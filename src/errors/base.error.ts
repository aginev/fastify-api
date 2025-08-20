import type { FastifyError } from 'fastify';

export interface ContextualError {
    context: Record<string, unknown>;
}

export type ErrorContext = Record<string, unknown>;

export class AppError extends Error implements FastifyError, ContextualError {
    public statusCode: number;
    public code: string;
    public context: Record<string, unknown> = {};

    constructor(
        message: string,
        statusCode: number,
        code: string,
        context: ErrorContext = {}
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.context = context;
    }
}
