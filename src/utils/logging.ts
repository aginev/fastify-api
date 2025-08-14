// Type-safe log level mapping for HTTP status codes
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug';

/**
 * Maps HTTP status codes to appropriate log levels
 * @param statusCode - HTTP status code
 * @returns LogLevel for the given status code
 */
export const getLogLevel = (statusCode: number): LogLevel => {
    if (statusCode >= 500) return 'fatal';
    if (statusCode >= 400) return 'error';
    if (statusCode >= 300) return 'warn';
    if (statusCode >= 200) return 'info';
    return 'info';
};
