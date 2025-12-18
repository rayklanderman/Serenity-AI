import React, { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import type { UserContext } from '../types';
import type { MoodEntry } from '../App';

interface EmotionGraphProps {
  userContext: UserContext;
  moodHistory?: MoodEntry[];
}

// Emotion colors
const EMOTION_COLORS: Record<string, string> = {
  happy: '#FFD700',
  sad: '#4169E1',
  anxious: '#FF6347',
  calm: '#98FB98',
  angry: '#DC143C',
  neutral: '#808080'
};

const EmotionGraph: React.FC<EmotionGraphProps> = ({ userContext: _userContext, moodHistory = [] }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'radar'>('timeline');

  // Transform real moodHistory data for timeline chart
  const timelineData = useMemo(() => {
    // Intensity mapping based on mood type (since Emotion type doesn't include intensity)
    const getIntensity = (emotionName: string): number => {
      const intensityMap: Record<string, number> = {
        happy: 8,
        calm: 7,
        neutral: 5,
        sad: 3,
        anxious: 4,
        angry: 6
      };
      return intensityMap[emotionName.toLowerCase()] || 5;
    };

    if (!moodHistory || moodHistory.length === 0) {
      // Return placeholder data when no moods logged
      return [{
        date: 'Today',
        fullDate: new Date().toISOString().split('T')[0],
        emotion: 'neutral',
        intensity: 5,
        color: EMOTION_COLORS['neutral'],
        note: 'No moods logged yet'
      }];
    }

    // Group moods by date and take the latest per day (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    
    const recentMoods = moodHistory
      .filter(m => new Date(m.timestamp) >= last7Days)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // If no recent moods, use all available moods
    const dataToUse = recentMoods.length > 0 ? recentMoods : moodHistory.slice(-7);

    return dataToUse.map(mood => ({
      date: new Date(mood.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: new Date(mood.timestamp).toISOString().split('T')[0],
      emotion: mood.emotion.name.toLowerCase(),
      intensity: getIntensity(mood.emotion.name),
      color: EMOTION_COLORS[mood.emotion.name.toLowerCase()] || EMOTION_COLORS['neutral'],
      note: mood.note || ''
    }));
  }, [moodHistory]);

  // Generate radar data from real mood frequency
  const radarData = useMemo(() => {
    const emotionCounts: Record<string, number> = {
      happy: 0,
      sad: 0,
      anxious: 0,
      calm: 0,
      angry: 0,
      neutral: 0
    };
    
    moodHistory.forEach(entry => {
      const emotionName = entry.emotion.name.toLowerCase();
      if (emotionCounts[emotionName] !== undefined) {
        emotionCounts[emotionName]++;
      }
    });
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      frequency: count,
      fullMark: Math.max(7, moodHistory.length)
    }));
  }, [moodHistory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '12px',
          borderRadius: '8px',
          border: `2px solid ${data.color}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: data.color, fontWeight: '600' }}>
            {data.emotion.charAt(0).toUpperCase() + data.emotion.slice(1)} - {data.intensity}/10
          </p>
          {data.note && (
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
              "{data.note}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const hasRealData = moodHistory && moodHistory.length > 0;

  return (
    <motion.div 
      className="card emotion-graph"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Emotional Patterns</h2>
          {hasRealData && (
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
              Based on {moodHistory.length} mood{moodHistory.length !== 1 ? 's' : ''} logged
            </p>
          )}
        </div>
        <div className="view-toggle" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--gray-200)',
              background: viewMode === 'timeline' ? 'var(--primary)' : 'white',
              color: viewMode === 'timeline' ? 'white' : 'var(--gray-600)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Timeline
          </button>
          <button
            className={`toggle-btn ${viewMode === 'radar' ? 'active' : ''}`}
            onClick={() => setViewMode('radar')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--gray-200)',
              background: viewMode === 'radar' ? 'var(--primary)' : 'white',
              color: viewMode === 'radar' ? 'white' : 'var(--gray-600)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Radar
          </button>
        </div>
      </div>

      {!hasRealData && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          background: 'var(--gray-100)', 
          borderRadius: '12px',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, color: 'var(--gray-600)' }}>
            📊 Log your first mood to see your emotional patterns here!
          </p>
        </div>
      )}

      {viewMode === 'timeline' ? (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
              <XAxis dataKey="date" stroke="var(--gray-500)" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="var(--gray-500)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="intensity"
                stroke="#a855f7"
                strokeWidth={3}
                fill="url(#intensityGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={payload.fullDate}
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill={payload.color}
                      stroke="#fff"
                      strokeWidth={3}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--gray-300)" />
              <PolarAngleAxis dataKey="emotion" stroke="var(--gray-600)" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, Math.max(7, moodHistory.length)]} stroke="var(--gray-400)" />
              <Radar
                name="Frequency"
                dataKey="frequency"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.5}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="emotion-legend" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.8rem', 
        marginTop: '1rem',
        justifyContent: 'center'
      }}>
        {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
          <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              background: color,
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmotionGraph;
