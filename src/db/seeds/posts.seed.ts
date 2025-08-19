import { seed } from 'drizzle-seed';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import { posts } from '../models';

/**
 * Posts Table Seeder
 * 
 * Generates realistic post data for testing and development.
 * This seeder can be used independently to add more posts.
 */

export async function seedPosts(db: MySql2Database<any>) {
    await seed(db, { posts }).refine((f) => ({
        posts: {
            count: 50, // Generate 50 additional posts
            columns: {
                title: f.loremIpsum(), // Generate realistic titles
                content: f.loremIpsum(), // Generate realistic content
                published_at: f.date(), // Generate dates
                user_id: f.int({ minValue: 1, maxValue: 25 }), // Reference existing users (1-25)
            },
        },
    }));
}
