import { z } from 'zod';

// Database environment validation schema
const DatabaseEnvSchema = z.object({
    DATABASE_URL: z.string().default('mysql://db_user:db_pass@localhost:3306/api'),
    DATABASE_HOST: z.string().default('localhost'),
    DATABASE_PORT: z.coerce.number().default(3306),
    DATABASE_NAME: z.string().default('api'),
    DATABASE_USER: z.string().default('db_user'),
    DATABASE_PASSWORD: z.string().default('db_pass'),
    // Connection pool settings
    DATABASE_POOL_LIMIT: z.coerce.number().default(10),
    DATABASE_CONNECT_TIMEOUT: z.coerce.number().default(60000),
    DATABASE_QUEUE_LIMIT: z.coerce.number().default(0),
    DATABASE_SUPPORT_BIG_NUMBERS: z.coerce.boolean().default(true),
    DATABASE_BIG_NUMBER_STRINGS: z.coerce.boolean().default(false),
    DATABASE_DATE_STRINGS: z.coerce.boolean().default(false),
    DATABASE_ENABLE_KEEP_ALIVE: z.coerce.boolean().default(true),
    DATABASE_KEEP_ALIVE_INITIAL_DELAY: z.coerce.number().default(0),
});

// Parse database environment variables
const dbEnv = DatabaseEnvSchema.parse(process.env);

// Database configuration object
export const dbConfig = {
    host: dbEnv.DATABASE_HOST,
    port: dbEnv.DATABASE_PORT,
    database: dbEnv.DATABASE_NAME,
    user: dbEnv.DATABASE_USER,
    password: dbEnv.DATABASE_PASSWORD,
    url: dbEnv.DATABASE_URL,
    // Pool configuration
    pool: {
        connectionLimit: dbEnv.DATABASE_POOL_LIMIT,
        connectTimeout: dbEnv.DATABASE_CONNECT_TIMEOUT,
        queueLimit: dbEnv.DATABASE_QUEUE_LIMIT,
        supportBigNumbers: dbEnv.DATABASE_SUPPORT_BIG_NUMBERS,
        bigNumberStrings: dbEnv.DATABASE_BIG_NUMBER_STRINGS,
        dateStrings: dbEnv.DATABASE_DATE_STRINGS,
        enableKeepAlive: dbEnv.DATABASE_ENABLE_KEEP_ALIVE,
        keepAliveInitialDelay: dbEnv.DATABASE_KEEP_ALIVE_INITIAL_DELAY,
    },
};

// Export individual values for direct access
export const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_URL,
    DATABASE_POOL_LIMIT,
    DATABASE_CONNECT_TIMEOUT,
    DATABASE_QUEUE_LIMIT,
    DATABASE_SUPPORT_BIG_NUMBERS,
    DATABASE_BIG_NUMBER_STRINGS,
    DATABASE_DATE_STRINGS,
    DATABASE_ENABLE_KEEP_ALIVE,
    DATABASE_KEEP_ALIVE_INITIAL_DELAY,
} = dbEnv;
