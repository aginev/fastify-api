import { seed } from 'drizzle-seed';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { users, posts, postsRelations } from '../models';

/**
 * Users Table Seeder
 * 
 * Generates realistic user data for testing and development.
 */

export async function seedUsers(db: MySql2Database<any>) {
    await seed(db, { users, posts, postsRelations }).refine((f) => ({
        users: {
            count: 25, // Generate 25 users
            columns: {
                email: f.email(), // Generate realistic emails
                password: f.string(), // Generate passwords
                first_name: f.firstName(), // Realistic first names
                last_name: f.lastName(), // Realistic last names
                is_active: f.boolean(), // Generate boolean values
            },
            with: {
                posts: 3, // Each user gets 3 posts
            },
        },
    }));
}
