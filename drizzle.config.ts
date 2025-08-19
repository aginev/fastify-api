import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    // Path to your schema file
    schema: './src/db/models/index.ts',

    // Output directory for generated migrations
    out: './src/db/migrations',

    // Database dialect (mysql, postgresql, sqlite, etc.)
    dialect: 'mysql',

    // Database connection credentials
    dbCredentials: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USER || 'db_user',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'api',
    },

    // Enable verbose logging for debugging
    verbose: true,

    // Enable strict mode for better type safety
    strict: true,

    // Enable breakpoints for better SQL formatting
    breakpoints: true,

    // Enhanced migration configuration
    migrations: {
        prefix: 'timestamp', // Better migration naming (20241201120000_migration_name.sql)
        table: 'migrations', // Custom migration history table
    },
});
