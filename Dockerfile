FROM node:20-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

ENV NODE_ENV=production
ENV PORT=3000
ENV AUTH_BASE_URL=http://127.0.0.1:3000
ENV BETTER_AUTH_URL=http://127.0.0.1:3000
ENV BETTER_AUTH_SECRET=build-time-secret-build-time-secret
ENV MONGODB_URI=mongodb://127.0.0.1:27017
ENV MONGODB_DB_NAME=auth-central
ENV TRUSTED_ORIGINS=
ENV ALLOWED_RETURN_TO_ORIGINS=
ENV BOOTSTRAP_ON_STARTUP=false
ENV BOOTSTRAP_ADMIN_EMAIL=admin@example.com
ENV BOOTSTRAP_ADMIN_NAME=Auth Central Admin
ENV BOOTSTRAP_ADMIN_PASSWORD=ChangeMe12345!
ENV BOOTSTRAP_INTRANIC_NAME=IntraNIC
ENV BOOTSTRAP_NFC_NAME=NFC

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
