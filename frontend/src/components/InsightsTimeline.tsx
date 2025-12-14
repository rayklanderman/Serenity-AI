import React, { useEffect, useState } from 'react';
import { useJac } from '../hooks/useJac';
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

// Positive elaborations for common recommendations
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
      <div className="card insights-timeline">
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(30,30,50,0.5)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: `1px solid ${getTrendColor(data.patterns.weekly_trend)}40`
            }}>
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
            </div>

            {/* Recurring Emotions */}
            {data.patterns.recurring_emotions?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Common Emotions
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.patterns.recurring_emotions.map((emotion: string, i: number) => (
                    <span key={i} style={{
                      padding: '0.4rem 0.8rem',
                      background: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      {emotion}
                    </span>
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
                  <button 
                    key={i} 
                    onClick={() => handleRecommendationClick(rec)}
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
                  </button>
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
      </div>

      {/* Modal Popup for Recommendation Detail */}
      {selectedRec && (
        <div className="modal-overlay" onClick={closeModal}>
          <div 
            className="recommendation-modal fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, var(--bg-card), rgba(30,30,50,0.98))',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '480px',
              border: '1px solid var(--primary)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
              borderBottom: '1px solid var(--glass-border)'
            }}>
              <button 
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >×</button>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                {selectedRec.title}
              </h3>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <p style={{ 
                margin: '0 0 1.5rem', 
                color: 'var(--text-secondary)', 
                lineHeight: 1.7,
                fontSize: '0.95rem'
              }}>
                {selectedRec.detail}
              </p>

              {/* Action Box */}
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                borderRadius: '12px',
                borderLeft: '3px solid var(--accent-green)'
              }}>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--accent-green)', fontSize: '0.9rem' }}>
                  💡 Try This:
                </p>
                <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {selectedRec.action}
                </p>
              </div>

              <button
                onClick={closeModal}
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent-pink))',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Got it! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InsightsTimeline;
