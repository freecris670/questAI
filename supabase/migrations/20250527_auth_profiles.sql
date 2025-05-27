-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  avatar_url TEXT,
  character_name TEXT,
  preferences JSONB,
  completed_onboarding BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы статистики пользователей
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  quests_completed INTEGER DEFAULT 0,
  quests_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы квестов
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL,
  type TEXT DEFAULT 'custom',
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание таблицы достижений квестов
CREATE TABLE IF NOT EXISTS public.quest_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создание триггеров для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modified
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_stats_modified
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_quests_modified
BEFORE UPDATE ON public.quests
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Настройка политик безопасности (RLS) для таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_achievements ENABLE ROW LEVEL SECURITY;

-- Политики для профилей: пользователи могут видеть все профили, но редактировать только свои
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политики для статистики: пользователи могут видеть всю статистику, но редактировать только свою
CREATE POLICY "User stats are viewable by everyone" ON public.user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Политики для квестов: опубликованные квесты видны всем, неопубликованные - только их авторам
CREATE POLICY "Quests are viewable by everyone if published" ON public.quests
  FOR SELECT USING (published = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own quests" ON public.quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests" ON public.quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quests" ON public.quests
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для достижений: достижения видны всем, но редактировать могут только авторы квестов
CREATE POLICY "Achievements are viewable by everyone" ON public.quest_achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can insert achievements for their own quests" ON public.quest_achievements
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.quests WHERE id = quest_id
    )
  );

CREATE POLICY "Users can update achievements for their own quests" ON public.quest_achievements
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.quests WHERE id = quest_id
    )
  );

CREATE POLICY "Users can delete achievements for their own quests" ON public.quest_achievements
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.quests WHERE id = quest_id
    )
  );

-- Функции для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля при регистрации
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
