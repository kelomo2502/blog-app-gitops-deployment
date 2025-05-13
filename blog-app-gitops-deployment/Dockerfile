# # Use a lightweight Node.js image for building
# FROM node:20-alpine AS builder

# # Set working directory
# WORKDIR /app

# # Copy package.json and lock files first (for better caching)
# COPY package.json package-lock.json ./

# # Install dependencies (including devDependencies for building)
# RUN npm ci

# # Copy the rest of the app
# COPY . .

# # Build the project
# RUN npm run build  

# # Serve stage with Nginx
# FROM nginx:alpine

# # Set working directory
# WORKDIR /usr/share/nginx/html

# # Copy build files from builder stage
# COPY --from=builder /app/dist/ /usr/share/nginx/html/

# # Copy custom entrypoint script
# COPY entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# # # Set entrypoint
# ENTRYPOINT ["/entrypoint.sh"]


# ---------- Builder Stage ----------
FROM node:20-alpine AS builder

# Metadata labels (for maintainability)
LABEL org.opencontainers.image.source="https://github.com/kelomo2502/blog-app-gitops-deployment"
LABEL org.opencontainers.image.maintainer="kelvinoye@gmail.com"
LABEL org.opencontainers.image.description="Production build for blog app"

# Set working directory
WORKDIR /app

# Copy lock files first for optimized caching
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source files
COPY . .

# Build app
RUN npm run build


# ---------- Serve Stage ----------
FROM nginx:alpine

# Add metadata again for final image
LABEL org.opencontainers.image.source="https://github.com/kelomo2502/blog-app-gitops-deployment"
LABEL org.opencontainers.image.maintainer="kelvinoye@gmail.com"
LABEL org.opencontainers.image.description="Nginx container to serve blog app"

# Run as non-root user (security)
# Create a new user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built files from builder
COPY --from=builder /app/dist/ ./

# Copy entrypoint and give permissions
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Now switch to non-root user
USER appuser

# Add a health check (simple HTTP check)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --spider http://localhost || exit 1

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
