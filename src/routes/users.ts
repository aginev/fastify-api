import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '../types';

export async function userRoutes(app: FastifyInstance) {
    app.get('/', async (req: Request, reply: Reply) => {
        return reply.send({ users: [] });
    });

    app.get('/:id', async (req: Request, reply: Reply) => {
        const { id } = req.params as { id: string };

        return reply.send({ user: { id, name: 'John Doe' } });
    });

    app.post('/', async (req: Request, reply: Reply) => {
        const userData = req.body as Record<string, unknown>;

        return reply.code(201).send({ user: userData });
    });

    app.put('/:id', async (req: Request, reply: Reply) => {
        const { id } = req.params as { id: string };
        const userData = req.body as Record<string, unknown>;

        return reply.send({ user: { id, ...userData } });
    });

    app.delete('/:id', async (req: Request, reply: Reply) => {
        const { id } = req.params as { id: string };

        return reply.send({ deleted: id });
    });
}
