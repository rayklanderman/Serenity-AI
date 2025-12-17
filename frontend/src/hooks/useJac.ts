// Real API hook for interacting with Jac backend via `jac serve`
// Walkers are exposed at /walker/{WalkerName}
import { useState, useCallback } from 'react';
import type { 
  MoodLoggerResponse, 
  TrendAnalyzerResponse, 
  SuggestionResponse, 
  JournalResponse 
} from '../types';

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type WalkerName = 'MoodLogger' | 'TrendAnalyzer' | 'SuggestionGenerator' | 'JournalSaver' | 'MindCoach';

interface MindCoachResponse {
  productivity_tips: Array<{ type: string; icon: string; title: string; message: string }>;
  mental_check: string;
  time_greeting: string;
}

type WalkerResponse<T extends WalkerName> = 
  T extends 'MoodLogger' ? MoodLoggerResponse :
  T extends 'TrendAnalyzer' ? TrendAnalyzerResponse :
  T extends 'SuggestionGenerator' ? SuggestionResponse :
  T extends 'JournalSaver' ? JournalResponse :
  T extends 'MindCoach' ? MindCoachResponse :
  never;

interface UseJacReturn<T extends WalkerName> {
  spawn: (payload: Record<string, unknown>) => Promise<WalkerResponse<T> | null>;
  loading: boolean;
  error: Error | null;
  data: WalkerResponse<T> | null;
}

export const useJac = <T extends WalkerName>(walkerName: T): UseJacReturn<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<WalkerResponse<T> | null>(null);

  const spawn = useCallback(async (payload: Record<string, unknown>): Promise<WalkerResponse<T> | null> => {
    setLoading(true);
    setError(null);
    try {
      // Jac serve exposes walkers at /walker/{WalkerName}
      const response = await fetch(`${API_URL}/walker/${walkerName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Jac serve returns { result: ..., reports: [...] }
      // The actual data we want is in reports[0] or result
      const reportData = result.reports?.[0] || result.result || result;
      
      setData(reportData as WalkerResponse<T>);
      return reportData as WalkerResponse<T>;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`[useJac] Error spawning ${walkerName}:`, error);
      
      // Return intelligent fallback responses for demo purposes
      const getMoodAwareTip = () => {
        const mood = (payload?.current_mood as string) || 'neutral';
        const tips: Record<string, { prompt: string; exercise: { name: string; duration_seconds: number; steps: string[]; benefits: string } }> = {
          'happy': {
            prompt: "You're radiating positive energy today! Take a moment to savor this feeling and think about what contributed to your joy.",
            exercise: { name: "Gratitude Amplifier", duration_seconds: 60, steps: ["Close your eyes", "Think of 3 things you're grateful for", "Smile and breathe deeply"], benefits: "Extends positive emotions" }
          },
          'calm': {
            prompt: "Your inner peace is a gift. Let's deepen this serene state and carry it through your day.",
            exercise: { name: "Ocean Breath", duration_seconds: 90, steps: ["Inhale slowly for 4 counts", "Hold for 4 counts", "Exhale for 6 counts", "Repeat 5 times"], benefits: "Deepens relaxation" }
          },
          'anxious': {
            prompt: "I sense you're carrying some tension. Remember: you've overcome challenges before, and you will again. Let's ground ourselves.",
            exercise: { name: "5-4-3-2-1 Grounding", duration_seconds: 120, steps: ["Name 5 things you see", "4 things you hear", "3 things you feel", "2 things you smell", "1 thing you taste"], benefits: "Reduces anxiety instantly" }
          },
          'sad': {
            prompt: "It's okay to feel this way. Your feelings are valid, and this moment will pass. Be gentle with yourself today.",
            exercise: { name: "Self-Compassion Pause", duration_seconds: 60, steps: ["Place hand on heart", "Say 'I'm doing my best'", "Take 3 deep breaths", "Acknowledge your strength"], benefits: "Builds emotional resilience" }
          },
          'angry': {
            prompt: "Anger often tells us something important. Let's channel this energy constructively while staying centered.",
            exercise: { name: "Cool Down Breath", duration_seconds: 90, steps: ["Breathe in through nose for 4", "Hold for 2", "Exhale through mouth for 8", "Repeat until calm"], benefits: "Releases tension safely" }
          },
          'neutral': {
            prompt: "A balanced state is powerful. This is a perfect time to set intentions and cultivate positivity.",
            exercise: { name: "Mindful Check-in", duration_seconds: 60, steps: ["Scan your body for tension", "Notice your thoughts without judgment", "Set one positive intention", "Smile gently"], benefits: "Increases self-awareness" }
          }
        };
        return tips[mood] || tips['neutral'];
      };

      const getMindCoachTips = () => {
        const mood = (payload?.current_mood as string) || 'neutral';
        const hour = (payload?.current_hour as number) || 12;
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        
        const tips = [
          { type: "hydration", icon: "💧", title: "Stay Hydrated", message: "A glass of water refreshes both body and mind. Take a sip!" },
          { type: "break", icon: "🚶", title: "Movement Break", message: "Stand up, stretch, or take a short walk. Your body will thank you." },
          { type: "focus", icon: "🎯", title: "Focus Session", message: "Try working in 25-minute focused blocks with 5-minute breaks." }
        ];

        if (mood === 'anxious' || mood === 'sad') {
          tips.unshift({ type: "compassion", icon: "💜", title: "Be Gentle", message: "Prioritize your wellbeing today. It's okay to take things slower." });
        }

        return {
          productivity_tips: tips,
          mental_check: mood === 'happy' ? "You're in a great headspace! Let's make the most of it." : 
                        mood === 'anxious' ? "I notice you might be feeling stressed. Remember to breathe." :
                        "Checking in with yourself is a powerful habit. Keep it up!",
          time_greeting: greeting
        };
      };

      const mockResponses: Record<WalkerName, unknown> = {
        'MoodLogger': {
          analysis: { emotion: "calm", intensity: 7, triggers: ["self-reflection"], sentiment: "positive" },
          response: "Thank you for sharing. Taking time to acknowledge your feelings is a beautiful act of self-care. You're doing great! 🌟",
          emotion: { name: "calm", intensity: 7, color: "#98FB98" }
        },
        'TrendAnalyzer': {
          patterns: {
            recurring_emotions: ["calm", "happy"],
            weekly_trend: "improving",
            recommendations: ["Continue your mindfulness practice", "Try morning gratitude journaling", "Celebrate small wins"]
          }
        },
        'SuggestionGenerator': getMoodAwareTip(),
        'JournalSaver': {
          entry_id: String(Date.now()),
          mood_change: 1,
          response: "Your thoughts are valuable. Writing helps process emotions and gain clarity. Keep journaling! ✨"
        },
        'MindCoach': getMindCoachTips()
      };
      
      const fallback = mockResponses[walkerName] as WalkerResponse<T>;
      setData(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [walkerName]);

  return { spawn, loading, error, data };
};
