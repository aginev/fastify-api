import { eq, desc, isNotNull, isNull, and } from 'drizzle-orm';
import { db, posts, users, type Post, type NewPost, type UpdatePost, type PostWithUser } from '../db/index.js';
import {
    PostError
} from '../errors/index.js';

/**
 * Post service for handling all post-related database operations
 */
export const postService = {
    /**
     * Create a new post
     */
    async create(postData: NewPost): Promise<Post> {
        // Use $returningId() to get the inserted ID directly from MySQL
        const result = await db.insert(posts).values(postData).$returningId();

        // $returningId() returns an array of { id: number } objects
        if (!result || result.length === 0) {
            throw PostError.creationFailed({
                reason: 'No ID returned from insert operation',
                postData: { title: postData.title, userId: postData.userId }
            });
        }

        // Fetch the complete post data using the returned ID
        const [post] = await db.select().from(posts).where(eq(posts.id, result[0].id)).limit(1);

        if (!post) {
            throw PostError.creationFailed({
                reason: 'Post not found after insert',
                postId: result[0].id,
                postData: { title: postData.title, userId: postData.userId }
            });
        }

        return post;
    },

    /**
     * Find post by ID (excludes soft-deleted posts)
     */
    async findById(id: number): Promise<Post | undefined> {
        const [post] = await db
            .select()
            .from(posts)
            .where(and(eq(posts.id, id), isNull(posts.deletedAt)));

        return post;
    },

    /**
     * Find posts by user ID with pagination (excludes soft-deleted posts)
     */
    async findByUser(userId: number, limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(and(eq(posts.userId, userId), isNull(posts.deletedAt)))
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);
    },

    /**
     * Find post with user information
     */
    async findByIdWithUser(id: number): Promise<PostWithUser | undefined> {
        const [post] = await db
            .select({
                id: posts.id,
                title: posts.title,
                content: posts.content,
                userId: posts.userId,
                publishedAt: posts.publishedAt,
                deletedAt: posts.deletedAt,
                createdAt: posts.createdAt,
                updatedAt: posts.updatedAt,
                user: {
                    id: users.id,
                    email: users.email,
                    username: users.username,
                    passwordHash: users.passwordHash,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    isActive: users.isActive,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                }
            })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .where(and(eq(posts.id, id), isNull(posts.deletedAt)));

        return post;
    },

    /**
     * Find all published posts with pagination (excludes soft-deleted posts)
     */
    async findPublished(limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(and(isNotNull(posts.publishedAt), isNull(posts.deletedAt)))
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset);
    },

    /**
     * Update post by ID (excludes soft-deleted posts)
     */
    async update(id: number, postData: UpdatePost): Promise<Post | undefined> {
        await db
            .update(posts)
            .set({ ...postData, updatedAt: new Date() })
            .where(and(eq(posts.id, id), isNull(posts.deletedAt)));

        // Fetch the updated post
        const [post] = await db.select().from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt))).limit(1);

        return post;
    },

    /**
     * Soft delete post by ID
     */
    async delete(id: number): Promise<boolean> {
        await db
            .update(posts)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(posts.id, id), isNull(posts.deletedAt)));

        // Verify the soft delete by checking if deletedAt is set
        const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

        return post?.deletedAt !== null && post?.deletedAt !== undefined;
    },

    /**
     * Publish a post
     */
    async publish(id: number): Promise<Post | undefined> {
        // Check if post is already published
        const [existingPost] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

        if (!existingPost) {
            throw PostError.notFound(id);
        }

        if (existingPost.publishedAt) {
            throw PostError.alreadyPublished(id);
        }

        await db
            .update(posts)
            .set({ publishedAt: new Date(), updatedAt: new Date() })
            .where(eq(posts.id, id));

        // Fetch the updated post
        const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

        if (!post) {
            throw PostError.notFound(id);
        }

        return post;
    },

    /**
     * Unpublish a post
     */
    async unpublish(id: number): Promise<Post | undefined> {
        // Check if post exists and is published
        const [existingPost] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

        if (!existingPost) {
            throw PostError.notFound(id);
        }

        if (!existingPost.publishedAt) {
            throw PostError.notPublished(id);
        }

        if (existingPost.deletedAt) {
            throw PostError.alreadyDeleted(id);
        }

        await db
            .update(posts)
            .set({ publishedAt: null, updatedAt: new Date() })
            .where(and(eq(posts.id, id), isNull(posts.deletedAt)));

        // Fetch the updated post
        const [post] = await db.select().from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt))).limit(1);

        if (!post) {
            throw PostError.notFound(id);
        }

        return post;
    },

    /**
     * Restore a soft-deleted post
     */
    async restore(id: number): Promise<Post | undefined> {
        await db
            .update(posts)
            .set({ deletedAt: null, updatedAt: new Date() })
            .where(eq(posts.id, id));

        // Fetch the restored post
        const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

        return post;
    },

    /**
     * Hard delete post by ID (permanently removes from database)
     */
    async hardDelete(id: number): Promise<boolean> {
        await db.delete(posts).where(eq(posts.id, id));
        // Verify hard delete by trying to fetch the post
        const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

        return !post; // Return true if post was hard deleted (not found)
    },

    /**
     * Find soft-deleted posts (for administrative purposes)
     */
    async findDeleted(limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(isNotNull(posts.deletedAt))
            .orderBy(desc(posts.deletedAt))
            .limit(limit)
            .offset(offset);
    },

    /**
     * Find post by ID including soft-deleted posts
     */
    async findByIdIncludingDeleted(id: number): Promise<Post | undefined> {
        const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

        return post;
    },
};
