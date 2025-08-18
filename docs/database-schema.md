# Database Schema Structure

This document explains the database schema organization and how to work with individual table schemas.

## Overview

The database schema is organized into individual files for each table, providing better maintainability and scalability. Each table has its own schema file with types, indexes, and relationships.

## Structure

```
src/db/models/
├── index.ts               # Main export file
├── users.model.ts         # Users table model
└── posts.model.ts         # Posts table model
```

## Benefits of Separated Schemas

- **🎯 Single Responsibility** - Each file handles one table
- **📁 Better Organization** - Easy to find and modify specific tables
- **🔄 Easier Maintenance** - Changes to one table don't affect others
- **👥 Team Collaboration** - Multiple developers can work on different tables
- **📝 Clear Documentation** - Each table has its own file with types

## Current Tables

### Users Table (`users.model.ts`)

**Purpose:** User accounts and authentication

**Fields:**
- `id` - Primary key, auto-increment
- `email` - Unique email address (255 chars)
- `password_hash` - Hashed password (255 chars)
- `first_name` - First name (100 chars, optional)
- `last_name` - Last name (100 chars, optional)
- `is_active` - Account status (boolean, default: true)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- `email_idx` - On email field for fast lookups

**Types:**
- `User` - Complete user record
- `NewUser` - Data for creating a user
- `UpdateUser` - Partial data for updating a user

### Posts Table (`posts.model.ts`)

**Purpose:** Blog posts and content

**Fields:**
- `id` - Primary key, auto-increment
- `title` - Post title (255 chars, required)
- `content` - Post content (text, required)
- `user_id` - Foreign key to users table
- `published_at` - Publication timestamp (null if not published)
- `deleted_at` - Soft delete timestamp (null if not deleted)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- `user_idx` - On user_id for fast user queries
- `published_idx` - On published_at for filtering published posts
- `deleted_idx` - On deleted_at for soft delete queries

**Types:**
- `Post` - Complete post record
- `NewPost` - Data for creating a post
- `UpdatePost` - Partial data for updating a post
- `PostWithUser` - Post with user information

**Relationships:**
- `user_id` references `users.id` (foreign key)
- One-to-many relationship: A user can have multiple posts

**Publication Status:**
- **`publishedAt` field**: Uses timestamp instead of boolean flag
- **Benefits**:
  - **When published**: Stores exact publication date/time
  - **Not published**: Field is `null`
  - **Better tracking**: Know exactly when content went live
  - **Analytics**: Can analyze publication timing and patterns
  - **Audit trail**: Complete history of publication changes

**Soft Delete Support:**
- **`deletedAt` field**: Uses timestamp for soft deletes
- **Benefits**:
  - **Data Safety**: Posts are hidden but not permanently removed
  - **Recovery**: Can restore posts if deleted by mistake
  - **Audit Trail**: Know exactly when posts were deleted
  - **Compliance**: Maintain data for legal/regulatory requirements
  - **Performance**: Efficient queries with proper indexing

## Table Relationships

### User-Post Relationship

The database implements a **one-to-many** relationship between users and posts:

- **Users Table**: Primary table containing user accounts
- **Posts Table**: Contains posts with a foreign key reference to users
- **Relationship**: `posts.userId` → `users.id`

**Benefits:**
- **Data Integrity**: Foreign key constraints ensure referential integrity
- **Efficient Queries**: Indexes on foreign keys enable fast joins
- **Scalability**: Easy to add more related tables in the future

**Query Examples:**
```sql
-- Get all posts by a specific user
SELECT * FROM posts WHERE userId = 1;

-- Get user with all their posts (using JOIN)
SELECT u.*, p.* FROM users u 
LEFT JOIN posts p ON u.id = p.userId 
WHERE u.id = 1;
```

**TypeScript Types:**
```typescript
// Basic types
type User = typeof users.$inferSelect;
type Post = typeof posts.$inferSelect;

// Relationship types
type UserWithPosts = User & { posts: Post[] };
type PostWithUser = Post & { user: User };
```

## Adding a New Table

### 1. Create Model File

Create a new file `src/db/models/your-table.model.ts`:

```typescript
import { mysqlTable, varchar, int, timestamp, boolean, index } from 'drizzle-orm/mysql-core';

export const yourTable = mysqlTable(
    'your_table',
    {
        id: int('id').primaryKey().autoincrement(),
        name: varchar('name', { length: 100 }).notNull(),
        is_active: boolean('is_active').default(true),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => ({
        nameIdx: index('your_table_name_idx').on(table.name),
    })
);

// Export types
export type YourTable = typeof yourTable.$inferSelect;
export type NewYourTable = typeof yourTable.$inferInsert;
export type UpdateYourTable = Partial<Omit<NewYourTable, 'id' | 'created_at' | 'updated_at'>>;
```

