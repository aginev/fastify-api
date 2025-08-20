import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { users } from '@db/models';

// Base user response schema (excludes password)
export const UserResponseSchema = createSelectSchema(users, {
    // Exclude password from responses
    password: z.never(),
});

// Helper function to create response schema with user property
const createUserResponse = (statusCode: number) => ({
    [statusCode]: {
        type: 'object',
        properties: {
            user: UserResponseSchema
        }
    }
});

// Fastify response schemas for OpenAPI documentation
export const UserResponse = createUserResponse(200);

export const UserListResponse = {
    200: {
        type: 'object',
        properties: {
            users: z.array(UserResponseSchema)
        }
    }
};

export const UserUpsertResponse = {
    ...createUserResponse(200),
    ...createUserResponse(201)
};

// Type exports for response schemas
export type UserResponseType = z.infer<typeof UserResponseSchema>;
export type UserListResponseType = z.infer<typeof UserResponseSchema>[];
