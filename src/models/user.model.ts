import { z } from 'zod';

// Base user schema
export const UserSchema = z.object({
  id: z.uuid(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.email(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable().default(null)
});

// Input schema for creating a user (without id, created_at, updated_at)
export const CreateUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  email: z.email({ error: 'Invalid email format' })
});

// Input schema for updating a user (all fields optional except id)
export const UpdateUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters').optional(),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters').optional(),
  email: z.email({ error: 'Invalid email format' })
});

// Params schema for route parameters
export const UserParamsSchema = z.object({
  id: z.uuid('Invalid user ID format')
});

// Response schema for user data
export const UserResponseSchema = z.object({
  user: UserSchema
});

// Response schema for users list
export const UsersResponseSchema = z.object({
  users: z.array(UserSchema)
});

// Response schema for user creation
export const CreateUserResponseSchema = z.object({
  user: UserSchema
});

// Response schema for user update
export const UpdateUserResponseSchema = z.object({
  user: UserSchema
});

// Soft delete schema (for soft delete operations)
export const SoftDeleteUserSchema = z.object({
  id: z.uuid('Invalid user ID format')
});

// Response schema for user deletion
export const DeleteUserResponseSchema = z.object({
  deleted: z.uuid(),
  deleted_at: z.date()
});

// TypeScript types derived from schemas
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserParams = z.infer<typeof UserParamsSchema>;
export type SoftDeleteUserInput = z.infer<typeof SoftDeleteUserSchema>;
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
