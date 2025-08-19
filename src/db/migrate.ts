import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config';

/**
 * Migration runner for Drizzle ORM
 * This script applies pending migrations to the database
 */
async function runMigrations() {
    let connection: mysql.Connection | null = null;

    try {
        console.log('🚀 Starting database migrations...');

        // Create a dedicated connection for migrations
        connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            multipleStatements: true, // Required for migrations
        });

        console.log('🔌 Database connection established');

        // Create Drizzle instance with the connection
        const db = drizzle(connection);

        // Run migrations
        await migrate(db, {
            migrationsFolder: './src/db/migrations',
            migrationsTable: 'migrations',
        });

        console.log('✅ Migrations completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);

    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations().catch((error) => {
        console.error('💥 Unhandled error during migration:', error);
        process.exit(1);
    });
}

export { runMigrations };
