# Azaria Wiki - Optimized Multi-Stage Dockerfile
# Stage 1: Dependencies and Build
FROM node:alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY bun.lock* ./

# Install all dependencies (needed for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Runtime
FROM nginx:alpine AS production

# Install security updates
RUN apk upgrade --no-cache

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for security
RUN addgroup -g 1001 -S azaria && \
    adduser -S azaria -u 1001

# Set ownership and permissions
RUN chown -R azaria:azaria /usr/share/nginx/html && \
    chown -R azaria:azaria /var/cache/nginx && \
    chown -R azaria:azaria /var/log/nginx && \
    chown -R azaria:azaria /etc/nginx/conf.d

# Create PID directory for nginx and set permissions
RUN mkdir -p /var/run/nginx && \
    chown -R azaria:azaria /var/run/nginx && \
    touch /var/run/nginx/nginx.pid && \
    chown azaria:azaria /var/run/nginx/nginx.pid

# Switch to non-root user
USER azaria

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]