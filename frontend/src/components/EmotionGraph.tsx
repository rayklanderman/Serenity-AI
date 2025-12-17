import React, { useEffect, useState } from 'react';
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

// Sample mood history data for visualization
const generateSampleData = () => {
  const emotions = ['happy', 'calm', 'neutral', 'anxious', 'sad'];
  const data = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toISOString().split('T')[0],
      emotion,
      intensity: Math.floor(Math.random() * 5) + 4, // 4-9 range
      color: EMOTION_COLORS[emotion]
    });
  }
  return data;
};

// Generate radar data for emotion frequency
const generateRadarData = (moodData: typeof generateSampleData extends () => infer R ? R : never) => {
  const emotionCounts: Record<string, number> = {
    happy: 0,
    sad: 0,
    anxious: 0,
    calm: 0,
    angry: 0,
    neutral: 0
  };
  
  moodData.forEach(entry => {
    if (emotionCounts[entry.emotion] !== undefined) {
      emotionCounts[entry.emotion]++;
    }
  });
  
  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    frequency: count,
    fullMark: 7
  }));
};

const EmotionGraph: React.FC<EmotionGraphProps> = ({ userContext: _userContext }) => {
  const [moodData, setMoodData] = useState<ReturnType<typeof generateSampleData>>([]);
  const [radarData, setRadarData] = useState<ReturnType<typeof generateRadarData>>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'radar'>('timeline');

  useEffect(() => {
    // Generate sample data on mount
    const data = generateSampleData();
    setMoodData(data);
    setRadarData(generateRadarData(data));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          background: '#2a2a2a',
          padding: '12px',
          borderRadius: '8px',
          border: `2px solid ${data.color}`
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: data.color }}>
            {data.emotion} - Intensity: {data.intensity}/10
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="card emotion-graph"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Emotional Patterns</h2>
        <div className="view-toggle" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'timeline' ? '#535bf2' : '#333',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Timeline
          </button>
          <button
            className={`toggle-btn ${viewMode === 'radar' ? 'active' : ''}`}
            onClick={() => setViewMode('radar')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'radar' ? '#535bf2' : '#333',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Radar
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#888" fontSize={12} />
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
                      key={payload.date}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={payload.color}
                      stroke="#fff"
                      strokeWidth={2}
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
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="emotion" stroke="#888" fontSize={12} />
              <PolarRadiusAxis angle={30} domain={[0, 7]} stroke="#555" />
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
          <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              background: color 
            }} />
            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmotionGraph;
