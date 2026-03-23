FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY platform/pnpm-lock.yaml platform/pnpm-workspace.yaml platform/package.json ./
COPY platform/packages/shared/package.json ./packages/shared/
COPY platform/apps/storefront/package.json ./apps/storefront/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/storefront/node_modules ./apps/storefront/node_modules
COPY platform/pnpm-lock.yaml platform/pnpm-workspace.yaml platform/package.json ./
COPY platform/packages/shared ./packages/shared
COPY platform/apps/storefront ./apps/storefront
RUN pnpm --filter @mercashop/shared build
RUN pnpm --filter ./apps/storefront build

# Serve with nginx
FROM nginx:alpine AS production
COPY --from=build /app/apps/storefront/dist /usr/share/nginx/html
COPY platform/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
