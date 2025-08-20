# Response Schemas

This document describes the response schema system used in the API to transform and filter data before sending it to users.

## Purpose

Response schemas are used to:
- **Exclude sensitive fields** (e.g., passwords, tokens)
- **Transform data structure** for API consistency
- **Provide OpenAPI documentation** for automatic API docs generation
- **Ensure type safety** in responses

## Structure

Response schemas are organized with clear naming conventions:
- `src/requests/[resource].request.ts` - Request validation schemas
- `src/requests/[resource].response.ts` - Response transformation schemas
- `src/requests/index.ts` - Exports all request schemas
- `src/responses/index.ts` - Exports all response schemas

Current files:
- `src/requests/users.request.ts` - User input validation
- `src/requests/users.response.ts` - User response schemas (excludes passwords)
- `src/requests/posts.request.ts` - Post input validation
- `src/requests/posts.response.ts` - Post response schemas (basic structure)

## Implementation Pattern

Each response file follows a consistent pattern to avoid code duplication:

```typescript
// Helper function to create response schema with resource property
const createUserResponse = (statusCode: number) => ({
    [statusCode]: {
        type: 'object',
        properties: {
            user: UserResponseSchema
        }
    }
});

// Single resource response
export const UserResponse = createUserResponse(200);

// Upsert response (create + update)
export const UserUpsertResponse = {
    ...createUserResponse(200),
    ...createUserResponse(201)
};
```

## When to Create Response Schemas

Create response schemas for resources that:
- Have sensitive fields that should never be exposed (e.g., `users` with passwords)
- Need data transformation before sending to clients
- Require custom response formatting

## Example Usage

```typescript
// In routes/users.ts
app.get('/:id', {
    schema: {
        response: UserResponse
    }
}, async (req, reply) => {
    const user = await userService.findById(id);
    // Fastify automatically validates and transforms the response
    // excluding the password field
    return reply.send({ user });
});
```

## Adding New Response Schemas

1. Create a new file: `src/requests/[resource].response.ts`
2. Use `createSelectSchema` from drizzle-zod
3. Exclude sensitive fields with `{ field: z.never() }`
4. Create a helper function to avoid duplication
5. Export from `src/responses/index.ts`
6. Use in your routes with the `schema.response` property

## Naming Convention

- `UserResponse` - For GET operations returning a single user
- `UserListResponse` - For GET operations returning multiple users
- `UserUpsertResponse` - For POST (create) and PUT (update) operations
- `PostResponse` - For GET operations returning a single post
- `PostListResponse` - For GET operations returning multiple posts
- `PostUpsertResponse` - For POST (create) and PUT (update) operations

## Security Benefits

The primary security benefit is automatic field exclusion:
- **Users**: Passwords are automatically excluded using `{ password: z.never() }`
- **Posts**: No sensitive fields currently, but structure is ready for future customization
- **Automatic**: Fastify handles the transformation, no manual filtering needed

## Consistency Benefits

Using the UpsertResponse pattern provides:
- **DRY Principle**: One schema for both create and update responses
- **Consistency**: Both operations return the same data structure
- **Maintainability**: Single place to modify upsert response format
- **OpenAPI**: Automatically documents both 200 and 201 responses

## Code Quality Benefits

The refactored approach provides:
- **No Duplication**: Helper functions eliminate repeated schema definitions
- **Easy Maintenance**: Change the schema structure in one place
- **Consistent Pattern**: All resources follow the same implementation approach
- **Type Safety**: Full TypeScript support with inferred types

## File Organization Benefits

The new naming convention provides:
- **Clear Purpose**: `.request.ts` and `.response.ts` suffixes make file purpose obvious
- **Logical Grouping**: Related schemas are co-located in the same directory
- **Easy Navigation**: Developers can quickly find the right schema file
- **Consistent Structure**: All resources follow the same file naming pattern
