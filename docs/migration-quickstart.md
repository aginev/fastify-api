# Migration Quick Start Guide

Get up and running with Drizzle migrations in 5 minutes!

## 🚀 Quick Start

### 1. Start Database
```bash
pnpm db:up
```

### 2. Generate Initial Migration
```bash
pnpm db:generate
```

This creates the `./src/db/migrations` folder with your first migration files.

### 3. Apply Migration
```bash
pnpm db:migrate
```

Your database schema is now created! 🎉

## 📝 Daily Workflow

### When you change your schema:

1. **Generate migration:**
   ```bash
   pnpm db:generate
   ```

2. **Review generated SQL** in `./src/db/migrations/` folder

3. **Apply migration:**
   ```bash
   pnpm db:migrate
   ```

4. **Verify changes:**
   ```bash
   pnpm db:studio
   ```

## 🔧 Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate migration files |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:check` | Check migration status |
| `pnpm db:studio` | Open database browser |
| `pnpm db:push` | Push schema directly (dev only) |
| `pnpm db:drop` | Remove unapplied migrations |

## 🆘 Need Help?

- **Full Documentation**: [Drizzle Migrations](./drizzle-migrations.md)
- **Database Schema**: [Database Schema](./database-schema.md)
- **Configuration**: [Configuration Structure](./configuration-structure.md)

## ⚠️ Important Notes

- **Never modify applied migrations** - create new ones instead
- **Always review generated SQL** before applying
- **Test migrations in development** before production
- **Commit migration files** to version control

## 🎯 Next Steps

1. Read the [full migration documentation](./drizzle-migrations.md)
2. Explore your database with [Drizzle Studio](./drizzle-migrations.md#open-drizzle-studio)
3. Learn about [best practices](./drizzle-migrations.md#best-practices)
