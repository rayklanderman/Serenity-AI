import React, { useState, useEffect } from 'react';
import { useJac } from '../hooks/useJac';
import type { UserContext, Emotion } from '../types';
import type { MoodEntry } from '../App';

const EMOTIONS: Emotion[] = [
  { name: 'happy', emoji: '😊', color: '#FFD700' },
  { name: 'sad', emoji: '😢', color: '#4169E1' },
  { name: 'anxious', emoji: '😰', color: '#FF6347' },
  { name: 'calm', emoji: '😌', color: '#98FB98' },
  { name: 'angry', emoji: '😠', color: '#DC143C' },
  { name: 'neutral', emoji: '😐', color: '#808080' },
];

interface MoodWheelProps {
  userContext: UserContext;
  onMoodSelect: (mood: Emotion | null) => void;
  onMoodLogged: (entry: MoodEntry) => void;
  moodHistory: MoodEntry[];
}

const MoodWheel: React.FC<MoodWheelProps> = ({ 
  userContext, 
  onMoodSelect, 
  onMoodLogged,
  moodHistory 
}) => {
  const [selectedMood, setSelectedMood] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const { spawn, loading, data } = useJac('MoodLogger');

  useEffect(() => {
    onMoodSelect(selectedMood);
  }, [selectedMood, onMoodSelect]);

  const handleLog = async () => {
    if (!selectedMood) return;
    
    const result = await spawn({
      user_id: userContext.userId,
      mood_text: note || selectedMood.name,
      emoji: selectedMood.emoji
    });

    if (result) {
      onMoodLogged({
        emotion: selectedMood,
        timestamp: new Date(),
        note: note || selectedMood.name,
        aiResponse: result.response
      });
    }
    
    setNote('');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).format(date);
  };

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="card mood-wheel-container">
      <h2>How are you feeling?</h2>
      
      <div className="mood-grid">
        {EMOTIONS.map((mood) => (
          <button
            key={mood.name}
            className={`mood-btn ${selectedMood?.name === mood.name ? 'selected' : ''}`}
            onClick={() => setSelectedMood(mood)}
            style={{ borderColor: mood.color }}
          >
            <span className="emoji">{mood.emoji}</span>
            <span className="label">{mood.name}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="log-area fade-in">
          <textarea
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="primary-btn" onClick={handleLog} disabled={loading}>
            {loading ? '✨ Logging...' : '📝 Log Mood'}
          </button>
        </div>
      )}

      {data && (
        <div className="response-area fade-in">
          <div className="ai-bubble">
            <span className="ai-icon">🤖</span>
            <p className="ai-message">{data.response}</p>
          </div>
        </div>
      )}

      {/* Mood History Strip */}
      {moodHistory.length > 0 && (
        <div className="mood-history fade-in">
          <h3>📊 Today's Check-ins <span className="click-hint">(click to view details)</span></h3>
          <div className="history-strip">
            {moodHistory.slice(0, 7).map((entry, i) => (
              <div 
                key={i} 
                className="history-item clickable"
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

      {/* Mood Detail Modal */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div 
            className="mood-detail-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: selectedEntry.emotion.color }}
          >
            <button className="modal-close" onClick={() => setSelectedEntry(null)}>×</button>
            
            <div className="modal-header" style={{ background: `${selectedEntry.emotion.color}20` }}>
              <span className="modal-emoji">{selectedEntry.emotion.emoji}</span>
              <div>
                <h3 style={{ color: selectedEntry.emotion.color, margin: 0 }}>
                  {selectedEntry.emotion.name.charAt(0).toUpperCase() + selectedEntry.emotion.name.slice(1)}
                </h3>
                <p className="modal-time">{formatFullDate(selectedEntry.timestamp)}</p>
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
