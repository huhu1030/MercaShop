FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY platform/pnpm-lock.yaml platform/pnpm-workspace.yaml platform/package.json ./
COPY platform/packages/shared/package.json ./packages/shared/
COPY platform/apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY platform/pnpm-lock.yaml platform/pnpm-workspace.yaml platform/package.json platform/tsconfig.base.json ./
COPY platform/packages/shared ./packages/shared
COPY platform/apps/api ./apps/api
RUN pnpm --filter @mercashop/shared build
RUN pnpm --filter @mercashop/api build

# Production — only node runtime, no pnpm/corepack
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY platform/packages/shared/package.json ./packages/shared/
COPY platform/apps/api/package.json ./apps/api/

USER appuser
EXPOSE 3030
CMD ["node", "apps/api/dist/index.js"]
