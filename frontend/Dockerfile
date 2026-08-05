# ──────────────────────────────────────────────
# Frontend Dockerfile - Next.js 15 ERP (pnpm workspace)
# Build context is the repo ROOT.
# ──────────────────────────────────────────────

# ---- Dependencies Stage ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY frontend ./frontend
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter erp-frontend build

# ---- Development Stage ----
FROM node:20-alpine AS development
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY frontend ./frontend
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["pnpm", "--filter", "erp-frontend", "dev"]

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S erp && adduser -S erp -G erp
RUN apk add --no-cache dumb-init
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public
RUN chown -R erp:erp /app
USER erp
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["dumb-init", "node", "server.js"]
