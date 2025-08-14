import Fastify, { FastifyError, FastifyInstance, HookHandlerDoneFunction } from 'fastify';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { getRequestId, setContext, type Store } from './context';
import { AppError } from './error';
import { getLogLevel, type LogLevel } from './utils/logging';
import { env } from './config';
import type { Request, Reply } from './types';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import underPressure from '@fastify/under-pressure';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerRoutes } from './routes';

const port = env.PORT;
const transport = env.NODE_ENV === 'development'
  ? {
    target: 'pino-pretty',
    options: {
      singleLine: true,
      colorize: true,
      translateTime: 'SYS:standard',
    },
  }
  : undefined;
const options = {
  // Pino config
  logger: {
    level: 'info',
    transport,

    // Add requestId to every log if present in context
    mixin() {
      const requestId = getRequestId();

      return requestId ? { requestId } : {};
    },

    // Remove sensitive data from logs
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
      ],
      remove: true,
    },
  },

  // Request ID wiring
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: (req: IncomingMessage) => {
    return (req.headers['x-request-id'] as string) ?? randomUUID();
  },
};

const app = Fastify(options).withTypeProvider<ZodTypeProvider>();

// Readiness flag managed by this module
app.decorate('isReady', false);

// Put the requestId into context for the whole lifecycle of the request
// and surface it to clients
app.addHook('onRequest', (req: Request, reply: Reply, done: HookHandlerDoneFunction) => {
  reply.header('x-request-id', req.id);

  const store: Store = { requestId: req.id };

  setContext(store, done);
});

// Global error/404 handlers
app.setErrorHandler((err: FastifyError, req: Request, reply: Reply) => {
  const request = {
    requestId: req.id,
    url: req.url,
    method: req.method,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  };

  const error = {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode ?? 500,
    stack: err.stack,
    context: err instanceof AppError ? err.context : {}
  };

  const logLevel: LogLevel = getLogLevel(error.statusCode);
  const logData = { request, error };

  // Type-safe logging - TypeScript will ensure logLevel is valid
  try {
    (app.log as any)[logLevel](logData, 'Unhandled error');
  } catch (logError) {
    app.log.error(logData, 'Unhandled error (fallback)');
  }

  reply
    .status(error.statusCode)
    .send({
      error: 'Internal Server Error',
      code: error.code,
      requestId: req.id
    });
});

app.setNotFoundHandler((_req: Request, reply: Reply) => {
  reply.status(404).send({ error: 'Not Found' });
});

// Register all route modules
await registerRoutes(app);

export async function start() {
  try {
    // Core plugins
    await app.register(sensible);
    await app.register(helmet);
    await app.register(cors);
    await app.register(underPressure);

    await app.listen({ port, host: '0.0.0.0' });

    app.log.info(`Server listening on http://localhost:${port}`);

    app.isReady = true;
  } catch (err) {
    app.log.error(err);

    process.exit(1);
  }
}

// Ensure readiness returns false during shutdown sequence
app.addHook('onClose', (_instance: FastifyInstance, done: HookHandlerDoneFunction) => {
  app.isReady = false;

  done();
});

export default app;
