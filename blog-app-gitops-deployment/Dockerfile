# Use a lightweight Node.js image for building
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock files first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the project
RUN npm run build  

# Serve stage with Nginx
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy build files from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy custom entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
