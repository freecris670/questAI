-- Создаем таблицу профилей пользователей
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Создаем RLS политики для профилей
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Профили доступны всем для чтения" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Пользователи могут обновлять только свои профили" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Создаем таблицу для квестов
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Создаем RLS политики для квестов
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Публичные квесты доступны всем для чтения" 
  ON public.quests 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Пользователи могут видеть свои квесты" 
  ON public.quests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать свои квесты" 
  ON public.quests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои квесты" 
  ON public.quests 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои квесты" 
  ON public.quests 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Создаем таблицу для прохождений квестов
CREATE TABLE IF NOT EXISTS public.quest_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  progress JSONB DEFAULT '{}'::JSONB,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(quest_id, user_id)
);

-- Создаем RLS политики для прохождений квестов
ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Пользователи могут видеть свои прохождения" 
  ON public.quest_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать свои прохождения" 
  ON public.quest_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои прохождения" 
  ON public.quest_completions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Создаем таблицу для планов подписки
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Создаем RLS политики для планов подписки
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Планы подписки доступны всем для чтения" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (true);

-- Создаем таблицу для подписок пользователей
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Создаем RLS политики для подписок
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Пользователи могут видеть свои подписки" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для обновления updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
BEFORE UPDATE ON public.quests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quest_completions_updated_at
BEFORE UPDATE ON public.quest_completions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставляем базовые планы подписки
INSERT INTO public.subscription_plans (id, name, description, price, features)
VALUES 
  ('free', 'Бесплатный', 'Базовый план с ограниченным функционалом', 0.00, '{"quests_per_month": 3, "ai_generations": 10}'),
  ('pro', 'Профессиональный', 'Расширенный план для активных пользователей', 499.00, '{"quests_per_month": 20, "ai_generations": 100, "priority_support": true}'),
  ('unlimited', 'Безлимитный', 'Полный доступ ко всем функциям без ограничений', 999.00, '{"quests_per_month": -1, "ai_generations": -1, "priority_support": true, "early_access": true}');

-- Создаем триггер для создания профиля при регистрации пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, NEW.email, '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
