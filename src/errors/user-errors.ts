import { AppError } from './base.js';

/**
 * UserError - Static factory for creating user-related errors
 * Provides a clean API for creating specific user error instances
 */
export class UserError extends AppError {
    /**
     * User not found error
     */
    static notFound(userId: number, context: Record<string, unknown> = {}): UserError {
        return new UserError(
            'User not found',
            404,
            'USER_NOT_FOUND',
            { userId, ...context }
        );
    }

    /**
     * User already exists error
     */
    static alreadyExists(field: 'email' | 'username', context: Record<string, unknown> = {}): UserError {
        return new UserError(
            'User already exists',
            409,
            'USER_ALREADY_EXISTS',
            { field, ...context }
        );
    }

    /**
     * User creation failed error
     */
    static creationFailed(context: Record<string, unknown> = {}): UserError {
        return new UserError(
            'Failed to create user',
            500,
            'USER_CREATION_FAILED',
            context
        );
    }

    /**
     * User update failed error
     */
    static updateFailed(userId: number, context: Record<string, unknown> = {}): UserError {
        return new UserError(
            'Failed to update user',
            500,
            'USER_UPDATE_FAILED',
            { userId, ...context }
        );
    }

    /**
     * User deletion failed error
     */
    static deletionFailed(userId: number, context: Record<string, unknown> = {}): UserError {
        return new UserError(
            'Failed to delete user',
            500,
            'USER_DELETION_FAILED',
            { userId, ...context }
        );
    }

    /**
     * Authentication failed error
     */
    static authenticationFailed(context: Record<string, unknown> = {}): UserError {
        return new UserError(
            'Authentication failed - invalid credentials',
            401,
            'AUTHENTICATION_FAILED',
            context
        );
    }

    /**
     * Password update failed error
     */
    static passwordUpdateFailed(userId: number, context: Record<string, unknown> = {}): UserError {
        return new UserError(
            'Failed to update password',
            500,
            'PASSWORD_UPDATE_FAILED',
            { userId, ...context }
        );
    }
}


