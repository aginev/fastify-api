import { mysqlTable, varchar, text, serial, timestamp, index } from 'drizzle-orm/mysql-core';
import { users, type User } from './users.schema.js';

// Posts table schema
export const posts = mysqlTable(
    'posts',
    {
        id: serial('id').primaryKey(),
        user_id: serial('user_id').notNull().references(() => users.id),
        title: varchar('title', { length: 255 }).notNull(),
        content: text('content').notNull(),
        published_at: timestamp('published_at'),
        deleted_at: timestamp('deleted_at'),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
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

