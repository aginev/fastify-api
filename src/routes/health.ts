import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '@/types';
import { getRequestId, getContext } from '@/context';

export async function healthRoutes(app: FastifyInstance) {
    // Health check endpoints - bypass rate limiting
    app.get('/live', {
        config: {
            rateLimit: false
        }
    }, async () => ({ ok: true }));

    app.get('/ready', {
        config: {
            rateLimit: false
        }
    }, async (_req: Request, reply: Reply) => {
        if (!app.isReady) {
            return reply.code(503).send({ ok: false });
        }

        return reply.send({ ok: true });
    });

    // Legacy alias - bypass rate limiting
    app.get('/', {
        config: {
            rateLimit: false
        }
    }, async (_req: Request, reply: Reply) =>
        reply.send({ ok: true })
    );

    // Debug endpoint to show context
    app.get('/debug', async (_req: Request, reply: Reply) => {
        const requestId = getRequestId();
        const context = getContext();

        return reply.send({
            requestId,
            context,
            timestamp: new Date().toISOString(),
        });
    });
}
