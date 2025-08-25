# Multi-stage Dockerfile for Kubernetes deployment
# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies (production only)
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Production runtime
FROM node:20-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml ./

# Copy pre-built application (built locally)
COPY dist/ ./dist/

# Install only production dependencies
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate && \
    pnpm install --frozen-lockfile --prod

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# # Use dumb-init to handle signals properly
# ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
