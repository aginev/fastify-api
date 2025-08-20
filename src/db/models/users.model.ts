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