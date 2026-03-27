# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MercaShop SaaS — a multi-tenant e-commerce platform for food ordering and delivery. Each tenant gets their own branded storefront and dashboard. The goal is to provide a turnkey online ordering solution with real-time order tracking, payment processing, and analytics.

## Tech Stack

- **Backend**: TypeScript, Node.js, Express, TSOA (OpenAPI-based routes/schema generation), Mongoose (MongoDB), Firebase Admin
- **Frontend**: TypeScript, React 19, Vite, Chakra UI v3, TanStack Query, react-hook-form, Jotai
- **Database**: MongoDB via Mongoose
- **Package Manager**: PNPM (mandatory)
- **Testing**: Jest (API), Vitest (dashboard, storefront)

## Repository Structure

This is a **PNPM workspace monorepo** under `platform/`:

```
platform/
├── apps/
│   ├── api/                  # Express + Tsoa REST API (Node 20+)
│   │   └── src/
│   │       ├── controllers/  # TSOA controllers (route definitions)
│   │       ├── services/     # Business logic (Mongoose queries)
│   │       ├── models/       # Mongoose schemas/models
│   │       ├── dtos/         # Request/response DTOs
│   │       ├── auth/         # Firebase Admin auth module
│   │       ├── config/       # Database, Firebase, GCP config
│   │       ├── middleware/    # Tenant resolver, error handler
│   │       ├── utils/        # Date, distance, string, validation utilities
│   │       └── generated/    # TSOA-generated routes (do not edit)
│   ├── dashboard/            # Admin dashboard (React + Vite)
│   │   └── src/
│   │       ├── pages/        # Page components
│   │       ├── components/   # Reusable UI components
│   │       ├── hooks/        # Custom hooks
│   │       ├── store/        # Jotai atoms
│   │       └── services/     # API service helpers
│   └── storefront/           # Customer-facing storefront (React + Vite)
│       └── src/
│           ├── pages/        # Customer pages (menu, checkout, orders, etc.)
│           ├── components/   # Storefront UI components
│           ├── hooks/        # Custom hooks (useAuth, useProducts, useBranding, etc.)
│           └── lib/          # Utility library
├── packages/
│   └── shared/               # @mercashop/shared - Shared types, enums, API client
│       └── src/
│           ├── types.ts      # Shared TypeScript interfaces (DTOs)
│           ├── enums.ts      # OrderStatus, PaymentMethod, UserRole, etc.
│           ├── api/          # API client factory and singleton instances
│           └── apis/api/     # Generated OpenAPI client (do not edit)
├── docker/                   # Docker configuration
├── eslint.config.mjs         # Flat ESLint config for all apps
├── tsconfig.base.json        # Shared base TypeScript config
├── prettier.config.mjs       # Prettier config
└── pnpm-workspace.yaml       # Workspace definition
```

## Frontend Architecture

Two independent frontend apps sharing a common package:

| Package | Name | Purpose |
|---------|------|---------|
| `apps/dashboard` | `@mercashop/dashboard` | Admin panel for managing products, orders, analytics |
| `apps/storefront` | `@mercashop/storefront` | Customer-facing ordering experience |
| `packages/shared` | `@mercashop/shared` | Shared types, enums, and generated API clients |

### Import Conventions

```typescript
// ============================================
// FROM SHARED PACKAGE - Use @mercashop/shared
// ============================================
// Main exports (types, enums)
import { OrderStatus, type IOrderLine, type IPublicProduct } from '@mercashop/shared';

// API client singletons
import { getOrderApi, getProductApi } from '@mercashop/shared/api-client';

// ============================================
// TYPES - Always use `import type` for type-only imports
// ============================================
import type { ISelectedOptionGroup, IAnalyticsResponse } from '@mercashop/shared';
```

### API Clients (MANDATORY)

- **NEVER use raw `fetch()` or `axios` to call the backend API**
- Always use singleton API clients from `@mercashop/shared/api-client`
- Method names match the backend controller's `operationId`

```typescript
// Correct - use API singleton
import { getOrderApi } from '@mercashop/shared/api-client';
const response = await getOrderApi().getOrdersByUser(userId);

// FORBIDDEN - never use fetch/axios directly
const response = await fetch(`${API_URL}/orders?userId=${userId}`);
```

### State Management

- **Server state**: TanStack Query (React Query v5) — all API data fetching
- **Client state**: Jotai atoms — local UI state (cart, modals, etc.)
- **No Redux** — intentionally replaced with Jotai + React Query

### UI & Forms

- **Components**: Chakra UI v3
- **Forms**: React Hook Form
- **Routing**: React Router v7

### Authentication & Authorization

Firebase Auth SDK on the frontend, Firebase Admin SDK on the backend. Each tenant has its own Firebase Identity Platform tenant ID (not standard Firebase Auth).

- Token passed to API via Axios interceptor in the shared API client factory
- 401 responses trigger automatic token refresh, then graceful sign-out on failure
- Tenant config loaded via `useTenant` hook

**Role hierarchy:**
- `ADMIN` — full access
- `OWNER` — establishment owner
- `USER` — customer

### Environment Variables (MANDATORY)

**All environment variables MUST be accessed via `@mercashop/shared/config/environment`**. Never use `import.meta.env` directly elsewhere.

