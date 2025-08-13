import type { FastifyRequest, FastifyReply } from 'fastify';

// Common type aliases for convenience
export type Request = FastifyRequest;
export type Reply = FastifyReply;

// Generic route handler type
export type RouteHandler = (req: Request, reply: Reply) => Promise<any>;

// Extend Fastify types to include our custom decorator
declare module 'fastify' {
    interface FastifyInstance {
        isReady: boolean;
    }
}
