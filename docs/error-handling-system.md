# Error Handling System

This document describes the centralized error handling system for the Node.js application, organized by resource and domain.

## 📁 Structure

```
src/errors/
├── index.ts               # Main export file
├── base.ts                # Base AppError class
├── user-errors.ts         # User-related errors
├── post-errors.ts         # Post-related errors
└── database-errors.ts     # Database-related errors
```

## 🏗️ Architecture

### **Base Error Class (`base.ts`)**
- **`AppError`** - Base class extending Error with FastifyError and ErrorContext
- **`ErrorContext`** - Interface for structured error context
- Provides consistent error structure across the application

### **Resource-Specific Errors**

#### **User Errors (`user-errors.ts`)**
- **`UserAlreadyExistsError`** - Email/username conflicts (409 Conflict)
- **`UserNotFoundError`** - User not found (404 Not Found)
- **`UserCreationFailedError`** - Insert failures (500 Internal Server Error)
- **`UserUpdateFailedError`** - Update failures (500 Internal Server Error)
- **`UserDeletionFailedError`** - Delete failures (500 Internal Server Error)
- **`AuthenticationFailedError`** - Invalid credentials (401 Unauthorized)
- **`PasswordUpdateFailedError`** - Password update failures (500 Internal Server Error)

#### **Post Errors (`post-errors.ts`)**
- **`PostNotFoundError`** - Post not found (404 Not Found)
- **`PostCreationFailedError`** - Insert failures (500 Internal Server Error)
- **`PostUpdateFailedError`** - Update failures (500 Internal Server Error)
- **`PostDeletionFailedError`** - Delete failures (500 Internal Server Error)
- **`PostAlreadyPublishedError`** - Already published (400 Bad Request)
- **`PostNotPublishedError`** - Not published (400 Bad Request)
- **`PostAlreadyDeletedError`** - Already deleted (400 Bad Request)
- **`PostNotDeletedError`** - Not deleted (400 Bad Request)

#### **Database Errors (`database-errors.ts`)**
- **`DatabaseConstraintError`** - Constraint violations (409 Conflict)
- **`DatabaseConnectionError`** - Connection failures (500 Internal Server Error)
- **`DatabaseQueryError`** - Query failures (500 Internal Server Error)
- **`DatabaseTransactionError`** - Transaction failures (500 Internal Server Error)

## 🚀 Usage

### **Importing Errors**
```typescript
// Import specific error types
import { 
    UserAlreadyExistsError, 
    PostNotFoundError,
    DatabaseConstraintError 
} from '../errors/index.js';

// Import base AppError
import { AppError } from '../errors/index.js';
```

### **Throwing Errors with Context**
```typescript
// User errors
throw new UserAlreadyExistsError('email', { 
    email: 'user@example.com',
    userId: 123 
});

// Post errors
throw new PostNotFoundError(456, { 
    operation: 'update',
    userId: 123 
});

// Database errors
throw new DatabaseConstraintError(
    'User creation',
    'unique constraint',
    { 
        email: 'user@example.com',
        reason: 'race condition' 
    }
);
```

### **Error Handling in Services**
```typescript
// ✅ Keep try/catch for complex operations with race condition handling
try {
    // Complex business logic with multiple steps
    const result = await db.insert(users).values(userData).$returningId();
    // ... additional logic
} catch (error) {
    // Handle database constraint violations (race conditions)
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
        throw new DatabaseConstraintError(
            'User creation',
            'unique constraint',
            { email: userData.email, reason: 'race condition' }
        );
    }
    throw error; // Let other errors bubble up naturally
}

// ✅ Simple operations don't need try/catch
async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user; // Let errors bubble up naturally
}
```

## 📊 HTTP Status Codes

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| **400 Bad Request** | 400 | Client errors (invalid operations) |
| **401 Unauthorized** | 401 | Authentication failures |
| **404 Not Found** | 404 | Resource not found |
| **409 Conflict** | 409 | Constraint violations |
| **500 Internal Server Error** | 500 | Server/database failures |

## 🔧 Error Context

Each error includes rich context for debugging and monitoring:

```typescript
{
    statusCode: 409,
    code: 'USER_ALREADY_EXISTS',
    context: {
        field: 'email',
        email: 'user@example.com',
        userId: 123,
        timestamp: '2024-01-01T00:00:00.000Z'
    }
}
```

## 🎯 Benefits

### **✅ Consistency**
- **Uniform error structure** across all services
- **Standardized HTTP status codes** for API responses
- **Consistent error handling** patterns

### **✅ Maintainability**
- **Resource-based organization** makes errors easy to find
- **Clear separation of concerns** between different error types
- **Centralized error definitions** for easy updates

### **✅ Developer Experience**
- **Type safety** with TypeScript
- **Rich error context** for debugging
- **Clear error categorization** for different scenarios

### **✅ Monitoring & Logging**
- **Structured error data** for analytics
- **Error categorization** for alerting
- **Rich context** for troubleshooting

## 🔄 Adding New Errors

### **1. Create Resource-Specific File**
```typescript
// src/errors/new-resource-errors.ts
import { AppError } from './base.js';

export class NewResourceNotFoundError extends AppError {
    constructor(resourceId?: number, context: Record<string, unknown> = {}) {
        super(
            'New resource not found',
            404,
            'NEW_RESOURCE_NOT_FOUND',
            { resourceId, ...context }
        );
    }
}
```

### **2. Update Index File**
```typescript
// src/errors/index.ts
export * from './new-resource-errors.js';
```

### **3. Use in Services**
```typescript
import { NewResourceNotFoundError } from '../errors/index.js';

throw new NewResourceNotFoundError(123, { operation: 'update' });
```

## 📝 Best Practices

1. **Always use specific error types** instead of generic Error
2. **Include rich context** for debugging and monitoring
3. **Use appropriate HTTP status codes** for different error types
4. **Organize errors by resource** for maintainability
5. **Extend AppError** for consistency across the application
6. **Use try/catch strategically** - not for every database query

## 🎯 When to Use Try/Catch

### **✅ Keep Try/Catch For:**
- **Complex operations** with multiple database steps
- **Race condition handling** (unique constraint violations)
- **Error transformation** (wrapping generic errors with context)
- **Business logic validation** (checking state before operations)
- **Operations that need custom error handling**

### **❌ Remove Try/Catch For:**
- **Simple queries** (findById, findByEmail, etc.)
- **Basic CRUD operations** that don't need error transformation
- **Read operations** that can fail gracefully
- **Operations where default error handling is sufficient**

### **Example: Strategic Try/Catch Usage**
```typescript
// ✅ Complex operation with race condition handling
async create(userData: NewUser): Promise<User> {
    try {
        const result = await db.insert(users).values(userData).$returningId();
        // ... additional logic
    } catch (error) {
        // Handle specific database constraint violations
        if (error instanceof Error && error.message.includes('Duplicate entry')) {
            throw new DatabaseConstraintError('User creation', 'unique constraint', { userData });
        }
        throw error; // Let other errors bubble up
    }
}

// ✅ Simple operation - no try/catch needed
async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user; // Errors bubble up naturally
}
```
