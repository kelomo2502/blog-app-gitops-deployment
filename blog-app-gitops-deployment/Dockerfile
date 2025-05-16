# ----- builder stage -----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build



FROM nginx:alpine

# Metadata for final image
LABEL org.opencontainers.image.source="https://github.com/kelomo2502/blog-app-gitops-deployment"
LABEL org.opencontainers.image.maintainer="kelvinoye@gmail.com"
LABEL org.opencontainers.image.description="Nginx container to serve blog app"

# Add non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create necessary dirs and assign permissions to non-root user
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R appuser:appgroup /usr/share/nginx /var/cache/nginx /var/run

# Copy custom nginx configuration file to replace default config
COPY nginx.conf /etc/nginx/nginx.conf

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy build artifacts from the builder stage
COPY --from=builder /app/dist/ ./

# Copy and set permissions for entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Change ownership of nginx html directory (if not done earlier)
RUN chown -R appuser:appgroup /usr/share/nginx/html

RUN mkdir -p /run && chown appuser:appgroup /run

# Switch to non-root user
USER appuser

# Health check to verify container is serving
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --spider http://127.0.0.1:8080 || exit 1

EXPOSE 8080

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]

