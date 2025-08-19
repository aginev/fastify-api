import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { posts } from '../db/models/posts.model.js';

// Generate Zod schema directly from Drizzle table definition
export const PostDataRequest = createInsertSchema(posts, {
    // Override fields that shouldn't be in API requests
    id: z.never(), // Never allow ID in requests
    created_at: z.never(), // Never allow created_at in requests
    updated_at: z.never(), // Never allow updated_at in requests
    deleted_at: z.never(), // Never allow deleted_at in requests

    // Override published_at to accept date or null
    published_at: z.date().nullable().default(null).refine(
        (date) => !date || date <= new Date(),
        'Published date cannot be in the future'
    ),
});

// Type exports for request validation
export type PostData = z.infer<typeof PostDataRequest>;
