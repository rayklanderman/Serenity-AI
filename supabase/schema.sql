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
