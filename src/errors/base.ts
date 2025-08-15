import type { FastifyError } from 'fastify';

export interface ErrorContext {
    context: Record<string, unknown>;
}

export class AppError extends Error implements FastifyError, ErrorContext {
    public statusCode: number;
    public code: string;
    public context: Record<string, unknown> = {};

    constructor(
        message: string,
        statusCode: number,
        code: string,
        context: Record<string, unknown> = {}
    ) {
        super(message);

        this.statusCode = statusCode;
        this.code = code;
        this.context = context;
    }
}
