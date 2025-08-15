// Export all table schemas
export * from './users.schema.js';
export * from './posts.schema.js';

// Re-export commonly used types for convenience
export type { User, NewUser, UpdateUser } from './users.schema.js';
export type { Post, NewPost, UpdatePost } from './posts.schema.js';
