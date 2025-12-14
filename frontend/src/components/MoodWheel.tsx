import React, { useState } from 'react';
import { useJac } from '../hooks/useJac';
import type { UserContext, Emotion } from '../types';
import type { MoodEntry } from '../App';

// Modern animated emoji components
const AnimatedEmoji: React.FC<{ name: string; size?: number }> = ({ name, size = 48 }) => {
  const style: React.CSSProperties = {
    fontSize: size,
    display: 'inline-block',
    lineHeight: 1,
  };

  switch (name) {
    case 'happy':
      return <span style={{ ...style, animation: 'bounce 1s ease infinite' }}>😊</span>;
    case 'calm':
      return <span style={{ ...style, animation: 'float 3s ease-in-out infinite' }}>😌</span>;
    case 'neutral':
      return <span style={style}>😐</span>;
    case 'anxious':
      return <span style={{ ...style, animation: 'shake 0.5s ease infinite' }}>😰</span>;
    case 'sad':
      return (
        <span style={{ ...style, position: 'relative' }}>
          😢
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            fontSize: size * 0.3,
            animation: 'tearDrop 1.5s ease-in-out infinite',
          }}>💧</span>
        </span>
      );
    case 'angry':
      return <span style={{ ...style, animation: 'pulse 0.8s ease infinite' }}>😠</span>;
    default:
      return <span style={style}>😊</span>;
  }
};

const MOODS: Emotion[] = [
  { name: 'happy', emoji: '😊', color: '#3b82f6' },
  { name: 'calm', emoji: '😌', color: '#22c55e' },
  { name: 'neutral', emoji: '😐', color: '#6b7280' },
  { name: 'anxious', emoji: '😰', color: '#f59e0b' },
  { name: 'sad', emoji: '😢', color: '#3b82f6' },
  { name: 'angry', emoji: '😠', color: '#ef4444' },
];

interface MoodWheelProps {
  userContext: UserContext;
  onMoodSelect?: (mood: Emotion) => void;
  onMoodLogged?: (entry: MoodEntry) => void;
  moodHistory: MoodEntry[];
  onNavigateToJournal?: () => void;
}

const MoodWheel: React.FC<MoodWheelProps> = ({ userContext, onMoodSelect, onMoodLogged, moodHistory, onNavigateToJournal }) => {
  const [selectedMood, setSelectedMood] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const { spawn, loading, data } = useJac('MoodLogger');

  const handleMoodClick = (mood: Emotion) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood);
  };

  const handleLog = async () => {
    if (!selectedMood) return;
    
    const result = await spawn({
      user_id: userContext.userId,
      mood_text: note || `Feeling ${selectedMood.name}`,
      emoji: selectedMood.emoji
    });

    if (result) {
      const entry: MoodEntry = {
        emotion: selectedMood,
        timestamp: new Date(),
        note: note || `Feeling ${selectedMood.name}`,
        aiResponse: result.response
      };
      onMoodLogged?.(entry);
      setNote('');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date);
  };

  const shouldShowJournalButton = data?.response && 
    (data.response.toLowerCase().includes('journal') || 
     data.response.toLowerCase().includes('write') ||
     data.response.toLowerCase().includes('express'));

  return (
    <div className="mood-wheel-container">
      {/* Left Side: Mood Selection */}
      <div className="card mood-input-section">
        <h2>How are you feeling?</h2>
        <p className="subtitle">Select your mood and add a note</p>
        
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <button
              key={mood.name}
              className={`mood-btn ${selectedMood?.name === mood.name ? 'selected' : ''}`}
              onClick={() => handleMoodClick(mood)}
              style={{ borderColor: selectedMood?.name === mood.name ? mood.color : 'transparent' }}
            >
              <AnimatedEmoji name={mood.name} size={36} />
              <span className="mood-label">{mood.name}</span>
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about how you're feeling..."
          rows={3}
        />

        <button 
          className="primary-btn" 
          onClick={handleLog} 
          disabled={!selectedMood || loading}
        >
          {loading ? '✨ Processing...' : '📝 Log Mood'}
        </button>

        {/* Mood History Strip */}
        {moodHistory.length > 0 && (
          <div className="mood-history">
            <h3>Today's Check-ins</h3>
            <div className="history-strip">
              {moodHistory.slice(0, 8).map((entry, i) => (
                <div 
                  key={i} 
                  className="history-item"
                  style={{ borderColor: entry.emotion.color }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <span className="history-emoji">{entry.emotion.emoji}</span>
                  <span className="history-time">{formatTime(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side: AI Response */}
      <div className="card ai-response-section">
        <h2>🤖 SerenityAI Says</h2>
        
        {data ? (
          <div className="ai-response-content fade-in">
            <div className="ai-response-bubble">
              <div className="ai-avatar">🧘</div>
              <div className="ai-text">
                <p>{data.response}</p>
              </div>
            </div>

            {data.emotion && (
              <div className="detected-mood" style={{ borderColor: data.emotion.color }}>
                <span>Detected: </span>
                <strong style={{ color: data.emotion.color }}>{data.emotion.name}</strong>
                <span className="intensity"> (intensity: {data.emotion.intensity}/10)</span>
              </div>
            )}

            {shouldShowJournalButton && onNavigateToJournal && (
              <button 
                className="journal-redirect-btn"
                onClick={onNavigateToJournal}
              >
                📝 Start Journaling
              </button>
            )}
          </div>
        ) : (
          <div className="ai-placeholder">
            <div className="placeholder-icon">💬</div>
            <p>Log a mood to receive personalized support</p>
            <p className="placeholder-hint">Your AI companion is here to help!</p>
          </div>
        )}
      </div>

      {/* Modal for Mood Details */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div 
            className="mood-detail-modal fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: selectedEntry.emotion.color }}
          >
            <button className="modal-close" onClick={() => setSelectedEntry(null)}>×</button>
            <div className="modal-header" style={{ background: `linear-gradient(135deg, ${selectedEntry.emotion.color}20, transparent)` }}>
              <AnimatedEmoji name={selectedEntry.emotion.name} size={48} />
              <div>
                <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{selectedEntry.emotion.name}</h3>
                <p className="modal-time">{selectedEntry.timestamp.toLocaleString()}</p>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>📝 Your Note</h4>
                <p>{selectedEntry.note}</p>
              </div>
              {selectedEntry.aiResponse && (
                <div className="modal-section ai-section">
                  <h4>🤖 AI Response</h4>
                  <p>{selectedEntry.aiResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodWheel;
