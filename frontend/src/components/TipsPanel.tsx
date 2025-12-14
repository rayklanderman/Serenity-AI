import React, { useEffect, useState } from 'react';
import { useJac } from '../hooks/useJac';
import type { UserContext, Emotion } from '../types';

interface TipsPanelProps {
  userContext: UserContext;
  currentMood: Emotion | null;
}

interface ProductivityTip {
  type: string;
  icon: string;
  title: string;
  message: string;
}

const TipsPanel: React.FC<TipsPanelProps> = ({ userContext, currentMood }) => {
  const [mode, setMode] = useState<'mindfulness' | 'coach'>('mindfulness');
  const { spawn: spawnSuggestion, data: suggestionData, loading: suggestionLoading } = useJac('SuggestionGenerator');
  const { spawn: spawnCoach, data: coachData, loading: coachLoading } = useJac('MindCoach');

  // Get current hour for time-based tips
  const currentHour = new Date().getHours();
  const getTimeGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Auto-fetch when mood changes
  useEffect(() => {
    if (mode === 'mindfulness') {
      handleGetTip();
    } else {
      handleGetCoaching();
    }
  }, [currentMood?.name, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGetTip = () => {
    spawnSuggestion({ 
      user_id: userContext.userId,
      current_mood: currentMood?.name || "positive",
      stress_level: currentMood?.name === 'anxious' ? 7 : 
                   currentMood?.name === 'sad' ? 6 : 
                   currentMood?.name === 'angry' ? 8 : 4
    });
  };

  const handleGetCoaching = () => {
    spawnCoach({
      user_id: userContext.userId,
      current_mood: currentMood?.name || "neutral",
      current_hour: currentHour,
      last_break_minutes: 60, // Could track this in real app
      is_working: true
    });
  };

  const loading = mode === 'mindfulness' ? suggestionLoading : coachLoading;
  const data = mode === 'mindfulness' ? suggestionData : coachData;

  const getMoodEmoji = () => {
    if (!currentMood) return '✨';
    return currentMood.emoji;
  };

  return (
    <div className="card tips-panel">
      {/* Mode Toggle */}
      <div className="coach-toggle">
        <button 
          className={`coach-btn ${mode === 'mindfulness' ? 'active' : ''}`}
          onClick={() => setMode('mindfulness')}
        >
          🧘 Mindfulness
        </button>
        <button 
          className={`coach-btn ${mode === 'coach' ? 'active' : ''}`}
          onClick={() => setMode('coach')}
        >
          🎯 Mind Coach
        </button>
      </div>

      <h2>{getMoodEmoji()} {mode === 'mindfulness' ? 'Mindfulness Moment' : 'Productivity Coach'}</h2>
      
      {/* Time greeting for coach mode */}
      {mode === 'coach' && (
        <p className="time-greeting">{getTimeGreeting()}, <span>let's stay focused!</span></p>
      )}
      
      {currentMood ? (
        <p className="mood-context">
          {mode === 'mindfulness' ? 'Tips for when you\'re feeling' : 'Coaching while feeling'} <strong style={{ color: currentMood.color }}>{currentMood.name}</strong>
        </p>
      ) : (
        <p className="mood-context positive">
          {mode === 'mindfulness' ? '✨ Stay positive with these uplifting tips' : '✨ Ready to be productive!'}
        </p>
      )}
      
      <button 
        className="secondary-btn" 
        onClick={mode === 'mindfulness' ? handleGetTip : handleGetCoaching} 
        disabled={loading}
      >
        {loading ? '🔄 Loading...' : mode === 'mindfulness' ? '🔄 New Tip' : '🔄 New Coaching'}
      </button>
      
      {data ? (
        <div className="tip-content fade-in">
          {/* Mindfulness Mode Content */}
          {mode === 'mindfulness' && data.prompt && (
            <>
              <blockquote>{data.prompt}</blockquote>
              {data.exercise && (
                <div className="exercise-box">
                  <h4>🫁 {data.exercise.name || 'Breathing Exercise'}</h4>
                  <p className="duration">⏱️ {data.exercise.duration_seconds}s</p>
                  {data.exercise.steps && (
                    <ol className="exercise-steps">
                      {data.exercise.steps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {data.exercise.benefits && (
                    <p className="benefits">💚 {data.exercise.benefits}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Coach Mode Content */}
          {mode === 'coach' && data.productivity_tips && (
            <>
              {data.mental_check && (
                <p className="mood-context">{data.mental_check}</p>
              )}
              {data.productivity_tips.map((tip: ProductivityTip, i: number) => (
                <div key={i} className="productivity-tip">
                  <h4>
                    <span className="tip-icon">{tip.icon}</span>
                    {tip.title}
                  </h4>
                  <p>{tip.message}</p>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <p className="placeholder-text">
          {mode === 'mindfulness' 
            ? (currentMood ? `Getting personalized ${currentMood.name} tips...` : 'Select a mood or click for uplifting suggestions')
            : 'Click for productivity coaching based on your mental state'
          }
        </p>
      )}
    </div>
  );
};

export default TipsPanel;
