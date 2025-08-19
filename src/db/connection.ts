import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/index.js';
import * as schema from './models/index.js';

// Create the connection pool
const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
});

// Create the Drizzle instance with schema for relational queries
export const db = drizzle(connection, { schema, mode: 'default' });

// Export the raw connection for manual queries if needed
export { connection };
