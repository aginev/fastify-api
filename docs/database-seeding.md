# Database Seeding

This document explains how to use the database seeding system to populate your database with test data.

## Overview

The seeding system uses [drizzle-seed](https://github.com/drizzle-team/drizzle-seed) to generate realistic test data based on your schema definitions. It automatically handles relationships between tables and generates appropriate data types.

## Architecture

The seeding system is organized in a modular structure:

```
src/db/seeds/
├── index.ts          # Exports all seeders
├── users.seed.ts     # Users table seeder
└── posts.seed.ts     # Posts table seeder
```

Each table has its own dedicated seeder file, making it easy to:
- **Maintain** seeding logic for specific tables
- **Extend** with new tables
- **Customize** data generation per table
- **Test** individual seeders independently

## Seeds Directory Structure

### **File Organization**
- **`src/db/seeds/index.ts`** - Exports all seeders for easy importing
- **`src/db/seeds/users.seed.ts`** - Dedicated seeder for users table
- **`src/db/seeds/posts.seed.ts`** - Dedicated seeder for posts table

### **Naming Convention**
- **File names**: `{table}.seed.ts` (e.g., `users.seed.ts`)
- **Function names**: `seed{Table}` (e.g., `seedUsers`)
- **Export names**: Match function names exactly

### **Function Signature Pattern**
All seeders follow this consistent pattern:

```typescript
export async function seed{Table}(db: MySql2Database<any>) {
    return seed(db, { {table}: true }).refine((f) => ({
        {table}: {
            count: number,
            columns: {
                // Column definitions using drizzle-seed generators
            },
        },
    }));
}
```

## Available Seeding Scripts

### **Database Seeding** (`pnpm db:seed`)
```bash
pnpm db:seed
```

**What it generates:**
- **25 users** with realistic profiles
- **75 posts** with realistic content
- **Proper relationships** between users and posts
- **Realistic data** using drizzle-seed generators

**Use case:** When you need test data for development and testing.

## Seeding Workflow

### **Complete Reset and Seed:**
```bash
# 1. Reset database (clear all data)
pnpm db:reset

# 2. Seed with test data
pnpm db:seed
```

### **Quick Development Setup:**
```bash
# Just seed with test data
pnpm db:seed
```

## Generated Data

### **Users Table**
- **Email**: Realistic email addresses
- **Password**: Random strings (for testing only)
- **First Name**: Realistic first names
- **Last Name**: Realistic last names
- **Active Status**: Boolean values
- **Timestamps**: Auto-generated

### **Posts Table**
- **Title**: Lorem ipsum content
- **Content**: Lorem ipsum paragraphs
- **User ID**: Properly linked to users
- **Published At**: Random dates
- **Timestamps**: Auto-generated

### **Relationships**
- **One-to-Many**: Each user has multiple posts
- **Foreign Keys**: Properly maintained
- **Referential Integrity**: Ensured by Drizzle

## Configuration

### **Data Volume Control**
You can modify the seeding scripts to control data volume:

```typescript
// In src/db/seed.ts or src/db/seed-dev.ts
users: {
    count: 25, // Change this number
    with: {
        posts: 3, // Change posts per user
    },
},
```

### **Custom Data Generation**
Modify the `columns` section to customize data generation:

```typescript
columns: {
    email: f.email(), // Realistic emails
    first_name: f.firstName(), // Realistic names
    is_active: f.boolean(), // Boolean values
    // Add more customizations as needed
},
```

### **Adding New Table Seeders**
To add a new table seeder:

1. **Create a new seeder file** in `src/db/seeds/`:
```typescript
// src/db/seeds/categories.seed.ts
import { seed } from 'drizzle-seed';
import type { MySql2Database } from 'drizzle-orm/mysql2';

export async function seedCategories(db: MySql2Database<any>) {
    return seed(db, { categories: true }).refine((f) => ({
        categories: {
            count: 10,
            columns: {
                name: f.string(),
                description: f.loremIpsum(),
            },
        },
    }));
}
```

2. **Export it** in `src/db/seeds/index.ts`:
```typescript
export { seedCategories } from './categories.seed.js';
```

3. **Use it** in `src/db/seed.ts`:
```typescript
import { seedCategories } from './seeds/index.js';

// In main function:
await seedCategories(db);
```

## Available Data Generators

The `drizzle-seed` library provides various data generators for realistic test data:

### **Text Generators**
- **`f.string()`** - Random strings
- **`f.email()`** - Realistic email addresses
- **`f.firstName()`** - Realistic first names
- **`f.lastName()`** - Realistic last names
- **`f.loremIpsum()`** - Lorem ipsum text content
- **`f.companyName()`** - Realistic company names
- **`f.jobTitle()`** - Professional job titles

### **Numeric Generators**
- **`f.int()`** - Random integers with optional min/max
- **`f.number()`** - Random numbers with precision control
- **`f.date()`** - Random dates within specified ranges

### **Boolean Generators**
- **`f.boolean()`** - Random boolean values

### **Advanced Generators**
- **`f.valuesFromArray()`** - Select from predefined arrays
- **`f.weightedRandom()`** - Weighted random selection
- **`f.phoneNumber()`** - Realistic phone numbers with templates

### **Generator Examples**
```typescript
// Basic usage
email: f.email(),
name: f.firstName(),
active: f.boolean(),

// With options
age: f.int({ minValue: 18, maxValue: 65 }),
price: f.number({ minValue: 10, maxValue: 100, precision: 100 }),
birthDate: f.date({ minDate: '1980-01-01', maxDate: '2000-12-31' }),

// Custom arrays
status: f.valuesFromArray({ values: ['active', 'inactive', 'pending'] }),
category: f.valuesFromArray({ values: ['tech', 'health', 'finance'] }),

// Weighted random
priority: f.weightedRandom([
    { weight: 0.7, value: 'low' },
    { weight: 0.2, value: 'medium' },
    { weight: 0.1, value: 'high' }
])
```

## Prerequisites

### **Required Packages**
```bash
pnpm add drizzle-seed
```

### **Database Setup**
- Database must be running (`pnpm db:up`)
- Migrations must be applied (`pnpm db:migrate`)
- Schema must be properly defined

### **Environment Variables**
Ensure your database configuration is set in `.env`:
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=api
DATABASE_USER=db_user
DATABASE_PASSWORD=db_pass
```

## Troubleshooting

### **Common Issues**

#### 1. **Connection Errors**
```bash
# Ensure database is running
pnpm db:up

# Check connection settings
cat .env
```

#### 2. **Schema Errors**
```bash
# Generate and apply migrations first
pnpm db:generate
pnpm db:migrate
```

#### 3. **Permission Errors**
```bash
# Check database user permissions
pnpm db:shell
SHOW GRANTS FOR 'db_user'@'%';
```

### **Reset and Retry**
```bash
# Complete reset and retry
pnpm db:reset
pnpm db:seed
```

### **Seeds Directory Troubleshooting**

#### **Type Errors**
Ensure correct database type in seeder files:
```typescript
// ✅ Correct
import type { MySql2Database } from 'drizzle-orm/mysql2';

// ❌ Incorrect
import type { DrizzleD1Database } from 'drizzle-orm/d1';
```

#### **Import Errors**
Check file paths and extensions:
```typescript
// ✅ Correct
export { seedUsers } from './users.seed.js';

// ❌ Incorrect
export { seedUsers } from './users.seed'; // Missing .js extension
```

#### **Schema Mismatch**
Verify table names match your schema:
```typescript
// ✅ Correct - 'users' matches schema table name
return seed(db, { users: true })

// ❌ Incorrect - 'user' doesn't match schema
return seed(db, { user: true })
```

#### **Function Naming**
Ensure consistent naming across files:
```typescript
// ✅ Correct - All names match
// users.seed.ts
export async function seedUsers(db: MySql2Database<any>) { ... }

// index.ts
export { seedUsers } from './users.seed.js';

// seed.ts
import { seedUsers } from './seeds/index.js';
```

#### **Directory Structure Issues**
```bash
# Check if seeds directory exists
ls -la src/db/seeds/

# Verify seeder exports
cat src/db/seeds/index.ts

# Check individual seeder files
cat src/db/seeds/users.seed.ts
```

## Best Practices

### **Development Workflow**
1. **Seed with test data**: `pnpm db:seed`
2. **Test your application** with the generated data
3. **Reset when needed**: `pnpm db:reset`

### **Testing**
1. **Use seeding** for unit and integration tests
2. **Reset between test runs** for consistency
3. **Modify seed data** as needed for specific test scenarios

### **Data Management**
1. **Never seed production** databases
2. **Use realistic data** for better testing
3. **Maintain relationships** between tables

## Integration with Other Commands

### **Complete Database Reset**
```bash
# Reset database and data directory
pnpm db:reset

# Seed with fresh data
pnpm db:seed
```

### **Migration Workflow**
```bash
# 1. Generate migrations
pnpm db:generate

# 2. Apply migrations
pnpm db:migrate

# 3. Seed with data
pnpm db:seed
```

### **Development Cycle**
```bash
# Daily development workflow
pnpm db:up          # Start database
pnpm db:seed        # Seed with test data
pnpm dev            # Start application
# ... develop and test ...
pnpm db:reset       # Clean slate when needed
```

## Related Documentation

- [Database Schema](./database-schema.md) - Table structure and relationships
- [Drizzle Migrations](./drizzle-migrations.md) - Database migration system
- [Docker Guide](./docker-guide.md) - Database container management
- [Configuration Structure](./configuration-structure.md) - Environment setup

## External Resources

- [drizzle-seed Documentation](https://github.com/drizzle-team/drizzle-seed)
- [Drizzle ORM Seeding Guide](https://orm.drizzle.team/docs/seed-overview)
- [MySQL Seeding Best Practices](https://dev.mysql.com/doc/refman/8.0/en/insert.html)
