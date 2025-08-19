import { mysqlTable, varchar, timestamp, boolean, index } from 'drizzle-orm/mysql-core';
import { type Post } from './posts.model';
import { withActiveStatus, withPrimary, withSoftDelete, withTimestamps } from './base';

// Users table schema
export const users = mysqlTable(
    'users',
    {
        ...withPrimary,
        email: varchar('email', { length: 255 }).notNull().unique(),
        password: varchar('password', { length: 255 }).notNull(),
        first_name: varchar('first_name', { length: 100 }).notNull(),
        last_name: varchar('last_name', { length: 100 }).notNull(),
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
export type NewUser = Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;

// Relationship types
export type UserWithPosts = User & {
    posts: Post[];
};