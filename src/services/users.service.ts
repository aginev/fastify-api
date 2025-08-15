import { eq } from 'drizzle-orm';
import { db, users, posts, type User, type NewUser, type UpdateUser, type UserWithPosts } from '../db/index.js';

/**
 * User service for handling all user-related database operations
 */
export const userService = {
    /**
     * Create a new user
     */
    async create(userData: NewUser): Promise<User> {
        await db.insert(users).values(userData);
        // For MySQL, we need to fetch the created user by email/username since we don't have insertId
        const [user] = await db.select().from(users).where(eq(users.email, userData.email));
        if (!user) {
            throw new Error('Failed to create user');
        }
        return user;
    },

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    },

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    },

    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
    },

    /**
     * Find all users with pagination
     */
    async findAll(limit = 50, offset = 0): Promise<User[]> {
        return db.select().from(users).limit(limit).offset(offset);
    },

    /**
     * Update user by ID
     */
    async update(id: number, userData: UpdateUser): Promise<User | undefined> {
        await db
            .update(users)
            .set({ ...userData, updatedAt: new Date() })
            .where(eq(users.id, id));

        // Fetch the updated user
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    },

    /**
     * Delete user by ID
     */
    async delete(id: number): Promise<boolean> {
        await db.delete(users).where(eq(users.id, id));
        // For MySQL, we can't easily check affected rows, so we'll verify by trying to fetch the user
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return !user; // Return true if user was deleted (not found)
    },

    /**
     * Find user with posts
     */
    async findByIdWithPosts(id: number): Promise<UserWithPosts | undefined> {
        // First get the user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id));

        if (!user) return undefined;

        // Then get the user's posts
        const userPosts = await db
            .select()
            .from(posts)
            .where(eq(posts.userId, id));

        return {
            ...user,
            posts: userPosts
        };
    },
};
