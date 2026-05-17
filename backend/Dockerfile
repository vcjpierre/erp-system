# ──────────────────────────────────────────────
# Backend Dockerfile - NestJS ERP
# ──────────────────────────────────────────────

# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma
RUN pnpm prisma generate

COPY src ./src
RUN pnpm run build

# ---- Development Stage ----
FROM node:20-alpine AS development
WORKDIR /app

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY prisma ./prisma
RUN pnpm prisma generate

COPY . .

EXPOSE 3001
CMD ["pnpm", "run", "start:dev"]

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl dumb-init
RUN addgroup -S erp && adduser -S erp -G erp

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

USER erp

EXPOSE 3001
CMD ["dumb-init", "node", "dist/main"]
