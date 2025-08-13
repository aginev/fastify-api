import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '../types';

export async function productRoutes(app: FastifyInstance) {
    app.get('/', async (req: Request, reply: Reply) => {
        return reply.send({ products: [] });
    });
}
