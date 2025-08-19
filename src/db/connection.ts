import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config';
import * as schema from './models';

/**
 * Database Connection Management
 * 
 * Establishes a connection pool to the MySQL database using Drizzle ORM.
 * The pool provides better performance, scalability, and connection management.
 */

const options = {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    // Use pool configuration from environment variables
    ...dbConfig.pool,
};
const pool = mysql.createPool(options);

// Create the Drizzle instance with schema for relational queries
export const db = drizzle(pool, { schema, mode: 'default' });

// Export the pool for direct access if needed
export { pool };
