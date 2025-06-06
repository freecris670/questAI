#!/bin/bash

# Скрипт для запуска Next.js приложения в production режиме

# Проверяем наличие .next/standalone директории
if [ ! -d ".next/standalone" ]; then
    echo "❌ Standalone build не найден. Запустите 'npm run build' сначала."
    exit 1
fi

# Копируем статические файлы если они еще не скопированы
if [ ! -d ".next/standalone/.next/static" ]; then
    echo "📁 Копирование статических файлов..."
    cp -r .next/static .next/standalone/.next/
fi

# Копируем public директорию если она еще не скопирована
if [ ! -d ".next/standalone/public" ] && [ -d "public" ]; then
    echo "📁 Копирование public директории..."
    cp -r public .next/standalone/
fi

# Устанавливаем переменные окружения
export NODE_ENV=production
export PORT=${PORT:-3000}
export HOSTNAME=${HOSTNAME:-"0.0.0.0"}

echo "🚀 Запуск Next.js приложения в production режиме..."
echo "📍 URL: http://${HOSTNAME}:${PORT}"

# Запускаем сервер
cd .next/standalone
node server.js
