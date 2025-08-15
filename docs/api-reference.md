# API Reference

Complete API documentation for the Node.js application.

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://your-domain.com`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow a consistent format:

```json
{
    "success": true,
    "data": {
        // Response data here
    },
    "message": "Optional message",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable error message",
        "details": "Additional error details"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Endpoints

### Health Check

#### GET `/health`

Check if the API is running and healthy.

**Response:**
```json
{
    "success": true,
    "data": {
        "status": "ok",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "uptime": 123.456,
        "version": "0.1.0"
    },
    "message": "API is healthy"
}
```

### Root

#### GET `/`

Get basic API information.

**Response:**
```json
{
    "success": true,
    "data": {
        "name": "Node.js API",
        "version": "0.1.0",
        "description": "A modern Node.js API with Fastify and Drizzle ORM",
        "endpoints": [
            "/health",
            "/users",
            "/posts"
        ]
    },
    "message": "Welcome to the API"
}
```

### Users

#### GET `/users`

Get all users with pagination.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 50, max: 100)
- `offset` (optional): Number of users to skip (default: 0)

**Response:**
```json
{
    "success": true,
    "data": {
        "users": [
            {
                "id": 1,
                "email": "user@example.com",
                "username": "username",
                "firstName": "John",
                "lastName": "Doe",
                "isActive": true,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "updatedAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "total": 1,
            "limit": 50,
            "offset": 0,
            "hasMore": false
        }
    }
}
```

#### GET `/users/:id`

Get a specific user by ID.

**Path Parameters:**
- `id`: User ID (integer)

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "user@example.com",
        "username": "username",
        "firstName": "John",
        "lastName": "Doe",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

**Error Response (404):**
```json
{
    "success": false,
    "error": {
        "code": "USER_NOT_FOUND",
        "message": "User with id 999 not found"
    }
}
```

#### POST `/users`

Create a new user.

**Request Body:**
```json
{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "securepassword",
    "firstName": "Jane",
    "lastName": "Smith"
}
```

**Validation Rules:**
- `email`: Required, valid email format, unique
- `username`: Required, 3-100 characters, unique
- `password`: Required, minimum 8 characters
- `firstName`: Optional, 1-100 characters
- `lastName`: Optional, 1-100 characters

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "email": "newuser@example.com",
        "username": "newuser",
        "firstName": "Jane",
        "lastName": "Smith",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "User created successfully"
}
```

**Error Response (422):**
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": {
            "email": "Email already exists",
            "username": "Username already exists"
        }
    }
}
```

#### PUT `/users/:id`

Update an existing user.

**Path Parameters:**
- `id`: User ID (integer)

**Request Body:**
```json
{
    "firstName": "Updated Name",
    "lastName": "Updated Last"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "user@example.com",
        "username": "username",
        "firstName": "Updated Name",
        "lastName": "Updated Last",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "message": "User updated successfully"
}
```

#### DELETE `/users/:id`

Delete a user.

**Path Parameters:**
- `id`: User ID (integer)

**Response:**
```json
{
    "success": true,
    "data": null,
    "message": "User deleted successfully"
}
```

### Posts

#### GET `/posts`

Get all posts with pagination and filtering.

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 50, max: 100)
- `offset` (optional): Number of posts to skip (default: 0)
- `authorId` (optional): Filter by author ID
- `published` (optional): Filter by publication status (true/false)

**Response:**
```json
{
    "success": true,
    "data": {
        "posts": [
            {
                "id": 1,
                "title": "Sample Post",
                "content": "This is a sample post content...",
                "authorId": 1,
                "isPublished": true,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "updatedAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "total": 1,
            "limit": 50,
            "offset": 0,
            "hasMore": false
        }
    }
}
```

#### GET `/posts/:id`

Get a specific post by ID.

**Path Parameters:**
- `id`: Post ID (integer)

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Sample Post",
        "content": "This is a sample post content...",
        "authorId": 1,
        "isPublished": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

#### POST `/posts`

Create a new post.

**Request Body:**
```json
{
    "title": "New Post Title",
    "content": "This is the content of the new post...",
    "authorId": 1,
    "isPublished": false
}
```

**Validation Rules:**
- `title`: Required, 1-255 characters
- `content`: Optional, text content
- `authorId`: Required, valid user ID
- `isPublished`: Optional, boolean (default: false)

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 2,
        "title": "New Post Title",
        "content": "This is the content of the new post...",
        "authorId": 1,
        "isPublished": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Post created successfully"
}
```

#### PUT `/posts/:id`

Update an existing post.

**Path Parameters:**
- `id`: Post ID (integer)

**Request Body:**
```json
{
    "title": "Updated Post Title",
    "isPublished": true
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Updated Post Title",
        "content": "This is the content of the new post...",
        "authorId": 1,
        "isPublished": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "message": "Post updated successfully"
}
```

#### DELETE `/posts/:id`

Delete a post.

**Path Parameters:**
- `id`: Post ID (integer)

**Response:**
```json
{
    "success": true,
    "data": null,
    "message": "Post deleted successfully"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. All endpoints are accessible without restrictions.

## CORS

CORS is enabled for all origins in development. In production, configure appropriate CORS settings.

## Error Handling

The API uses centralized error handling with consistent error responses. All errors are logged for debugging purposes.

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `USER_NOT_FOUND` - User not found
- `POST_NOT_FOUND` - Post not found
- `DUPLICATE_EMAIL` - Email already exists
- `DUPLICATE_USERNAME` - Username already exists
- `INTERNAL_ERROR` - Server internal error

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/users

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

### Using Postman

1. Import the API collection
2. Set the base URL to `http://localhost:3000`
3. Test individual endpoints

### Using Drizzle Studio

```bash
pnpm db:studio
```

Open the provided URL to view and manage database data directly.

## Future Enhancements

- Authentication and authorization
- Rate limiting
- API versioning
- WebSocket support
- File upload endpoints
- Search and filtering
- Pagination metadata
- API documentation with Swagger/OpenAPI
