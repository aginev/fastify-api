import { z } from 'zod';

const userFields = {
    first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
    last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
    email: z.email({ error: 'Email must be a valid email address' }),
    password: z.string().min(8, 'Password must be at least 8 characters long').max(255, 'Password must be less than 255 characters').refine(
        (password) => validatePasswordStrength(password).isValid,
        { message: 'Password must contain at least 8 characters, mixed case, numbers, and special characters' }
    ),
};

// Input validation schemas (for API requests)
export const UserDataRequest = z.object({
    ...userFields,
});

export const ChangePasswordRequest = z.object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: userFields.password
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
