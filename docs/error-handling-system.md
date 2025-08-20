# Error Handling System

This document describes the comprehensive error handling system used throughout the API.

## Overview

The error handling system provides:
- **Structured error classes** for different types of errors
- **Consistent error responses** across all endpoints
- **Proper HTTP status codes** for different error scenarios
- **Detailed error information** for debugging and logging
- **User-friendly error messages** when appropriate

## Error Class Structure

### Base Error Classes

All error classes inherit from the base `AppError` class:

```typescript
// src/errors/base.error.ts
export abstract class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code: string;
    public readonly details?: Record<string, any>;

    constructor(message: string, statusCode: number, code: string, details?: Record<string, any>) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        this.details = details;
    }
}
```

### Resource-Specific Errors

Each resource has its own error classes:

```typescript
// src/errors/user.error.ts
export class UserNotFoundError extends AppError {
    constructor(userId: number) {
        super(`User with ID ${userId} not found`, 404, 'USER_NOT_FOUND', { userId });
    }
}

// src/errors/post.error.ts
export class PostNotFoundError extends AppError {
    constructor(postId: number) {
        super(`Post with ID ${postId} not found`, 404, 'POST_NOT_FOUND', { postId });
    }
}
```

## File Organization

Error files follow a consistent naming convention:
- `src/errors/base.error.ts` - Base error class definitions
- `src/errors/user.error.ts` - User-specific error classes
- `src/errors/post.error.ts` - Post-specific error classes
- `src/errors/database.error.ts` - Database-related error classes
- `src/errors/index.ts` - Exports all error classes

## Error Types

### 1. Base Errors
- `AppError` - Abstract base class for all application errors

### 2. User Errors
- `UserNotFoundError` - User not found (404)
- `UserAlreadyExistsError` - User already exists (409)
- `UserCreationFailedError` - User creation failed (500)
- `UserUpdateFailedError` - User update failed (500)
- `UserDeletionFailedError` - User deletion failed (500)

### 3. Post Errors
- `PostNotFoundError` - Post not found (404)
- `PostCreationFailedError` - Post creation failed (500)
- `PostUpdateFailedError` - Post update failed (500)
- `PostDeletionFailedError` - Post deletion failed (500)
- `PostAlreadyPublishedError` - Post already published (409)
- `PostNotPublishedError` - Post not published (400)

### 4. Database Errors
- `DatabaseConnectionError` - Database connection failed (500)
- `DatabaseQueryError` - Database query failed (500)
- `DatabaseTransactionError` - Database transaction failed (500)

## Usage Examples

### In Services

```typescript
import { UserError } from '../errors/index.js';

// Throw user not found error
if (!user) {
    throw UserError.notFound(id);
}

// Throw user already exists error
if (existingUser) {
    throw UserError.alreadyExists('email', { email: userData.email });
}
```

### In Routes

```typescript
import { UserError } from '../errors/index.js';

app.get('/:id', async (req, reply) => {
    const user = await userService.findById(id);
    
    if (!user) {
        throw UserError.notFound(id);
    }
    
    return reply.send({ user });
});
```

## Error Response Format

All errors follow a consistent response format:

```json
{
    "error": {
        "message": "User with ID 123 not found",
        "code": "USER_NOT_FOUND",
        "statusCode": 404,
        "details": {
            "userId": 123
        }
    }
}
```

## Error Handler Middleware

The global error handler middleware:
- Catches all thrown errors
- Formats them consistently
- Logs errors appropriately
- Returns proper HTTP status codes
- Provides detailed error information in development

```typescript
// src/middleware/error-handler.ts
app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                details: error.details
            }
        });
    }
    
    // Handle unexpected errors
    return reply.status(500).send({
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
            statusCode: 500
        }
    });
});
```

## Best Practices

### 1. Use Specific Error Classes
```typescript
// Good
throw new UserNotFoundError(userId);

// Avoid
throw new Error('User not found');
```

### 2. Include Relevant Details
```typescript
// Good
throw new UserAlreadyExistsError('email', { email: userData.email });

// Avoid
throw new UserAlreadyExistsError('User already exists');
```

### 3. Handle Errors Appropriately
```typescript
try {
    const user = await userService.findById(id);
    return user;
} catch (error) {
    if (error instanceof UserNotFoundError) {
        // Handle user not found
        return null;
    }
    // Re-throw unexpected errors
    throw error;
}
```

### 4. Log Errors with Context
```typescript
app.log.error({
    error: error.message,
    code: error.code,
    userId: req.params.id,
    requestId: req.id
});
```

## Adding New Error Classes

1. Create a new file: `src/errors/[resource].error.ts`
2. Extend from `AppError` or appropriate base class
3. Provide meaningful error messages and codes
4. Include relevant details in the constructor
5. Export from `src/errors/index.ts`
6. Use in your services and routes

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `USER_NOT_FOUND` | User not found | 404 |
| `USER_ALREADY_EXISTS` | User already exists | 409 |
| `POST_NOT_FOUND` | Post not found | 404 |
| `POST_ALREADY_PUBLISHED` | Post already published | 409 |
| `DATABASE_CONNECTION_ERROR` | Database connection failed | 500 |
| `INTERNAL_ERROR` | Unexpected internal error | 500 |

## Testing Error Scenarios

When testing your API, ensure you cover:
- **Happy path** - Successful operations
- **Error scenarios** - All possible error conditions
- **Edge cases** - Boundary conditions and invalid inputs
- **Error responses** - Verify error format and status codes
- **Error logging** - Ensure errors are properly logged

## Monitoring and Alerting

Consider implementing:
- **Error rate monitoring** - Track error frequency
- **Error alerting** - Notify on critical errors
- **Error aggregation** - Group similar errors
- **Performance impact** - Monitor error impact on response times
- **User experience** - Track user-facing error rates
