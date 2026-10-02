# Dockerfile for Personal MCP Server
# This creates a containerized version of your MCP server that can run anywhere

# Use official Node.js LTS (Long Term Support) version
FROM node:20-alpine

# Why alpine? It's a tiny Linux (~5MB) that makes your container smaller and faster

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better Docker layer caching)
# If package.json doesn't change, Docker reuses the npm install layer
COPY package*.json ./

# Install production dependencies only
# --omit=dev skips devDependencies to keep image smaller
RUN npm ci --omit=dev

# Copy the rest of your application code
COPY . .

# Create a non-root user for security
# Running as root inside containers is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port your app runs on
# Change this if your server uses a different port
EXPOSE 3000

# Health check to ensure container is running properly
# Docker will ping this endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "server.js"]
