import { eq, or, and, ne } from 'drizzle-orm';
import { db, users, posts, type User, type NewUser, type UpdateUser, type UserWithPosts } from '../db/index.js';
import bcrypt from 'bcrypt';

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
        // Check if email or username already exists in a single query
        const existingUser = await db
            .select({ email: users.email, username: users.username })
            .from(users)
            .where(
                or(
                    eq(users.email, userData.email),
                    eq(users.username, userData.username)
                )
            );

        if (existingUser.length > 0) {
            const conflicts = existingUser.map(user => {
                if (user.email === userData.email) {
                    return 'email';
                }
                if (user.username === userData.username) {
                    return 'username';
                }
                return null;
            }).filter(Boolean);

            if (conflicts.includes('email') && conflicts.includes('username')) {
                throw new Error('Email and username already exist in the system');
            } else if (conflicts.includes('email')) {
                throw new Error('Email already exists in the system');
            } else if (conflicts.includes('username')) {
                throw new Error('Username already exists in the system');
            }
        }

        // Hash the password before storing
        const hashedPassword = await this.hashPassword(userData.passwordHash);

        const userToCreate = {
            ...userData,
            passwordHash: hashedPassword,
        };

        try {
            // Use $returningId() to get the inserted ID directly from MySQL
            const result = await db.insert(users).values(userToCreate).$returningId();

            // $returningId() returns an array of { id: number } objects
            if (!result || result.length === 0) {
                throw new Error('Failed to create user');
            }

            // Fetch the complete user data using the returned ID
            const [user] = await db.select().from(users).where(eq(users.id, result[0].id));

            if (!user) {
                throw new Error('Failed to create user');
            }

            return user;
        } catch (error) {
            // Handle database-level unique constraint violations (race condition fallback)
            if (error instanceof Error && error.message.includes('Duplicate entry')) {
                // Since we already validated, this is likely a race condition
                // Provide a generic but helpful error message
                throw new Error('User creation failed - email or username may already exist. Please try again.');
            }

            throw error;
        }
    },

    /**
     * Authenticate user with email/username and password
     */
    async authenticate(identifier: string, password: string): Promise<User | null> {
        // Single query to find user by email OR username
        const [user] = await db
            .select()
            .from(users)
            .where(
                or(
                    eq(users.email, identifier),
                    eq(users.username, identifier)
                )
            );

        if (!user) {

            return null;
        }

        // Verify password
        const isValidPassword = await this.verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {

            return null;
        }

        return user;
    },

    /**
     * Update user password with new hashed password
     */
    async updatePassword(userId: number, newPassword: string): Promise<User | undefined> {
        const hashedPassword = await this.hashPassword(newPassword);

        await db
            .update(users)
            .set({
                passwordHash: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId));

        // Fetch the updated user
        const [user] = await db.select().from(users).where(eq(users.id, userId));

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
     * Check if email is available (not used by any user)
     */
    async isEmailAvailable(email: string, excludeUserId?: number): Promise<boolean> {
        const query = excludeUserId
            ? and(eq(users.email, email), ne(users.id, excludeUserId))
            : eq(users.email, email);

        const [existingUser] = await db.select().from(users).where(query);
        return !existingUser;
    },

    /**
     * Check if username is available (not used by any user)
     */
    async isUsernameAvailable(username: string, excludeUserId?: number): Promise<boolean> {
        const query = excludeUserId
            ? and(eq(users.username, username), ne(users.id, excludeUserId))
            : eq(users.username, username);

        const [existingUser] = await db.select().from(users).where(query);
        return !existingUser;
    },

    /**
     * Check if email and username are available (single query)
     */
    async areEmailAndUsernameAvailable(email: string, username: string, excludeUserId?: number): Promise<{ emailAvailable: boolean; usernameAvailable: boolean; conflicts: string[] }> {
        const baseQuery = excludeUserId
            ? and(
                or(
                    eq(users.email, email),
                    eq(users.username, username)
                ),
                ne(users.id, excludeUserId)
            )
            : or(
                eq(users.email, email),
                eq(users.username, username)
            );

        const existingUsers = await db
            .select({ email: users.email, username: users.username })
            .from(users)
            .where(baseQuery);

        const conflicts = existingUsers.map(user => {
            if (user.email === email) {
                return 'email';
            }
            if (user.username === username) {
                return 'username';
            }
            return null;
        }).filter(Boolean) as string[];

        return {
            emailAvailable: !conflicts.includes('email'),
            usernameAvailable: !conflicts.includes('username'),
            conflicts
        };
    },

    /**
     * Update user by ID with uniqueness validation
     */
    async update(id: number, userData: UpdateUser): Promise<User | undefined> {
        // Check uniqueness constraints if email or username is being updated
        if (userData.email || userData.username) {
            const email = userData.email || '';
            const username = userData.username || '';

            const { emailAvailable, usernameAvailable, conflicts } = await this.areEmailAndUsernameAvailable(email, username, id);

            if (userData.email && !emailAvailable) {
                throw new Error('Email already exists in the system');
            }

            if (userData.username && !usernameAvailable) {
                throw new Error('Username already exists in the system');
            }
        }

        try {
            await db
                .update(users)
                .set({ ...userData, updatedAt: new Date() })
                .where(eq(users.id, id));

            // Fetch the updated user
            const [user] = await db.select().from(users).where(eq(users.id, id));

            return user;
        } catch (error) {
            // Handle database-level unique constraint violations (race condition fallback)
            if (error instanceof Error && error.message.includes('Duplicate entry')) {
                // Since we already validated, this is likely a race condition
                // Provide a generic but helpful error message
                throw new Error('User update failed - email or username may already exist. Please try again.');
            }

            throw error;
        }
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

        if (!user) {
            return undefined;
        }

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
