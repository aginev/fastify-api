import { mysqlTable, varchar, text, serial, timestamp, index, bigint } from 'drizzle-orm/mysql-core';
import { users, type User } from './users.model.js';
import { withPrimary, withSoftDelete, withTimestamps } from './base.js';

// Posts table schema
export const posts = mysqlTable(
    'posts',
    {
        ...withPrimary,
        user_id: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
        title: varchar('title', { length: 255 }).notNull(),
        content: text('content').notNull(),
        published_at: timestamp('published_at'),
        ...withSoftDelete,
        ...withTimestamps,
    },
    (table) => [
        index('user_idx').on(table.user_id),
        index('published_idx').on(table.published_at),
        index('deleted_idx').on(table.deleted_at),
    ]
);

// Export types for use in your application
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type UpdatePost = Partial<Omit<NewPost, 'id' | 'created_at' | 'updated_at'>>;

// Relationship types
export type PostWithUser = Post & {
    user: User;
};

