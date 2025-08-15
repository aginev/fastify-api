# Services Structure

This document explains the service layer organization and how business logic is separated by resource.

## Overview

Services are organized by resource/domain and contain all business logic for database operations, data validation, and business rules. Each service is responsible for a specific entity and provides a clean API for the application layer.

## Structure

```
src/services/
├── index.ts              # Main export file
├── users.service.ts      # User-related business logic
└── posts.service.ts      # Post-related business logic
```

## Service Organization

### User Service (`users.service.ts`)

**Responsibilities:**
- User CRUD operations
- User authentication data management
- User search and filtering

**Available Methods:**
- `create(userData)` - Create a new user
- `findById(id)` - Find user by ID
- `findByEmail(email)` - Find user by email
- `findByUsername(username)` - Find user by username
- `findAll(limit, offset)` - Get all users with pagination
- `update(id, userData)` - Update user by ID
- `delete(id)` - Delete user by ID
- `findByIdWithPosts(id)` - Find user with all their posts

**Example Usage:**
```typescript
import { userService } from '../services/users.service.js';

// Create a new user
const newUser = await userService.create({
    email: 'user@example.com',
    username: 'johndoe',
    passwordHash: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe'
});

// Find user by email
const user = await userService.findByEmail('user@example.com');
```

### Post Service (`posts.service.ts`)

**Responsibilities:**
- Post CRUD operations
- Post publishing logic
- Post search and filtering by author

**Available Methods:**
- `create(postData)` - Create a new post
- `findById(id)` - Find post by ID (excludes soft-deleted posts)
- `findByUser(userId, limit, offset)` - Find posts by user with pagination (excludes soft-deleted posts)
- `findPublished(limit, offset)` - Find all published posts (excludes soft-deleted posts)
- `update(id, postData)` - Update post by ID (excludes soft-deleted posts)
- `delete(id)` - Soft delete post by ID (sets deletedAt timestamp)
- `restore(id)` - Restore a soft-deleted post
- `hardDelete(id)` - Permanently delete post from database
- `findByIdWithUser(id)` - Find post with user information (excludes soft-deleted posts)
- `publish(id)` - Publish a post (sets publishedAt timestamp)
- `unpublish(id)` - Unpublish a post (sets publishedAt to null)
- `findDeleted(limit, offset)` - Find soft-deleted posts (administrative)
- `findByIdIncludingDeleted(id)` - Find post by ID including soft-deleted posts

**Example Usage:**
```typescript
import { postService } from '../services/posts.service.js';

// Create a new post
const newPost = await postService.create({
    title: 'My First Post',
    content: 'This is the content of my post',
    userId: 1,
    isPublished: false
});

// Find published posts
const publishedPosts = await postService.findPublished(10, 0);
```

## Importing Services

### Import All Services

```typescript
import { userService, postService } from '../services/index.js';
```

### Import Specific Services

```typescript
// Import only user service
import { userService } from '../services/users.service.js';

// Import only post service
import { postService } from '../services/posts.service.js';
```

### Import from Database Module

```typescript
// Services are also exported from the database module
import { userService, postService } from '../db/index.js';
```

## Benefits of This Structure

1. **Separation of Concerns** - Each service handles one resource
2. **Better Organization** - Easy to find and modify specific business logic
3. **Maintainability** - Changes to one service don't affect others
4. **Testability** - Each service can be tested independently
5. **Scalability** - Easy to add new services for new resources
6. **Code Reusability** - Services can be imported where needed

## Adding New Services

### 1. Create Service File

```typescript
// src/services/new-resource.service.ts
import { eq } from 'drizzle-orm';
import { db, newResource, type NewResource, type UpdateNewResource } from '../db/index.js';

export const newResourceService = {
    async create(data: NewResource) {
        // Implementation
    },

    async findById(id: number) {
        // Implementation
    },

    // ... other methods
};
```

### 2. Add to Services Index

