import { z } from 'zod';

const postFields = {
    user_id: z.number().int().positive('User ID must be a positive integer'),
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    content: z.string().min(1, 'Content is required'),
    published_at: z.date().nullable().default(null).refine(
        (date) => !date || date <= new Date(),
        'Published date cannot be in the future'
    ),
};

// Input validation schemas (for API requests)
export const PostDataRequest = z.object({
    ...postFields,
});

// Type exports for request validation
export type PostData = z.infer<typeof PostDataRequest>;
