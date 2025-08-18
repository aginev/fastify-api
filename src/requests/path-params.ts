import { z } from 'zod';

// Path (route) parameter validation utilities
export const routeIdParam = (modelName: string) =>
    z.coerce.number().int().positive(`${modelName} ID must be a positive integer`);
