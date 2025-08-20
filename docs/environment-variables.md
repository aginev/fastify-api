# Environment Variables Reference

Complete reference for all environment variables used in this project.

## Overview

Environment variables are used to configure the application behavior, database connections, and other settings. They can be set in a `.env` file or directly in your shell environment.

## Quick Setup

### 1. Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Load Environment Variables

The application automatically loads variables from `.env` file using the `dotenv` package.

## Database Configuration

### Required Variables

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `DATABASE_HOST` | `localhost` | Database server hostname | `localhost` |
| `DATABASE_PORT` | `3306` | Database server port | `3306` |
| `DATABASE_NAME` | `api` | Database name | `api` |
| `DATABASE_USER` | `db_user` | Database username | `db_user` |
| `DATABASE_PASSWORD` | `db_pass` | Database password | `db_pass` |

### Connection String

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `DATABASE_URL` | `mysql://db_user:db_pass@localhost:3306/api` | Full database connection string | `mysql://user:pass@host:port/db` |

**Note:** If `DATABASE_URL` is provided, it takes precedence over individual connection parameters.

## Application Configuration

### Server Settings

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `NODE_ENV` | `development` | Application environment | `development`, `test`, `production` |
| `PORT` | `3000` | Server port number | `3000`, `8080` |
| `GRACEFUL_SHUTDOWN_TIMEOUT` | `10000` | Graceful shutdown timeout in milliseconds. After this time, the process will force exit if shutdown hasn't completed. | `5000`, `15000`, `30000` |

### Logging

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `LOG_LEVEL` | `info` | Logging level | `debug`, `info`, `warn`, `error` |
| `LOG_FORMAT` | `json` | Log format | `json`, `pretty` |

## Environment-Specific Configurations

### Development

```env
# Development environment
NODE_ENV=development
PORT=3000
GRACEFUL_SHUTDOWN_TIMEOUT=10000
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Database (local Docker)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=api
DATABASE_USER=db_user
DATABASE_PASSWORD=db_pass
DATABASE_URL=mysql://db_user:db_pass@localhost:3306/api
```

### Testing

```env
# Testing environment
NODE_ENV=test
PORT=3001
LOG_LEVEL=warn
LOG_FORMAT=json

# Test database
DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_NAME=api_test
DATABASE_USER=test_user
DATABASE_PASSWORD=test_pass
DATABASE_URL=mysql://test_user:test_pass@localhost:3307/api_test
```

### Production

```env
# Production environment
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
LOG_FORMAT=json

# Production database
DATABASE_HOST=prod-db.example.com
DATABASE_PORT=3306
DATABASE_NAME=api_prod
DATABASE_USER=prod_user
DATABASE_PASSWORD=secure_password_here
DATABASE_URL=mysql://prod_user:secure_password_here@prod-db.example.com:3306/api_prod
```

## Docker Environment

### Docker Compose Variables

These variables are used in `docker-compose.yml`:

```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-db_pass}
  MYSQL_DATABASE: ${MYSQL_DATABASE:-api}
  MYSQL_USER: ${MYSQL_USER:-db_user}
  MYSQL_PASSWORD: ${MYSQL_PASSWORD:-db_pass}
```

### Docker Environment File

Create a `.env.docker` file for Docker-specific variables:

```env
# Docker environment variables
MYSQL_ROOT_PASSWORD=secure_root_password
MYSQL_DATABASE=api
MYSQL_USER=db_user
MYSQL_PASSWORD=secure_db_password
```

## Security Considerations

### Sensitive Information

**Never commit sensitive environment variables to version control:**

```bash
# Add to .gitignore
.env
.env.local
.env.production
.env.secrets
```

### Production Security

1. **Use strong passwords** for database users
2. **Restrict database access** to application servers only
3. **Use SSL/TLS** for database connections
4. **Rotate credentials** regularly
5. **Use secrets management** services (AWS Secrets Manager, HashiCorp Vault)

### Example Production .env

```env
# Production environment (keep secure)
NODE_ENV=production
PORT=8080

# Database (use strong passwords)
DATABASE_HOST=prod-db.internal
DATABASE_PORT=3306
DATABASE_NAME=api_prod
DATABASE_USER=api_user
DATABASE_PASSWORD=K8s#mP9$vL2@qR7
DATABASE_URL=mysql://api_user:K8s#mP9$vL2@qR7@prod-db.internal:3306/api_prod

# Security
LOG_LEVEL=info
LOG_FORMAT=json
```

## Validation

### Environment Schema

The application validates environment variables using Zod schema:

```typescript
const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(0).max(65535).default(3000),
    DATABASE_URL: z.string().default('mysql://db_user:db_pass@localhost:3306/api'),
    DATABASE_HOST: z.string().default('localhost'),
    DATABASE_PORT: z.coerce.number().default(3306),
    DATABASE_NAME: z.string().default('api'),
    DATABASE_USER: z.string().default('db_user'),
    DATABASE_PASSWORD: z.string().default('db_pass'),
});
```

### Validation Errors

If validation fails, the application will:

1. Log the validation error
2. Exit with error code 1
3. Display helpful error messages

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Check if .env file exists
ls -la .env

# Verify file permissions
chmod 600 .env

# Check file content (without sensitive data)
grep -v PASSWORD .env
```

#### 2. Database Connection Issues

```bash
# Verify environment variables
echo $DATABASE_HOST
echo $DATABASE_PORT
echo $DATABASE_NAME

# Test database connection
mysql -h $DATABASE_HOST -P $DATABASE_PORT -u $DATABASE_USER -p $DATABASE_NAME
```

#### 3. Port Already in Use

```bash
# Check what's using the port
lsof -i :$PORT

# Kill process if needed
sudo kill -9 <PID>
```

### Debug Environment

```bash
# Print all environment variables
env | sort

# Print specific variables
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_HOST: $DATABASE_HOST"
```

## Best Practices

### 1. Environment File Management

- Keep `.env.example` updated with all variables
- Use `.env.local` for local overrides
- Never commit `.env` files to version control
- Document all required variables

### 2. Variable Naming

- Use UPPER_SNAKE_CASE for environment variables
- Use descriptive names
- Group related variables with prefixes
- Document default values and constraints

### 3. Security

- Use different credentials for each environment
- Rotate passwords regularly
- Use secrets management in production
- Validate all input values

### 4. Development Workflow

```bash
# Start development
cp .env.example .env
# Edit .env with your values
pnpm dev

# Switch environments
cp .env.example .env.test
# Edit for testing
NODE_ENV=test pnpm test
```

## Next Steps

1. **Create your `.env` file** from `.env.example`
2. **Customize values** for your environment
3. **Test configuration** by starting the application
4. **Set up production** environment variables
5. **Implement secrets management** for production
