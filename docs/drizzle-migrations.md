# Drizzle ORM Migrations

This document explains how to use the Drizzle ORM migration system in this project.

## Overview

Drizzle ORM provides a powerful migration system that allows you to:
- Generate SQL migration files from your schema changes
- Apply migrations to your database
- Track migration history
- Roll back changes if needed

## Prerequisites

- Database is running (`pnpm db:up`)
- Drizzle Kit is installed (`drizzle-kit` in devDependencies)
- Database connection is properly configured

## Available Commands

### 1. Generate Migrations

Generate SQL migration files based on schema changes:

```bash
pnpm db:generate
```

This command:
- Compares your current schema with the database
- Generates SQL migration files in the `./src/db/migrations` folder
- Creates both `.sql` files and metadata files
- Uses timestamp-based naming (e.g., `20241201120000_migration_name.sql`)

### 2. Apply Migrations

Apply pending migrations to the database:

```bash
pnpm db:migrate
```

This command:
- Connects to the database
- Applies all pending migrations
- Updates the migration history table (`__drizzle_migrations__`)
- Logs the process

### 3. Push Schema Changes (Development)

For development, you can push schema changes directly:

```bash
pnpm db:push
```

⚠️ **Warning**: This bypasses migrations and directly modifies the database. Use only in development.

### 4. Check Migration Status

Check the current migration status:

```bash
pnpm db:check
```

This shows:
- Which migrations are pending
- Which migrations have been applied
- Any schema drift

### 5. Open Drizzle Studio

Open the web-based database browser:

```bash
pnpm db:studio
```

Features:
- Browse tables and data
- Execute queries
- View schema structure
- Monitor performance

### 6. Drop Migrations

Remove unapplied migration files:

```bash
pnpm db:drop
```

⚠️ **Warning**: This permanently deletes migration files. Use with caution.

## Migration Workflow

### 1. Development Workflow

```bash
# 1. Make changes to your schema files
# 2. Generate migrations
pnpm db:generate

# 3. Review generated SQL files in ./src/db/migrations/
# 4. Apply migrations
pnpm db:migrate

# 5. Verify changes
pnpm db:studio
```

### 2. Production Workflow

```bash
# 1. Generate migrations locally
pnpm db:generate

# 2. Review and test migrations
pnpm db:check

# 3. Commit migration files to version control
git add src/db/migrations/
git commit -m "Add database migrations"

# 4. Deploy and run migrations
pnpm db:migrate
```

## Migration File Structure

```
📦 <project root>
 └ 📂 src
    └ 📂 db
       └ 📂 migrations
          └ 📂 meta
            ├ 📜 _journal.json          # Migration history
            ├ 📜 0000_snapshot.json     # Schema snapshot
            ├ 📜 0001_snapshot.json     # Schema snapshot
          └ 📜 0000_initial_schema.sql # SQL migration
          └ 📜 0001_add_users.sql      # SQL migration
```

## Configuration

The migration system uses your existing database configuration from `src/config/database.ts`:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import { dbConfig } from './src/config/index.js';

export default defineConfig({
    schema: './src/db/models/index.ts',      // Schema file location
    out: './src/db/migrations',              // Migration output folder
    dialect: 'mysql',                        // Database dialect
    
    dbCredentials: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    },
    
    verbose: true,                            // Detailed logging
    strict: true,                             // Strict mode
    breakpoints: true,                        // Better SQL formatting
    
    migrations: {
        prefix: 'timestamp',                  // Timestamp-based naming
        table: '__drizzle_migrations__',      // Custom migration history table
    },
});
```

## Best Practices

### 1. Always Review Generated SQL

Before applying migrations:
- Review the generated SQL files
- Ensure they match your expectations
- Test in development first

### 2. Use Descriptive Migration Names

When generating migrations, use descriptive names:

```bash
pnpm db:generate --name add_user_authentication
```

### 3. Never Modify Applied Migrations

Once a migration is applied:
- Never modify the SQL files
- Create new migrations for additional changes
- This ensures consistency across environments

### 4. Backup Before Production

Before running migrations in production:
- Take a database backup
- Test migrations in staging
- Have a rollback plan

### 5. Version Control

Always commit migration files:
```bash
git add src/db/migrations/
git commit -m "Add database migration: add_users_table"
```

## Troubleshooting

### Common Issues

#### 1. Migration Already Applied

If you get "migration already applied" errors:
```bash
# Check migration status
pnpm db:check

# Reset if needed (development only)
pnpm db:reset
```

#### 2. Connection Issues

If migrations fail to connect:
- Ensure database is running (`pnpm db:up`)
- Check connection credentials in `.env`
- Verify network connectivity

#### 3. Schema Drift

If schema doesn't match:
```bash
# Check for drift
pnpm db:check

# Regenerate migrations
pnpm db:generate
```

## Related Documentation

- [Drizzle ORM Official Docs](https://orm.drizzle.team/)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit/overview)
- [MySQL Migrations](https://orm.drizzle.team/kit/overview#mysql)
- [Database Schema](./database-schema.md)
- [Configuration Structure](./configuration-structure.md)