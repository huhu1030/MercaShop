FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY platform/pnpm-lock.yaml platform/pnpm-workspace.yaml platform/package.json ./
COPY platform/packages/shared/package.json ./packages/shared/
COPY platform/apps/dashboard/package.json ./apps/dashboard/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY platform/pnpm-lock.yaml platform/pnpm-workspace.yaml platform/package.json platform/tsconfig.base.json ./
COPY platform/packages/shared ./packages/shared
COPY platform/apps/dashboard ./apps/dashboard
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_API_URL

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter @mercashop/shared build
RUN pnpm --filter @mercashop/dashboard build

# Serve with nginx
FROM nginx:alpine AS production
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
COPY platform/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
