import { eq, or, and, ne, isNull } from 'drizzle-orm';
import { db, users, posts, type User, type NewUser, type UpdateUser } from '@db';
import bcrypt from 'bcrypt';
import {
    UserError
} from '@errors';

/**
 * User service for handling all user-related database operations
 */
export const userService = {
    /**
     * Hash a password securely
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12; // Industry standard, good balance of security and performance

        return bcrypt.hash(password, saltRounds);
    },

    /**
     * Verify a password against a hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    },

    /**
     * Create a new user with hashed password
     */
    async create(userData: NewUser): Promise<User> {
        // Check if email already exists
        const existingUser = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.email, userData.email));

        if (existingUser.length > 0) {
            throw UserError.alreadyExists('email', { email: userData.email });
        }

        // Hash the password before storing
        const hashedPassword = await this.hashPassword(userData.password);

        const userToCreate = {
            ...userData,
            password: hashedPassword,
        };

        // Use $returningId() to get the inserted ID directly from MySQL
        const result = await db.insert(users).values(userToCreate).$returningId();

        // $returningId() returns an array of { id: number } objects
        if (!result || result.length === 0) {
            throw UserError.creationFailed({
                reason: 'No ID returned from insert operation',
                userData: { email: userData.email }
            });
        }

        // Fetch the complete user data using the returned ID
        const [user] = await db.select().from(users).where(eq(users.id, result[0].id)).limit(1);

        if (!user) {
            throw UserError.creationFailed({
                reason: 'User not found after insert',
                userId: result[0].id,
                userData: { email: userData.email }
            });
        }

        return user;
    },

    /**
     * Authenticate user with email and password
     */
    async authenticate(email: string, password: string): Promise<User | null> {
        // Find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            return null;
        }

        // Verify password
        const isValidPassword = await this.verifyPassword(password, user.password);

        if (!isValidPassword) {
            return null;
        }

        return user;
    },

    /**
     * Update user password
     */
    async updatePassword(userId: number, newPassword: string): Promise<User | undefined> {
        const hashedPassword = await this.hashPassword(newPassword);

        await db
            .update(users)
            .set({
                password: hashedPassword,
                updated_at: new Date()
            })
            .where(eq(users.id, userId));

        // Fetch updated user to verify the update was successful
        const [updatedUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        return updatedUser;
    },

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<User | undefined> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user;
    },

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | undefined> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user;
    },

    /**
     * Find all users with pagination
     */
    async findAll(limit = 50, offset = 0): Promise<User[]> {
        return db
            .select()
            .from(users)
            .limit(limit)
            .offset(offset);
    },

    /**
     * Check if email is available (for new users or updates)
     */
    async isEmailAvailable(email: string, excludeUserId?: number): Promise<boolean> {
        const query = excludeUserId
            ? and(eq(users.email, email), ne(users.id, excludeUserId))
            : eq(users.email, email);

        const [existingUser] = await db.select().from(users).where(query).limit(1);

        return !existingUser;
    },

    /**
     * Update user information
     */
    async update(id: number, userData: UpdateUser): Promise<User | undefined> {
        // Check if email conflicts with existing users
        if (userData.email) {
            const emailAvailable = await this.isEmailAvailable(userData.email, id);

            if (!emailAvailable) {
                throw UserError.alreadyExists('email', { email: userData.email });
            }
        }

        // Hash password if provided
        let updateData = { ...userData, updated_at: new Date() };

        if (userData.password) {
            updateData.password = await this.hashPassword(userData.password);
        }

        await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id));

        // Fetch updated user to verify the update was successful
        const [updatedUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return updatedUser;
    },

    /**
     * Soft delete user
     */
    async delete(id: number): Promise<boolean> {
        await db
            .update(users)
            .set({ updated_at: new Date() })
            .where(eq(users.id, id));

        // Verify the update was successful by checking if user exists
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return !!user;
    },

    /**
     * Find user with their posts using Drizzle relations
     */
    async findByIdWithPosts(id: number) {
        const [user] = await db.query.users.findMany({
            where: eq(users.id, id),
            with: {
                posts: {
                    where: isNull(posts.deleted_at),
                    columns: {
                        id: true,
                        title: true,
                        content: true,
                        published_at: true,
                        created_at: true,
                        updated_at: true
                    }
                }
            },
            limit: 1
        });

        return user;
    }
};
