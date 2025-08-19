import { mysqlTable, varchar, text, timestamp, index, bigint, foreignKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { withPrimary, withSoftDelete, withTimestamps } from './base';
import { users } from './users.model';

// Posts table schema
export const posts = mysqlTable(
    'posts',
    {
        ...withPrimary,
        user_id: bigint('user_id', { mode: 'number' }).notNull(),
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
        foreignKey({
            name: 'posts_user_id_fk',
            columns: [table.user_id],
            foreignColumns: [users.id],
        }).onDelete('cascade').onUpdate('cascade'),
    ]
);

// Posts table relations
export const postsRelations = relations(posts, ({ one }) => ({
    user: one(users, {
        fields: [posts.user_id],
        references: [users.id],
        relationName: 'user_posts',
    }),
}));

// Export types for use in your application
export type Post = typeof posts.$inferSelect;
export type NewPost = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type UpdatePost = Partial<Omit<NewPost, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;

