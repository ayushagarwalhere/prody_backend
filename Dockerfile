FROM oven/bun:1 AS base

WORKDIR /app

# Install dependencies first (better build cache)
COPY package.json bun.lockb* ./
RUN if [ -f bun.lockb ]; then bun install --frozen-lockfile; else bun install; fi

# Copy the rest of the source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

# By default the app reads configuration from .env, which you should
# provide at runtime via env vars or a mounted file.
CMD ["bun", "run", "dev"]

