-- Создание таблицы profiles (профили пользователей)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  quests_created INTEGER NOT NULL DEFAULT 0,
  quests_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Включение Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Политики доступа для profiles
CREATE POLICY "Профили доступны всем для чтения" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Пользователи могут редактировать только свой профиль" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Создание таблицы quests (квесты)
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  quest_type TEXT
);

-- Включение Row Level Security (RLS)
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- Политики доступа для quests
CREATE POLICY "Публичные квесты доступны всем для чтения" ON public.quests
  FOR SELECT USING (is_public = true);

CREATE POLICY "Пользователи могут видеть свои квесты" ON public.quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать квесты" ON public.quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут редактировать свои квесты" ON public.quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои квесты" ON public.quests
  FOR DELETE USING (auth.uid() = user_id);

-- Создание таблицы quest_completions (прогресс прохождения квестов)
CREATE TABLE IF NOT EXISTS public.quest_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  progress INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(quest_id, user_id)
);

-- Включение Row Level Security (RLS)
ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;

-- Политики доступа для quest_completions
CREATE POLICY "Пользователи могут видеть свой прогресс" ON public.quest_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать свой прогресс" ON public.quest_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свой прогресс" ON public.quest_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- Создание таблицы quest_tasks (задачи квестов)
CREATE TABLE IF NOT EXISTS public.quest_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  xp INTEGER NOT NULL DEFAULT 10,
  order_num INTEGER NOT NULL
);

-- Включение Row Level Security (RLS)
ALTER TABLE public.quest_tasks ENABLE ROW LEVEL SECURITY;

-- Политики доступа для quest_tasks
CREATE POLICY "Задачи публичных квестов доступны всем для чтения" ON public.quest_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quests q WHERE q.id = quest_id AND q.is_public = true
    )
  );

CREATE POLICY "Пользователи могут видеть задачи своих квестов" ON public.quest_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quests q WHERE q.id = quest_id AND q.user_id = auth.uid()
    )
  );

-- Создание таблицы user_task_progress (прогресс пользователя по задачам)
CREATE TABLE IF NOT EXISTS public.user_task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.quest_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  completed BOOLEAN NOT NULL DEFAULT false,
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(task_id, user_id)
);

-- Включение Row Level Security (RLS)
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;

-- Политики доступа для user_task_progress
CREATE POLICY "Пользователи могут видеть свой прогресс по задачам" ON public.user_task_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать свой прогресс по задачам" ON public.user_task_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свой прогресс по задачам" ON public.user_task_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Создание таблицы subscription_plans (планы подписки)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Создание таблицы subscriptions (подписки пользователей)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Включение Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Политики доступа для subscriptions
CREATE POLICY "Пользователи могут видеть свои подписки" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
BEFORE UPDATE ON public.quests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Вставка базовых планов подписки
INSERT INTO public.subscription_plans (name, description, price, features)
VALUES 
  ('Бесплатный', 'Базовый план с ограниченными возможностями', 0.00, '["Создание 3 квестов", "Базовая геймификация"]'::jsonb),
  ('Стандартный', 'Стандартный план для активных пользователей', 299.00, '["Неограниченное количество квестов", "Расширенная геймификация", "Приоритетная поддержка"]'::jsonb),
  ('Премиум', 'Полный доступ ко всем функциям', 599.00, '["Все функции Стандартного плана", "Эксклюзивные темы квестов", "Расширенная аналитика", "VIP поддержка"]'::jsonb);
