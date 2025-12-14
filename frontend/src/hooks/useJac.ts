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
      
      // Return mock data as fallback for demo purposes
      const mockResponses: Record<WalkerName, unknown> = {
        'MoodLogger': {
          analysis: { emotion: "calm", intensity: 7, triggers: ["meditation"], sentiment: "positive" },
          response: "It's wonderful that you're taking time for yourself. Keeping this balance is key to your wellbeing.",
          emotion: { name: "calm", intensity: 7, color: "#98FB98" }
        },
        'TrendAnalyzer': {
          patterns: {
            recurring_emotions: ["anxious", "calm"],
            weekly_trend: "improving",
            recommendations: ["Morning breathing", "Evening walk", "Gratitude journal"]
          }
        },
        'SuggestionGenerator': {
          prompt: "What small moment today brought you peace?",
          exercise: null
        },
        'JournalSaver': {
          entry_id: String(Date.now()),
          mood_change: 0,
          response: "Thank you for sharing your thoughts."
        },
        'MindCoach': {
          productivity_tips: [
            { type: "general", icon: "✨", title: "Stay Focused", message: "You're doing great! Keep up the good work." }
          ],
          mental_check: "I see you're checking in. That's a great habit!",
          time_greeting: "Good day!"
        }
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
