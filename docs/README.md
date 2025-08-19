# Project Documentation

Welcome to the project documentation! This directory contains comprehensive guides and references for developers working on this Node.js application.

## 📚 Documentation Index

### 🚀 Getting Started
- [Project Setup](./project-setup.md) - Complete project setup guide
- [Development Guide](./development-guide.md) - Local development setup and workflow

### 🛠️ Development
- [API Reference](./api-reference.md) - API endpoints and usage
- [Services Structure](./services-structure.md) - Business logic organization by resource
- [Configuration Structure](./configuration-structure.md) - Application configuration organization
- [Environment Variables](./environment-variables.md) - Configuration options and setup
- [Error Handling System](./error-handling-system.md) - Error handling architecture and patterns

### 🗄️ Database
- [Database Schema](./database-schema.md) - Database table schemas and structure
- [Drizzle Migrations](./drizzle-migrations.md) - Database migration system and workflow
- [Migration Quick Start](./migration-quickstart.md) - Get started with migrations in 5 minutes

### 🐳 Infrastructure
- [Docker Guide](./docker-guide.md) - Container configuration and management

## 🎯 Quick Start

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd nodejs
   pnpm install
   ```

2. **Start the database:**
   ```bash
   pnpm db:up
   ```

3. **Run the application:**
   ```bash
   pnpm dev
   ```

4. **View API documentation:**
   ```bash
   # API will be available at http://localhost:3000
   ```

## 📝 Contributing

When adding new documentation:
- Use clear, descriptive titles
- Include code examples where helpful
- Keep information up-to-date
- Follow the existing documentation structure

## 🔗 External Resources

- [Fastify Documentation](https://www.fastify.io/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
