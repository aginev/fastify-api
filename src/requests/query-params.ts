import { z } from 'zod';

// Query parameter validation utilities
export const paginationQuery = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const sortingQuery = z.object({
    sort_by: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const searchQuery = paginationQuery.extend({
    q: z.string().optional(),
});
