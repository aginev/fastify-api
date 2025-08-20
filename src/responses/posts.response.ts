import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { posts } from '@db/models';

// Base post response schema (no sensitive fields to exclude currently)
export const PostResponseSchema = createSelectSchema(posts);

// Helper function to create response schema with post property
const createPostResponse = (statusCode: number) => ({
    [statusCode]: {
        type: 'object',
        properties: {
            post: PostResponseSchema
        }
    }
});

// Fastify response schemas for OpenAPI documentation
export const PostResponse = createPostResponse(200);

export const PostListResponse = {
    200: {
        type: 'object',
        properties: {
            posts: z.array(PostResponseSchema)
        }
    }
};

export const PostUpsertResponse = {
    ...createPostResponse(200),
    ...createPostResponse(201)
};

// Type exports for response schemas
export type PostResponseType = z.infer<typeof PostResponseSchema>;
export type PostListResponseType = z.infer<typeof PostResponseSchema>[];
