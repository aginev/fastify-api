import { AppError } from './base.js';

/**
 * DatabaseError - Static factory for creating database-related errors
 * Provides a clean API for creating specific database error instances
 */
export class DatabaseError extends AppError {
    /**
     * Database constraint violation error
     */
    static constraintViolation(operation: string, constraint: string, context: Record<string, unknown> = {}): DatabaseError {
        return new DatabaseError(
            'Database constraint violation',
            409,
            'DATABASE_CONSTRAINT_VIOLATION',
            { operation, constraint, ...context }
        );
    }

    /**
     * Database connection error
     */
    static connectionFailed(context: Record<string, unknown> = {}): DatabaseError {
        return new DatabaseError(
            'Database connection failed',
            503,
            'DATABASE_CONNECTION_FAILED',
            context
        );
    }

    /**
     * Database query execution error
     */
    static queryFailed(operation: string, context: Record<string, unknown> = {}): DatabaseError {
        return new DatabaseError(
            'Database query failed',
            500,
            'DATABASE_QUERY_FAILED',
            { operation, ...context }
        );
    }

    /**
     * Database transaction error
     */
    static transactionFailed(operation: string, context: Record<string, unknown> = {}): DatabaseError {
        return new DatabaseError(
            'Database transaction failed',
            500,
            'DATABASE_TRANSACTION_FAILED',
            { operation, ...context }
        );
    }

    /**
     * Database migration error
     */
    static migrationFailed(migration: string, context: Record<string, unknown> = {}): DatabaseError {
        return new DatabaseError(
            'Database migration failed',
            500,
            'DATABASE_MIGRATION_FAILED',
            { migration, ...context }
        );
    }
}


