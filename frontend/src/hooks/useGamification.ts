import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Point values for different actions
export const POINTS = {
  MOOD_CHECKIN: 10,
  JOURNAL_ENTRY: 25,
  BREATHING_EXERCISE: 15,
  ACTIVITY_COMPLETE: 20,
  TRIVIA_CORRECT: 5,
  DAILY_STREAK: 50,
  WEEKLY_STREAK: 100,
} as const;

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'checkins' | 'journal' | 'streak' | 'points';
  unlockedAt?: string;
}

export const BADGES: Badge[] = [
  { id: 'first_checkin', name: 'First Step', description: 'Complete your first mood check-in', icon: '🌱', requirement: 1, type: 'checkins' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day check-in streak', icon: '🔥', requirement: 7, type: 'streak' },
  { id: 'journal_starter', name: 'Journal Starter', description: 'Write your first journal entry', icon: '📝', requirement: 1, type: 'journal' },
  { id: 'century', name: 'Century Club', description: 'Earn 100 points', icon: '💯', requirement: 100, type: 'points' },
  { id: 'mindful_master', name: 'Mindful Master', description: '30-day check-in streak', icon: '🧘', requirement: 30, type: 'streak' },
  { id: 'dedicated', name: 'Dedicated', description: 'Complete 50 mood check-ins', icon: '⭐', requirement: 50, type: 'checkins' },
  { id: 'journal_pro', name: 'Journal Pro', description: 'Write 10 journal entries', icon: '✨', requirement: 10, type: 'journal' },
  { id: 'superstar', name: 'Superstar', description: 'Earn 500 points', icon: '🌟', requirement: 500, type: 'points' },
];

interface GamificationState {
  points: number;
  totalCheckins: number;
  totalJournals: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string | null;
  unlockedBadges: string[];
}

const DEFAULT_STATE: GamificationState = {
  points: 0,
  totalCheckins: 0,
  totalJournals: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCheckinDate: null,
  unlockedBadges: [],
};

const LOCAL_STORAGE_KEY = 'serenity_gamification';

export const useGamification = () => {
  const { user } = useAuth();
  const [state, setState] = useState<GamificationState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  // Calculate level from points (every 100 points = 1 level)
  const level = Math.floor(state.points / 100) + 1;
  const pointsToNextLevel = 100 - (state.points % 100);
  const levelProgress = (state.points % 100) / 100;

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      setLoading(true);
      
      if (user && isSupabaseConfigured()) {
        // Try to load from Supabase
        try {
          const { data, error } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (data && !error) {
            setState(data.state_data as GamificationState);
          }
        } catch (err) {
          console.log('[Gamification] No existing data, using defaults');
        }
      } else {
        // Load from localStorage for guest users
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setState(JSON.parse(stored));
        }
      }
      
      setLoading(false);
    };
    
    loadState();
  }, [user]);

  // Listen for gamification updates from other components
  useEffect(() => {
    const handleGamificationUpdate = (event: CustomEvent<GamificationState>) => {
      setState(event.detail);
    };

    window.addEventListener('gamification-update', handleGamificationUpdate as EventListener);
    return () => {
      window.removeEventListener('gamification-update', handleGamificationUpdate as EventListener);
    };
  }, []);

  // Save state helper - also dispatches event for cross-component sync
  const saveState = useCallback(async (newState: GamificationState) => {
    setState(newState);
    
    // Dispatch custom event so other components using this hook get updated
    window.dispatchEvent(new CustomEvent('gamification-update', { detail: newState }));
    
    if (user && isSupabaseConfigured()) {
      // Save to Supabase
      await supabase
        .from('user_gamification')
        .upsert({
          user_id: user.id,
          state_data: newState,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } else {
      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    }
  }, [user]);

  // Check and unlock badges
  const checkBadges = useCallback((newState: GamificationState): string[] => {
    const newlyUnlocked: string[] = [];
    
    for (const badge of BADGES) {
      if (newState.unlockedBadges.includes(badge.id)) continue;
      
      let unlocked = false;
      switch (badge.type) {
        case 'checkins':
          unlocked = newState.totalCheckins >= badge.requirement;
          break;
        case 'journal':
          unlocked = newState.totalJournals >= badge.requirement;
          break;
        case 'streak':
          unlocked = newState.currentStreak >= badge.requirement;
          break;
        case 'points':
          unlocked = newState.points >= badge.requirement;
          break;
      }
      
      if (unlocked) {
        newlyUnlocked.push(badge.id);
      }
    }
    
    return newlyUnlocked;
  }, []);

  // Calculate streak
  const calculateStreak = useCallback((lastDate: string | null): { newStreak: number; isNewDay: boolean } => {
    const today = new Date().toISOString().split('T')[0];
    
    if (!lastDate) {
      return { newStreak: 1, isNewDay: true };
    }
    
    const last = new Date(lastDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, no streak change
      return { newStreak: state.currentStreak, isNewDay: false };
    } else if (diffDays === 1) {
      // Consecutive day, increase streak
      return { newStreak: state.currentStreak + 1, isNewDay: true };
    } else {
      // Streak broken, start fresh
      return { newStreak: 1, isNewDay: true };
    }
  }, [state.currentStreak]);

  // Award points for an action
  const awardPoints = useCallback(async (action: keyof typeof POINTS, multiplier = 1) => {
    const pointsEarned = POINTS[action] * multiplier;
    const today = new Date().toISOString().split('T')[0];
    
    let newState = { ...state };
    newState.points += pointsEarned;
    
    // Update counters based on action
    if (action === 'MOOD_CHECKIN') {
      newState.totalCheckins += 1;
      
      // Calculate streak
      const { newStreak, isNewDay } = calculateStreak(state.lastCheckinDate);
      newState.currentStreak = newStreak;
      newState.longestStreak = Math.max(newStreak, state.longestStreak);
      
      // Award streak bonus for new day
      if (isNewDay && newStreak > 1 && newStreak % 7 === 0) {
        newState.points += POINTS.WEEKLY_STREAK;
      } else if (isNewDay && newStreak > 1) {
        newState.points += Math.floor(POINTS.DAILY_STREAK * (newStreak / 7));
      }
      
      newState.lastCheckinDate = today;
    }
    
    if (action === 'JOURNAL_ENTRY') {
      newState.totalJournals += 1;
    }
    
    // Check for new badges
    const newBadges = checkBadges(newState);
    if (newBadges.length > 0) {
      newState.unlockedBadges = [...newState.unlockedBadges, ...newBadges];
      // Show the first new badge
      const badge = BADGES.find(b => b.id === newBadges[0]);
      if (badge) {
        setNewBadge(badge);
        // Auto-hide after 3 seconds
        setTimeout(() => setNewBadge(null), 3000);
      }
    }
    
    await saveState(newState);
    
    return {
      pointsEarned,
      newBadges,
      currentStreak: newState.currentStreak
    };
  }, [state, calculateStreak, checkBadges, saveState]);

  // Get unlocked badges with full info
  const getUnlockedBadges = useCallback((): Badge[] => {
    return BADGES.filter(b => state.unlockedBadges.includes(b.id));
  }, [state.unlockedBadges]);

  // Get locked badges with progress
  const getLockedBadges = useCallback((): (Badge & { progress: number })[] => {
    return BADGES
      .filter(b => !state.unlockedBadges.includes(b.id))
      .map(badge => {
        let progress = 0;
        switch (badge.type) {
          case 'checkins':
            progress = (state.totalCheckins / badge.requirement) * 100;
            break;
          case 'journal':
            progress = (state.totalJournals / badge.requirement) * 100;
            break;
          case 'streak':
            progress = (state.currentStreak / badge.requirement) * 100;
            break;
          case 'points':
            progress = (state.points / badge.requirement) * 100;
            break;
        }
        return { ...badge, progress: Math.min(progress, 100) };
      });
  }, [state]);

  // Dismiss new badge notification
  const dismissBadge = useCallback(() => {
    setNewBadge(null);
  }, []);

  return {
    // State
    points: state.points,
    level,
    pointsToNextLevel,
    levelProgress,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    totalCheckins: state.totalCheckins,
    totalJournals: state.totalJournals,
    loading,
    
    // Badges
    newBadge,
    dismissBadge,
    getUnlockedBadges,
    getLockedBadges,
    
    // Actions
    awardPoints,
    
    // Constants
    POINTS,
  };
};

export default useGamification;
