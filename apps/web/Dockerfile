# Dockerfile для Web сервиса
FROM node:20-alpine AS base

# Установка pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Установка зависимостей для сборки
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы конфигурации монорепозитория
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Копируем package.json файлы всех workspace пакетов
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Установка зависимостей
FROM base AS deps
RUN pnpm install --frozen-lockfile

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules

# Копируем исходный код
COPY . .

# Сборка UI пакета и Web приложения
RUN pnpm --filter @questai/ui build
RUN pnpm --filter @questai/web build

# Production образ
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы для Next.js standalone
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запускаем Next.js сервер
CMD ["node", "apps/web/server.js"]
