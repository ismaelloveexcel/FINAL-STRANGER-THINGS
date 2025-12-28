import React, { useState, useEffect } from 'react';
import { useGameStore, GameMode } from './store';

/**
 * GameModes Component - Challenge Modes System
 *
 * Features:
 * - Mode selection UI with descriptions
 * - 5 modes: Survival, Speed Run, One-Hit, Boss Rush, Horde
 * - Mode-specific logic and scoring
 * - Leaderboard integration per mode
 * - Mode modifiers and special rules
 * - Mobile-friendly interface
 */

interface GameModeInfo {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  modifiers: string[];
  scoreMultiplier: number;
}

const GAME_MODES: GameModeInfo[] = [
  {
    id: 'story',
    name: 'Story Mode',
    description: 'Experience the full Stranger Things story across 3 levels',
    icon: '📖',
    difficulty: 'Medium',
    modifiers: ['Standard gameplay', 'Cutscenes enabled', 'Progressive difficulty'],
    scoreMultiplier: 1.0
  },
  {
    id: 'survival',
    name: 'Survival',
    description: 'Survive endless waves. How long can you last?',
    icon: '⏱️',
    difficulty: 'Hard',
    modifiers: ['Endless waves', 'Increasing difficulty', 'No health regeneration'],
    scoreMultiplier: 1.5
  },
  {
    id: 'speed-run',
    name: 'Speed Run',
    description: 'Complete all levels as fast as possible',
    icon: '⚡',
    difficulty: 'Medium',
    modifiers: ['Timer enabled', 'Bonus for speed', 'Reduced enemy health'],
    scoreMultiplier: 2.0
  },
  {
    id: 'one-hit',
    name: 'One-Hit Mode',
    description: 'One hit and you\'re done. Ultimate challenge!',
    icon: '💀',
    difficulty: 'Extreme',
    modifiers: ['1 HP only', 'Instant death', 'All enemies deal fatal damage'],
    scoreMultiplier: 3.0
  },
  {
    id: 'boss-rush',
    name: 'Boss Rush',
    description: 'Fight all bosses back-to-back',
    icon: '👑',
    difficulty: 'Hard',
    modifiers: ['Boss fights only', 'No breaks', 'Limited healing'],
    scoreMultiplier: 2.5
  },
  {
    id: 'horde',
    name: 'Horde Mode',
    description: 'Face massive enemy hordes',
    icon: '🌊',
    difficulty: 'Hard',
    modifiers: ['5x enemy spawn rate', 'Reduced damage', 'Power-ups disabled'],
    scoreMultiplier: 2.0
  }
];

