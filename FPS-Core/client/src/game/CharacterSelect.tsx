import React, { useState, useEffect } from 'react';
import { useGameStore, CHARACTER_CONFIGS, CharacterType } from './store';

/**
 * CharacterSelect Component - Character Selection System
 *
 * Features:
 * - 7 characters with unique stats and abilities
 * - Character stats display (health, speed, damage bonuses)
 * - Unlock requirements based on score thresholds
 * - Character abilities preview
 * - Visual unlock animations
 * - Uses CHARACTER_CONFIGS from store
 * - Mobile-optimized interface
 */

export default function CharacterSelect() {
  const selectedCharacter = useGameStore(state => state.selectedCharacter);
  const unlockedCharacters = useGameStore(state => state.unlockedCharacters);
  const totalScore = useGameStore(state => state.totalScore);
  const selectCharacter = useGameStore(state => state.selectCharacter);
  const unlockCharacter = useGameStore(state => state.unlockCharacter);
  const isPlaying = useGameStore(state => state.isPlaying);

  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [hoveredCharacter, setHoveredCharacter] = useState<CharacterType | null>(null);
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

  // Auto-unlock characters when score threshold is reached
  useEffect(() => {
    Object.values(CHARACTER_CONFIGS).forEach(char => {
      if (
        !unlockedCharacters.includes(char.type) &&
        totalScore >= char.unlockScore
      ) {
        unlockCharacter(char.type);
      }
    });
  }, [totalScore, unlockedCharacters, unlockCharacter]);

  const handleCharacterSelect = (character: CharacterType) => {
    if (unlockedCharacters.includes(character)) {
      selectCharacter(character);
      if (isMobile) {
        setShowCharacterSelect(false);
      }
    }
  };

  const getCharacterIcon = (character: CharacterType): string => {
    switch (character) {
      case 'default':
        return '👤';
      case 'eleven':
        return '👧';
      case 'hopper':
        return '👮';
      case 'steve':
        return '⚾';
      case 'dustin':
        return '🎩';
      case 'nancy':
        return '🔫';
      case 'max':
        return '🛹';
      default:
        return '❓';
    }
  };

  const getStatColor = (value: number): string => {
    if (value > 0) return '#00ff00';
    if (value < 0) return '#ff0000';
    return '#ffffff';
  };

  const renderStatBar = (label: string, value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    const color = value >= max * 0.7 ? '#00ff00' : value >= max * 0.4 ? '#ffcc00' : '#ff6600';

    return (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
          <span>{label}</span>
          <span style={{ color }}>{value}</span>
        </div>
        <div
          style={{
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    );
  };

  // Don't show during gameplay unless explicitly opened
  if (isPlaying && !showCharacterSelect) {
    return (
      <button
        onClick={() => setShowCharacterSelect(true)}
        style={{
          position: 'fixed',
          top: isMobile ? '10px' : '20px',
          left: isMobile ? '10px' : '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: isMobile ? '50px' : '60px',
          height: isMobile ? '50px' : '60px',
          fontSize: isMobile ? '24px' : '28px',
          cursor: 'pointer',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {getCharacterIcon(selectedCharacter)}
      </button>
    );
  }

  if (!showCharacterSelect && isPlaying) return null;

  return (
    <>
      {/* Character Select Button (when not playing) */}
      {!isPlaying && !showCharacterSelect && (
        <button
          onClick={() => setShowCharacterSelect(true)}
          style={{
            position: 'fixed',
            top: isMobile ? '20px' : '30px',
            right: isMobile ? '20px' : '30px',
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
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(100, 50, 200, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(100, 50, 200, 0.5)';
          }}
        >
          {getCharacterIcon(selectedCharacter)}
          <span>Select Character</span>
        </button>
      )}

      {/* Character Selection Screen */}
      {showCharacterSelect && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1001,
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
              marginBottom: isMobile ? '10px' : '20px',
              textShadow: '0 0 20px rgba(255, 100, 100, 0.8)',
              textAlign: 'center'
            }}
          >
            SELECT YOUR CHARACTER
          </h1>

          {/* Total Score Display */}
          <div
            style={{
              color: '#ffcc00',
              fontSize: isMobile ? '14px' : '18px',
              fontWeight: 'bold',
              marginBottom: isMobile ? '20px' : '30px',
              textShadow: '0 0 10px rgba(255, 200, 0, 0.5)'
            }}
          >
            Total Score: {totalScore.toLocaleString()}
          </div>

          {/* Character Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? '12px' : '20px',
              maxWidth: '1000px',
              width: '100%',
              marginBottom: '30px'
            }}
          >
            {Object.values(CHARACTER_CONFIGS).map((char) => {
              const isUnlocked = unlockedCharacters.includes(char.type);
              const isSelected = selectedCharacter === char.type;
              const isHovered = hoveredCharacter === char.type;
              const canAfford = totalScore >= char.unlockScore;

              return (
                <div
                  key={char.type}
                  onClick={() => handleCharacterSelect(char.type)}
                  onMouseEnter={() => setHoveredCharacter(char.type)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                  style={{
                    position: 'relative',
                    backgroundColor: isSelected
                      ? 'rgba(100, 50, 200, 0.5)'
                      : isUnlocked
                      ? 'rgba(50, 50, 50, 0.6)'
                      : 'rgba(30, 30, 30, 0.6)',
                    border: isSelected
                      ? '3px solid #6432c8'
                      : isUnlocked
                      ? '2px solid rgba(255, 255, 255, 0.3)'
                      : canAfford
                      ? '2px solid rgba(255, 200, 0, 0.5)'
                      : '2px solid rgba(100, 100, 100, 0.3)',
                    borderRadius: '15px',
                    padding: isMobile ? '12px' : '16px',
                    cursor: isUnlocked ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.05)' : isHovered && isUnlocked ? 'scale(1.02)' : 'scale(1)',
                    opacity: isUnlocked ? 1 : 0.6,
                    boxShadow: isSelected
                      ? '0 0 30px rgba(100, 50, 200, 0.8)'
                      : isUnlocked
                      ? '0 0 10px rgba(0, 0, 0, 0.5)'
                      : 'none',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  {/* Character Icon */}
                  <div
                    style={{
                      fontSize: isMobile ? '48px' : '64px',
                      textAlign: 'center',
                      marginBottom: '10px',
                      filter: isUnlocked ? 'none' : 'grayscale(100%)'
                    }}
                  >
                    {getCharacterIcon(char.type)}
                  </div>

                  {/* Character Name */}
                  <div
                    style={{
                      fontSize: isMobile ? '16px' : '20px',
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    {char.name}
                  </div>

                  {/* Lock Status */}
                  {!isUnlocked && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: isMobile ? '20px' : '24px'
                      }}
                    >
                      🔒
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        fontSize: isMobile ? '16px' : '20px',
                        color: '#00ff00'
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Stats (if unlocked or hovered) */}
                  {(isUnlocked || isHovered) && (
                    <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#ccc', marginTop: '8px' }}>
                      {char.healthBonus !== 0 && (
                        <div style={{ color: getStatColor(char.healthBonus) }}>
                          ❤️ Health: {char.healthBonus > 0 ? '+' : ''}{char.healthBonus}
                        </div>
                      )}
                      {char.speedBonus !== 0 && (
                        <div style={{ color: getStatColor(char.speedBonus) }}>
                          ⚡ Speed: {char.speedBonus > 0 ? '+' : ''}{(char.speedBonus * 100).toFixed(0)}%
                        </div>
                      )}
                      {char.damageBonus !== 0 && (
                        <div style={{ color: getStatColor(char.damageBonus) }}>
                          💥 Damage: {char.damageBonus > 0 ? '+' : ''}{(char.damageBonus * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Special Ability */}
                  <div
                    style={{
                      fontSize: isMobile ? '9px' : '11px',
                      color: '#6432c8',
                      marginTop: '8px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}
                  >
                    {char.specialAbility}
                  </div>

                  {/* Unlock Requirement */}
                  {!isUnlocked && (
                    <div
                      style={{
                        fontSize: isMobile ? '10px' : '11px',
                        color: canAfford ? '#ffcc00' : '#ff6600',
                        marginTop: '8px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      Unlock: {char.unlockScore.toLocaleString()} pts
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Character Details Panel (for selected/hovered) */}
          {(hoveredCharacter || selectedCharacter) && (
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(100, 50, 200, 0.8)',
                borderRadius: '15px',
                padding: isMobile ? '16px' : '24px',
                maxWidth: '500px',
                width: '100%',
                marginBottom: '20px'
              }}
            >
              {(() => {
                const char = CHARACTER_CONFIGS[hoveredCharacter || selectedCharacter];
                const baseHealth = 100;
                const baseSpeed = 5;
                const baseDamage = 50;

                return (
                  <>
                    <h3 style={{ color: 'white', marginBottom: '16px', textAlign: 'center' }}>
                      {char.name} - Stats
                    </h3>

                    {renderStatBar('Health', baseHealth + char.healthBonus, 120)}
                    {renderStatBar('Speed', baseSpeed * (1 + char.speedBonus), 8)}
                    {renderStatBar('Damage', baseDamage * (1 + char.damageBonus), 75)}

                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: 'rgba(100, 50, 200, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: isMobile ? '12px' : '14px',
                        textAlign: 'center'
                      }}
                    >
                      <strong>Special Ability:</strong>
                      <br />
                      {char.specialAbility}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => setShowCharacterSelect(false)}
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
            {isPlaying ? 'BACK TO GAME' : 'CONFIRM'}
          </button>
        </div>
      )}
    </>
  );
}
