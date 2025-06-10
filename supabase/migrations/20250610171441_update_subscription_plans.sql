-- Очищаем старые планы
DELETE FROM plans;

-- Вставляем обновленные планы
INSERT INTO plans (name, description, price, currency, billing_period, features, is_active)
VALUES
  (
    'Базовый',
    'Бесплатный режим с ограничениями',
    0,
    'RUB',
    'monthly',
    '{
      "quests_per_month": 5,
      "has_calendar_integration": false,
      "has_email_notifications": false,
      "has_priority_generation": false,
      "has_api_access": false,
      "has_custom_themes": false,
      "has_team_features": false,
      "descriptions": ["5 бесплатных квестов в месяц", "Базовая поддержка", "Ограниченные функции"]
    }'::jsonb,
    false
  ),
  (
    'Профессиональный',
    'Для активных пользователей',
    599,
    'RUB',
    'monthly',
    '{
      "quests_per_month": null,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_priority_generation": false,
      "has_api_access": false,
      "has_custom_themes": false,
      "has_team_features": false,
      "descriptions": ["Доступ ко всем квестам", "Расширенные подсказки", "Приоритетная поддержка", "Создание собственных квестов"]
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
      "quests_per_month": null,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_priority_generation": true,
      "has_api_access": true,
      "has_custom_themes": true,
      "has_team_features": true,
      "descriptions": ["Все функции Про версии", "Неограниченное количество пользователей", "Выделенная поддержка 24/7", "API доступ", "Кастомные интеграции"]
    }'::jsonb,
    true
  );
