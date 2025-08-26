import { z } from 'zod';

// Server environment validation schema
const ServerEnvSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: z.coerce.number().int().min(0).max(65535).default(3000),
    GRACEFUL_SHUTDOWN_TIMEOUT: z.coerce.number().int().min(1000).max(60000).default(10000),
    
    // Rate limiting configuration
    RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10000).default(100),
    RATE_LIMIT_TIME_WINDOW: z.coerce.number().int().min(1000).max(3600000).default(60000), // 1 minute in ms
});

// Parse server environment variables
const serverEnv = ServerEnvSchema.parse(process.env);

// Server configuration object
export const serverConfig = {
    nodeEnv: serverEnv.NODE_ENV,
    port: serverEnv.PORT,
    isDevelopment: serverEnv.NODE_ENV === 'development',
    isProduction: serverEnv.NODE_ENV === 'production',
    isTest: serverEnv.NODE_ENV === 'test',
    rateLimit: {
        max: serverEnv.RATE_LIMIT_MAX,
        timeWindow: serverEnv.RATE_LIMIT_TIME_WINDOW,
    },
};

// Export individual values for direct access
export const {
    NODE_ENV,
    PORT,
    GRACEFUL_SHUTDOWN_TIMEOUT,
    RATE_LIMIT_MAX,
    RATE_LIMIT_TIME_WINDOW,
} = serverEnv;
