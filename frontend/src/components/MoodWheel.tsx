import React, { useState, useEffect } from 'react';
import { useJac } from '../hooks/useJac';
import { useSpeechToText, useTextToSpeech } from '../hooks/useSpeech';
import type { UserContext, Emotion } from '../types';
import type { MoodEntry } from '../App';

// Animated emoji component
const AnimatedEmoji: React.FC<{ name: string; size?: number }> = ({ name, size = 48 }) => {
  const style: React.CSSProperties = {
    fontSize: size,
    display: 'inline-block',
    lineHeight: 1,
  };

  const animations: Record<string, string> = {
    happy: 'bounce 1s ease infinite',
    calm: 'float 3s ease-in-out infinite',
    anxious: 'shake 0.5s ease infinite',
    angry: 'pulse 0.8s ease infinite',
  };

  return (
    <span style={{ ...style, animation: animations[name] || undefined }}>
      {name === 'happy' && '😊'}
      {name === 'calm' && '😌'}
      {name === 'neutral' && '😐'}
      {name === 'anxious' && '😰'}
      {name === 'sad' && '😢'}
      {name === 'angry' && '😠'}
    </span>
  );
};

const MOODS: Emotion[] = [
  { name: 'happy', emoji: '😊', color: '#22c55e' },
  { name: 'calm', emoji: '😌', color: '#3b82f6' },
  { name: 'neutral', emoji: '😐', color: '#6b7280' },
  { name: 'anxious', emoji: '😰', color: '#f59e0b' },
  { name: 'sad', emoji: '😢', color: '#6366f1' },
  { name: 'angry', emoji: '😠', color: '#ef4444' },
];

interface MoodWheelProps {
  userContext: UserContext;
  onMoodSelect?: (mood: Emotion) => void;
  onMoodLogged?: (entry: MoodEntry) => void;
  moodHistory: MoodEntry[];
  onNavigateToJournal?: () => void;
}

const MoodWheel: React.FC<MoodWheelProps> = ({ 
  userContext, 
  onMoodSelect, 
  onMoodLogged, 
  moodHistory, 
  onNavigateToJournal 
}) => {
  const [selectedMood, setSelectedMood] = useState<Emotion | null>(null);
  const [note, setNote] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const { spawn, loading, data } = useJac('MoodLogger');
  
  // Voice features
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported: sttSupported } = useSpeechToText();
  const { speak, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Append voice transcript to note
  useEffect(() => {
    if (transcript) {
      setNote(prev => prev + (prev ? ' ' : '') + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Show modal when AI response arrives
  useEffect(() => {
    if (data?.response) {
      setShowSuccess(false);
      setShowAIModal(true);
    }
  }, [data?.response]);

  const handleMoodClick = (mood: Emotion) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood);
  };

  const handleLog = async () => {
    if (!selectedMood) return;
    
    setShowSuccess(true);
    
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

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
    <div className="mood-wheel-section">
      {/* Mood Input Card */}
      <div className="card mood-input-card">
        <div className="card-header">
          <h2>How are you feeling?</h2>
          <p className="subtitle">Select your mood and add a note</p>
        </div>
        
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <button
              key={mood.name}
              className={`mood-btn ${selectedMood?.name === mood.name ? 'selected' : ''}`}
              onClick={() => handleMoodClick(mood)}
              style={{ 
                '--mood-color': mood.color,
                borderColor: selectedMood?.name === mood.name ? mood.color : 'transparent'
              } as React.CSSProperties}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.name}</span>
            </button>
          ))}
        </div>

        <div className="note-input-wrapper">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isListening ? "🎤 Listening... speak now" : "What's on your mind? (optional)"}
            rows={3}
            className={isListening ? 'listening' : ''}
          />
          {sttSupported && (
            <button 
              className={`voice-btn ${isListening ? 'active' : ''}`}
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Speak your thoughts"}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          )}
        </div>

        <button 
          className="primary-btn log-btn" 
          onClick={handleLog} 
          disabled={!selectedMood || loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner"></span> Processing...
            </span>
          ) : (
            <>
              <span>✨</span> Log Mood
            </>
          )}
        </button>

        {/* Success message */}
        {showSuccess && !data && (
          <div className="success-toast fade-in">
            ✓ Mood logged! Getting AI response...
          </div>
        )}

        {/* Mood History Strip */}
        {moodHistory.length > 0 && (
          <div className="mood-history">
            <h3>Recent Check-ins</h3>
            <div className="history-strip">
              {moodHistory.slice(0, 6).map((entry, i) => (
                <button 
                  key={i} 
                  className="history-item"
                  style={{ '--mood-color': entry.emotion.color } as React.CSSProperties}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <span className="history-emoji">{entry.emotion.emoji}</span>
                  <span className="history-time">{formatTime(entry.timestamp)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Response Modal */}
      {showAIModal && data && (
        <div className="modal-overlay" onClick={() => setShowAIModal(false)}>
          <div className="ai-response-modal slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAIModal(false)}>×</button>
            
            <div className="modal-header ai-modal-header">
              <div className="ai-avatar-large">🧘</div>
              <div>
                <h2>SerenityAI</h2>
                <p className="ai-subtitle">Your wellness companion</p>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="ai-message">
                <p>{data.response}</p>
              </div>

              {data.emotion && (
                <div className="detected-mood-tag" style={{ backgroundColor: `${data.emotion.color}20`, borderColor: data.emotion.color }}>
                  <span>Detected: </span>
                  <strong style={{ color: data.emotion.color }}>{data.emotion.name}</strong>
                  <span className="intensity"> · Intensity {data.emotion.intensity}/10</span>
                </div>
              )}

              <div className="modal-actions">
                {ttsSupported && (
                  <button 
                    className="action-btn"
                    onClick={() => isSpeaking ? window.speechSynthesis.cancel() : speak(data.response)}
                  >
                    {isSpeaking ? '🔇 Stop' : '🔊 Listen'}
                  </button>
                )}
                
                {shouldShowJournalButton && onNavigateToJournal && (
                  <button 
                    className="action-btn primary"
                    onClick={() => {
                      setShowAIModal(false);
                      onNavigateToJournal();
                    }}
                  >
                    📝 Start Journaling
                  </button>
                )}
                
                <button 
                  className="action-btn"
                  onClick={() => setShowAIModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Detail Modal */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="mood-detail-modal slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEntry(null)}>×</button>
            
            <div className="modal-header" style={{ background: `linear-gradient(135deg, ${selectedEntry.emotion.color}15, transparent)` }}>
              <AnimatedEmoji name={selectedEntry.emotion.name} size={56} />
              <div>
                <h3 style={{ textTransform: 'capitalize' }}>{selectedEntry.emotion.name}</h3>
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
                  <h4>🧘 AI Response</h4>
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
