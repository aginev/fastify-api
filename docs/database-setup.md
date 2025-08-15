# Database Setup with Drizzle ORM

This project uses Drizzle ORM with MariaDB for database operations.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and pnpm

## Getting Started

1. **Start the database:**
   ```bash
   pnpm db:up
   ```

2. **Generate database schema:**
   ```bash
   pnpm db:generate
   ```

3. **Push schema to database:**
   ```bash
   pnpm db:push
   ```

4. **View database in Drizzle Studio:**
   ```bash
   pnpm db:studio
   ```

## Available Commands

- `pnpm db:up` - Start MariaDB container
- `pnpm db:down` - Stop MariaDB container
- `pnpm db:logs` - View database logs
- `pnpm db:reset` - Reset database (removes all data)
- `pnpm db:shell` - Access MariaDB shell
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (web interface)

## Database Schema

The current schema includes:

### Users Table
- `id` - Primary key, auto-increment
- `email` - Unique email address
- `username` - Unique username
- `passwordHash` - Hashed password
- `firstName` - First name
- `lastName` - Last name
- `isActive` - Account status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Posts Table
- `id` - Primary key, auto-increment
- `title` - Post title
- `content` - Post content
- `authorId` - Foreign key to users table
- `isPublished` - Publication status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Usage in Code

```typescript
import { db, users, userService } from '../db/index.js';

// Using the service layer
const newUser = await userService.create({
    email: 'user@example.com',
    username: 'username',
    passwordHash: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe'
});

// Direct database queries
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.id, 1));
```

## Environment Variables

You can customize the database connection by setting these environment variables:

- `DATABASE_HOST` - Database host (default: localhost)
- `DATABASE_PORT` - Database port (default: 3306)
- `DATABASE_NAME` - Database name (default: api)
- `DATABASE_USER` - Database user (default: db_user)
- `DATABASE_PASSWORD` - Database password (default: db_pass)
- `DATABASE_URL` - Full database connection string

## Migration Workflow

1. Modify the schema in `src/db/schema.ts`
2. Generate migrations: `pnpm db:generate`
3. Review generated files in `./drizzle` folder
4. Apply migrations: `pnpm db:migrate` or push directly: `pnpm db:push`

## Drizzle Studio

Drizzle Studio provides a web interface to:
- View and edit data
- Execute SQL queries
- Monitor database performance
- Manage schema changes

Access it by running `pnpm db:studio` and opening the provided URL in your browser.

## Connection Details

- **Host:** localhost (or DATABASE_HOST env var)
- **Port:** 3306 (or DATABASE_PORT env var)
- **Database:** api
- **Username:** db_user
- **Password:** db_pass

## Troubleshooting

### Common Issues

1. **Connection refused:**
   - Ensure Docker is running
   - Check if MariaDB container is up: `pnpm db:logs`

2. **Authentication failed:**
   - Verify database credentials in docker-compose.yml
   - Check environment variables

3. **Schema sync issues:**
   - Use `pnpm db:reset` to start fresh
   - Check Drizzle configuration in `drizzle.config.ts`
