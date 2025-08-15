import { mysqlTable, varchar, serial, timestamp, boolean, index } from 'drizzle-orm/mysql-core';
import { type Post } from './posts.schema.js';

// Users table schema
export const users = mysqlTable(
    'users',
    {
        id: serial('id').primaryKey(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        username: varchar('username', { length: 100 }).notNull().unique(),
        passwordHash: varchar('password_hash', { length: 255 }).notNull(),
        firstName: varchar('first_name', { length: 100 }),
        lastName: varchar('last_name', { length: 100 }),
        isActive: boolean('is_active').default(true),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        index('email_idx').on(table.email),
        index('username_idx').on(table.username),
    ]
);

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>;

// Relationship types
export type UserWithPosts = User & {
    posts: Post[];
};