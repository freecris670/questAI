-- Очищаем старые планы
DELETE FROM plans;

-- Вставляем обновленные планы согласно спецификации
INSERT INTO plans (name, description, price, currency, billing_period, features, is_active)
VALUES
  (
    'Бесплатный',
    'Базовый бесплатный режим',
    0,
    'RUB',
    'monthly',
    '{
      "quests_per_month": 5,
      "has_calendar_integration": false,
      "has_email_notifications": false,
      "has_telegram_notifications": false,
      "has_priority_generation": false,
      "has_api_access": false,
      "has_custom_themes": false,
      "has_team_features": false,
      "descriptions": ["5 бесплатных квестов в месяц", "Базовая поддержка", "Ограниченные функции"]
    }'::jsonb,
    false
  ),
  (
    'Стандарт',
    'Для активных пользователей',
    299,
    'RUB',
    'monthly',
    '{
      "quests_per_day": 5,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_telegram_notifications": true,
      "has_whatsapp_notifications": true,
      "has_discord_notifications": true,
      "has_priority_generation": false,
      "has_api_access": false,
      "has_custom_themes": false,
      "has_team_features": false,
      "descriptions": ["Базовые квесты", "Уведомления в Telegram, WhatsApp, Discord", "Интеграция с календарем", "Email уведомления", "5 квестов в день"]
    }'::jsonb,
    true
  ),
  (
    'Премиум',
    'Для профессионалов',
    599,
    'RUB',
    'monthly',
    '{
      "quests_per_day": 10,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_telegram_notifications": true,
      "has_whatsapp_notifications": true,
      "has_discord_notifications": true,
      "has_task_manager_integration": true,
      "has_custom_themes": true,
      "has_mobile_notifications": true,
      "has_priority_generation": true,
      "has_api_access": false,
      "has_team_features": false,
      "descriptions": ["Все функции Стандарт", "Расширенные квесты с тонкой настройкой", "10 квестов в день", "Интеграция с таск менеджерами (Notion, Todoist, Trello)", "Кастомные темы", "Уведомления на Android и iOS"]
    }'::jsonb,
    true
  ),
  (
    'Корпоративный',
    'Для компаний и организаций',
    1999,
    'RUB',
    'monthly',
    '{
      "quests_per_day": null,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_telegram_notifications": true,
      "has_whatsapp_notifications": true,
      "has_discord_notifications": true,
      "has_task_manager_integration": true,
      "has_custom_themes": true,
      "has_mobile_notifications": true,
      "has_priority_generation": true,
      "has_api_access": true,
      "has_team_features": true,
      "has_group_quests": true,
      "has_dedicated_support": true,
      "unlimited_users": true,
      "descriptions": ["Все функции Премиум", "Неограниченное количество пользователей", "Групповые квесты", "Выделенная поддержка", "API доступ", "Кастомные интеграции"]
    }'::jsonb,
    true
  );
