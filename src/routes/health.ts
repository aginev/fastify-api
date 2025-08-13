import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '../types';
import { getRequestId, getContext } from '../context';

export async function healthRoutes(app: FastifyInstance) {
    app.get('/live', async () => ({ ok: true }));

    app.get('/ready', async (_req: Request, reply: Reply) => {
        if (!app.isReady) {
            return reply.code(503).send({ ok: false });
        }

        return reply.send({ ok: true });
    });

    // Legacy alias
    app.get('/', async (_req: Request, reply: Reply) => reply.send({ ok: true }));

    // Debug endpoint to show context
    app.get('/debug', async (_req: Request, reply: Reply) => {
        const requestId = getRequestId();
        const context = getContext();

        return reply.send({
            requestId,
            context,
            timestamp: new Date().toISOString()
        });
    });
}
