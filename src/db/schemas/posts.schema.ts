import { mysqlTable, varchar, serial, int, timestamp, text, boolean, index } from 'drizzle-orm/mysql-core';
import { users, type User } from './users.schema.js';

// Posts table schema
export const posts = mysqlTable(
    'posts',
    {
        id: serial('id').primaryKey(),
        userId: int('user_id').notNull().references(() => users.id),
        title: varchar('title', { length: 255 }).notNull(),
        content: text('content'),
        publishedAt: timestamp('published_at'),
        deletedAt: timestamp('deleted_at'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        index('user_idx').on(table.userId),
        index('published_idx').on(table.publishedAt),
        index('deleted_idx').on(table.deletedAt),
    ]
);

// Export types for use in your application
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type UpdatePost = Partial<Omit<NewPost, 'id' | 'createdAt' | 'updatedAt'>>;

// Relationship types
export type PostWithUser = Post & {
    user: User;
};

