import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useJac } from '../hooks/useJac';
import { useMoodStorage } from '../hooks/useStorage';
import { useGamification } from '../hooks/useGamification';
import { useSpeechToText, useTextToSpeech } from '../hooks/useSpeech';
import { motion } from 'framer-motion';
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const { spawn, loading, data } = useJac('MoodLogger');
  const { saveMood } = useMoodStorage();
  const { awardPoints, currentStreak, newBadge, dismissBadge } = useGamification();
  
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
    
    const moodText = note.trim();
    const result = await spawn({
      user_id: userContext.userId,
      mood_text: moodText || `Feeling ${selectedMood.name}`,
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
      
      // Award points for mood check-in
      const reward = await awardPoints('MOOD_CHECKIN');
      setPointsEarned(reward.pointsEarned);
      
      // Save to Supabase for logged-in users
      saveMood({
        emotion: selectedMood.name,
        emoji: selectedMood.emoji,
        intensity: 7,
        note: entry.note,
        ai_response: result.response || ''
      });
      
      setNote('');
      
      // Clear points display after 3 seconds
      setTimeout(() => setPointsEarned(null), 3000);
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
    return new Intl.DateTimeFormat('en', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit' 
    }).format(date);
  };

  const shouldShowJournalButton = data?.response && 
    (data.response.toLowerCase().includes('journal') || 
     data.response.toLowerCase().includes('write') ||
     data.response.toLowerCase().includes('express'));

  return (
    <div className="mood-wheel-section">
      {/* Mood Input Card */}
      <motion.div 
        className="card mood-input-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-header">
          <h2>How are you feeling?</h2>
          <p className="subtitle">Select your mood to begin</p>
        </div>
        
        <motion.div 
          className="mood-grid"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {MOODS.map((mood) => (
            <motion.div
              key={mood.name}
              variants={item}
            >
              <button
                className={`mood-bubble ${selectedMood?.name === mood.name ? 'selected' : ''}`}
                onClick={() => handleMoodClick(mood)}
                style={{ 
                  '--mood-color': mood.color,
                  '--mood-glow': `${mood.color}40`,
                  borderColor: selectedMood?.name === mood.name ? mood.color : 'transparent'
                } as React.CSSProperties}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-label">{mood.name}</span>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Note Input - Always visible */}
        <div className="note-input-wrapper" style={{ marginTop: 'var(--space-4)' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isListening ? "🎤 Listening... speak now" : selectedMood ? `Why are you feeling ${selectedMood.name}? (optional)` : "What's on your mind? (optional)"}
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

        {/* Log Mood Button - Always visible */}
        <button 
          className="primary-btn log-btn" 
          onClick={handleLog} 
          disabled={!selectedMood || loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner"></span> Connecting...
            </span>
          ) : (
            <>
              <span>✨</span> {selectedMood ? 'Check In' : 'Select a Mood First'}
            </>
          )}
        </button>

        {/* Success message with points */}
        {showSuccess && !data && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="success-toast"
          >
            ✓ Mood logged! Generating insight...
          </motion.div>
        )}
        
        {/* Points Earned Toast */}
        {pointsEarned && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="points-toast"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              marginTop: '0.5rem',
              fontWeight: 600,
            }}
          >
            <span>🎉</span>
            <span>+{pointsEarned} points!</span>
            {currentStreak > 1 && <span style={{ opacity: 0.9 }}>🔥 {currentStreak} day streak!</span>}
          </motion.div>
        )}

        {/* Badge Notification */}
        {newBadge && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={dismissBadge}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              marginTop: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{newBadge.icon}</span>
            <span>Badge Unlocked: {newBadge.name}!</span>
          </motion.div>
        )}


        {/* Mood History Strip */}
        {moodHistory.length > 0 && (
          <div className="mood-history">
            <h3>Recent Check-ins</h3>
            <div className="history-strip">
              {moodHistory.slice(0, 6).map((entry, i) => (
                <motion.button 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="history-item"
                  style={{ '--mood-color': entry.emotion.color } as React.CSSProperties}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <span className="history-emoji">{entry.emotion.emoji}</span>
                  <span className="history-time">{formatTime(entry.timestamp)}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* AI Response Modal */}
      {showAIModal && data && createPortal(
        <motion.div 
          className="modal-overlay" 
          onClick={() => setShowAIModal(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div 
            className="ai-response-modal" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
          >
            <button className="modal-close" onClick={() => setShowAIModal(false)}>×</button>
            
            <div className="modal-header ai-modal-header">
              <div className="ai-avatar-large">🧠</div>
              <div>
                <h2>SerenityAI</h2>
                <p className="ai-subtitle">Your wellness companion</p>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="ai-message">
                {/* Typewriter-like effect for text split by sentences if needed, simpler for now */}
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
          </motion.div>
        </motion.div>,
        document.body
      )}

      {/* History Detail Modal */}
      {selectedEntry && createPortal(
        <motion.div 
          className="modal-overlay" 
          onClick={() => setSelectedEntry(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div 
            className="mood-detail-modal" 
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
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
                  <h4>✨ AI Response</h4>
                  <p>{selectedEntry.aiResponse}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </div>
  );
};

export default MoodWheel;
