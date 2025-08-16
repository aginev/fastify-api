import { AppError, type ErrorContext } from './base.js';

/**
 * User-related error classes
 */
export class UserError extends AppError {
    static notFound(id: number): UserError {
        return new UserError(
            'User not found',
            404,
            'USER_NOT_FOUND',
            { userId: id }
        );
    }

    static alreadyExists(field: 'email', context: ErrorContext = {}): UserError {
        return new UserError(
            'User already exists',
            409,
            'USER_ALREADY_EXISTS',
            { field, ...context }
        );
    }

    static creationFailed(context: ErrorContext = {}): UserError {
        return new UserError(
            'Failed to create user',
            500,
            'USER_CREATION_FAILED',
            context
        );
    }

    static updateFailed(id: number, context: ErrorContext = {}): UserError {
        return new UserError(
            'Failed to update user',
            500,
            'USER_UPDATE_FAILED',
            { userId: id, ...context }
        );
    }

    static deletionFailed(id: number, context: ErrorContext = {}): UserError {
        return new UserError(
            'Failed to delete user',
            500,
            'USER_DELETION_FAILED',
            { userId: id, ...context }
        );
    }

    static invalidCredentials(context: ErrorContext = {}): UserError {
        return new UserError(
            'Invalid credentials',
            401,
            'INVALID_CREDENTIALS',
            context
        );
    }

    static passwordMismatch(context: ErrorContext = {}): UserError {
        return new UserError(
            'Current password is incorrect',
            400,
            'PASSWORD_MISMATCH',
            context
        );
    }
}


