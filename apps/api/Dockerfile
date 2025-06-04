# Dockerfile для API сервиса
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
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules

# Копируем исходный код
COPY . .

# Сборка UI пакета и API
RUN pnpm --filter @questai/ui build
RUN pnpm --filter @questai/api build

# Production образ
FROM node:20-alpine AS runner
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Копируем необходимые файлы
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Копируем node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist
COPY --from=builder /app/packages/ui/package.json ./packages/ui/

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3001

USER nestjs

EXPOSE 3001

# Запускаем приложение
CMD ["node", "apps/api/dist/main.js"]
