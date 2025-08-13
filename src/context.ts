import { AsyncLocalStorage } from 'node:async_hooks';

export type Store = {
  requestId?: string;
};

export const context = new AsyncLocalStorage<Store>();
