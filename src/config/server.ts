import { z } from 'zod';

// Server environment validation schema
const ServerEnvSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: z.coerce.number().int().min(0).max(65535).default(3000),
    GRACEFUL_SHUTDOWN_TIMEOUT: z.coerce.number().int().min(1000).max(60000).default(10000),
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
};

// Export individual values for direct access
export const {
    NODE_ENV,
    PORT,
    GRACEFUL_SHUTDOWN_TIMEOUT,
} = serverEnv;
