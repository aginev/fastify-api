import { defineConfig } from 'drizzle-kit';
import { dbConfig } from './src/config/index.js';

export default defineConfig({
    schema: './src/db/models/index.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    },
    verbose: true,
    strict: true,
});
