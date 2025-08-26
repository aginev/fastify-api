# Claude Code Project Configuration

This Node.js/Fastify API server uses TypeScript, ESM modules, and MariaDB with robust error handling, logging, and request context management.

## 🏗️ Project Architecture

### Core Entry Points
- `src/index.ts` - Main application entry, process events, graceful shutdown
- `src/server.ts` - Fastify instance, global hooks, error handlers, server startup

### Configuration & Context
- `src/config/` - Environment validation using Zod (database, server configs)
- `src/types.ts` - Global type aliases, Fastify interface augmentation
- `src/context.ts` - Request-scoped AsyncLocalStorage context management

### Route Organization (Domain-Based)
- `src/routes/index.ts` - Main router registering all domain routes
- `src/routes/health.ts` - Health endpoints (`/health/live`, `/health/ready`, `/health/debug`)
- `src/routes/users.ts` - User CRUD operations with `/users` prefix
- Use descriptive prefixes: `/health`, `/users`, `/products`, `/orders`

### Database Layer
- **Technology**: MariaDB 11.2 in Docker (localhost:3306)
- **Credentials**: `db_user`/`db_pass` (app), `root`/`db_pass` (admin)
- **Database**: `api`
- **Schema Location**: `src/db/models/` (Drizzle ORM schemas)
- **Migrations**: `src/db/migrations/` (Drizzle migrations)

## 📋 Coding Standards

### TypeScript Patterns
- **Indentation**: Always 4 spaces (never tabs)
- **Line Length**: 120 characters maximum
- **Types**: Explicit types for function parameters/returns, avoid `any`
- **Database IDs**: Use `z.bigint().positive()` for DB IDs, `z.coerce.number().int().positive()` for route params
- **Imports**: Use `import type` for type-only imports, group by external/internal/types

### Code Formatting Rules
- **Control Flow**: Always use braces for `if`, `for`, `while`, `switch`, `try-catch`
- **Blank Lines**: Add before/after control flow statements (except single-statement blocks)
- **Return Statements**: Add blank line before return (except in single-statement blocks)
- **Spacing**: Single space around operators, after commas, no trailing spaces

#### Control Flow Examples
```typescript
// ✅ Good - Multiple statements
if (!user) {
    logger.warn('User not found', { userId: id });
    
    return undefined;
}

// ✅ Good - Single statement (blank lines optional)
if (!user) {
    return undefined;
}

// ❌ Bad - No braces
if (!user) return undefined;
```

### Database Schema Standards
- **Primary Keys**: `BIGINT UNSIGNED AUTO_INCREMENT`
- **Field Order**: ID first, reference IDs second, business fields, status timestamps, metadata timestamps last
- **Soft Deletes**: Use `deleted_at TIMESTAMP NULL` (not boolean flags)
- **Status Fields**: Use timestamps (`published_at`, `deleted_at`) instead of booleans
- **Character Set**: `utf8mb4` with `utf8mb4_unicode_ci` collation
- **Naming**: Tables plural (`users`, `posts`), columns snake_case (`created_at`, `user_id`)

#### Schema Example
```typescript
export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),                              // Primary key first
    email: varchar('email', { length: 255 }).notNull().unique(), // Business fields
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    deletedAt: timestamp('deleted_at'),                         // Status field
    createdAt: timestamp('created_at').defaultNow().notNull(),  // Metadata last
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
```

## 🚨 Error Handling Architecture

### Custom Error Classes
- Extend `Error` and implement `FastifyError` interface
- Include: `statusCode: number`, `code: string`, `context: Record<string, unknown>`
- Reference: `src/errors/base.error.ts`

### Error Handler Integration
- Global handler in `src/server.ts` catches unhandled errors
- Extract request context: `requestId`, `url`, `method`, `userAgent`, `timestamp`
- Dynamic log levels: 500+ = `fatal`, 400-499 = `error`, 300-399 = `warn`

### Response Patterns
- 4XX errors: Return "Client Error" message
- 5XX errors: Return "Internal Server Error" message  
- Always include: `error`, `code`, `requestId`
- Never expose internal server details

## 📝 Logging Standards

### Pino Configuration
- Development: `pino-pretty` for readable console output
- Production: Default JSON format
- Include request ID via `mixin()` function
- Redact sensitive headers: `authorization`, `cookie`, `set-cookie`

