import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '../types';
import {
    CreateUserSchema,
    UpdateUserSchema,
    UserParamsSchema,
    ChangePasswordSchema
} from '../models/user.model';

export async function userRoutes(app: FastifyInstance) {
    // Get all active users (excluding soft deleted)
    app.get('/', async (req: Request, reply: Reply) => {
        // TODO: Implement database query with WHERE deleted_at IS NULL
        const users: any[] = [];
        return reply.send({ users });
    });

    // Get user by ID (excluding soft deleted)
    app.get('/:id', async (req: Request, reply: Reply) => {
        // Validate route parameters
        const params = UserParamsSchema.parse(req.params);

        // TODO: Implement database query with WHERE deleted_at IS NULL
        const user = {
            id: params.id,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: '$2b$10$placeholder.hash.for.john.doe',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        return reply.send({ user });
    });

    // Create new user
    app.post('/', async (req: Request, reply: Reply) => {
        // Validate request body
        const userData = CreateUserSchema.parse(req.body);

        // TODO: Implement database insert
        const newUser = {
            id: BigInt(Date.now()), // Using BigInt for ID
            ...userData,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        return reply.code(201).send({ user: newUser });
    });

    // Update user
    app.put('/:id', async (req: Request, reply: Reply) => {
        // Validate route parameters and request body
        const params = UserParamsSchema.parse(req.params);
        const userData = UpdateUserSchema.parse(req.body);

        // TODO: Implement database update
        const updatedUser = {
            id: params.id,
            first_name: userData.first_name || 'John',
            last_name: userData.last_name || 'Doe',
            email: userData.email || 'john.doe@example.com',
            password: userData.password || '$2b$10$placeholder.hash.for.john.doe',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        return reply.send({ user: updatedUser });
    });

    // Soft delete user
    app.delete('/:id', async (req: Request, reply: Reply) => {
        // Validate route parameters
        const params = UserParamsSchema.parse(req.params);

        // TODO: Implement soft delete: UPDATE users SET deleted_at = NOW() WHERE id = ?
        const deletedAt = new Date();
        return reply.send({
            deleted: params.id,
            deleted_at: deletedAt,
        });
    });

    // Restore soft deleted user
    app.patch('/:id/restore', async (req: Request, reply: Reply) => {
        // Validate route parameters
        const params = UserParamsSchema.parse(req.params);

        // TODO: Implement restore: UPDATE users SET deleted_at = NULL WHERE id = ?
        const restoredUser = {
            id: params.id,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: '$2b$10$placeholder.hash.for.john.doe',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        return reply.send({ user: restoredUser });
    });

    // Hard delete user (permanently remove)
    app.delete('/:id/hard', async (req: Request, reply: Reply) => {
        // Validate route parameters
        const params = UserParamsSchema.parse(req.params);

        // TODO: Implement hard delete: DELETE FROM users WHERE id = ?
        return reply.send({
            permanently_deleted: params.id,
        });
    });

    // Change user password
    app.patch('/:id/password', async (req: Request, reply: Reply) => {
        // Validate route parameters and request body
        const params = UserParamsSchema.parse(req.params);
        const passwordData = ChangePasswordSchema.parse(req.body);

        // TODO: Implement password change:
        // 1. Verify current password hash matches stored hash
        // 2. Hash new password using bcrypt or similar
        // 3. Update password in database
        // 4. Update updated_at timestamp

        return reply.send({
            message: 'Password changed successfully',
            user_id: params.id,
        });
    });
}
