import { z } from 'zod';
import {
    withId,
    withTimestamps,
    withSoftDelete,
    withActiveStatus,
    withForeignKey
} from './base.model.js';

// Post-specific field schemas
const postFields = {
    ...withForeignKey('user_id', 'User ID'),
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be less than 255 characters'),
    content: z
        .string()
        .min(1, 'Content is required'),
    published_at: z.date().nullable().default(null).refine(
        (date) => !date || date <= new Date(),
        'Published date cannot be in the future'
    ),
};

// Post schemas using pure spread syntax - compose exactly what you want!
// Posts need: id, timestamps, soft delete, active status
export const PostSchema = z.object({
    ...withId,
    ...postFields,
    ...withActiveStatus,
    ...withTimestamps,
    ...withSoftDelete,
});

// For creation and updates: only business fields (no id, timestamps, or soft delete)
export const PostDataSchema = z.object({
    ...postFields,
});

// Params schema for route parameters
export const PostParamsSchema = z.object({
    id: z.coerce.number().int().positive('Post ID must be a positive integer'),
});

// Response schemas
export const PostResponseSchema = z.object({
    post: PostSchema,
});

export const PostsResponseSchema = z.object({
    posts: z.array(PostSchema),
});

// Soft delete schema
export const SoftDeletePostSchema = z.object({
    id: z.coerce.number().int().positive('Post ID must be a positive integer'),
});

// Response schema for post deletion
export const DeletePostSchema = z.object({
    deleted: z.number().int().positive(),
    deleted_at: z.date(),
});

// Schema for publishing/unpublishing posts
export const PublishPostSchema = z.object({
    id: z.coerce.number().int().positive('Post ID must be a positive integer'),
});

// Type exports
export type Post = z.infer<typeof PostSchema>;
export type PostData = z.infer<typeof PostDataSchema>;
export type PostParams = z.infer<typeof PostParamsSchema>;
