import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
// Get these from: https://supabase.com/dashboard/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbUser {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export interface DbMood {
  id: string;
  user_id: string;
  emotion: string;
  emoji: string;
  color: string;
  intensity: number;
  note: string;
  ai_response: string;
  triggers: string[];
  created_at: string;
}

export interface DbJournalEntry {
  id: string;
  user_id: string;
  content: string;
  ai_insight: string;
  mood_before: number;
  mood_after: number;
  created_at: string;
}

// Helper functions
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
};
