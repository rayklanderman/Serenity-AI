import React, { useEffect, useState } from 'react';
import { useJac } from '../hooks/useJac';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserContext } from '../types';
import type { MoodEntry } from '../App';

interface InsightsTimelineProps {
  userContext: UserContext;
  moodHistory?: MoodEntry[];
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'improving': return '📈';
    case 'declining': return '📉';
    default: return '➡️';
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'improving': return '#4ade80';
    case 'declining': return '#f87171';
    default: return '#fbbf24';
  }
};

// Positive elaborations for common recommendations (omitted large block for brevity, same as before)
// ... (Keeping the full logic for elaboration matching)
const getElaboration = (recommendation: string): { title: string, detail: string, action: string } => {
  const rec = recommendation.toLowerCase();
  
  if (rec.includes('gratitude') || rec.includes('thankful')) {
    return {
      title: "🙏 Practice Gratitude",
      detail: "Gratitude rewires your brain for positivity! When you focus on what you're thankful for, your brain releases dopamine and serotonin - natural mood boosters.",
      action: "Try this: Before bed, write down 3 things that went well today, no matter how small."
    };
  }
  if (rec.includes('walk') || rec.includes('exercise') || rec.includes('movement')) {
    return {
      title: "🚶 Move Your Body",
      detail: "Movement is medicine for your mind! Even a short 10-minute walk can reduce anxiety by up to 50%.",
      action: "Start small: Take a 5-minute walk outside. Feel the fresh air, notice nature around you."
    };
  }
  if (rec.includes('breath') || rec.includes('breathing')) {
    return {
      title: "🫁 Breathe Deeply",
      detail: "Your breath is your superpower! Deep breathing activates your parasympathetic nervous system, instantly calming stress.",
      action: "Try 4-7-8 breathing: Inhale for 4 seconds, hold for 7, exhale for 8. Do this 3 times."
    };
  }
  if (rec.includes('sleep') || rec.includes('rest')) {
    return {
      title: "😴 Prioritize Rest",
      detail: "Sleep is your brain's time to heal and process emotions. Quality rest improves mood, focus, and resilience.",
      action: "Tonight, try a 'wind-down ritual': No screens 30 minutes before bed, dim the lights."
    };
  }
  if (rec.includes('journal') || rec.includes('write')) {
    return {
      title: "📝 Express Yourself",
      detail: "Journaling helps you process emotions and gain clarity. Writing moves thoughts from emotional to logical brain.",
      action: "Try free-writing for just 5 minutes. Don't worry about grammar - just let thoughts flow."
    };
  }
  if (rec.includes('hydrat') || rec.includes('water')) {
    return {
      title: "💧 Stay Hydrated",
      detail: "Your brain is 75% water! Even mild dehydration can affect your mood and energy levels.",
      action: "Keep a water bottle nearby and take small sips throughout the day."
    };
  }
  if (rec.includes('connect') || rec.includes('friend') || rec.includes('talk')) {
    return {
      title: "💬 Connect with Others",
      detail: "Human connection is essential for mental wellbeing. Sharing feelings lightens your emotional load.",
      action: "Reach out to someone today - a simple 'thinking of you' message can brighten both your days!"
    };
  }
  
  return {
    title: "✨ " + recommendation,
    detail: "Every small step you take towards self-care matters. Be patient with yourself - growth happens gradually.",
    action: "Take one small action today that makes you feel good - fresh air, a warm drink, or simply rest."
  };
};

const InsightsTimeline: React.FC<InsightsTimelineProps> = ({ userContext }) => {
  const { spawn, data, loading } = useJac('TrendAnalyzer');
  const [selectedRec, setSelectedRec] = useState<{ title: string, detail: string, action: string, original: string } | null>(null);

  useEffect(() => {
    spawn({ user_id: userContext.userId, days: 7 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecommendationClick = (rec: string) => {
    const elaboration = getElaboration(rec);
    setSelectedRec({ ...elaboration, original: rec });
  };

  const closeModal = () => setSelectedRec(null);

  return (
    <>
      <motion.div 
        className="card insights-timeline"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>📊 Weekly Insights</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '3px solid rgba(139,92,246,0.2)', 
              borderTop: '3px solid #a855f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: 'var(--text-muted)' }}>Analyzing your patterns...</p>
          </div>
        ) : data ? (
          <div className="insights-content">
            {/* Trend Badge */}
            <motion.div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: 'rgba(30,30,50,0.5)',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: `1px solid ${getTrendColor(data.patterns.weekly_trend)}40`
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span style={{ fontSize: '2rem' }}>{getTrendIcon(data.patterns.weekly_trend)}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Week</p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1.2rem', 
                  fontWeight: 600,
                  color: getTrendColor(data.patterns.weekly_trend),
                  textTransform: 'capitalize'
                }}>
                  {data.patterns.weekly_trend}
                </p>
              </div>
            </motion.div>

            {/* Recurring Emotions */}
            {data.patterns.recurring_emotions?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Common Emotions
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.patterns.recurring_emotions.map((emotion: string, i: number) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + (i * 0.05) }}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: 'rgba(139, 92, 246, 0.2)',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      {emotion}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                ✨ AI Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.patterns.recommendations.map((rec: string, i: number) => (
                  <motion.button 
                    key={i} 
                    onClick={() => handleRecommendationClick(rec)}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%)',
                      borderLeft: '3px solid var(--primary)',
                      borderRadius: '0 10px 10px 0',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      border: 'none',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span>{rec}</span>
                    <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>→</span>
                  </motion.button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                Click any recommendation to learn more
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No insights yet. Start logging your moods!
          </p>
        )}
      </motion.div>

      {/* Modal Popup for Recommendation Detail */}
      <AnimatePresence>
      {/* Modal Popup for Recommendation Detail - Portal to escape Stacking Context */}
      {selectedRec && createPortal(
        <div className="modal-overlay" onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            className="ai-response-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header ai-modal-header">
              <div className="ai-avatar-large">✨</div>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>{selectedRec.title}</h2>
                <p className="ai-subtitle">Wellness Recommendation</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="ai-message">
                <p>{selectedRec.detail}</p>
              </div>

              <div 
                className="tip-content" 
                style={{ 
                  marginTop: '1.5rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  borderLeft: '4px solid #10b981',
                  padding: '1rem',
                  borderRadius: '0 8px 8px 0'
                }}
              >
                <strong style={{ color: '#059669', display: 'block', marginBottom: '0.5rem' }}>
                  💡 Action Item:
                </strong>
                <p style={{ margin: 0, color: 'var(--gray-800)' }}>
                  {selectedRec.action}
                </p>
              </div>

              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button 
                  className="action-btn primary"
                  onClick={closeModal}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
      </AnimatePresence>
    </>
  );
};

export default InsightsTimeline;
