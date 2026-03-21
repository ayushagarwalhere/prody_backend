# Multi-stage build for production
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN if [ -f bun.lockb ]; then bun install --frozen-lockfile; else bun install; fi

# Build stage
FROM base AS builder
COPY . .
RUN bun run build

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM oven/bun:1 AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 bun
RUN adduser --system --uid 1001 bun

# Copy production dependencies
COPY package.json bun.lockb* ./
RUN if [ -f bun.lockb ]; then bun install --frozen-lockfile --production; else bun install --production; fi

# Copy built application and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set permissions
RUN chown -R bun:bun /app
USER bun

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/events || exit 1

EXPOSE 3000

# Environment variables for production
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", "start"]

