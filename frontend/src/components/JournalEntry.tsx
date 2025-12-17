import React, { useState } from 'react';
import { useJac } from '../hooks/useJac';
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [latestInsight, setLatestInsight] = useState<string | null>(null);
  const { spawn, loading, data } = useJac('JournalSaver');

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
      onEntrySaved({
        content,
        timestamp: new Date(),
        aiInsight: result.response,
        moodChange: result.mood_change || 0
      });
      setContent('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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

  const getMoodChangeIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
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
          <p className="mood-indicator">
            Currently feeling: <span style={{ color: currentMood.color }}>{currentMood.emoji} {currentMood.name}</span>
          </p>
        )}
        <p className="subtitle">Write your thoughts freely. SerenityAI is here to listen.</p>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was your day? What's on your mind?"
          rows={10}
        />
        
        <button className="primary-btn" onClick={handleSave} disabled={loading || !content.trim()}>
          {loading ? '✨ Analyzing...' : '💾 Save Entry'}
        </button>

        {saveSuccess && (
          <motion.div 
            className="save-success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✅ Entry saved! Check the AI insight on the right →
          </motion.div>
        )}
      </motion.div>

      {/* RIGHT SIDE: AI Insight + Entries List */}
      <motion.div 
        className="card journal-entries-card"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* AI Insight - Appears at TOP of right column after saving */}
        <AnimatePresence>
          {(latestInsight || data?.response) && (
            <motion.div 
              className="ai-insight-banner"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%)',
                borderLeft: '4px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: '1.5rem' }}>🧘</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 var(--space-2) 0', color: 'var(--primary)', fontSize: '0.9rem' }}>
                    ✨ AI Insight
                  </h4>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--gray-700)', fontSize: '0.95rem' }}>
                    {latestInsight || data?.response}
                  </p>
                </div>
                <button 
                  onClick={() => setLatestInsight(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--gray-400)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0'
                  }}
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <h3>📚 Your Entries ({entries.length})</h3>
        
        {entries.length > 0 ? (
          <div className="entries-list">
            {entries.map((entry, i) => (
              <motion.div 
                key={i} 
                className={`entry-item ${expandedIndex === i ? 'expanded' : ''}`}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="entry-header">
                  <span className="entry-date">{formatDate(entry.timestamp)}</span>
                  <span className="mood-change">{getMoodChangeIcon(entry.moodChange)}</span>
                </div>
                <p className="entry-preview">
                  {expandedIndex === i ? entry.content : entry.content.slice(0, 80) + (entry.content.length > 80 ? '...' : '')}
                </p>
                <AnimatePresence>
                  {expandedIndex === i && entry.aiInsight && (
                    <motion.div 
                      className="entry-insight"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <strong>🤖 AI Insight:</strong>
                      <p>{entry.aiInsight}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📖</span>
            <p>No entries yet</p>
            <p className="empty-hint">Start journaling to see your thoughts here!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JournalEntry;

