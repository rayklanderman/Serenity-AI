import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WellnessPlan {
  id?: string;
  week_start: string;
  schedule_data: {
    occupation: string;
    workDays: string[];
    workStartHour: number;
    workEndHour: number;
    stressByDay: Record<string, number>;
  };
  plan_data: Array<{
    day: string;
    activities: Array<{
      id: string;
      time: string;
      activity: string;
      icon: string;
      duration: string;
    }>;
    affirmation: string;
  }>;
}

interface GameScore {
  id?: string;
  game_type: string;
  score: number;
  total_questions: number;
  played_at?: string;
}

// Hook for wellness plan persistence
export const usePlannerStorage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const savePlan = useCallback(async (plan: WellnessPlan) => {
    if (!isSupabaseConfigured() || !user) {
      console.log('[PlannerStorage] Skipping save - not configured or no user');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wellness_plans')
        .upsert({
          user_id: user.id,
          week_start: plan.week_start,
          schedule_data: plan.schedule_data,
          plan_data: plan.plan_data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,week_start'
        })
        .select()
        .single();

      if (error) throw error;
      console.log('[PlannerStorage] Saved plan:', data);
      return data;
    } catch (err) {
      console.error('[PlannerStorage] Error saving plan:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getCurrentPlan = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      return null;
    }

    setLoading(true);
    try {
      // Get plan for current week
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const weekStart = monday.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('wellness_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as WellnessPlan | null;
    } catch (err) {
      console.error('[PlannerStorage] Error getting plan:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateActivity = useCallback(async (
    planId: string,
    dayIndex: number,
    activityIndex: number,
    updatedActivity: { time: string; activity: string; duration: string }
  ) => {
    if (!isSupabaseConfigured() || !user) return null;

    // This would need to fetch, update, and save the plan
    // For now, we'll handle this at component level
    console.log('[PlannerStorage] Update activity:', planId, dayIndex, activityIndex, updatedActivity);
    return null;
  }, [user]);

  return { savePlan, getCurrentPlan, updateActivity, loading };
};

// Hook for game score persistence
export const useGameStorage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveScore = useCallback(async (gameType: string, score: number, totalQuestions: number) => {
    if (!isSupabaseConfigured() || !user) {
      console.log('[GameStorage] Skipping save - not configured or no user');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .insert({
          user_id: user.id,
          game_type: gameType,
          score,
          total_questions: totalQuestions
        })
        .select()
        .single();

      if (error) throw error;
      console.log('[GameStorage] Saved score:', data);
      return data;
    } catch (err) {
      console.error('[GameStorage] Error saving score:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getHighScore = useCallback(async (gameType: string) => {
    if (!isSupabaseConfigured() || !user) return null;

    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('score, total_questions')
        .eq('user_id', user.id)
        .eq('game_type', gameType)
        .order('score', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      // Return first result or null if no scores yet
      return data && data.length > 0 ? data[0] as GameScore : null;
    } catch (err) {
      console.error('[GameStorage] Error getting high score:', err);
      return null;
    }
  }, [user]);

  const getRecentScores = useCallback(async (gameType: string, limit = 10) => {
    if (!isSupabaseConfigured() || !user) return [];

    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_type', gameType)
        .order('played_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as GameScore[];
    } catch (err) {
      console.error('[GameStorage] Error getting scores:', err);
      return [];
    }
  }, [user]);

  return { saveScore, getHighScore, getRecentScores, loading };
};
