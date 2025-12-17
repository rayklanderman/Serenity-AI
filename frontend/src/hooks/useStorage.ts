import { useState, useCallback } from 'react';
import { supabase, DbMood, DbJournalEntry, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Hook for mood persistence
export const useMoodStorage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveMood = useCallback(async (mood: Omit<DbMood, 'id' | 'user_id' | 'created_at'>) => {
    if (!isSupabaseConfigured() || !user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('moods')
        .insert({
          user_id: user.id,
          ...mood
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving mood:', err);
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
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching moods:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getMoodsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isSupabaseConfigured() || !user) return [];
    
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching moods by date:', err);
      return [];
    }
  }, [user]);

  return { saveMood, getMoods, getMoodsByDateRange, loading };
};

// Hook for journal persistence
export const useJournalStorage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveEntry = useCallback(async (entry: Omit<DbJournalEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!isSupabaseConfigured() || !user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          ...entry
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving journal entry:', err);
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
      console.error('Error fetching journal entries:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { saveEntry, getEntries, loading };
};
