import { mysqlTable, varchar, serial, timestamp, boolean, index } from 'drizzle-orm/mysql-core';
import { type Post } from './posts.model.js';
import { withActiveStatus, withPrimary, withSoftDelete, withTimestamps } from './base.js';

// Users table schema
export const users = mysqlTable(
    'users',
    {
        ...withPrimary,
        email: varchar('email', { length: 255 }).notNull().unique(),
        password_hash: varchar('password_hash', { length: 255 }).notNull(),
        first_name: varchar('first_name', { length: 100 }),
        last_name: varchar('last_name', { length: 100 }),
        ...withActiveStatus,
        ...withSoftDelete,
        ...withTimestamps,
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