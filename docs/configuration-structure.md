# Configuration Structure

This document explains the separated configuration structure for different aspects of the application.

## Structure

```
src/config/
├── index.ts           # Main export file
├── database.ts        # Database configuration
└── server.ts          # Server configuration
```

## Usage

### Import All Configuration

```typescript
import { dbConfig, serverConfig } from '../config/index.js';
```

### Import Specific Configuration

```typescript
// Database config only
import { dbConfig, DATABASE_HOST, DATABASE_PORT } from '../config/database.js';

// Server config only
import { serverConfig, PORT, NODE_ENV } from '../config/server.js';
```

### Import Individual Values

```typescript
import { PORT, DATABASE_HOST, NODE_ENV } from '../config/index.js';
```

## Configuration Files

### Database Configuration (`database.ts`)

**Environment Variables:**
- `DATABASE_URL` - Full database connection string
- `DATABASE_HOST` - Database hostname
- `DATABASE_PORT` - Database port
- `DATABASE_NAME` - Database name
- `DATABASE_USER` - Database username
- `DATABASE_PASSWORD` - Database password

**Exports:**
- `dbConfig` - Complete database configuration object
- Individual environment variables for direct access

**Example:**
```typescript
import { dbConfig } from '../config/database.js';

const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
});
```

### Server Configuration (`server.ts`)

**Environment Variables:**
- `NODE_ENV` - Application environment (development, test, production)
- `PORT` - Server port number

**Exports:**
- `serverConfig` - Complete server configuration object with computed properties
- Individual environment variables for direct access

**Computed Properties:**
- `isDevelopment` - Boolean for development environment
- `isProduction` - Boolean for production environment
- `isTest` - Boolean for test environment

**Example:**
```typescript
import { serverConfig } from '../config/server.js';

const app = Fastify();
await app.listen({ 
    port: serverConfig.port, 
    host: '0.0.0.0' 
});

if (serverConfig.isDevelopment) {
    console.log('Development mode enabled');
}
```

## Benefits of This Structure

1. **Separation of Concerns** - Each config file handles one domain
2. **Better Organization** - Easy to find and modify specific configurations
3. **Type Safety** - Each config file has its own validation schema
4. **Flexibility** - Import only what you need
5. **Maintainability** - Changes to one config don't affect others

## Adding New Configuration

### 1. Create New Config File

```typescript
// src/config/new-service.ts
import { z } from 'zod';

const NewServiceEnvSchema = z.object({
    NEW_SERVICE_URL: z.string().default('http://localhost:8080'),
    NEW_SERVICE_API_KEY: z.string().optional(),
});

const newServiceEnv = NewServiceEnvSchema.parse(process.env);

export const newServiceConfig = {
    url: newServiceEnv.NEW_SERVICE_URL,
    apiKey: newServiceEnv.NEW_SERVICE_API_KEY,
};

export const { NEW_SERVICE_URL, NEW_SERVICE_API_KEY } = newServiceEnv;
```

### 2. Add to Index

```typescript
// src/config/index.ts
export * from './database.js';
export * from './server.js';
export * from './new-service.js';  // Add this line

export { dbConfig } from './database.js';
export { serverConfig } from './server.js';
export { newServiceConfig } from './new-service.js';  // Add this line
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=api
DATABASE_USER=db_user
DATABASE_PASSWORD=db_pass
DATABASE_URL=mysql://db_user:db_pass@localhost:3306/api
```

## Validation

All configuration uses Zod schemas for:
- **Type Safety** - Ensures correct data types
- **Validation** - Validates environment variables
- **Defaults** - Provides sensible defaults
- **Error Handling** - Clear error messages for invalid config

## Best Practices

1. **Always validate** environment variables with Zod
2. **Provide defaults** for non-critical configuration
3. **Use computed properties** for derived values
4. **Export both objects and individual values** for flexibility
5. **Keep schemas simple** and focused on one domain
