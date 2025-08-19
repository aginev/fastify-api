#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config';
import { seedUsers, seedPosts } from './seeds';

/**
 * Database Seeder
 * 
 * This script populates your database with realistic test data.
 * It uses modular seeders for each table to maintain clean separation.
 */

async function main() {
    let connection: mysql.Connection | null = null;

    try {
        console.log('🌱 Starting database seeding...');

        // Create database connection
        connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        });

        console.log('🔌 Database connection established');

        // Create Drizzle instance
        const db = drizzle(connection);

        console.log('📊 Seeding database with test data...');

        // Seed users with posts (posts are generated through user relationships)
        console.log('👥 Seeding users with posts...');
        await seedUsers(db);

        console.log('✅ Database seeding completed successfully!');
        console.log('📈 Generated:');
        console.log('   - 25 users with realistic profiles');
        console.log('   - 75 posts with realistic content');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('💥 Unhandled error during seeding:', error);
        process.exit(1);
    });
}

export { main as seedDatabase };
