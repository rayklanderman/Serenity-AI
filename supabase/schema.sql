-- SerenityAI Supabase Schema
-- Run this in your Supabase SQL Editor

-- =====================================================
-- MOOD LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_name TEXT NOT NULL,
  emoji TEXT,
  intensity INTEGER DEFAULT 5,
  note TEXT,
  ai_response TEXT,
  day_of_week TEXT,
  hour_of_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user's mood history
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_created 
ON mood_logs(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own moods" ON mood_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods" ON mood_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moods" ON mood_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moods" ON mood_logs
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- JOURNAL ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood_before TEXT,
  mood_before_intensity INTEGER,
  ai_insight TEXT,
  mood_change INTEGER DEFAULT 0,
  day_of_week TEXT,
  hour_of_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user's journal history
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created 
ON journal_entries(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'achievement', 'tip', 'insight')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user's unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, read, created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATION SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  reminders_enabled BOOLEAN DEFAULT TRUE,
  achievements_enabled BOOLEAN DEFAULT TRUE,
  tips_enabled BOOLEAN DEFAULT TRUE,
  reminder_minutes INTEGER DEFAULT 5,
  quiet_start TIME DEFAULT '22:00',
  quiet_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- WELLNESS PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wellness_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  schedule_data JSONB NOT NULL DEFAULT '{}',
  plan_data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Index for querying user's current plan
CREATE INDEX IF NOT EXISTS idx_wellness_plans_user_week 
ON wellness_plans(user_id, week_start DESC);

-- RLS Policies
ALTER TABLE wellness_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans" ON wellness_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON wellness_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON wellness_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON wellness_plans
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- GAME SCORES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_type)
);

-- Index for high scores
CREATE INDEX IF NOT EXISTS idx_game_scores_user_game 
ON game_scores(user_id, game_type);

-- RLS Policies
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON game_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON game_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON game_scores
  FOR UPDATE USING (auth.uid() = user_id);
