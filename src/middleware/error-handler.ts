import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../error';
import { getLogLevel, type LogLevel } from '../utils/logging';

interface ErrorResponse {
    error: string;
    code: string;
    context?: Record<string, unknown>;
}

interface ErrorInfo {
    statusCode: number;
    code: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
}

interface ErrorHandler {
    canHandle(err: Error): boolean;
    handle(err: Error): ErrorInfo;
    buildResponse(errorInfo: ErrorInfo): ErrorResponse;
}

class GenericErrorHandler implements ErrorHandler {
    canHandle(err: Error): boolean {
        return true;
    }

    handle(err: Error): ErrorInfo {
        return {
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
            stack: err.stack,
            context: {},
        };
    }

    buildResponse(errorInfo: ErrorInfo): ErrorResponse {
        return {
            error: 'Internal Server Error',
            code: errorInfo.code,
            context: errorInfo.context,
        };
    }
}

class ZodErrorHandler implements ErrorHandler {
    canHandle(err: Error): boolean {
        return err instanceof ZodError;
    }

    handle(err: ZodError): ErrorInfo {
        return {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            stack: err.stack,
            context: {
                validation: err.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                    received: (issue as any).received,
                })),
            },
        };
    }

    buildResponse(errorInfo: ErrorInfo): ErrorResponse {
        return {
            error: 'Validation Error',
            code: errorInfo.code,
            context: errorInfo.context,
        };
    }
}

class AppErrorHandler implements ErrorHandler {
    canHandle(err: Error): boolean {
        return err instanceof AppError;
    }

    handle(err: AppError): ErrorInfo {
        return {
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
            stack: err.stack,
            context: err.context,
        };
    }

    buildResponse(errorInfo: ErrorInfo): ErrorResponse {
        return {
            error: 'Application Error',
            code: errorInfo.code,
            context: errorInfo.context,
        };
    }
}

class FastifyErrorHandler implements ErrorHandler {
    canHandle(err: Error): boolean {
        return 'statusCode' in err || 'code' in err;
    }

    handle(err: Error): ErrorInfo {
        return {
            statusCode: (err as any).statusCode ?? 500,
            code: (err as any).code || 'INTERNAL_SERVER_ERROR',
            message: err.message,
            stack: err.stack,
            context: {},
        };
    }

    buildResponse(errorInfo: ErrorInfo): ErrorResponse {
        return {
            error: 'Server Error',
            code: errorInfo.code,
            context: errorInfo.context,
        };
    }
}

class ErrorHandlerRegistry {
    private handlers: ErrorHandler[] = [];

    register(handler: ErrorHandler): void {
        this.handlers.push(handler);
    }

    findHandler(err: Error): ErrorHandler {
        // Find first handler that can handle this error
        const handler = this.handlers.find(h => h.canHandle(err));

        // Fallback to last (GenericErrorHandler)
        return handler || this.handlers[this.handlers.length - 1];
    }
}

export function createErrorHandler(app: FastifyInstance) {
    const registry = new ErrorHandlerRegistry();

    registry.register(new ZodErrorHandler());
    registry.register(new AppErrorHandler());
    registry.register(new FastifyErrorHandler());
    registry.register(new GenericErrorHandler());

    return (err: Error, req: FastifyRequest, reply: FastifyReply) => {
        const request = {
            requestId: req.id,
            url: req.url,
            method: req.method,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString(),
        };

        // Find appropriate handler and process error
        const handler = registry.findHandler(err);
        const errorInfo = handler.handle(err);
        const response = handler.buildResponse(errorInfo);

        // Log the error
        const logLevel: LogLevel = getLogLevel(errorInfo.statusCode);
        const logData = { request, error: { ...errorInfo } };

        try {
            (app.log as any)[logLevel](
                logData,
                `${handler.constructor.name} error`
            );
        } catch (logError) {
            app.log.error(
                logData,
                `${handler.constructor.name} error (fallback)`
            );
        }

        // Send response
        reply
            .status(errorInfo.statusCode)
            .send({ requestId: req.id, ...response });
    };
}
