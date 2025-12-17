import React, { useEffect, useState } from 'react';
import { useJac } from '../hooks/useJac';
import { motion, AnimatePresence } from 'framer-motion';
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

  const currentHour = new Date().getHours();
  const getTimeGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
      last_break_minutes: 60,
      is_working: true
    });
  };

  const loading = mode === 'mindfulness' ? suggestionLoading : coachLoading;

  const getMoodEmoji = () => {
    if (!currentMood) return '✨';
    return currentMood.emoji;
  };

  return (
    <motion.div 
      className="card insight-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
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

      <motion.div
        key={mode}
        initial={{ opacity: 0, x: mode === 'mindfulness' ? -10 : 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2>{getMoodEmoji()} {mode === 'mindfulness' ? 'Mindfulness Moment' : 'Productivity Coach'}</h2>
        
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
        
        {/* Mindfulness Mode Content */}
        <AnimatePresence mode='wait'>
          {mode === 'mindfulness' && suggestionData && (
            <motion.div 
              className="tip-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="mindfulness-data"
            >
              {suggestionData.prompt && (
                <blockquote>{suggestionData.prompt}</blockquote>
              )}
              {suggestionData.exercise && (
                <div className="exercise-box">
                  <h4>🫁 {suggestionData.exercise.name || 'Breathing Exercise'}</h4>
                  <p className="duration">⏱️ {suggestionData.exercise.duration_seconds}s</p>
                  {suggestionData.exercise.steps && (
                    <ol className="exercise-steps">
                      {suggestionData.exercise.steps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {suggestionData.exercise.benefits && (
                    <p className="benefits">💚 {suggestionData.exercise.benefits}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Coach Mode Content */}
          {mode === 'coach' && coachData && (
            <motion.div 
              className="tip-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="coach-data"
            >
              {coachData.mental_check && (
                <p className="mood-context">{coachData.mental_check}</p>
              )}
              {coachData.productivity_tips && coachData.productivity_tips.map((tip: ProductivityTip, i: number) => (
                <div key={i} className="productivity-tip">
                  <h4>
                    <span className="tip-icon">{tip.icon}</span>
                    {tip.title}
                  </h4>
                  <p>{tip.message}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No data placeholder */}
        {((mode === 'mindfulness' && !suggestionData) || (mode === 'coach' && !coachData)) && !loading && (
          <p className="placeholder-text">
            {mode === 'mindfulness' 
              ? (currentMood ? `Getting personalized ${currentMood.name} tips...` : 'Select a mood or click for uplifting suggestions')
              : 'Click for productivity coaching based on your mental state'
            }
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TipsPanel;