export default function GameModes() {
  const gameMode = useGameStore(state => state.gameMode);
  const setGameMode = useGameStore(state => state.setGameMode);
  const isPlaying = useGameStore(state => state.isPlaying);
  const startGame = useGameStore(state => state.startGame);

  const [showModeSelect, setShowModeSelect] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('story');
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

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleStartGame = () => {
    setGameMode(selectedMode);
    setShowModeSelect(false);
    startGame();
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Easy':
        return '#00ff00';
      case 'Medium':
        return '#ffcc00';
      case 'Hard':
        return '#ff6600';
      case 'Extreme':
        return '#ff0000';
      default:
        return '#ffffff';
    }
  };

  // Don't show during gameplay
  if (isPlaying) {
    return <ActiveModeIndicator />;
  }

  return (
    <>
      {/* Mode Select Button */}
      {!showModeSelect && (
        <button
          onClick={() => setShowModeSelect(true)}
          style={{
            position: 'fixed',
            bottom: isMobile ? '20px' : '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(100, 50, 200, 0.9)',
            color: 'white',
            border: '2px solid rgba(150, 100, 255, 0.8)',
            borderRadius: '12px',
            padding: isMobile ? '12px 24px' : '16px 32px',
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(100, 50, 200, 0.5)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(100, 50, 200, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(100, 50, 200, 0.5)';
          }}
        >
          🎮 Select Game Mode
        </button>
      )}

      {/* Mode Selection Screen */}
      {showModeSelect && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '20px' : '40px',
            overflow: 'auto',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Title */}
          <h1
            style={{
              color: 'white',
              fontSize: isMobile ? '28px' : '42px',
              fontWeight: 'bold',
              marginBottom: isMobile ? '20px' : '30px',
              textShadow: '0 0 20px rgba(255, 100, 100, 0.8)',
              textAlign: 'center'
            }}
          >
            SELECT GAME MODE
          </h1>

          {/* Mode Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: isMobile ? '15px' : '20px',
              maxWidth: '1200px',
              width: '100%',
              marginBottom: '30px'
            }}
          >
            {GAME_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;

              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(100, 50, 200, 0.4)' : 'rgba(50, 50, 50, 0.6)',
                    border: isSelected ? '3px solid #6432c8' : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '15px',
                    padding: isMobile ? '15px' : '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 30px rgba(100, 50, 200, 0.6)' : '0 0 10px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.backgroundColor = 'rgba(70, 70, 70, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = 'rgba(50, 50, 50, 0.6)';
                    }
                  }}
                >
                  {/* Icon and Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: isMobile ? '32px' : '40px' }}>{mode.icon}</div>
                    <div>
                      <div
                        style={{
                          fontSize: isMobile ? '18px' : '22px',
                          fontWeight: 'bold',
                          color: 'white',
                          marginBottom: '4px'
                        }}
                      >
                        {mode.name}
                      </div>
                      <div
                        style={{
                          fontSize: isMobile ? '11px' : '13px',
                          fontWeight: 'bold',
                          color: getDifficultyColor(mode.difficulty),
                          textShadow: `0 0 10px ${getDifficultyColor(mode.difficulty)}80`
                        }}
                      >
                        {mode.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      color: '#ccc',
                      fontSize: isMobile ? '13px' : '14px',
                      marginBottom: '12px',
                      lineHeight: 1.5
                    }}
                  >
                    {mode.description}
                  </p>

                  {/* Modifiers */}
                  <div style={{ marginBottom: '12px' }}>
                    {mode.modifiers.map((modifier, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: isMobile ? '11px' : '12px',
                          color: '#aaa',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ color: '#6432c8' }}>▸</span>
                        {modifier}
                      </div>
                    ))}
                  </div>

                  {/* Score Multiplier */}
                  <div
                    style={{
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: 'bold',
                      color: '#ffcc00',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    Score Multiplier: x{mode.scoreMultiplier}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleStartGame}
              style={{
                backgroundColor: 'rgba(255, 100, 100, 0.9)',
                color: 'white',
                border: '2px solid rgba(255, 150, 150, 0.8)',
                borderRadius: '10px',
                padding: isMobile ? '12px 32px' : '16px 48px',
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255, 100, 100, 0.5)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 100, 100, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 100, 100, 0.5)';
              }}
            >
              START GAME
            </button>

            <button
              onClick={() => setShowModeSelect(false)}
              style={{
                backgroundColor: 'rgba(100, 100, 100, 0.7)',
                color: 'white',
                border: '2px solid rgba(150, 150, 150, 0.5)',
                borderRadius: '10px',
                padding: isMobile ? '12px 32px' : '16px 48px',
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(120, 120, 120, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(100, 100, 100, 0.7)';
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Active Mode Indicator - Shows current mode during gameplay
 */
function ActiveModeIndicator() {
  const gameMode = useGameStore(state => state.gameMode);
  const survivalWave = useGameStore(state => state.survivalWave);
  const speedRunStartTime = useGameStore(state => state.speedRunStartTime);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Update timer for speed run mode
  useEffect(() => {
    if (gameMode === 'speed-run' && speedRunStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - speedRunStartTime);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameMode, speedRunStartTime]);

  const modeInfo = GAME_MODES.find(m => m.id === gameMode);
  if (!modeInfo) return null;

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '10px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: isMobile ? '8px 16px' : '10px 20px',
        borderRadius: '10px',
        border: '2px solid rgba(100, 50, 200, 0.6)',
        color: 'white',
        fontSize: isMobile ? '12px' : '14px',
        fontWeight: 'bold',
        zIndex: 100,
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 0 15px rgba(100, 50, 200, 0.4)'
      }}
    >
      <span style={{ fontSize: isMobile ? '16px' : '20px' }}>{modeInfo.icon}</span>
      <span>{modeInfo.name}</span>

      {/* Survival wave counter */}
      {gameMode === 'survival' && (
        <span style={{ marginLeft: '10px', color: '#ffcc00' }}>
          Wave {survivalWave}
        </span>
      )}

      {/* Speed run timer */}
      {gameMode === 'speed-run' && speedRunStartTime && (
        <span style={{ marginLeft: '10px', color: '#00ffff', fontFamily: 'monospace' }}>
          {formatTime(elapsedTime)}
        </span>
      )}

      {/* One-hit indicator */}
      {gameMode === 'one-hit' && (
        <span style={{ marginLeft: '10px', color: '#ff0000' }}>
          💀 ONE HIT
        </span>
      )}
    </div>
  );
}

export { ActiveModeIndicator };
