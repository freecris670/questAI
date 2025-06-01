#!/bin/bash

echo "🚀 Тестирование сборки проекта для Railway..."

# Проверяем наличие pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm не установлен. Устанавливаем..."
    npm install -g pnpm
fi

echo "📦 Установка зависимостей..."
pnpm install

echo "🔨 Сборка API..."
cd apps/api
pnpm run build
if [ $? -eq 0 ]; then
    echo "✅ API собран успешно"
else
    echo "❌ Ошибка сборки API"
    exit 1
fi

cd ../..

echo "🔨 Сборка Web..."
cd apps/web
pnpm run build
if [ $? -eq 0 ]; then
    echo "✅ Web собран успешно"
else
    echo "❌ Ошибка сборки Web"
    exit 1
fi

cd ../..

echo "🎉 Все компоненты собраны успешно!"
echo "📋 Проект готов к деплою на Railway"
