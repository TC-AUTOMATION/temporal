# syntax=docker/dockerfile:1.4

# ============================================
# BASE IMAGE - Alpine for minimal size
# ============================================
FROM node:20-alpine AS base

# Install security updates
RUN apk update && apk upgrade --no-cache

# ============================================
# DEPENDENCIES STAGE - Cached separately
# ============================================
FROM base AS deps

# Required for some npm packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only package files first (better cache)
COPY package.json package-lock.json ./

# Install dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# ============================================
# PRISMA STAGE - Generate client separately
# ============================================
FROM base AS prisma

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma

# Generate Prisma client with cache
RUN --mount=type=cache,target=/root/.cache/prisma \
    npx prisma generate

# ============================================
# BUILDER STAGE - Build the application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies and generated Prisma client
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

# Copy config files (order matters for cache efficiency)
COPY package.json next.config.ts tsconfig.json postcss.config.mjs ./

# Copy source files
COPY public ./public
COPY src ./src
COPY prisma ./prisma

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build-time dummy values (replaced at runtime by real secrets)
# These are NOT used in production - only to satisfy build-time checks
ENV JWT_SECRET="build-time-placeholder-will-be-replaced-at-runtime"
ENV RESEND_API_KEY="re_build_placeholder"
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV STRIPE_SECRET_KEY="sk_test_placeholder"
ENV STRIPE_WEBHOOK_SECRET="whsec_placeholder"

# Build with cache mount for Next.js
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ============================================
# RUNNER STAGE - Production image (minimal)
# ============================================
FROM base AS runner

WORKDIR /app

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install only wget for healthcheck (minimal)
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets (no ownership change needed - read only)
COPY --from=builder /app/public ./public

# Copy standalone build with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema for runtime (needed for some queries)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=prisma --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
