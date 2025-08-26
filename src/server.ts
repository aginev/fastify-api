import Fastify from 'fastify';
import type {
    FastifyInstance,
    HookHandlerDoneFunction,
} from 'fastify';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { createErrorHandler, createRequestContextHook } from '@middlewares';
import { getRequestId } from '@/context';
import { serverConfig } from '@/config';
import type { Request, Reply } from '@/types';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import underPressure from '@fastify/under-pressure';
import rateLimit from '@fastify/rate-limit';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerRoutes } from '@/routes';
import { pool } from '@/db/connection';

const port = serverConfig.port;
const transport = serverConfig.isDevelopment
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
                'res.body.password',
                'res.body.password_hash',
                'res.body.passwordHash',
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
app.addHook('onRequest', createRequestContextHook);

// Global error/404 handlers
app.setErrorHandler(createErrorHandler(app));

app.setNotFoundHandler((_req: Request, reply: Reply) => {
    reply.status(404).send({ error: 'Not Found' });
});

export async function start() {
    try {
        // Core plugins
        await app.register(sensible);
        await app.register(helmet);
        await app.register(cors);
        await app.register(underPressure);

        // Rate limiting (must be registered before routes)
        await app.register(rateLimit, {
            max: serverConfig.rateLimit.max,
            timeWindow: serverConfig.rateLimit.timeWindow,
            errorResponseBuilder: (req, context) => {
                return {
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
                    statusCode: 429,
                    requestId: req.id,
                };
            },
            addHeaders: {
                'x-ratelimit-limit': true,
                'x-ratelimit-remaining': true,
                'x-ratelimit-reset': true,
                'retry-after': true,
            },
            keyGenerator: (req) => {
                // Use IP address as the key for rate limiting
                return req.ip;
            },
        });

        // Register all route modules (after rate limiting)
        await registerRoutes(app);

        await app.listen({ port, host: '0.0.0.0' });

        app.log.info(`Server listening on http://localhost:${port}`);
        app.log.info(`Rate limiting: ${serverConfig.rateLimit.max} requests per ${serverConfig.rateLimit.timeWindow}ms`);

        app.isReady = true;
    } catch (err) {
        app.log.error(err);

        process.exit(1);
    }
}

// Ensure readiness returns false during shutdown sequence
app.addHook(
    'onClose',
    (_instance: FastifyInstance, done: HookHandlerDoneFunction) => {
        app.isReady = false;

        done();
    }
);

export default app;

// Graceful shutdown handling
process.on('SIGINT', async () => {
    app.log.info('🛑 Received SIGINT, shutting down gracefully...');

    await pool.end();

    process.exit(0);
});

process.on('SIGTERM', async () => {
    app.log.info('🛑 Received SIGTERM, shutting down gracefully...');

    await pool.end();

    process.exit(0);
});
