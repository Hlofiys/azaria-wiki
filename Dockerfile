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

# Sync SvelteKit first to generate .svelte-kit directory
RUN npm run prepare

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

# Create simple nginx.conf to avoid PID issues
RUN echo "events{} http{ include /etc/nginx/conf.d/*.conf; }" > /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]