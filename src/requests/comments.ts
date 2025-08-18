import { z } from 'zod';

const commentFields = {
    user_id: z.number().int().positive('User ID must be a positive integer'),
    post_id: z.number().int().positive('Post ID must be a positive integer'),
    parent_comment_id: z.number().int().positive('Parent Comment ID must be a positive integer').optional(),
    content: z
        .string()
        .min(1, 'Comment content is required')
        .max(1000, 'Comment content must be less than 1000 characters'),
    is_approved: z.boolean().default(false).describe('Whether the comment is approved for display'),
};

// Input validation schemas (for API requests)
export const CommentDataRequest = z.object({
    ...commentFields,
});

// Type exports for request validation
export type CommentData = z.infer<typeof CommentDataRequest>;
