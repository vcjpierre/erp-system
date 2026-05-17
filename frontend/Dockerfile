# ──────────────────────────────────────────────
# Frontend Dockerfile - Next.js 15 ERP
# ──────────────────────────────────────────────

# ---- Dependencies Stage ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# ---- Development Stage ----
FROM node:20-alpine AS development
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN addgroup -S erp && adduser -S erp -G erp
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN chown -R erp:erp /app
USER erp
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S erp && adduser -S erp -G erp
RUN apk add --no-cache dumb-init
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN chown -R erp:erp /app
USER erp
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["dumb-init", "node", "server.js"]
