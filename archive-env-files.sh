#!/bin/bash

# Скрипт для архивации .env файлов перед деплоем на Railway
# Railway использует переменные окружения из своего интерфейса, а не из файлов

echo "Архивация .env файлов..."

# Создаем директорию для архивов если её нет
mkdir -p .env-archive

# Архивируем .env файлы
files=(
  ".env"
  "apps/api/.env"
  "apps/api/.env.production"
  "apps/api/.env.railway"
  "apps/web/.env"
  "apps/web/.env.production"
  "apps/web/.env.railway"
  "apps/web/.env.local"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Архивация: $file"
    mv "$file" ".env-archive/$(basename $file).$(date +%Y%m%d_%H%M%S)"
  fi
done

echo "Готово! Все .env файлы перемещены в .env-archive/"
echo "Не забудьте настроить переменные окружения в Railway!"
