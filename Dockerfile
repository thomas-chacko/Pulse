FROM node:20-alpine AS base
# Set working directory
WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install **production** dependencies only (omit dev)
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create non‑root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# ---------- Development image ----------
FROM base AS development
# Install **all** dependencies (including dev) for hot‑reloading tools like nodemon
RUN npm ci
USER nodejs
EXPOSE 3000 9229
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
# Use npm's watch script (or nodemon) for live reload
CMD ["npm", "run", "dev"]

# ---------- Production image (DEFAULT) ----------
FROM base AS production
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["node", "server.js"]
