import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Helper to get current day name
const getDayOfWeek = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

// Hook for mood persistence
export const useMoodStorage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveMood = useCallback(async (mood: {
    emotion: string;
    emoji: string;
    color?: string;
    intensity?: number;
    note?: string;
    ai_response?: string;
    triggers?: string[];
  }) => {
    if (!isSupabaseConfigured() || !user) {
      console.log('[MoodStorage] Skipping save - not configured or no user');
      return null;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .insert({
          user_id: user.id,
          mood_name: mood.emotion,
          emoji: mood.emoji,
          intensity: mood.intensity || 5,
          note: mood.note || '',
          ai_response: mood.ai_response || '',
          day_of_week: getDayOfWeek(),
          hour_of_day: new Date().getHours()
        })
        .select()
        .single();

      if (error) throw error;
      console.log('[MoodStorage] Saved mood:', data);
      return data;
    } catch (err) {
      console.error('[MoodStorage] Error saving mood:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getMoods = useCallback(async (limit = 20) => {
    if (!isSupabaseConfigured() || !user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[MoodStorage] Error fetching moods:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getMoodsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isSupabaseConfigured() || !user) return [];
    
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[MoodStorage] Error fetching moods by date:', err);
      return [];
    }
  }, [user]);

  return { saveMood, getMoods, getMoodsByDateRange, loading };
};

// Hook for journal persistence
export const useJournalStorage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveEntry = useCallback(async (entry: {
    content: string;
    mood_before?: string;
    mood_before_intensity?: number;
    ai_insight?: string;
    mood_change?: number;
  }) => {
    if (!isSupabaseConfigured() || !user) {
      console.log('[JournalStorage] Skipping save - not configured or no user');
      return null;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: entry.content,
          mood_before: entry.mood_before || 'neutral',
          mood_before_intensity: entry.mood_before_intensity || 5,
          ai_insight: entry.ai_insight || '',
          mood_change: entry.mood_change || 0,
          day_of_week: getDayOfWeek(),
          hour_of_day: new Date().getHours()
        })
        .select()
        .single();

      if (error) throw error;
      console.log('[JournalStorage] Saved entry:', data);
      return data;
    } catch (err) {
      console.error('[JournalStorage] Error saving journal entry:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getEntries = useCallback(async (limit = 50) => {
    if (!isSupabaseConfigured() || !user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[JournalStorage] Error fetching journal entries:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { saveEntry, getEntries, loading };
};

