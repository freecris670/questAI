-- Создание основных таблиц для приложения QuestAI

-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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

-- Создание таблицы квестов
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

-- Создание таблицы задач квестов
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

-- Создание таблицы прогресса прохождения квестов
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

-- Создание таблицы прогресса по задачам
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

-- Создание таблицы планов подписки
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Включение Row Level Security для планов подписки
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Политики доступа для subscription_plans
CREATE POLICY "Планы подписки доступны всем для чтения" ON public.subscription_plans
  FOR SELECT USING (true);

-- Создание таблицы подписок пользователей
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

-- Создание триггеров для обновления времени
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
BEFORE UPDATE ON public.quests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.email, 'New User'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Безопасное создание триггера с проверкой на существование
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    EXECUTE 'CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';
  END IF;
END;
$$;

-- Вставка базовых планов подписки
INSERT INTO public.subscription_plans (name, description, price, features)
VALUES 
  ('Бесплатный', 'Базовый план с ограниченными возможностями', 0.00, '{"quests_per_month": 5, "ai_generations": 10}'::jsonb),
  ('Стандартный', 'Стандартный план для активных пользователей', 299.00, '{"quests_per_month": -1, "ai_generations": 50, "priority_support": true}'::jsonb),
  ('Премиум', 'Полный доступ ко всем функциям', 599.00, '{"quests_per_month": -1, "ai_generations": -1, "priority_support": true, "early_access": true}'::jsonb)
ON CONFLICT DO NOTHING;
