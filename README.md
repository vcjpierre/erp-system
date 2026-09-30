# ERP System

Monorepo ERP with a Next.js frontend and a NestJS API. Run one command to start both.

## Quick path

1. `pnpm install`
2. Copy `.env.example` to `.env` (root) and `backend/.env` (authoritative for the API). Set `DATABASE_URL` and `REDIS_URL`.
3. `pnpm --filter erp-backend prisma:migrate && pnpm --filter erp-backend prisma:seed`
4. `pnpm dev`

Verify: frontend at `http://localhost:3000`, API at `http://localhost:3001/api`, Swagger at `http://localhost:3001/api/docs`.

## Demo credentials (local dev only)

| Email | Password |
|---|---|
| `admin@erp.local` | `Admin123!` |

Created by `backend/prisma/seed.ts` (bcrypt-hashed, Super Admin with full permissions). **Local development only — rotate or remove before staging/production. Never commit real secrets to the repo or this file.**

## Stack

| Layer | Tech |
|---|---|
| Orchestration | pnpm workspaces + Turborepo (`pnpm dev` → `turbo run dev`) |
| Frontend (`erp-frontend`) | Next.js 15 App Router, React 19, Tailwind CSS, Radix UI, React Hook Form + Zod, Zustand |
| Backend (`erp-backend`) | NestJS 10, Prisma 5.22 (PostgreSQL, schemas `public` + `erp`), BullMQ + Redis, JWT + Passport, Swagger |
| Data | PostgreSQL 16, Redis 7 (local via compose) or managed (default, see below) |

## Prerequisites

- Node.js 20+, pnpm 10.14 (`packageManager: pnpm@10.14.0`)
- Docker (only if you run the local Postgres/Redis stack)
- Remote database access (default path — no Docker needed)

## Database targets

| Mode | When | How |
|---|---|---|
| Remote by default | Normal development | `DATABASE_URL` / `REDIS_URL` in `backend/.env` point to managed Postgres (InsForge) + Redis (Upstash). Root `.env` mirrors the same URLs. |
| Local via compose | Offline work or isolated testing | `docker compose up -d postgres redis`, then point `DATABASE_URL` / `REDIS_URL` at `localhost:5432` / `localhost:6379`. See `.env.example` for the variable names. |

`docker-compose.yml` also defines `backend`, `frontend`, and `nginx` services, but local `pnpm dev` (without containers) is the default workflow.

## Ports and services

| Service | URL |
|---|---|
| Frontend (`next dev`) | `http://localhost:3000` |
| Backend API (`nest start --watch`, global prefix `/api`) | `http://localhost:3001/api` |
| Swagger docs | `http://localhost:3001/api/docs` |
| Local Postgres (compose, opt-in) | `localhost:5432` |
| Local Redis (compose, opt-in) | `localhost:6379` |

Backend alias: `pnpm --filter erp-backend dev` is shorthand for `start:dev` (`prisma generate && nest start --watch`).

## Useful scripts

```bash
pnpm dev            # turbo: frontend + backend together
pnpm build          # turbo: build all
pnpm lint           # turbo: lint all
```

## Repo structure

```text
backend/          NestJS API (src/, prisma/schema.prisma, prisma/seed.ts)
frontend/         Next.js App Router UI
infra/            postgres init.sql, nginx config
docker-compose.yml  postgres / redis / backend / frontend / nginx
turbo.json        dev (persistent, no cache), build, lint, test pipelines
pnpm-workspace.yaml packages: backend, frontend
```