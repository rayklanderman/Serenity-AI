import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useJac } from '../hooks/useJac';
import { useJournalStorage } from '../hooks/useStorage';
import { useGamification, BADGES } from '../hooks/useGamification';
import { useNotifications } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserContext, Emotion } from '../types';
import type { JournalEntryData } from '../App';

interface JournalEntryProps {
  userContext: UserContext;
  currentMood?: Emotion | null;
  entries: JournalEntryData[];
  onEntrySaved: (entry: JournalEntryData) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ userContext, currentMood, entries, onEntrySaved }) => {
  const [content, setContent] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [latestInsight, setLatestInsight] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const { spawn, loading } = useJac('JournalSaver');
  const { saveEntry } = useJournalStorage();
  const { awardPoints } = useGamification();
  const { notify } = useNotifications();

  const handleSave = async () => {
    if (!content.trim()) return;
    
    const moodBefore = currentMood?.name === 'happy' ? 8 :
                       currentMood?.name === 'calm' ? 7 :
                       currentMood?.name === 'neutral' ? 5 :
                       currentMood?.name === 'anxious' ? 3 :
                       currentMood?.name === 'sad' ? 2 : 
                       currentMood?.name === 'angry' ? 2 : 5;
    
    const result = await spawn({
      user_id: userContext.userId,
      content,
      mood_before: moodBefore
    });

    if (result) {
      setLatestInsight(result.response);
      setShowAIModal(true); // Show popup modal
      
      onEntrySaved({
        content,
        timestamp: new Date(),
        aiInsight: result.response,
        moodChange: result.mood_change || 0
      });
      
      // Save to Supabase for logged-in users
      saveEntry({
        content,
        mood_before: currentMood?.name,
        mood_before_intensity: moodBefore,
        ai_insight: result.response,
        mood_change: result.mood_change || 0
      });
      
      // Award points for journal entry
      const reward = await awardPoints('JOURNAL_ENTRY');
      setPointsEarned(reward.pointsEarned);
      
      // Create in-app notification
      notify.achievement(
        `+${reward.pointsEarned} Points Earned!`,
        'Great job journaling your thoughts!'
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
      
      setContent('');
      
      // Clear points display after modal closes
      setTimeout(() => setPointsEarned(null), 5000);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getMoodChangeInfo = (change: number) => {
    if (change > 0) return { emoji: '📈', text: 'Mood lifted', color: '#22c55e' };
    if (change < 0) return { emoji: '📉', text: 'Processing emotions', color: '#f59e0b' };
    return { emoji: '➡️', text: 'Steady state', color: '#6b7280' };
  };

  // Dynamic mood-aware journal prompts
  const getMoodPlaceholder = () => {
    if (!currentMood) {
      return "How was your day? What's on your mind?";
    }
    
    const prompts: Record<string, string> = {
      happy: "What made today special? Capture this joyful moment...",
      calm: "Reflect on your peaceful state. What's bringing you balance?",
      anxious: "Let's work through these feelings together. What's on your mind?",
      sad: "It's okay to express this. What would you like to share?",
      angry: "Write it out. What's causing this frustration?",
      neutral: "What's been on your mind today?"
    };
    
    return prompts[currentMood.name] || prompts.neutral;
  };

  // Get mood-specific encouragement for the modal
  const getModalTitle = () => {
    const mood = currentMood?.name || 'neutral';
    const titles: Record<string, string> = {
      happy: '✨ Beautiful Reflection',
      calm: '🌿 Thoughtful Entry',
      neutral: '📝 Entry Saved',
      anxious: '💭 Brave Expression',
      sad: '💜 Heartfelt Words',
      angry: '🔥 Powerful Release'
    };
    return titles[mood] || titles.neutral;
  };

  return (
    <div className="journal-layout">
      {/* LEFT SIDE: Input Section */}
      <motion.div 
        className="card journal-input-card"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2>📝 Journal Entry</h2>
        {currentMood && (
          <div 
            className="mood-indicator"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: `${currentMood.color}15`,
              border: `1px solid ${currentMood.color}40`,
              marginBottom: '1rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{currentMood.emoji}</span>
            <span style={{ color: currentMood.color, fontWeight: 500, textTransform: 'capitalize' }}>
              Feeling {currentMood.name}
            </span>
          </div>
        )}
        <p className="subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Write your thoughts freely. SerenityAI is here to listen.
        </p>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={getMoodPlaceholder()}
          rows={10}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border)',
            fontSize: '1rem',
            lineHeight: 1.6,
            resize: 'vertical',
            transition: 'border-color 0.2s',
          }}
        />
        
        <button 
          className="primary-btn" 
          onClick={handleSave} 
          disabled={loading || !content.trim()}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
              Analyzing your thoughts...
            </span>
          ) : (
            '💾 Save & Get AI Insight'
          )}
        </button>
      </motion.div>

      {/* RIGHT SIDE: Entries List */}
      <motion.div 
        className="card journal-entries-card"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span>📚</span> Your Entries 
          <span style={{ 
            background: 'var(--accent)', 
            color: 'white', 
            padding: '0.2rem 0.6rem', 
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {entries.length}
          </span>
        </h3>
        
        {entries.length > 0 ? (
          <div className="entries-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {entries.map((entry, i) => {
              const moodInfo = getMoodChangeInfo(entry.moodChange);
              const isExpanded = expandedIndex === i;
              
              return (
                <motion.div 
                  key={i} 
                  className="journal-entry-card"
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: isExpanded 
                      ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.08), rgba(167, 139, 250, 0.05))' 
                      : 'var(--card-bg)',
                    border: isExpanded ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Entry Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--text-secondary)',
                      fontWeight: 500
                    }}>
                      {formatDate(entry.timestamp)}
                    </span>
                    <span style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      color: moodInfo.color,
                      background: `${moodInfo.color}15`,
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {moodInfo.emoji} {moodInfo.text}
                    </span>
                  </div>
                  
                  {/* Entry Content */}
                  <p style={{ 
                    margin: 0,
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}>
                    {isExpanded ? entry.content : entry.content.slice(0, 120) + (entry.content.length > 120 ? '...' : '')}
                  </p>
                  
                  {/* Expanded AI Insight */}
                  <AnimatePresence>
                    {isExpanded && entry.aiInsight && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: '1px dashed var(--border)'
                        }}
                      >
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>🧠</span>
                            <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>AI Insight</strong>
                          </div>
                          <p style={{ 
                            margin: 0, 
                            color: 'var(--text-primary)', 
                            lineHeight: 1.6,
                            fontSize: '0.9rem'
                          }}>
                            {entry.aiInsight}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Expand hint */}
                  {!isExpanded && entry.aiInsight && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      fontSize: '0.8rem', 
                      color: 'var(--primary)',
                      opacity: 0.8
                    }}>
                      🧠 Click to see AI insight →
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📖</span>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 500 }}>No entries yet</p>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Start journaling to see your thoughts here!
            </p>
          </div>
        )}
      </motion.div>

      {/* AI Insight Popup Modal */}
      {showAIModal && latestInsight && createPortal(
        <motion.div 
          className="modal-overlay" 
          onClick={() => setShowAIModal(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ 
            zIndex: 9999, 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <motion.div 
            className="ai-response-modal" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            style={{
              background: 'var(--card-bg)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border)'
            }}
          >
            <button 
              className="modal-close" 
              onClick={() => setShowAIModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '0.5rem'
              }}
            >
              ×
            </button>
            
            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
              >
                🧠
              </motion.div>
              <h2 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                {getModalTitle()}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                SerenityAI's response to your journal
              </p>
              
              {/* Points Badge */}
              {pointsEarned && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginTop: '1rem'
                  }}
                >
                  🎉 +{pointsEarned} points earned!
                </motion.div>
              )}
            </div>
            
            {/* AI Message */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(167, 139, 250, 0.08))',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ 
                margin: 0, 
                lineHeight: 1.7, 
                color: 'var(--text-primary)',
                fontSize: '1.05rem'
              }}>
                {latestInsight}
              </p>
            </div>
            
            {/* Action Button */}
            <button 
              className="primary-btn" 
              onClick={() => setShowAIModal(false)}
              style={{ width: '100%' }}
            >
              ✨ Continue Journaling
            </button>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </div>
  );
};

export default JournalEntry;
