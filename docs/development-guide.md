# Development Environment Guide

Complete guide for developers working on this Node.js project.

## 🚀 Development Workflow

### 1. Daily Development Cycle

```bash
# Start your day
git pull origin main
pnpm install  # If dependencies changed
pnpm db:up    # Ensure database is running

# Development
pnpm dev       # Start development server
# Make changes in src/
# Test your changes

# Before committing
pnpm check     # Run all checks
git add .
git commit -m "feat: add new feature"
git push origin feature-branch
```

### 2. Feature Development

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and test:**
   ```bash
   pnpm dev
   # Make changes and test
   ```

3. **Quality checks:**
   ```bash
   pnpm typecheck  # TypeScript validation
   pnpm lint       # Code style check
   pnpm format     # Auto-format code
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: descriptive message"
   git push origin feature/your-feature-name
   ```

## 🛠️ Development Tools

### Code Quality

- **TypeScript:** Strong typing and IntelliSense
- **ESLint:** Code linting and style enforcement
- **Prettier:** Automatic code formatting
- **pnpm:** Fast, efficient package management

### Database Tools

- **Drizzle ORM:** Type-safe database operations
- **Drizzle Studio:** Web-based database management
- **MariaDB:** Reliable database engine

### Development Server

- **tsx:** Fast TypeScript execution
- **nodemon:** Automatic restart on file changes
- **Fastify:** High-performance web framework

## 📝 Coding Standards

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Prefer interfaces over types for objects
- Use proper type annotations
- Avoid `any` type

```typescript
// Good
interface User {
    id: number;
    email: string;
    isActive: boolean;
}

// Avoid
const user: any = { id: 1, email: 'test@example.com' };
```

### Code Style

- **Indentation:** 4 spaces (no tabs)
- **Line length:** Maximum 100 characters
- **Quotes:** Single quotes for strings
- **Semicolons:** Always use semicolons
- **Trailing commas:** Use in objects and arrays

```typescript
// Good
const config = {
    host: 'localhost',
    port: 3000,
    database: 'api',
};

// Avoid
const config = {host:'localhost',port:3000,database:'api'}
```

### Naming Conventions

- **Files:** kebab-case (`user-service.ts`)
- **Variables/Functions:** camelCase (`getUserById`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Classes:** PascalCase (`UserService`)
- **Interfaces:** PascalCase with `I` prefix (`IUser`)

### Error Handling

- Use try-catch blocks for async operations
- Log errors with context
- Return meaningful error messages
- Use custom error classes

```typescript
try {
    const user = await userService.findById(id);
    if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
} catch (error) {
    logger.error('Failed to fetch user', { id, error });
    throw error;
}
```

## 🗂️ Project Structure

### File Organization

```
src/
├── config.ts              # Configuration and environment
├── index.ts               # Application entry point
├── server.ts              # Server setup and configuration
├── types.ts               # Global type definitions
├── db/                    # Database layer
│   ├── connection.ts      # Database connection
│   ├── schema.ts          # Database schema
│   ├── services.ts        # Business logic services
│   └── index.ts           # Database exports
├── middleware/            # Express middleware
├── models/                # Data models
├── routes/                # API route handlers
└── utils/                 # Utility functions
```

### Import/Export Patterns

- Use named exports for most functions/classes
- Use default exports sparingly
- Group related exports in index files
- Use absolute imports for clarity

```typescript
// Good - named exports
export { userService, postService } from './services.js';

// Good - index file grouping
export * from './connection.js';
export * from './schema.js';
export * from './services.js';

// Avoid - default exports for utilities
export default function formatDate() { /* ... */ }
```

## 🔍 Testing Strategy

### Testing Levels

1. **Unit Tests:** Individual functions and classes
2. **Integration Tests:** Database and API endpoints
3. **End-to-End Tests:** Complete user workflows

### Testing Tools

- **Jest:** Test runner and assertion library
- **Supertest:** HTTP endpoint testing
- **@types/jest:** TypeScript support for Jest

### Writing Tests

```typescript
describe('UserService', () => {
    describe('create', () => {
        it('should create a new user', async () => {
            const userData = {
                email: 'test@example.com',
                username: 'testuser',
                passwordHash: 'hash',
            };
            
            const user = await userService.create(userData);
            
            expect(user.email).toBe(userData.email);
            expect(user.username).toBe(userData.username);
        });
    });
});
```

## 🚀 Performance Considerations

### Database

- Use indexes on frequently queried fields
- Implement pagination for large datasets
- Use connection pooling
- Monitor query performance

### API

- Implement request rate limiting
- Use compression middleware
- Cache frequently accessed data
- Monitor response times

### Memory

- Avoid memory leaks in event listeners
- Use streaming for large file operations
- Implement proper cleanup in services

## 🐛 Debugging

### Development Debugging

```bash
# Start with debugging enabled
pnpm debug

# Or with watch mode
pnpm debug:watch
```

### Database Debugging

```bash
# Check database logs
pnpm db:logs

# Access database shell
pnpm db:shell

# Open Drizzle Studio
pnpm db:studio
```

### Logging

- Use structured logging with context
- Log at appropriate levels (debug, info, warn, error)
- Include request IDs for tracing
- Log performance metrics

## 📚 Learning Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [Drizzle ORM Guide](https://orm.drizzle.team/learn)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [ESLint Rules](https://eslint.org/docs/rules/)

## 🤝 Contributing

### Before Submitting

1. Run all quality checks: `pnpm check`
2. Ensure tests pass: `pnpm test`
3. Update documentation if needed
4. Follow commit message conventions

### Commit Message Format

```
type(scope): description

feat(auth): add JWT authentication
fix(db): resolve connection timeout issue
docs(api): update endpoint documentation
style(utils): format utility functions
refactor(services): simplify user service logic
test(auth): add authentication tests
```

### Pull Request Process

1. Create feature branch from main
2. Make changes and test thoroughly
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval
