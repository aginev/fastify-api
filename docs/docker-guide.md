# Docker Setup Guide

Complete guide for managing Docker containers and services in this project.

## Overview

This project uses Docker to run MariaDB database and other services in isolated containers. Docker Compose is used to orchestrate multiple services.

## Prerequisites

- **Docker:** Version 20.10 or higher
- **Docker Compose:** Version 2.0 or higher
- **Docker Desktop:** For macOS/Windows users

## Services

### MariaDB Database

The main database service running MariaDB 11.2.

**Configuration:**
- **Image:** `mariadb:11.2`
- **Port:** 3306 (mapped to host)
- **Database:** `api`
- **Username:** `db_user`
- **Password:** `db_pass`
- **Root Password:** `db_pass`

**Volumes:**
- `db_data` - Persistent database storage
- `./docker/mariadb/init` - Initialization scripts
- `./docker/mariadb/conf` - Custom configuration
- `./docker/mariadb/logs` - Database logs

## Quick Start

### 1. Start All Services

```bash
# Start all services in background
pnpm db:up

# Or start specific service
docker-compose up -d mariadb
```

### 2. Check Service Status

```bash
# View running containers
docker-compose ps

# Check service logs
pnpm db:logs
```

### 3. Stop Services

```bash
# Stop all services
pnpm db:down

# Stop specific service
docker-compose stop mariadb
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm db:up` | Start all services in background |
| `pnpm db:down` | Stop and remove all services |
| `pnpm db:logs` | View database logs |
| `pnpm db:reset` | Reset database (removes all data) |
| `pnpm db:shell` | Access MariaDB shell |

## Docker Compose Configuration

### Main Configuration

```yaml
services:
  db:
    image: mariadb:11.2
    container_name: mariadb
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: db_pass
      MYSQL_DATABASE: api
      MYSQL_USER: db_user
      MYSQL_PASSWORD: db_pass
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./docker/mariadb/init:/docker-entrypoint-initdb-d
      - ./docker/mariadb/conf:/etc/mysql/conf.d
      - ./docker/mariadb/logs:/var/log/mysql
    networks:
      - fastify_api_network
```

### Environment Variables

- `MYSQL_ROOT_PASSWORD` - Root user password
- `MYSQL_DATABASE` - Default database name
- `MYSQL_USER` - Application user username
- `MYSQL_PASSWORD` - Application user password

### Port Mapping

- **Host Port:** 3306
- **Container Port:** 3306
- **Protocol:** TCP

### Volume Mounts

- **Database Data:** Persistent storage for MariaDB data
- **Init Scripts:** Custom initialization scripts
- **Configuration:** Custom MariaDB configuration
- **Logs:** Database log files

## Database Management

### Accessing the Database

#### Via Docker Shell

```bash
# Access MariaDB shell
pnpm db:shell

# Or directly with docker-compose
docker-compose exec mariadb mysql -u db_user -p api
```

#### Via External Client

Connect using any MySQL/MariaDB client:
- **Host:** localhost
- **Port:** 3306
- **Database:** api
- **Username:** db_user
- **Password:** db_pass

### Database Reset

```bash
# Complete reset (removes all data)
pnpm db:reset

# This command:
# 1. Stops all services
# 2. Removes volumes (data)
# 3. Starts MariaDB fresh
```

### Backup and Restore

#### Create Backup

```bash
# Backup database
docker-compose exec mariadb mysqldump -u db_user -p api > backup.sql

# Backup with timestamp
docker-compose exec mariadb mysqldump -u db_user -p api > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore Database

```bash
# Restore from backup
docker-compose exec -T mariadb mysql -u db_user -p api < backup.sql
```

## Configuration Files

### MariaDB Configuration

Located in `./docker/mariadb/conf/my.cnf`:

```ini
[mysqld]
# Basic settings
default-authentication-plugin = mysql_native_password
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Performance settings
innodb_buffer_pool_size = 256M
max_connections = 100

# Logging
general_log = 1
general_log_file = /var/log/mysql/general.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
```

### Initialization Scripts

Place SQL scripts in `./docker/mariadb/init/` to run them when the container starts:

```sql
-- Example: create_tables.sql
CREATE TABLE IF NOT EXISTS example (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using port 3306
lsof -i :3306

# Kill process if needed
sudo kill -9 <PID>
```

#### 2. Container Won't Start

```bash
# Check container logs
docker-compose logs mariadb

# Check container status
docker-compose ps -a
```

#### 3. Database Connection Issues

```bash
# Verify container is running
docker-compose ps

# Check database logs
pnpm db:logs

# Test connection
pnpm db:shell
```

#### 4. Permission Issues

```bash
# Fix volume permissions
sudo chown -R 999:999 ./docker/mariadb/logs
sudo chown -R 999:999 ./docker/mariadb/conf
```

### Performance Tuning

#### Memory Optimization

```yaml
# Add to docker-compose.yml
services:
  db:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

#### Connection Pooling

```yaml
# Add to docker-compose.yml
services:
  db:
    environment:
      MYSQL_MAX_CONNECTIONS: 200
      MYSQL_INNODB_BUFFER_POOL_SIZE: 512M
```

## Development vs Production

### Development

- All services run locally
- Data persists between restarts
- Debug logging enabled
- No security restrictions

### Production

- Use managed database service
- Implement proper security
- Regular backups
- Monitoring and alerting
- Connection pooling
- SSL/TLS encryption

## Monitoring

### Container Health

```bash
# Check container health
docker-compose ps

# View resource usage
docker stats mariadb
```

### Database Metrics

```bash
# Check database status
pnpm db:shell
SHOW STATUS;

# Check process list
SHOW PROCESSLIST;
```

### Log Analysis

```bash
# View real-time logs
pnpm db:logs

# Search logs for errors
docker-compose logs mariadb | grep ERROR
```

## Security Considerations

### Development

- Default passwords (change in production)
- No SSL/TLS
- All hosts allowed

### Production

- Strong, unique passwords
- SSL/TLS encryption
- Restricted host access
- Regular security updates
- Network isolation

## Next Steps

1. **Customize Configuration:** Modify `docker/mariadb/conf/my.cnf`
2. **Add Initialization Scripts:** Place SQL files in `docker/mariadb/init/`
3. **Set Up Monitoring:** Implement health checks and metrics
4. **Security Hardening:** Review and update security settings
5. **Backup Strategy:** Implement automated backup procedures
