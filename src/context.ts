import { AsyncLocalStorage } from 'node:async_hooks';

export type Store = {
    requestId?: string;
};

const context = new AsyncLocalStorage<Store>();

export const getRequestId = () => context.getStore()?.requestId;
export const getContext = () => context.getStore();
export const setContext = (store: Store, done: () => void) => context.run(store, done);
