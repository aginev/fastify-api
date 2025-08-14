# Docker Setup for Node.js Application

This directory contains Docker configuration for running MariaDB locally during development.

## 🚀 **Quick Start**

### **Start the Database:**
```bash
# Start MariaDB only
docker-compose up mariadb -d

# Start MariaDB
docker-compose up -d
```

### **Stop the Database:**
```bash
docker-compose down
```

### **View Logs:**
```bash
# MariaDB logs
docker-compose logs mariadb

# Follow logs in real-time
docker-compose logs -f mariadb
```

## 🗄️ **Database Configuration**

### **Connection Details:**
- **Host**: `localhost` (or `127.0.0.1`)
- **Port**: `3306`
- **Database**: `api`
- **User**: `db_user`
- **Password**: `db_pass`
- **Root Password**: `db_pass`

### **Environment Variables:**
Copy `env.example` to `.env` and update as needed:
```bash
cp env.example .env
```



## 📁 **Directory Structure**

```
docker/
├── mariadb/
│   ├── conf/           # MariaDB configuration files
│   │   └── my.cnf     # Main configuration
│   ├── init/           # Database initialization scripts
│   │   └── 01-init.sql # Initial setup script
│   └── logs/           # Database logs (mounted volume)
├── README.md           # This file
└── docker-compose.yml  # Main compose file
```

## 🔧 **Configuration Files**

### **MariaDB Configuration (`my.cnf`)**
- **Character Set**: UTF8MB4 with Unicode collation
- **Buffer Pool**: 256MB (optimized for development)
- **Logging**: General and slow query logs enabled
- **Performance**: Optimized for development workloads

### **Initialization Script (`01-init.sql`)**
- Creates `nodejs_dev` database
- Sets up `users` table with proper indexes
- Inserts sample data
- Configures user permissions

## 🚨 **Important Notes**

### **Data Persistence:**
- Database data is stored in a Docker volume (`mariadb_data`)
- Data persists between container restarts
- To reset data: `docker-compose down -v && docker-compose up -d`

### **Port Conflicts:**
- If port 3306 is already in use, change it in `docker-compose.yml`

### **Security:**
- **Development only**: These passwords are for local development
- **Never use** these credentials in production
- **Change passwords** if deploying to shared environments

## 🛠️ **Troubleshooting**

### **Container Won't Start:**
```bash
# Check if ports are in use
lsof -i :3306

# Remove existing containers
docker-compose down -v
docker system prune -f
```

### **Can't Connect to Database:**
```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs mariadb

# Test connection from host
mysql -h localhost -P 3306 -u db_user -p api
```

### **Reset Database:**
```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 📚 **Useful Commands**

```bash
# Access MariaDB shell
docker-compose exec mariadb mysql -u root -p

# Backup database
docker-compose exec mariadb mysqldump -u root -p api > backup.sql

# Restore database
docker-compose exec -T mariadb mysql -u root -p api < backup.sql

# View running containers
docker-compose ps

# View resource usage
docker stats
```
