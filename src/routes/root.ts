import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '@/types';

export async function rootRoutes(app: FastifyInstance) {
    app.get('/', async (_req: Request, reply: Reply) => {
        return reply.send({ message: 'Hello from Fastify!' });
    });
}