### Structured Logging Pattern
```typescript
const logLevel: LogLevel = getLogLevel(error.statusCode);
const logData = { request, error };

try {
    (app.log as any)[logLevel](logData, 'Unhandled error');
} catch (logError) {
    app.log.error(logData, 'Unhandled error (fallback)');
}
```

## 🛣️ Route Handler Standards

### Handler Pattern
```typescript
export async function registerRoutes(app: FastifyInstance) {
    await app.register(rootRoutes);
    await app.register(healthRoutes, { prefix: '/health' });
    await app.register(userRoutes, { prefix: '/users' });
}
```

### Request Context Management
- Use `setContext()` in `onRequest` hook from `src/context.ts`
- Set `x-request-id` header for client correlation
- Access via `getRequestId()` and `getContext()`

## 🔧 Development Workflow

### Available Commands
- `pnpm dev` - Development server with hot reload (`tsx watch`)
- `pnpm debug` - Debug server (`tsx --inspect`)
- `pnpm typecheck` - TypeScript compilation check
- `pnpm lint` - ESLint code quality check
- `pnpm format` - Prettier code formatting

### Database Commands
- `pnpm db:up` - Start MariaDB container
- `pnpm db:down` - Stop MariaDB container
- `pnpm db:logs` - View database logs
- `pnpm db:shell` - Access database shell
- `pnpm db:reset` - Reset database (fresh start)

### Code Quality Checks
- **Pre-commit**: Always run `pnpm typecheck` before committing
- **ESLint**: Fix all linting errors
- **Prettier**: Maintain consistent formatting
- **TypeScript**: Use strict mode, proper types from Drizzle ORM schemas

## 📁 File Organization Standards

### Project Structure
```
src/
├── config/           # Domain-separated configuration (database.ts, server.ts)
├── db/              # Database connection, migrations, models, seeds
│   ├── models/      # Drizzle ORM schemas (users.model.ts, posts.model.ts)
│   └── migrations/  # Database migration files
├── errors/          # Custom error classes by domain
├── middlewares/     # Request/response middleware
├── routes/          # Domain-based routes with prefixes
├── services/        # Business logic services by resource
├── utils/           # Logging utilities and helpers
└── types.ts         # Global type definitions
```

### Documentation Structure
- **All README files**: Place in `docs/` folder (never in source directories)
- **API Documentation**: `docs/api-reference.md`
- **Setup Guides**: `docs/project-setup.md`, `docs/development-guide.md`
- **Technical Docs**: `docs/database-schema.md`, `docs/services-structure.md`

## 🎯 Key Development Patterns

### Service Layer Organization
- Separate services by resource into individual files
- Place in `src/services/` directory
- Use barrel exports from `src/services/index.ts`
- Implement soft deletes with timestamps
- JSDoc comments for all service methods

### Request/Response Validation
- Use Zod schemas for all request validation in `src/requests/`
- Response schemas in `src/responses/`
- Database IDs: `z.bigint().positive()` for DB, `z.coerce.number().int().positive()` for routes

### Security Practices
- Validate all input with Zod schemas
- Use environment variables for sensitive config
- Never log passwords, tokens, or personal information
- Implement proper authentication/authorization
- Parameterized queries to prevent SQL injection

## ⚡ Performance Guidelines

### Database Optimization
- Index all foreign key columns
- Index `deleted_at` for soft delete filtering  
- Index frequently searched columns (email, username)
- Use pagination for large result sets
- Avoid `SELECT *` in production queries

### Query Patterns
```sql
-- Active records only
SELECT * FROM users WHERE deleted_at IS NULL;

-- Efficient pagination
SELECT * FROM users 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 40;
```

### Memory Management
- Use proper connection pooling
- Close database connections properly
- Implement graceful shutdown handling
- Monitor memory usage with appropriate limits

## 🚀 Deployment Considerations

### Environment Configuration
- Validate all environment variables with Zod schemas
- Provide sensible defaults for non-critical settings
- Use `env.PORT` and `env.NODE_ENV` throughout application
- Load environment with `dotenv/config`

### Health Checks
- `/health/live` - Basic liveness check
- `/health/ready` - Readiness check using `app.isReady`
- `/health/debug` - Request context inspection (development only)

### Process Management
- Handle `uncaughtException` and `unhandledRejection`
- Implement graceful shutdown with timeout
- Use request correlation via `x-request-id` header
- Log startup and shutdown events with signal information

This configuration ensures consistent code quality, maintainable architecture, and robust error handling across the entire Node.js/Fastify application.