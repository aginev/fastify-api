import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { context, type Store } from './context';
import { env } from './config';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import underPressure from '@fastify/under-pressure';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

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
      const requestId = context.getStore()?.requestId;

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
let ready = false;

// Put the requestId into context for the whole lifecycle of the request
// and surface it to clients
app.addHook('onRequest', (req, reply, done) => {
  reply.header('x-request-id', req.id);

  const store: Store = { requestId: req.id };

  context.run(store, done);
});

// Global error/404 handlers
app.setErrorHandler((error, _req, reply) => {
  app.log.error({ err: error }, 'Unhandled error');

  reply
    .status(error.statusCode ?? 500)
    .send({ error: 'Internal Server Error' });
});

app.setNotFoundHandler((_req, reply) => {
  reply.status(404).send({ error: 'Not Found' });
});

// Routes
app.get('/health/live', async () => ({ ok: true }));

app.get('/health/ready', async (_req, reply) => {
  if (!ready) {
    return reply.code(503).send({ ok: false });
  }

  return reply.send({ ok: true });
});

// Keep legacy alias if used by callers/tools
app.get('/health', async (_req, reply) => reply.send({ ok: true }));

app.get('/', async (_req, reply) => {
  return reply.send({ message: 'Hello from Fastify!' });
});

export async function start() {
  try {
    // Core plugins
    await app.register(sensible);
    await app.register(helmet);
    await app.register(cors);
    await app.register(underPressure);

    await app.listen({ port, host: '0.0.0.0' });

    app.log.info(`Server listening on http://localhost:${port}`);

    ready = true;
  } catch (err) {
    app.log.error(err);

    process.exit(1);
  }
}

// Ensure readiness returns false during shutdown sequence
app.addHook('onClose', (_instance, done) => {
  ready = false;

  done();
});

export default app;
