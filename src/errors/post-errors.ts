import { AppError, type ErrorContext } from './base.js';

/**
 * PostError - Static factory for creating post-related errors
 * Provides a clean API for creating specific post error instances
 */
export class PostError extends AppError {
    /**
     * Post not found error
     */
    static notFound(postId: number, context: ErrorContext = {}): PostError {
        return new PostError(
            'Post not found',
            404,
            'POST_NOT_FOUND',
            { postId, ...context }
        );
    }

    /**
     * Post creation failed error
     */
    static creationFailed(context: ErrorContext = {}): PostError {
        return new PostError(
            'Failed to create post',
            500,
            'POST_CREATION_FAILED',
            context
        );
    }

    /**
     * Post update failed error
     */
    static updateFailed(postId: number, context: ErrorContext = {}): PostError {
        return new PostError(
            'Failed to update post',
            500,
            'POST_UPDATE_FAILED',
            { postId, ...context }
        );
    }

    /**
     * Post deletion failed error
     */
    static deletionFailed(postId: number, context: ErrorContext = {}): PostError {
        return new PostError(
            'Failed to delete post',
            500,
            'POST_DELETION_FAILED',
            { postId, ...context }
        );
    }

    /**
     * Post already published error
     */
    static alreadyPublished(postId: number, context: ErrorContext = {}): PostError {
        return new PostError(
            'Post is already published',
            409,
            'POST_ALREADY_PUBLISHED',
            { postId, ...context }
        );
    }

    /**
     * Post not published error
     */
    static notPublished(postId: number, context: ErrorContext = {}): PostError {
        return new PostError(
            'Post is not published',
            409,
            'POST_NOT_PUBLISHED',
            { postId, ...context }
        );
    }

    /**
     * Post already deleted error
     */
    static alreadyDeleted(postId: number, context: ErrorContext = {}): PostError {
        return new PostError(
            'Post is already deleted',
            409,
            'POST_ALREADY_DELETED',
            { postId, ...context }
        );
    }

    /**
     * Post not deleted error
     */
    static notDeleted(postId: number, context: ErrorContext = {}): PostError {
        return new PostError(
            'Post is not deleted',
            409,
            'POST_NOT_DELETED',
            { postId, ...context }
        );
    }
}


