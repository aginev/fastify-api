// Export all table models
export * from './base.js';
export * from './users.model.js';
export * from './posts.model.js';

// Re-export commonly used types for convenience
export type { User, NewUser, UpdateUser } from './users.model.js';
export type { Post, NewPost, UpdatePost } from './posts.model.js';
