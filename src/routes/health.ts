import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '../types';

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
}
