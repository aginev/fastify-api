import type { FastifyInstance } from 'fastify';
import type { Request, Reply } from '../types';
import { userService } from '../services/users.service.js';
import { UserError } from '../errors/index.js';
import {
    UserDataSchema,
    UserParamsSchema,
    ChangePasswordSchema
} from '../models/user.model';

export async function userRoutes(app: FastifyInstance) {
    // Get all active users (excluding soft deleted)
    app.get('/', async (req: Request, reply: Reply) => {
        const users = await userService.findAll();

        return reply.send({ users });
    });

    // Get user by ID (excluding soft deleted)
    app.get('/:id', async (req: Request, reply: Reply) => {
        const params = UserParamsSchema.parse(req.params);

        const user = await userService.findById(params.id);

        if (!user) {
            throw UserError.notFound(params.id);
        }

        return reply.send({ user });
    });

    // Create new user
    app.post('/', async (req: Request, reply: Reply) => {
        const userData = UserDataSchema.parse(req.body);

        // Transform to match database schema
        const drizzleUserData = {
            email: userData.email,
            password_hash: userData.password,
            first_name: userData.first_name,
            last_name: userData.last_name,
            is_active: true
        };

        const newUser = await userService.create(drizzleUserData);

        return reply.code(201).send({ user: newUser });
    });

    // Update user
    app.put('/:id', async (req: Request, reply: Reply) => {
        const params = UserParamsSchema.parse(req.params);
        const userData = UserDataSchema.parse(req.body);

        // Transform to match database schema
        const drizzleUserData: any = {};

        if (userData.first_name !== undefined) {
            drizzleUserData.first_name = userData.first_name;
        }

        if (userData.last_name !== undefined) {
            drizzleUserData.last_name = userData.last_name;
        }

        if (userData.email !== undefined) {
            drizzleUserData.email = userData.email;
        }

        if (userData.password !== undefined) {
            drizzleUserData.password_hash = userData.password;
        }

        const updatedUser = await userService.update(params.id, drizzleUserData);

        if (!updatedUser) {
            throw UserError.notFound(params.id);
        }

        return reply.send({ user: updatedUser });
    });

    // Soft delete user
    app.delete('/:id', async (req: Request, reply: Reply) => {
        const params = UserParamsSchema.parse(req.params);

        const deleted = await userService.delete(params.id);

        if (!deleted) {
            throw UserError.notFound(params.id);
        }

        return reply.send({
            deleted: params.id,
            message: 'User soft deleted successfully'
        });
    });

    // Restore soft deleted user (not implemented in service yet)
    app.patch('/:id/restore', async (req: Request, reply: Reply) => {
        const params = UserParamsSchema.parse(req.params);

        // TODO: Implement restore method in user service
        return reply.send({
            message: 'Restore functionality not implemented yet',
            user_id: params.id
        });
    });

    // Hard delete user (permanently remove)
    app.delete('/:id/hard', async (req: Request, reply: Reply) => {
        const params = UserParamsSchema.parse(req.params);

        // TODO: Implement hard delete method in user service
        return reply.send({
            message: 'Hard delete functionality not implemented yet',
            permanently_deleted: params.id
        });
    });

    // Change user password
    app.patch('/:id/password', async (req: Request, reply: Reply) => {
        const params = UserParamsSchema.parse(req.params);
        const passwordData = ChangePasswordSchema.parse(req.body);

        // TODO: Implement current password verification in service
        // For now, just update the password
        const updatedUser = await userService.updatePassword(params.id, passwordData.new_password);

        if (!updatedUser) {
            throw UserError.notFound(params.id);
        }

        return reply.send({
            message: 'Password changed successfully',
            user_id: params.id
        });
    });
}
