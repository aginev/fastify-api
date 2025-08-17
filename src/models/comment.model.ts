import { z } from 'zod';
import {
    withId,
    withTimestamps,
    withSoftDelete,
    withActiveStatus,
    withForeignKey
} from './base.model.js';

// Comment-specific field schemas
const commentFields = {
    ...withForeignKey('user_id', 'User ID'),
    ...withForeignKey('post_id', 'Post ID'),
    ...withForeignKey('parent_comment_id', 'Parent Comment ID'),
    content: z
        .string()
        .min(1, 'Comment content is required')
        .max(1000, 'Comment content must be less than 1000 characters'),
    is_approved: z.boolean().default(false).describe('Whether the comment is approved for display'),
};

// Comment schemas using spread syntax
export const CommentSchema = z.object({
    ...withId,
    ...commentFields,
    ...withActiveStatus,
    ...withTimestamps,
    ...withSoftDelete,
});

// For creation and updates: only business fields
export const CommentDataSchema = z.object({
    ...commentFields,
});

// Params schema for route parameters
export const CommentParamsSchema = z.object({
    id: z.coerce.number().int().positive('Comment ID must be a positive integer'),
});

// Response schemas
export const CommentResponseSchema = z.object({
    comment: CommentSchema,
});

export const CommentsResponseSchema = z.object({
    comments: z.array(CommentSchema),
});

// Soft delete schema
export const SoftDeleteCommentSchema = z.object({
    id: z.coerce.number().int().positive('Comment ID must be a positive integer'),
});

// Response schema for comment deletion
export const DeleteCommentResponseSchema = z.object({
    deleted: z.number().int().positive(),
    deleted_at: z.date(),
});

// Type exports
export type Comment = z.infer<typeof CommentSchema>;
export type CommentData = z.infer<typeof CommentDataSchema>;
export type CommentParams = z.infer<typeof CommentParamsSchema>;
