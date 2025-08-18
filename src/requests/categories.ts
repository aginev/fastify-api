import { z } from 'zod';

const categoryFields = {
    name: z.string().min(1, 'Category name is required').max(100, 'Category name must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
};

// Input validation schemas (for API requests)
export const CategoryDataRequest = z.object({
    ...categoryFields,
});

// Type exports for request validation
export type CategoryData = z.infer<typeof CategoryDataRequest>;
