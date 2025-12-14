// Types for SerenityAI Frontend

export interface UserContext {
  userId: string;
}

export interface Emotion {
  name: string;
  emoji: string;
  color: string;
}

export interface MoodAnalysis {
  emotion: string;
  intensity: number;
  triggers: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface MoodLoggerResponse {
  analysis: MoodAnalysis;
  response: string;
}

export interface TrendPatterns {
  recurring_emotions: string[];
  trigger_correlations: Record<string, string>;
  weekly_trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export interface TrendAnalyzerResponse {
  patterns: TrendPatterns;
}

export interface BreathingExercise {
  name: string;
  steps: string[];
  duration_seconds: number;
  benefits: string;
}

export interface SuggestionResponse {
  prompt: string;
  exercise: BreathingExercise | null;
  suggestion_id?: number;
}

export interface JournalResponse {
  entry_id: number;
  mood_change: number;
  response: string;
}