### 2. Add to Index

Update `src/db/models/index.ts`:

```typescript
// Export all table models
export * from './users.model.js';
export * from './posts.model.js';
export * from './your-table.model.js';  // Add this line

// Re-export commonly used types
export type { User, NewUser, UpdateUser } from './users.model.js';
export type { Post, NewPost, UpdatePost } from './posts.model.js';
export type { YourTable, NewYourTable, UpdateYourTable } from './your-table.model.js';  // Add this line
```

### 3. Generate and Apply Migrations

```bash
# Generate migration files
pnpm db:generate

# Apply to database
pnpm db:push
```

## Model File Template

Use this template for new tables:

```typescript
import { mysqlTable, varchar, int, timestamp, text, boolean, index } from 'drizzle-orm/mysql-core';

export const tableName = mysqlTable(
    'table_name',
    {
        // Primary key
        id: int('id').primaryKey().autoincrement(),
        
        // Required fields
        name: varchar('name', { length: 255 }).notNull(),
        
        // Optional fields
        description: text('description'),
        
        // Boolean fields
        is_active: boolean('is_active').default(true),
        
        // Timestamps
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
    },
    (table) => ({
        // Indexes for performance
        nameIdx: index('table_name_idx').on(table.name),
        activeIdx: index('table_active_idx').on(table.is_active),
    })
);

// Export types
export type TableName = typeof tableName.$inferSelect;
export type NewTableName = typeof tableName.$inferInsert;
export type UpdateTableName = Partial<Omit<NewTableName, 'id' | 'created_at' | 'updated_at'>>;
```

## Best Practices

### 1. Naming Conventions

- **Files:** `table-name.schema.ts` (kebab-case)
- **Tables:** `table_name` (snake_case)
- **Types:** `TableName`, `NewTableName`, `UpdateTableName` (PascalCase)

### 2. Field Organization

- Primary key first
- Required fields next
- Optional fields after
- Boolean flags
- Timestamps last

### 3. Indexes

- Add indexes for frequently queried fields
- Use descriptive index names
- Consider composite indexes for complex queries

### 4. Types

- Always export the three main types
- Use `UpdateType` for partial updates
- Exclude immutable fields from updates

### 5. Relationships

- Use `references()` for foreign keys
- Import related schemas as needed
- Consider circular dependency issues

## Migration Workflow

1. **Modify Model** - Update the appropriate `.model.ts` file
2. **Generate Migration** - Run `pnpm db:generate`
3. **Review Changes** - Check generated migration files in `./drizzle`
4. **Apply Migration** - Run `pnpm db:push` or `pnpm db:migrate`
5. **Test Changes** - Verify the new model works correctly

## Working with Models

### Importing Tables

```typescript
// Import specific tables
import { users, posts } from '../db/models/index.js';

// Import types
import type { User, NewUser, Post } from '../db/models/index.js';
```

### Using in Queries

```typescript
// Select users
const allUsers = await db.select().from(users);

// Find user by email
const user = await db.select().from(users).where(eq(users.email, 'user@example.com'));

// Create new user
const newUser = await db.insert(users).values({
    email: 'new@example.com',
    username: 'newuser',
    passwordHash: 'hashed_password'
});
```

### Relationships

```typescript
// Join users and posts
const userPosts = await db
    .select({
        user: users,
        post: posts
    })
    .from(users)
    .innerJoin(posts, eq(users.id, posts.authorId))
    .where(eq(users.id, userId));
```

## Troubleshooting

### Common Issues

1. **Import Errors** - Ensure the table is exported in `index.ts`
2. **Type Errors** - Check that all types are properly exported
3. **Migration Failures** - Review the generated SQL for syntax errors
4. **Circular Dependencies** - Use forward references for self-referencing tables

### Getting Help

- Check Drizzle ORM documentation
- Review existing model files for examples
- Test migrations on a development database first
- Use `pnpm db:studio` to inspect database structure

## Related Documentation

- [Database Setup](./database-setup.md) - Complete database configuration guide
- [API Reference](./api-reference.md) - API endpoints that use these models
- [Development Guide](./development-guide.md) - Development workflow and best practices
