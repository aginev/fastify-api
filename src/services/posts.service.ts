import { eq, isNull, isNotNull, and } from 'drizzle-orm';
import { db, posts, users, type Post, type NewPost, type UpdatePost, type PostWithUser } from '../db/index.js';
import { PostError } from '../errors/index.js';

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
                postData: { title: postData.title, user_id: postData.user_id }
            });
        }

        // Fetch the complete post data using the returned ID
        const [post] = await db.select().from(posts).where(eq(posts.id, result[0].id)).limit(1);

        if (!post) {
            throw PostError.creationFailed({
                reason: 'Post not found after insert',
                postId: result[0].id,
                postData: { title: postData.title, user_id: postData.user_id }
            });
        }

        return post;
    },

    /**
     * Find post by ID (excluding soft deleted)
     */
    async findById(id: number): Promise<Post | undefined> {
        const [post] = await db
            .select()
            .from(posts)
            .where(
                and(
                    eq(posts.id, id),
                    isNull(posts.deleted_at)
                )
            )
            .limit(1);

        return post;
    },

    /**
     * Find post by ID including soft deleted
     */
    async findByIdIncludingDeleted(id: number): Promise<Post | undefined> {
        const [post] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        return post;
    },

    /**
     * Find post with user information
     */
    async findByIdWithUser(id: number): Promise<PostWithUser | undefined> {
        const [post] = await db
            .select({
                id: posts.id,
                user_id: posts.user_id,
                title: posts.title,
                content: posts.content,
                published_at: posts.published_at,
                deleted_at: posts.deleted_at,
                created_at: posts.created_at,
                updated_at: posts.updated_at,
                user: {
                    id: users.id,
                    email: users.email,
                    password_hash: users.password_hash,
                    first_name: users.first_name,
                    last_name: users.last_name,
                    is_active: users.is_active,
                    created_at: users.created_at,
                    updated_at: users.updated_at
                }
            })
            .from(posts)
            .innerJoin(users, eq(posts.user_id, users.id))
            .where(
                and(
                    eq(posts.id, id),
                    isNull(posts.deleted_at)
                )
            )
            .limit(1);

        if (!post) {
            return undefined;
        }

        return {
            id: post.id,
            user_id: post.user_id,
            title: post.title,
            content: post.content,
            published_at: post.published_at,
            deleted_at: post.deleted_at,
            created_at: post.created_at,
            updated_at: post.updated_at,
            user: post.user
        };
    },

    /**
     * Find all posts (excluding soft deleted)
     */
    async findAll(limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(isNull(posts.deleted_at))
            .limit(limit)
            .offset(offset);
    },

    /**
     * Find posts by user ID (excluding soft deleted)
     */
    async findByUserId(userId: number, limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(
                and(
                    eq(posts.user_id, userId),
                    isNull(posts.deleted_at)
                )
            )
            .limit(limit)
            .offset(offset);
    },

    /**
     * Find published posts (excluding soft deleted)
     */
    async findPublished(limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(
                and(
                    isNotNull(posts.published_at),
                    isNull(posts.deleted_at)
                )
            )
            .limit(limit)
            .offset(offset);
    },

    /**
     * Find unpublished posts (excluding soft deleted)
     */
    async findUnpublished(limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(
                and(
                    isNull(posts.published_at),
                    isNull(posts.deleted_at)
                )
            )
            .limit(limit)
            .offset(offset);
    },

    /**
     * Update post
     */
    async update(id: number, postData: UpdatePost): Promise<Post | undefined> {
        await db
            .update(posts)
            .set({ ...postData, updated_at: new Date() })
            .where(eq(posts.id, id));

        // Fetch updated post to verify the update was successful
        const [updatedPost] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        return updatedPost;
    },

    /**
     * Publish post
     */
    async publish(id: number): Promise<Post | undefined> {
        // Check if post exists and is not already published
        const [existingPost] = await db
            .select()
            .from(posts)
            .where(
                and(
                    eq(posts.id, id),
                    isNull(posts.deleted_at)
                )
            )
            .limit(1);

        if (!existingPost) {
            throw PostError.notFound(id);
        }

        if (existingPost.published_at) {
            throw PostError.alreadyPublished(id);
        }

        await db
            .update(posts)
            .set({ published_at: new Date(), updated_at: new Date() })
            .where(eq(posts.id, id));

        // Fetch updated post
        const [updatedPost] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        return updatedPost;
    },

    /**
     * Unpublish post
     */
    async unpublish(id: number): Promise<Post | undefined> {
        // Check if post exists and is published
        const [existingPost] = await db
            .select()
            .from(posts)
            .where(
                and(
                    eq(posts.id, id),
                    isNull(posts.deleted_at)
                )
            )
            .limit(1);

        if (!existingPost) {
            throw PostError.notFound(id);
        }

        if (!existingPost.published_at) {
            throw PostError.notPublished(id);
        }

        await db
            .update(posts)
            .set({ published_at: null, updated_at: new Date() })
            .where(eq(posts.id, id));

        // Fetch updated post
        const [updatedPost] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        return updatedPost;
    },

    /**
     * Soft delete post
     */
    async delete(id: number): Promise<boolean> {
        await db
            .update(posts)
            .set({ deleted_at: new Date(), updated_at: new Date() })
            .where(eq(posts.id, id));

        // Verify the update was successful by checking if post exists
        const [post] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        return !!post;
    },

    /**
     * Restore soft deleted post
     */
    async restore(id: number): Promise<Post | undefined> {
        await db
            .update(posts)
            .set({ deleted_at: null, updated_at: new Date() })
            .where(eq(posts.id, id));

        // Fetch restored post
        const [restoredPost] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        return restoredPost;
    },

    /**
     * Hard delete post (permanently remove)
     */
    async hardDelete(id: number): Promise<boolean> {
        await db.delete(posts).where(eq(posts.id, id));

        // Verify the delete was successful by checking if post exists
        const [post] = await db
            .select()
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1);

        return !post; // Return true if post was deleted (not found)
    },

    /**
     * Find soft deleted posts
     */
    async findDeleted(limit = 50, offset = 0): Promise<Post[]> {
        return db
            .select()
            .from(posts)
            .where(isNotNull(posts.deleted_at))
            .limit(limit)
            .offset(offset);
    }
};
