import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '../types';

export async function orderRoutes(app: FastifyInstance) {
    app.get('/', async (req: Request, reply: Reply) => {
        return reply.send({ orders: [] });
    });
}
