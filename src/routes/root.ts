import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '@/types';

export async function rootRoutes(app: FastifyInstance) {
    app.get('/', async (_req: Request, reply: Reply) => {
        return reply.send({ message: 'Hello from Fastify!' });
    });

    app.get("/whoami", async (_req: Request, reply: Reply) => {
        const pod = process.env.POD_NAME || process.env.HOSTNAME;

        console.log(pod);

        return reply.send({ pod });
    });

}
