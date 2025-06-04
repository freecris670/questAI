#!/bin/bash

# Скрипт для деплоя монорепозитория на Railway

set -e

echo "🚂 Начинаем деплой на Railway..."

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI не установлен${NC}"
    echo "Установите его командой: npm install -g @railway/cli"
    exit 1
fi

# Функция для создания и деплоя сервиса
deploy_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo -e "\n${BLUE}📦 Деплой сервиса: $service_name${NC}"
    
    # Переходим в директорию сервиса
    cd "$service_path"
    
    # Инициализируем сервис если нужно
    if [ ! -f ".railway/config.json" ]; then
        echo "Инициализация нового сервиса..."
        railway init -n "$service_name"
    fi
    
    # Устанавливаем переменные окружения
    echo "Настройка переменных окружения..."
    
    if [ "$service_name" = "questai-api" ]; then
        # Переменные для API
        railway variables set PORT=$port
        railway variables set NODE_ENV=production
        railway variables set SUPABASE_URL="${SUPABASE_URL:-}"
        railway variables set SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}"
        railway variables set SUPABASE_JWT_SECRET="${SUPABASE_JWT_SECRET:-}"
        railway variables set OPENAI_API_KEY="${OPENAI_API_KEY:-}"
        railway variables set FRONTEND_URL="https://questai-web.up.railway.app"
        railway variables set RATE_LIMIT_GLOBAL=100
        railway variables set RATE_LIMIT_QUEST_MINUTE=3
        railway variables set RATE_LIMIT_QUEST_HOUR=20
    elif [ "$service_name" = "questai-web" ]; then
        # Переменные для Web
        railway variables set PORT=$port
        railway variables set NODE_ENV=production
        railway variables set NEXT_PUBLIC_API_URL="https://questai-api.up.railway.app"
        railway variables set NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}"
        railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
    fi
    
    # Деплоим сервис
    echo -e "${YELLOW}🚀 Запуск деплоя...${NC}"
    railway up --detach
    
    # Возвращаемся в корневую директорию
    cd ../..
    
    echo -e "${GREEN}✅ Сервис $service_name успешно задеплоен${NC}"
}

# Проверка переменных окружения
echo -e "${YELLOW}⚠️  Убедитесь, что следующие переменные окружения установлены:${NC}"
echo "Для API:"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_SERVICE_KEY"
echo "  - SUPABASE_JWT_SECRET"
echo "  - OPENAI_API_KEY"
echo ""
echo "Для Web:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""

read -p "Продолжить деплой? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Деплой API сервиса
deploy_service "questai-api" "apps/api" "3001"

# Деплой Web сервиса
deploy_service "questai-web" "apps/web" "3000"

echo -e "\n${GREEN}🎉 Деплой завершен!${NC}"
echo ""
echo "Проверьте статус сервисов:"
echo "  railway status"
echo ""
echo "Откройте сервисы:"
echo "  API: railway open -s questai-api"
echo "  Web: railway open -s questai-web"
