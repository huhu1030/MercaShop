# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MercaShop SaaS — a multi-tenant e-commerce platform. pnpm monorepo under `platform/`.

## Monorepo Structure

```
platform/
├── apps/api/        — Express + Tsoa REST API (Node 20+)
├── apps/web/        — React + Vite admin dashboard
└── packages/shared/ — Shared types, enums, and generated API client (TypeScript + Axios)
```

## Common Commands

All commands run from `platform/`:

```bash
# Development
pnpm dev:api              # Start API in watch mode
pnpm dev:web              # Start Vite dev server

# Build, lint, typecheck, test (all packages)
pnpm build
pnpm lint
pnpm typecheck
pnpm test

# Single package
pnpm --filter @mercashop/api test
pnpm --filter @mercashop/web lint
pnpm --filter @mercashop/shared build

# API client regeneration (run after changing Tsoa controllers)
pnpm generate:api-client  # Generates OpenAPI spec → TypeScript Axios client
```

**Testing:**
- API: Jest (`platform/apps/api/jest.config.js`)
- Web: Vitest (`platform/apps/web/vitest.config.ts`)

## Architecture

### Multi-Tenancy

Single MongoDB database. Every document (except Tenant) has a `tenantId` field. Tenant resolved via middleware matching `Origin` or `x-tenant-id` header.

### API (Express + Tsoa)

- Controllers in `apps/api/src/controllers/` use Tsoa decorators → auto-generate OpenAPI 3.0 spec and Express routes
- Business logic in `apps/api/src/services/`
- Mongoose models in `apps/api/src/models/`
- Auth: Firebase Admin SDK verifies JWT tokens per-tenant (each tenant has its own Firebase Identity Platform tenant ID)
- Auth module: `apps/api/src/auth/authentication.ts`
- Swagger UI at `/docs` in dev

### Web (React + Vite + Chakra UI v3)

- State: React Query for server state, Jotai atoms for client state
- Forms: React Hook Form
- Routing: React Router v7
- Auth: Firebase Auth SDK → token passed to API via Axios interceptor
- Tenant config loaded via `useTenant` hook

### Shared Package

- `packages/shared/src/types.ts` — DTOs shared between API and web
- `packages/shared/src/enums.ts` — OrderStatus, UserRole, etc.
- `packages/shared/src/api/api-client-factory.ts` — Centralized Axios instance with bearer token injection, 401 auto-refresh, and graceful sign-out
- `packages/shared/src/api/clients.ts` — Lazy-loaded API client instances
- `packages/shared/src/apis/api/` — Generated API client (do not edit manually)

### API Client Flow

Tsoa controller decorators → `pnpm generate:api-spec` → OpenAPI spec (`dist/swagger.json`) → `openapi-generator-cli` → TypeScript Axios client in shared package. Always regenerate after controller changes.

## Key Technical Decisions

- **No Redux** — replaced with Jotai atoms + React Query
- **Tsoa** for type-safe API routes and automatic OpenAPI generation
- **Firebase Identity Platform** for per-tenant auth (not standard Firebase Auth)
- **Mollie** for payment processing
- **Google Cloud Storage** for file uploads
- **Socket.io** for real-time order notifications
- **Strict TypeScript** — no `any`/`unknown`/casting; everything must be properly typed
