import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '../hooks/useGamification';

interface PointsDisplayProps {
  compact?: boolean;
  showBadges?: boolean;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ compact = false, showBadges = true }) => {
  const {
    points,
    level,
    pointsToNextLevel,
    levelProgress,
    currentStreak,
    newBadge,
    dismissBadge,
    getUnlockedBadges,
    getLockedBadges,
  } = useGamification();

  if (compact) {
    return (
      <div className="points-compact" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
        borderRadius: 'var(--radius-full)',
        color: 'white',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}>
        <span>⭐</span>
        <span>{points} pts</span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span>Lv {level}</span>
        {currentStreak > 1 && (
          <>
            <span style={{ opacity: 0.7 }}>|</span>
            <span>🔥 {currentStreak}</span>
          </>
        )}
      </div>
    );
  }

  const unlockedBadges = getUnlockedBadges();
  const lockedBadges = getLockedBadges();

  return (
    <div className="points-display card" style={{ padding: '1.5rem' }}>
      {/* New Badge Notification */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            className="badge-notification"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            onClick={dismissBadge}
            style={{
              position: 'fixed',
              top: '5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 40px rgba(251, 191, 36, 0.4)',
              zIndex: 1000,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{newBadge.icon}</div>
            <div style={{ fontWeight: 700 }}>Badge Unlocked!</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{newBadge.name}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>🎮 Progress</h3>
        {currentStreak > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            🔥 {currentStreak} day streak!
          </div>
        )}
      </div>

      {/* Level & Points */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          boxShadow: '0 8px 24px rgba(129, 140, 248, 0.4)',
        }}>
          Lv {level}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
          {points} Points
        </div>
        
        {/* Progress to next level */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{
            height: '8px',
            background: 'var(--gray-200)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '0.25rem',
          }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--accent-teal))',
                borderRadius: '4px',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            {pointsToNextLevel} pts to Level {level + 1}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {showBadges && (
        <div>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>Achievements</h4>
          
          {/* Unlocked Badges */}
          {unlockedBadges.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem', 
              marginBottom: '1rem' 
            }}>
              {unlockedBadges.map(badge => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.1 }}
                  title={`${badge.name}: ${badge.description}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
                  }}
                >
                  {badge.icon}
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Locked Badges Preview */}
          {lockedBadges.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem' 
            }}>
              {lockedBadges.slice(0, 4).map(badge => (
                <div
                  key={badge.id}
                  title={`${badge.name}: ${badge.description} (${Math.round(badge.progress)}%)`}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    background: 'var(--gray-100)',
                    borderRadius: '50%',
                    opacity: 0.4,
                    filter: 'grayscale(1)',
                    position: 'relative',
                  }}
                >
                  {badge.icon}
                  {/* Progress indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30px',
                    height: '3px',
                    background: 'var(--gray-200)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${badge.progress}%`,
                      height: '100%',
                      background: 'var(--primary)',
                    }} />
                  </div>
                </div>
              ))}
              {lockedBadges.length > 4 && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'var(--gray-100)',
                  borderRadius: '50%',
                  color: 'var(--gray-500)',
                }}>
                  +{lockedBadges.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointsDisplay;