```typescript
// Correct - use environment config
import { environment } from '@mercashop/shared/config/environment';
const apiUrl = environment.API_URL;

// Wrong - direct env access
const apiUrl = import.meta.env.VITE_API_URL;
```

**Required variables** (in each app's `.env`):
- `VITE_API_URL` — Backend API URL
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET` — Firebase config
- `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` — Firebase (dashboard only)

## Common Commands

All commands run from `platform/`:

```bash
# Development
pnpm dev:api                # Start API in watch mode
pnpm dev:dashboard          # Start dashboard dev server
pnpm dev:storefront         # Start storefront dev server

# Build, lint, typecheck, test (all packages)
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format                 # Format with Prettier
pnpm format:check           # Check formatting

# Single package
pnpm --filter @mercashop/api test
pnpm --filter @mercashop/dashboard lint
pnpm --filter @mercashop/storefront typecheck
pnpm --filter @mercashop/shared build

# Tenant management
pnpm onboard-tenant         # Run tenant onboarding script

# API client regeneration (run after changing TSOA controllers)
pnpm generate:api-spec      # Generate OpenAPI spec from TSOA controllers
pnpm generate:api-client    # Regenerate TypeScript Axios client from spec
```

## Form Development Pattern

1. Define Zod schema (inline or co-located)
2. Derive TypeScript type with `z.input<typeof schema>`
3. Use `useForm` with `zodResolver(schema)`
4. Use `Controller` for complex field types (file uploads, selects)

```typescript
const schema = z.object({
  name: z.string().min(1, 'Required'),
  price: z.coerce.number().min(0),
});

type FormValues = z.input<typeof schema>;

const { control, handleSubmit } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

## Key Architecture Patterns

### Multi-Tenancy

Single MongoDB database. Every document (except Tenant) has a `tenantId` field. Tenant resolved via middleware matching `Origin` or `x-tenant-id` header.

### Backend API Development

1. **Controllers** in `apps/api/src/controllers/` use TSOA decorators → auto-generate OpenAPI 3.0 spec and Express routes
2. **Services** in `apps/api/src/services/` contain all business logic — controllers should be thin
3. **Mongoose models** in `apps/api/src/models/` define MongoDB schemas
4. **DTOs** in `apps/api/src/dtos/` define request/response shapes
5. **Swagger UI** at `/docs` in dev

### OpenAPI Workflow

When modifying backend controllers or DTOs:
1. Run `pnpm generate:api-spec` to regenerate the OpenAPI spec
2. Run `pnpm generate:api-client` to regenerate the TypeScript Axios client in shared package
3. Never manually edit files in `packages/shared/src/apis/api/`

### Shared Package

- `types.ts` — Shared interfaces (IOrderLine, IPublicProduct, IOptionGroup, ISelectedOptionGroup, etc.)
- `enums.ts` — OrderStatus, PaymentMethod, DeliveryMethod, UserRole, EstablishmentStatus, SelectionMode
- `api/api-client-factory.ts` — Centralized Axios instance with bearer token injection, 401 auto-refresh, and graceful sign-out
- `api/clients.ts` — Lazy-loaded API client singleton instances
- `apis/api/` — Generated API client (do not edit manually)

### Adding to Shared Package

When adding types, enums, or API clients to `@mercashop/shared`:

1. **Add code** to `packages/shared/src/` (types in `types.ts`, enums in `enums.ts`)
2. **Export** from `packages/shared/src/index.ts`
3. **Import in apps** using `@mercashop/shared` or `@mercashop/shared/api-client`

```typescript
// packages/shared/src/index.ts
export { MyEnum } from './enums';
export type { IMyType } from './types';

// In app code
import { MyEnum, type IMyType } from '@mercashop/shared';
```

### Key Integrations

- **Mollie** for payment processing
- **Google Cloud Storage** for file uploads
- **Socket.io** for real-time order notifications
- **Email-templates + Nodemailer** for transactional emails
- **Firebase Identity Platform** for per-tenant auth

### Deployment

GCP Cloud Run via GitHub Actions. Each frontend app has its own Docker build and Cloud Run service:

- Multi-stage Docker builds (Node 20 Alpine + pnpm 9 + Nginx)
- Environment variables passed as Docker build args
- Nginx serves the built SPA on port 8080
- Auto-deploy on `main` branch CI success
- Dockerfiles in `platform/docker/` (`dashboard.Dockerfile`, `storefront.Dockerfile`)
- Workflows in `.github/workflows/` (`deploy-dashboard.yml`, `deploy-storefront.yml`)

## Code Style Rules

- Avoid `any` or `unknown` types — if you need them, something is wrong
- No type casting — fix the underlying type issue instead
- Use `import type` for type-only imports
- Use `never` for exhaustive switch statements, type guards, and type assertions
- Use meaningful variable and function names
- Comments only for business logic explanations, not obvious code
- Clean Architecture principles — clarity and maintainability are priorities

### ESLint Enforcement

- **Generated API imports**: ESLint blocks direct imports from `apis/api/` except:
  - `api/clients/` folder (allowed to import API classes)
  - Type imports using `import type { ... }` (allowed everywhere)
- **Type imports**: Use `import type` for all DTO/type imports
- Run `pnpm lint --fix` to auto-fix many style issues
