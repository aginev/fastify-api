import type { FastifyInstance } from 'fastify';
import { rootRoutes } from './root';
import { healthRoutes } from './health';
import { userRoutes } from './users';
import { productRoutes } from './products';
import { orderRoutes } from './orders';

export async function registerRoutes(app: FastifyInstance) {
    await app.register(rootRoutes);
    await app.register(healthRoutes, { prefix: '/health' });
    await app.register(userRoutes, { prefix: '/users' });
    await app.register(productRoutes, { prefix: '/products' });
    await app.register(orderRoutes, { prefix: '/orders' });
}
