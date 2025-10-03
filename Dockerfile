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

# Install dependencies (prefer npm ci for production builds)
RUN npm ci --only=production --ignore-scripts

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

# Copy custom nginx configuration for SPA
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # Handle SPA routing (fallback to index.html)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security: Hide nginx version
    server_tokens off;

    # Prevent access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Update nginx config to run on port 8080 (non-privileged)
RUN sed -i 's/listen 80;/listen 8080;/' /etc/nginx/conf.d/default.conf

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