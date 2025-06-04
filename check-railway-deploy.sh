#!/bin/bash
# check-railway-deploy.sh - Скрипт для проверки корректности конфигурации перед деплоем на Railway

echo "🔍 Проверка конфигурации для деплоя на Railway..."

# Проверка необходимых файлов
echo "📁 Проверка конфигурационных файлов..."
files_to_check=("railway.json" "railway.toml" "nixpacks.toml" "apps/api/railway.json" "apps/web/railway.json")
for file in "${files_to_check[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file найден"
  else
    echo "❌ $file отсутствует"
  fi
done

# Проверка переменных окружения
echo -e "\n🔐 Проверка переменных окружения..."

if [ -f "apps/api/.env.railway" ]; then
  echo "✅ Файл .env.railway для API найден"
  if grep -q "SUPABASE_SERVICE_KEY=" "apps/api/.env.railway"; then
    echo "✅ SUPABASE_SERVICE_KEY найден в API environments"
  else
    echo "❌ SUPABASE_SERVICE_KEY отсутствует в API environments (не SUPABASE_SERVICE_ROLE_KEY!)"
  fi
else
  echo "❌ Файл apps/api/.env.railway отсутствует"
fi

if [ -f "apps/web/.env.railway" ]; then
  echo "✅ Файл .env.railway для веб-приложения найден"
  if grep -q "NEXT_PUBLIC_API_URL=" "apps/web/.env.railway"; then
    echo "✅ NEXT_PUBLIC_API_URL найден в Web environments"
    api_url=$(grep "NEXT_PUBLIC_API_URL=" "apps/web/.env.railway" | cut -d '=' -f2)
    if [[ $api_url == *"railway.app"* ]]; then
      echo "✅ NEXT_PUBLIC_API_URL указывает на Railway домен"
    else
      echo "⚠️ NEXT_PUBLIC_API_URL может не указывать на деплой в Railway"
    fi
  else
    echo "❌ NEXT_PUBLIC_API_URL отсутствует в Web environments"
  fi
else
  echo "❌ Файл apps/web/.env.railway отсутствует"
fi

# Проверка CORS настроек
echo -e "\n🌐 Проверка CORS настроек..."
cors_files=$(grep -r "enableCors" --include="*.ts" apps/api/)
if [ -n "$cors_files" ]; then
  echo "✅ CORS настройки найдены"
  if grep -r "railway\.app" --include="*.ts" apps/api/ >/dev/null; then
    echo "✅ CORS настроен для Railway домена"
  else
    echo "⚠️ CORS может быть не настроен для Railway доменов (регулярное выражение /^https:\/\/.*\.railway\.app$/)"
  fi
else
  echo "❓ CORS настройки не обнаружены, проверьте вручную"
fi

# Проверка Nixpacks конфигураций
echo -e "\n⚙️ Проверка Nixpacks конфигураций..."
if grep -q 'nixPkgs = \["nodejs_20", "pnpm"\]' "nixpacks.toml"; then
  echo "✅ Корректная конфигурация nixPkgs"
else
  echo "❌ Проблема в nixpacks.toml: nixPkgs должен быть [\"nodejs_20\", \"pnpm\"] без версии pnpm"
fi

# Проверка Docker конфигурации
echo -e "\n🐳 Проверка Docker конфигурации..."
if [ -f "Dockerfile" ]; then
  echo "✅ Dockerfile найден"
  
  # Проверка на многоэтапную сборку
  stages=$(grep -c "FROM " "Dockerfile")
  if [ "$stages" -gt 1 ]; then
    echo "✅ Dockerfile использует многоэтапную сборку ($stages этапов)"
  else
    echo "⚠️ Dockerfile не использует многоэтапную сборку"
  fi
  
  # Проверка на оптимизацию кэширования
  if grep -q "mount=type=cache" "Dockerfile"; then
    echo "✅ Dockerfile использует оптимизацию кэширования"
  else
    echo "⚠️ Dockerfile не использует оптимизацию кэширования (...mount=type=cache)"
  fi
else
  echo "❌ Dockerfile не найден"
fi

echo -e "\n✨ Проверка завершена"
echo "📝 Для получения дополнительной информации о деплое монорепозитория на Railway смотрите документацию:"
echo "    - https://docs.railway.app/guides/monorepo"
echo "    - https://pnpm.io/docker"
echo ""
