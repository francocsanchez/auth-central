FROM node:20-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS prod-deps

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder

ENV NODE_ENV=production \
    PORT=3000 \
    AUTH_BASE_URL=http://127.0.0.1:3000 \
    BETTER_AUTH_URL=http://127.0.0.1:3000 \
    BETTER_AUTH_SECRET=build-time-secret-build-time-secret \
    MONGODB_URI=mongodb://127.0.0.1:27017 \
    MONGODB_DB_NAME=auth-central \
    TRUSTED_ORIGINS= \
    ALLOWED_RETURN_TO_ORIGINS= \
    AUTH_DEBUG=false \
    BOOTSTRAP_ON_STARTUP=false \
    BOOTSTRAP_ADMIN_EMAIL=admin@example.com \
    BOOTSTRAP_ADMIN_NAME="Auth Central Admin" \
    BOOTSTRAP_ADMIN_PASSWORD=ChangeMe12345! \
    BOOTSTRAP_INTRANIC_NAME=IntraNIC \
    BOOTSTRAP_NFC_NAME=NFC

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    AUTH_DEBUG=false

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=prod-deps /app/package.json ./package.json
COPY --from=prod-deps /app/package-lock.json ./package-lock.json
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts/bootstrap-admin.mjs ./scripts/bootstrap-admin.mjs

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
