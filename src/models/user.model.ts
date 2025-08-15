import { z } from 'zod';

// Base user schema
export const UserSchema = z.object({
    id: z.bigint().positive(),
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.email(),
    password: z.string().min(1, 'Password is required'),
    created_at: z.date(),
    updated_at: z.date(),
    deleted_at: z.date().nullable().default(null),
});

// Input schema for creating a user (without id, created_at, updated_at)
export const CreateUserSchema = z.object({
    first_name: z
        .string()
        .min(1, 'First name is required')
        .max(100, 'First name must be less than 100 characters'),
    last_name: z
        .string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be less than 100 characters'),
    email: z.email({ error: 'Invalid email format' }),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(255, 'Password must be less than 255 characters')
        .refine(
            (password) => validatePasswordStrength(password).isValid,
            {
                message: 'Password must contain at least 8 characters, mixed case, numbers, and special characters'
            }
        ),
});

// Input schema for updating a user (all fields optional except id)
export const UpdateUserSchema = z.object({
    first_name: z
        .string()
        .min(1, 'First name is required')
        .max(100, 'First name must be less than 100 characters')
        .optional(),
    last_name: z
        .string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be less than 100 characters')
        .optional(),
    email: z.email({ error: 'Invalid email format' }),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(255, 'Password must be less than 255 characters')
        .refine(
            (password) => validatePasswordStrength(password).isValid,
            {
                message: 'Password must contain at least 8 characters, mixed case, numbers, and special characters'
            }
        )
        .optional(),
});

// Params schema for route parameters
export const UserParamsSchema = z.object({
    id: z.coerce.number().int().positive('User ID must be a positive integer'),
});

// Response schema for user data
export const UserResponseSchema = z.object({
    user: UserSchema,
});

// Response schema for users list
export const UsersResponseSchema = z.object({
    users: z.array(UserSchema),
});

// Response schema for user creation
export const CreateUserResponseSchema = z.object({
    user: UserSchema,
});

// Response schema for user update
export const UpdateUserResponseSchema = z.object({
    user: UserSchema,
});

// Soft delete schema (for soft delete operations)
export const SoftDeleteUserSchema = z.object({
    id: z.coerce.number().int().positive('User ID must be a positive integer'),
});

// Response schema for user deletion
export const DeleteUserResponseSchema = z.object({
    deleted: z.number().int().positive(),
    deleted_at: z.date(),
});

// Schema for password change operations
export const ChangePasswordSchema = z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
        .string()
        .min(8, 'New password must be at least 8 characters long')
        .max(255, 'New password must be less than 255 characters')
        .refine(
            (password) => validatePasswordStrength(password).isValid,
            {
                message: 'Password must contain at least 8 characters, mixed case, numbers, and special characters'
            }
        ),
});

// TypeScript types derived from schemas
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type SoftDeleteUserInput = z.infer<typeof SoftDeleteUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;

// Utility function to check if a user is soft deleted
export const isUserDeleted = (user: User): boolean => {
    return user.deleted_at !== null;
};

// Utility function to get active users (filter out soft deleted)
export const getActiveUsers = (users: User[]): User[] => {
    return users.filter(user => !isUserDeleted(user));
};

// Utility function to validate password strength
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
