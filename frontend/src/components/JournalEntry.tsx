import React, { useState } from 'react';
import { useJac } from '../hooks/useJac';
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
      {/* Left: Input Section */}
      <div className="card journal-input-card">
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
          rows={8}
        />
        
        <button className="primary-btn" onClick={handleSave} disabled={loading || !content.trim()}>
          {loading ? '✨ Analyzing...' : '💾 Save Entry'}
        </button>

        {saveSuccess && (
          <div className="save-success fade-in">
            ✅ Entry saved! Check your entries on the right →
          </div>
        )}

        {data && (
          <div className="analysis-result fade-in">
            <div className="ai-bubble">
              <span className="ai-icon">🤖</span>
              <div>
                <h4>AI Insight</h4>
                <p className="ai-message">{data.response}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Entries List */}
      <div className="card journal-entries-card">
        <h3>📚 Your Entries ({entries.length})</h3>
        {entries.length > 0 ? (
          <div className="entries-list">
            {entries.map((entry, i) => (
              <div 
                key={i} 
                className={`entry-item ${expandedIndex === i ? 'expanded' : ''}`}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              >
                <div className="entry-header">
                  <span className="entry-date">{formatDate(entry.timestamp)}</span>
                  <span className="mood-change">{getMoodChangeIcon(entry.moodChange)}</span>
                </div>
                <p className="entry-preview">
                  {expandedIndex === i ? entry.content : entry.content.slice(0, 60) + (entry.content.length > 60 ? '...' : '')}
                </p>
                {expandedIndex === i && entry.aiInsight && (
                  <div className="entry-insight fade-in">
                    <strong>🤖 AI Insight:</strong>
                    <p>{entry.aiInsight}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📖</span>
            <p>No entries yet</p>
            <p className="empty-hint">Start journaling to see your thoughts here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalEntry;
