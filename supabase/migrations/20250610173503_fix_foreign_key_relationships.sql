-- Удаляем старые данные из subscriptions если они есть, так как они могут ссылаться на несуществующие планы
DELETE FROM subscriptions;

-- Удаляем существующий foreign key constraint если он есть
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;

-- Добавляем правильный foreign key constraint
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;

-- Убеждаемся, что у нас есть индекс на plan_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
