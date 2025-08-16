import { mysqlTable, varchar, serial, timestamp, boolean, index } from 'drizzle-orm/mysql-core';
import { type Post } from './posts.schema.js';

// Users table schema
export const users = mysqlTable(
    'users',
    {
        id: serial('id').primaryKey(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        password_hash: varchar('password_hash', { length: 255 }).notNull(),
        first_name: varchar('first_name', { length: 100 }),
        last_name: varchar('last_name', { length: 100 }),
        is_active: boolean('is_active').default(true),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        index('email_idx').on(table.email),
    ]
);

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'created_at' | 'updated_at'>>;

// Relationship types
export type UserWithPosts = User & {
    posts: Post[];
};