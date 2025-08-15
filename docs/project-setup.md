# Project Setup Guide

Complete guide to set up and run this Node.js project locally.

## Prerequisites

- **Node.js:** Version 20.0.0 or higher
- **Package Manager:** pnpm (recommended) or npm
- **Docker:** For running MariaDB database
- **Git:** For version control

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nodejs
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=api
DATABASE_USER=db_user
DATABASE_PASSWORD=db_pass
DATABASE_URL=mysql://db_user:db_pass@localhost:3306/api

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 4. Start the Database

```bash
# Start MariaDB container
pnpm db:up

# Wait for database to be ready (check logs)
pnpm db:logs
```

### 5. Initialize Database Schema

```bash
# Generate Drizzle migrations
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 6. Run the Application

```bash
# Development mode with hot reload
pnpm dev

# Or production build
pnpm build
pnpm start
```

## Verification

1. **Database:** Check if MariaDB is running on port 3306
2. **API:** Visit `http://localhost:3000/health` for health check
3. **Logs:** Monitor application logs for any errors

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm check` | Run all checks (type, lint, format) |

## Database Scripts

| Script | Description |
|--------|-------------|
| `pnpm db:up` | Start database container |
| `pnpm db:down` | Stop database container |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:push` | Push schema changes |
| `pnpm db:studio` | Open Drizzle Studio |

## Project Structure

```
nodejs/
├── src/                    # Source code
│   ├── db/               # Database layer
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
├── docs/                 # Documentation
├── docker/               # Docker configuration
├── drizzle/              # Generated migrations
└── dist/                 # Build output
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:3000 | xargs kill`

2. **Database connection failed:**
   - Ensure Docker is running
   - Check database container status: `pnpm db:logs`
   - Verify credentials in docker-compose.yml

3. **TypeScript errors:**
   - Run `pnpm typecheck` to see all errors
   - Ensure all dependencies are installed
   - Check tsconfig.json configuration

4. **ESLint errors:**
   - Run `pnpm lint:fix` to auto-fix issues
   - Check eslint.config.js for configuration

### Getting Help

- Check the logs: `pnpm db:logs`
- Review database status: `pnpm db:shell`
- Open Drizzle Studio: `pnpm db:studio`
- Check application logs in terminal

## Next Steps

After successful setup:

1. **Explore the API:** Visit `http://localhost:3000`
2. **Database Management:** Use `pnpm db:studio`
3. **Development:** Start coding in `src/` directory
4. **Testing:** Add tests to your features
5. **Documentation:** Update docs as you develop
