# ──────────────────────────────────────────────
# Backend Dockerfile - NestJS ERP (pnpm workspace)
# Build context is the repo ROOT.
# ──────────────────────────────────────────────

# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

COPY backend ./backend
RUN pnpm --filter erp-backend prisma generate
RUN pnpm --filter erp-backend build

# ---- Development Stage ----
FROM node:20-alpine AS development
WORKDIR /app

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

COPY backend ./backend
RUN pnpm --filter erp-backend prisma generate

EXPOSE 3001
CMD ["pnpm", "--filter", "erp-backend", "start:dev"]

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl dumb-init
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Deploy isolated production node_modules for the backend package
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN pnpm deploy --legacy --filter=erp-backend --prod /prod

COPY --from=builder /app/backend/dist /prod/dist
COPY --from=builder /app/backend/prisma /prod/prisma

RUN addgroup -S erp && adduser -S erp -G erp
RUN chown -R erp:erp /prod

USER erp
WORKDIR /prod
EXPOSE 3001
CMD ["dumb-init", "node", "dist/src/main"]
