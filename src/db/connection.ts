import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/index.js';

// Create the connection pool
const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
});

// Create the Drizzle instance
export const db = drizzle(connection);

// Export the raw connection for manual queries if needed
export { connection };
