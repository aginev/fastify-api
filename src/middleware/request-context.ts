import type { HookHandlerDoneFunction } from 'fastify';
import { setContext, type Store } from '../context';
import type { Request, Reply } from '../types';

export function createRequestContextHook(
    req: Request,
    reply: Reply,
    done: HookHandlerDoneFunction
) {
    reply.header('x-request-id', req.id);

    const store: Store = { requestId: req.id };

    setContext(store, done);
}
