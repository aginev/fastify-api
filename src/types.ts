import type { FastifyRequest, FastifyReply } from 'fastify';

// Common type aliases for convenience
export type Request = FastifyRequest;
export type Reply = FastifyReply;

// Generic route handler type
export type RouteHandler<T = any> = (req: Request, reply: Reply) => Promise<T>;
