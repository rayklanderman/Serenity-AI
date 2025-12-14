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
      detail: "Gratitude rewires your brain for positivity! When you focus on what you're thankful for, your brain releases dopamine and serotonin - natural mood boosters. Even on tough days, there's always something small to appreciate.",
      action: "Try this: Before bed, write down 3 things that went well today, no matter how small. A warm cup of coffee, a kind word, or simply a moment of peace counts!"
    };
  }
  if (rec.includes('walk') || rec.includes('exercise') || rec.includes('movement')) {
    return {
      title: "🚶 Move Your Body",
      detail: "Movement is medicine for your mind! Even a short 10-minute walk can reduce anxiety by up to 50%. Physical activity releases endorphins, your body's natural 'feel-good' chemicals.",
      action: "Start small: Take a 5-minute walk outside. Feel the fresh air, notice nature around you. You don't need to run a marathon - gentle movement is powerful!"
    };
  }
  if (rec.includes('breath') || rec.includes('breathing')) {
    return {
      title: "🫁 Breathe Deeply",
      detail: "Your breath is your superpower! Deep breathing activates your parasympathetic nervous system, instantly calming your body's stress response. It's like having a reset button you can press anytime.",
      action: "Try 4-7-8 breathing: Inhale for 4 seconds, hold for 7, exhale for 8. Do this 3 times and notice how your body relaxes."
    };
  }
  if (rec.includes('sleep') || rec.includes('rest')) {
    return {
      title: "😴 Prioritize Rest",
      detail: "Sleep is your brain's time to heal and process emotions. Quality rest improves mood, focus, and resilience. You're not lazy for needing rest - you're taking care of your mental health!",
      action: "Tonight, try a 'wind-down ritual': No screens 30 minutes before bed, dim the lights, and do something calming like reading or gentle stretching."
    };
  }
  if (rec.includes('journal') || rec.includes('write')) {
    return {
      title: "📝 Express Yourself",
      detail: "Journaling helps you process emotions and gain clarity. When you write down your thoughts, you move them from the emotional part of your brain to the logical part. It's like having a conversation with your wisest self.",
      action: "Try free-writing for just 5 minutes. Don't worry about grammar or making sense - just let your thoughts flow onto the page."
    };
  }
  if (rec.includes('hydrat') || rec.includes('water')) {
    return {
      title: "💧 Stay Hydrated",
      detail: "Your brain is 75% water! Even mild dehydration can affect your mood and energy levels. Staying hydrated helps you think clearly and feel more positive.",
      action: "Keep a water bottle nearby and take small sips throughout the day. Add fresh lemon or cucumber for a refreshing twist!"
    };
  }
  if (rec.includes('connect') || rec.includes('friend') || rec.includes('talk')) {
    return {
      title: "💬 Connect with Others",
      detail: "Human connection is essential for mental wellbeing. Sharing your feelings with someone you trust can lighten your emotional load and remind you that you're not alone.",
      action: "Reach out to someone today - a friend, family member, or even a supportive online community. A simple 'thinking of you' message can make both your days brighter!"
    };
  }
  
  // Default positive elaboration
  return {
    title: "✨ " + recommendation,
    detail: "Every small step you take towards self-care matters. Be patient with yourself - growth happens gradually. You're already doing something amazing by checking in with your emotional health!",
    action: "Take one small action today that makes you feel good. It could be as simple as stepping outside for fresh air, enjoying a warm drink, or giving yourself permission to rest."
  };
};

const InsightsTimeline: React.FC<InsightsTimelineProps> = ({ userContext }) => {
  const { spawn, data, loading } = useJac('TrendAnalyzer');
  const [selectedRec, setSelectedRec] = useState<{ title: string, detail: string, action: string } | null>(null);

  useEffect(() => {
    spawn({ user_id: userContext.userId, days: 7 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecommendationClick = (rec: string) => {
    setSelectedRec(getElaboration(rec));
  };

  return (
    <div className="card insights-timeline">
      <h2>Weekly Insights</h2>
      
      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid #333', 
            borderTop: '3px solid #a855f7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Analyzing your emotional patterns...</p>
        </div>
      ) : data ? (
        <div className="insights-content">
          {/* Trend Badge */}
          <div className="trend-badge" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(30,30,50,0.8) 0%, rgba(40,40,60,0.8) 100%)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: `1px solid ${getTrendColor(data.patterns.weekly_trend)}40`
          }}>
            <span style={{ fontSize: '2rem' }}>{getTrendIcon(data.patterns.weekly_trend)}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Your Week</p>
              <p style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: 600,
                color: getTrendColor(data.patterns.weekly_trend),
                textTransform: 'capitalize'
              }}>
                {data.patterns.weekly_trend}
              </p>
            </div>
          </div>

          {/* Recurring Emotions */}
          {data.patterns.recurring_emotions && data.patterns.recurring_emotions.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.75rem' }}>
                Common Emotions
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {data.patterns.recurring_emotions.map((emotion: string, i: number) => (
                  <span key={i} style={{
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
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
            <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.75rem' }}>
              ✨ AI Recommendations <span style={{ fontSize: '0.75rem', color: '#666' }}>(click to learn more)</span>
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {data.patterns.recommendations.map((rec: string, i: number) => (
                <li 
                  key={i} 
                  onClick={() => handleRecommendationClick(rec)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%)',
                    borderLeft: '3px solid #a855f7',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
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
                  {rec} →
                </li>
              ))}
            </ul>
          </div>

          {/* Elaboration Panel */}
          {selectedRec && (
            <div className="elaboration-panel fade-in" style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: '0 0 1rem', color: '#10b981', fontSize: '1.1rem' }}>
                  {selectedRec.title}
                </h4>
                <button 
                  onClick={() => setSelectedRec(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    fontSize: '1.25rem',
                    cursor: 'pointer'
                  }}
                >×</button>
              </div>
              <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {selectedRec.detail}
              </p>
              <div style={{
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '12px',
                borderLeft: '3px solid #10b981'
              }}>
                <p style={{ margin: 0, fontWeight: 500, color: '#10b981', fontSize: '0.9rem' }}>
                  💡 Try This:
                </p>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {selectedRec.action}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
          No insights yet. Start logging your moods!
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InsightsTimeline;
