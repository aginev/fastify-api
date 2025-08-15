import { z } from 'zod';

// Database environment validation schema
const DatabaseEnvSchema = z.object({
    DATABASE_URL: z.string().default('mysql://db_user:db_pass@localhost:3306/api'),
    DATABASE_HOST: z.string().default('localhost'),
    DATABASE_PORT: z.coerce.number().default(3306),
    DATABASE_NAME: z.string().default('api'),
    DATABASE_USER: z.string().default('db_user'),
    DATABASE_PASSWORD: z.string().default('db_pass'),
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
};

// Export individual values for direct access
export const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_URL,
} = dbEnv;
