import { z } from 'zod';
import {
    withId,
    withTimestamps,
    withSoftDelete,
    withActiveStatus
} from './base.model.js';

// User-specific field schemas
const userFields = {
    first_name: z
        .string()
        .min(1, 'First name is required')
        .max(100, 'First name must be less than 100 characters'),
    last_name: z
        .string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be less than 100 characters'),
    email: z.email({ error: 'Email must be a valid email address' }),
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
};

// User schemas using pure spread syntax - compose exactly what you want!
// Users need: id, timestamps, soft delete, active status
export const UserSchema = z.object({
    ...withId,
    ...userFields,
    ...withActiveStatus,
    ...withTimestamps,
    ...withSoftDelete,
});

// For creation and updates: only business fields (no id, timestamps, or soft delete)
export const UserDataSchema = z.object({
    ...userFields,
});

// Params schema for route parameters
export const UserParamsSchema = z.object({
    id: z.coerce.number().int().positive('User ID must be a positive integer'),
});

// Response schemas
export const UserResponseSchema = z.object({
    user: UserSchema,
});

export const UsersResponseSchema = z.object({
    users: z.array(UserSchema),
});

// Soft delete schema
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
    new_password: userFields.password,
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserData = z.infer<typeof UserDataSchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

// Password strength validation function
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
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
}