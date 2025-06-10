-- Проверяем и добавляем недостающие колонки в таблицу subscriptions
DO $$
BEGIN
    -- Добавляем колонку status если она не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscriptions' AND column_name='status') THEN
        ALTER TABLE subscriptions ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));
    END IF;
    
    -- Добавляем колонку auto_renew если она не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscriptions' AND column_name='auto_renew') THEN
        ALTER TABLE subscriptions ADD COLUMN auto_renew BOOLEAN DEFAULT true;
    END IF;
    
    -- Добавляем колонку cloudpayments_subscription_id если она не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscriptions' AND column_name='cloudpayments_subscription_id') THEN
        ALTER TABLE subscriptions ADD COLUMN cloudpayments_subscription_id TEXT;
    END IF;
    
    -- Добавляем колонку next_billing_date если она не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscriptions' AND column_name='next_billing_date') THEN
        ALTER TABLE subscriptions ADD COLUMN next_billing_date TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

-- Создание недостающих индексов
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Создание таблицы планов если её нет
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы платежей если её нет
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  payment_method TEXT NOT NULL,
  cloudpayments_transaction_id TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для payments
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS политики для plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- RLS политики для subscriptions  
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS политики для payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = payments.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

-- Вставка базовых тарифных планов если они не существуют
INSERT INTO plans (name, description, price, currency, billing_period, features, is_active)
SELECT * FROM (VALUES
  (
    'Базовый',
    'Базовый тариф для начинающих',
    0,
    'RUB',
    'monthly',
    '{
      "quests_per_day": 3,
      "has_calendar_integration": false,
      "has_email_notifications": false,
      "has_priority_generation": false,
      "has_api_access": false,
      "has_custom_themes": false,
      "has_team_features": false
    }'::jsonb,
    true
  ),
  (
    'Стандарт',
    'Стандартный тариф для активных пользователей',
    299,
    'RUB',
    'monthly',
    '{
      "quests_per_day": 10,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_priority_generation": false,
      "has_api_access": false,
      "has_custom_themes": false,
      "has_team_features": false
    }'::jsonb,
    true
  ),
  (
    'Премиум',
    'Премиум тариф для профессионалов',
    599,
    'RUB',
    'monthly',
    '{
      "quests_per_day": null,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_priority_generation": true,
      "has_api_access": true,
      "has_custom_themes": true,
      "has_team_features": false
    }'::jsonb,
    true
  ),
  (
    'Команда',
    'Тариф для команд и организаций',
    1499,
    'RUB',
    'monthly',
    '{
      "quests_per_day": null,
      "has_calendar_integration": true,
      "has_email_notifications": true,
      "has_priority_generation": true,
      "has_api_access": true,
      "has_custom_themes": true,
      "has_team_features": true
    }'::jsonb,
    true
  )
) AS v(name, description, price, currency, billing_period, features, is_active)
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plans.name = v.name);
