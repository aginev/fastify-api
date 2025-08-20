import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { users } from '@db/models';

// User response schema (excludes password)
export const UserResponseSchema = createSelectSchema(users, {
    password: z.never(),
});

// Simple response schemas - just like the fastify-type-provider-zod examples
export const UserResponse = {
    200: UserResponseSchema
};

export const UserListResponse = {
    200: UserResponseSchema.array()
};

export const UserUpsertResponse = {
    200: UserResponseSchema,
    201: UserResponseSchema
};

// Type exports
export type UserResponseType = z.infer<typeof UserResponseSchema>;