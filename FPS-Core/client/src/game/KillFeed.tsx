import React, { useEffect, useState } from 'react';
import { useGameStore } from './store';

/**
 * KillFeed Component - Real-time Kill Feed UI
 *
 * Features:
 * - Shows recent kills with points earned
 * - Combo multiplier display with visual feedback
 * - Kill streak announcements (DOUBLE KILL, TRIPLE KILL, etc.)
 * - Smooth fade-out animations
 * - Mobile-optimized positioning and sizing
 * - Color-coded enemy types
 */

export default function KillFeed() {
  const killFeed = useGameStore(state => state.killFeed);
  const comboMultiplier = useGameStore(state => state.comboMultiplier);
  const killStreak = useGameStore(state => state.killStreak);
  const isPlaying = useGameStore(state => state.isPlaying);

  const [streakAnnouncement, setStreakAnnouncement] = useState<string | null>(null);
  const [lastStreakCount, setLastStreakCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle kill streak announcements
  useEffect(() => {
    if (killStreak > lastStreakCount && killStreak >= 2) {
      const announcements: Record<number, string> = {
        2: 'DOUBLE KILL!',
        3: 'TRIPLE KILL!',
        4: 'QUADRA KILL!',
        5: 'PENTA KILL!',
        6: 'MEGA KILL!',
        7: 'ULTRA KILL!',
        8: 'MONSTER KILL!',
        10: 'UNSTOPPABLE!',
        15: 'GODLIKE!',
        20: 'LEGENDARY!'
      };

      // Find the appropriate announcement
      const streakMilestones = Object.keys(announcements)
        .map(Number)
        .sort((a, b) => b - a);

      for (const milestone of streakMilestones) {
        if (killStreak >= milestone) {
          setStreakAnnouncement(announcements[milestone]);
          setTimeout(() => setStreakAnnouncement(null), 2000);
          break;
        }
      }
    }
    setLastStreakCount(killStreak);
  }, [killStreak, lastStreakCount]);

  if (!isPlaying) return null;

  const getEnemyColor = (type: string): string => {
    switch (type) {
      case 'demogorgon':
        return '#ff6644';
      case 'mindFlayer':
        return '#aa44ff';
      case 'vecna':
        return '#ff0044';
      default:
        return '#ffffff';
    }
  };

  const getEnemyName = (type: string): string => {
    switch (type) {
      case 'demogorgon':
        return 'Demogorgon';
      case 'mindFlayer':
        return 'Mind Flayer';
      case 'vecna':
        return 'Vecna';
      default:
        return 'Enemy';
    }
  };

  const getEnemyIcon = (type: string): string => {
    switch (type) {
      case 'demogorgon':
        return '👹';
      case 'mindFlayer':
        return '🐙';
      case 'vecna':
        return '💀';
      default:
        return '❌';
    }
  };

  return (
    <>
      {/* Kill Feed Container */}
      <div
        style={{
          position: 'fixed',
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 100,
          pointerEvents: 'none',
          width: isMobile ? '200px' : '280px'
        }}
      >
        {/* Combo Multiplier Display */}
        {comboMultiplier > 1 && (
          <div
            style={{
              backgroundColor: 'rgba(255, 100, 100, 0.9)',
              padding: isMobile ? '8px 12px' : '10px 16px',
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              color: 'white',
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 'bold',
              textAlign: 'center',
              boxShadow: '0 0 20px rgba(255, 100, 100, 0.8)',
              animation: 'pulse 1s infinite',
              backdropFilter: 'blur(5px)'
            }}
          >
            <div style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.9 }}>
              COMBO
            </div>
            <div style={{ fontSize: isMobile ? '24px' : '32px', lineHeight: 1 }}>
              x{comboMultiplier.toFixed(1)}
            </div>
          </div>
        )}

        {/* Kill Feed Entries */}
        {killFeed.map((entry, index) => {
          const age = Date.now() - entry.timestamp;
          const opacity = Math.max(0, 1 - age / 3000); // Fade out over 3 seconds

          return (
            <div
              key={entry.id}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: isMobile ? '8px 10px' : '10px 12px',
                borderRadius: '8px',
                border: `2px solid ${getEnemyColor(entry.enemyType)}`,
                color: 'white',
                fontSize: isMobile ? '12px' : '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                opacity,
                transform: `translateX(${(1 - opacity) * 20}px)`,
                transition: 'all 0.3s ease',
                boxShadow: `0 0 10px ${getEnemyColor(entry.enemyType)}40`,
                backdropFilter: 'blur(5px)',
                animation: index === 0 ? 'slideIn 0.3s ease' : 'none'
              }}
            >
              {/* Enemy Icon and Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={{ fontSize: isMobile ? '16px' : '20px' }}>
                  {getEnemyIcon(entry.enemyType)}
                </span>
                <span
                  style={{
                    color: getEnemyColor(entry.enemyType),
                    fontWeight: 'bold',
                    fontSize: isMobile ? '11px' : '13px'
                  }}
                >
                  {getEnemyName(entry.enemyType)}
                </span>
              </div>

              {/* Points */}
              <div
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: 'bold',
                  color: '#ffcc00'
                }}
              >
                +{entry.points}
              </div>

              {/* Combo indicator */}
              {entry.combo > 1 && (
                <div
                  style={{
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: 'bold',
                    color: '#ff4444',
                    backgroundColor: 'rgba(255, 100, 100, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  x{entry.combo.toFixed(1)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kill Streak Announcement */}
      {streakAnnouncement && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: isMobile ? '36px' : '64px',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(255, 100, 100, 1), 2px 2px 4px black',
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'streakPop 2s ease-out',
            background: 'linear-gradient(45deg, #ff4444, #ff00ff, #4444ff, #ff4444)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {streakAnnouncement}
        </div>
      )}

      {/* Kill Streak Counter */}
      {killStreak > 0 && (
        <div
          style={{
            position: 'fixed',
            top: isMobile ? '10px' : '20px',
            left: isMobile ? '10px' : '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: isMobile ? '8px 12px' : '12px 16px',
            borderRadius: '10px',
            border: '2px solid rgba(255, 200, 0, 0.8)',
            color: 'white',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'bold',
            zIndex: 100,
            backdropFilter: 'blur(5px)',
            boxShadow: '0 0 15px rgba(255, 200, 0, 0.5)'
          }}
        >
          <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.8, marginBottom: '2px' }}>
            KILL STREAK
          </div>
          <div style={{ fontSize: isMobile ? '20px' : '28px', color: '#ffcc00', lineHeight: 1 }}>
            {killStreak}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 100, 100, 0.8);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(255, 100, 100, 1);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes streakPop {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          10% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          20% {
            transform: translate(-50%, -50%) scale(1);
          }
          80% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
}
