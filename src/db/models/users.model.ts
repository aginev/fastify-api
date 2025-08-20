import { mysqlTable, varchar, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { withActiveStatus, withPrimary, withSoftDelete, withTimestamps } from './base';
import { posts } from './posts.model';

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

// Users table relations
export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts, { relationName: 'user_posts' }),
}));

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;

// Public user type (without password)
export type PublicUser = Omit<User, 'password'>;

// Reusable select objects for different use cases

// Public user fields (excludes password)
export const publicUserSelect = {
    id: users.id,
    email: users.email,
    first_name: users.first_name,
    last_name: users.last_name,
    is_active: users.is_active,
    created_at: users.created_at,
    updated_at: users.updated_at,
    deleted_at: users.deleted_at,
} as const;

// Minimal user fields (for lists/autocomplete)
export const minimalUserSelect = {
    id: users.id,
    email: users.email,
    first_name: users.first_name,
    last_name: users.last_name,
} as const;

// Email check fields (for validation)
export const emailCheckSelect = {
    id: users.id,
    email: users.email,
} as const;