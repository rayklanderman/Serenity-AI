import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useJac } from '../hooks/useJac';
import { useMoodStorage } from '../hooks/useStorage';
import { useGamification, BADGES } from '../hooks/useGamification';
import { useNotifications } from '../hooks/useNotifications';
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

// Smart loading messages that rotate during AI response generation
const LOADING_MESSAGES = [
  { emoji: '🧠', text: 'Personalizing your wellness insight...' },
  { emoji: '✨', text: 'Analyzing your emotional patterns...' },
  { emoji: '💭', text: 'Crafting a thoughtful response just for you...' },
  { emoji: '🌱', text: 'Your mental health journey matters...' },
  { emoji: '💫', text: 'Almost there! Creating your personalized guidance...' },
  { emoji: '🌈', text: 'Take a deep breath while we prepare your insight...' },
  { emoji: '💜', text: 'Every check-in is a step toward wellness...' },
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
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const { spawn, loading, data } = useJac('MoodLogger');
  const { saveMood } = useMoodStorage();
  const { awardPoints, currentStreak, newBadge, dismissBadge } = useGamification();
  const { notify } = useNotifications();
  
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

  // Rotate loading messages every 2.5 seconds while loading
  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

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
      
      // Create in-app notification for points
      notify.achievement(
        `+${reward.pointsEarned} Points Earned!`,
        `Great job checking in! ${reward.currentStreak > 1 ? `🔥 ${reward.currentStreak}-day streak!` : 'Keep it up!'}`
      );
      
      // Notify for new badges
      if (reward.newBadges.length > 0) {
        const badge = BADGES.find(b => b.id === reward.newBadges[0]);
        if (badge) {
          notify.achievement(
            `${badge.icon} Badge Unlocked!`,
            `You earned the "${badge.name}" badge!`
          );
        }
      }
      
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

  // Mood-specific journal button text
  const getJournalButtonText = () => {
    const mood = selectedMood?.name || data?.emotion?.name || 'neutral';
    const buttonTexts: Record<string, { emoji: string; text: string }> = {
      'happy': { emoji: '✨', text: 'Capture This Joy' },
      'calm': { emoji: '🌿', text: 'Reflect & Ground' },
      'neutral': { emoji: '📝', text: 'Start Journaling' },
      'anxious': { emoji: '💭', text: 'Write It Out' },
      'sad': { emoji: '💜', text: 'Express Your Heart' },
      'angry': { emoji: '🔥', text: 'Take a Load Off' }
    };
    return buttonTexts[mood] || buttonTexts['neutral'];
  };

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
              <span className="spinner"></span> Creating your insight...
            </span>
          ) : (
            <>
              <span>✨</span> {selectedMood ? 'Check In' : 'Select a Mood First'}
            </>
          )}
        </button>

        {/* Smart Loading Overlay */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="loading-overlay-card"
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-6)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              textAlign: 'center',
            }}
          >
            {/* Pulsing emoji */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}
            >
              {LOADING_MESSAGES[loadingMessageIndex].emoji}
            </motion.div>
            
            {/* Rotating message */}
            <motion.p
              key={loadingMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                fontSize: '1.1rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {LOADING_MESSAGES[loadingMessageIndex].text}
            </motion.p>
            
            {/* Animated dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                  }}
                />
              ))}
            </div>
            
            {/* Wellness tip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                marginTop: 'var(--space-4)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}
            >
              💡 Tip: Taking a deep breath can help reduce stress in seconds!
            </motion.p>
          </motion.div>
        )}

        {/* Success message with points */}
        {showSuccess && !data && !loading && (
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
              
              {/* Points Earned Badge - Shows in modal */}
              {pointsEarned && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginLeft: 'auto',
                  }}
                >
                  🎉 +{pointsEarned} pts
                  {currentStreak > 1 && <span>🔥{currentStreak}</span>}
                </motion.div>
              )}
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
                
                {onNavigateToJournal && (
                  <button 
                    className="action-btn primary"
                    onClick={() => {
                      setShowAIModal(false);
                      onNavigateToJournal();
                    }}
                  >
                    {getJournalButtonText().emoji} {getJournalButtonText().text}
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