```typescript
// src/services/index.ts
export * from './users.service.js';
export * from './posts.service.js';
export * from './new-resource.service.js';  // Add this line

export { userService } from './users.service.js';
export { postService } from './posts.service.js';
export { newResourceService } from './new-resource.service.js';  // Add this line
```

### 3. Update Database Index (if needed)

```typescript
// src/db/index.ts
export * from './connection.js';
export * from './schemas/index.js';
export * from '../services/index.js';  // This already exports everything
```

## Relationships

The services support relationships between entities:

### User-Post Relationship

- **One-to-Many**: A user can have multiple posts
- **Foreign Key**: `posts.userId` references `users.id`
- **Methods**:
  - `userService.findByIdWithPosts(id)` - Get user with all their posts
  - `postService.findByIdWithUser(id)` - Get post with user information
  - `postService.findByUser(userId, limit, offset)` - Get posts by specific user

### Example Usage

```typescript
// Get user with all their posts
const userWithPosts = await userService.findByIdWithPosts(1);
console.log(`User ${userWithPosts.username} has ${userWithPosts.posts.length} posts`);

// Get post with user information
const postWithUser = await postService.findByIdWithUser(1);
console.log(`Post "${postWithUser.title}" by ${postWithUser.user.username}`);

// Get all posts by a specific user
const userPosts = await postService.findByUser(1, 10, 0);
console.log(`Found ${userPosts.length} posts by user`);
```

## Soft Delete Implementation

The posts service implements **soft deletes** for data safety and recovery:

### **How It Works:**
- **`delete(id)`** - Sets `deletedAt` timestamp instead of removing from database
- **All queries** - Automatically exclude soft-deleted posts by default
- **Recovery** - Soft-deleted posts can be restored using `restore(id)`
- **Administrative** - Use `findDeleted()` to see soft-deleted posts

### **Benefits:**
- **Data Safety** - No accidental permanent data loss
- **Recovery** - Can restore posts if deleted by mistake
- **Audit Trail** - Know when posts were deleted and by whom
- **Compliance** - Maintain data for legal/regulatory requirements

### **Example Usage:**
```typescript
// Soft delete a post
await postService.delete(1); // Sets deletedAt to current timestamp

// Post is now hidden from normal queries
const post = await postService.findById(1); // Returns undefined

// But can be found in deleted posts
const deletedPosts = await postService.findDeleted();

// And can be restored
await postService.restore(1); // Sets deletedAt back to null

// Post is now visible again
const restoredPost = await postService.findById(1); // Returns the post
```

## Service Best Practices

1. **Single Responsibility** - Each service should handle one resource
2. **Consistent API** - Use similar method names across services
3. **Error Handling** - Provide meaningful error messages
4. **Documentation** - Use JSDoc comments for all methods
5. **Type Safety** - Leverage TypeScript types from schemas
6. **Validation** - Validate input data before database operations
7. **Transaction Support** - Use database transactions for complex operations
8. **Relationship Handling** - Provide methods for fetching related data
9. **Soft Delete Support** - Implement soft deletes for data safety

## Database Integration

Services are tightly integrated with the database layer:

- **Schemas** - Import table schemas and types from `../db/index.js`
- **Connection** - Use the shared database connection instance
- **Types** - Leverage inferred types from Drizzle ORM schemas
- **Queries** - Use Drizzle ORM query builders for type-safe operations

## Error Handling

Services handle errors gracefully:

- **Validation Errors** - Check for required fields and data types
- **Database Errors** - Handle connection and query failures
- **Business Logic Errors** - Provide meaningful error messages
- **Not Found Errors** - Return undefined for missing resources

## Performance Considerations

- **Pagination** - Use limit/offset for large result sets
- **Indexing** - Ensure database indexes support common queries
- **Connection Pooling** - Leverage the shared database connection
- **Query Optimization** - Use efficient Drizzle ORM queries
