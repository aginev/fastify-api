import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { users } from '@db/models';

// Generate Zod schema directly from Drizzle table definition
export const UserDataRequest = createInsertSchema(users, {
    // Override fields that shouldn't be in API requests
    id: z.never(), // Never allow ID in requests
    created_at: z.never(), // Never allow created_at in requests
    updated_at: z.never(), // Never allow updated_at in requests
    deleted_at: z.never(), // Never allow deleted_at in requests

    // Password field with custom validation
    password: z.string().min(8, 'Password must be at least 8 characters long').max(255, 'Password must be less than 255 characters').refine(
        (password) => validatePasswordStrength(password).isValid,
        { message: 'Password must contain at least 8 characters, mixed case, numbers, and special characters' }
    ).describe('Password field (will be hashed before storage)'),

    // Override is_active to have a default value
    is_active: z.boolean().default(true),
});

export const ChangePasswordRequest = z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters long').max(255, 'Password must be less than 255 characters').refine(
        (password) => validatePasswordStrength(password).isValid,
        { message: 'Password must contain at least 8 characters, mixed case, numbers, and special characters' }
    ),
});

// Type exports for request validation
export type UserData = z.infer<typeof UserDataRequest>;
export type ChangePassword = z.infer<typeof ChangePasswordRequest>;

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
