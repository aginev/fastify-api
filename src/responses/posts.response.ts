import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { posts } from '@db/models';

// Post response schema
export const PostResponseSchema = createSelectSchema(posts);

// Simple response schemas - just like the fastify-type-provider-zod examples
export const PostResponse = {
    200: PostResponseSchema
};

export const PostListResponse = {
    200: PostResponseSchema.array()
};

export const PostUpsertResponse = {
    200: PostResponseSchema,
    201: PostResponseSchema
};

// Type exports
export type PostResponseType = z.infer<typeof PostResponseSchema>;