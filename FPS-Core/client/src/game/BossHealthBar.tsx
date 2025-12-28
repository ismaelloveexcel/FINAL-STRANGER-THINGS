import React, { useEffect, useState } from 'react';
import { useGameStore } from './store';

/**
 * BossHealthBar Component - Dramatic Boss Health Display
 *
 * Features:
 * - Segmented health bar showing damage phases
 * - Pulsing animation that intensifies as health decreases
 * - Dynamic color changes (green → yellow → red)
 * - Boss name display with dramatic styling
 * - Only shows during boss fights (Level 3 - Vecna)
 * - Smooth health transitions
 * - Mobile-optimized layout
 */

export default function BossHealthBar() {
  const enemies = useGameStore(state => state.enemies);
  const currentLevel = useGameStore(state => state.currentLevel);
  const isPlaying = useGameStore(state => state.isPlaying);

  const [isMobile, setIsMobile] = useState(false);
  const [prevHealth, setPrevHealth] = useState(100);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find boss enemy (Vecna)
  const boss = enemies.find(e => e.type === 'vecna');

  // Update previous health for animation
  useEffect(() => {
    if (boss) {
      setPrevHealth((boss.health / boss.maxHealth) * 100);
    }
  }, [boss?.health]);

  // Only show for boss level and when boss exists
  if (!isPlaying || currentLevel !== 3 || !boss) {
    return null;
  }

  const healthPercent = (boss.health / boss.maxHealth) * 100;

  // Determine color based on health
  const getHealthColor = (): string => {
    if (healthPercent > 66) return '#00ff00'; // Green
    if (healthPercent > 33) return '#ffcc00'; // Yellow
    return '#ff0000'; // Red
  };

  const getHealthGlow = (): string => {
    if (healthPercent > 66) return 'rgba(0, 255, 0, 0.5)';
    if (healthPercent > 33) return 'rgba(255, 200, 0, 0.5)';
    return 'rgba(255, 0, 0, 0.8)';
  };

  // Determine boss phase
  const getBossPhase = (): number => {
    if (healthPercent > 66) return 1;
    if (healthPercent > 33) return 2;
    return 3;
  };

  const phase = getBossPhase();

  // Pulse intensity increases as health decreases
  const pulseSpeed = 1 + (1 - healthPercent / 100) * 2;

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '60px' : '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobile ? '90%' : '600px',
        zIndex: 150,
        pointerEvents: 'none'
      }}
    >
      {/* Boss Name */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: 'bold',
          color: getHealthColor(),
          textShadow: `0 0 20px ${getHealthGlow()}, 2px 2px 4px black`,
          animation: `pulse ${2 / pulseSpeed}s ease-in-out infinite`,
          letterSpacing: '3px'
        }}
      >
        VECNA
      </div>

      {/* Phase Indicator */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '8px',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px black',
          opacity: 0.9
        }}
      >
        PHASE {phase} / 3
      </div>

      {/* Main Health Bar Container */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: isMobile ? '12px' : '16px',
          borderRadius: '15px',
          border: `3px solid ${getHealthColor()}`,
          boxShadow: `0 0 30px ${getHealthGlow()}, inset 0 0 20px rgba(0, 0, 0, 0.5)`,
          backdropFilter: 'blur(10px)',
          animation: `borderPulse ${2 / pulseSpeed}s ease-in-out infinite`
        }}
      >
        {/* Segmented Health Bar */}
        <div
          style={{
            position: 'relative',
            height: isMobile ? '30px' : '40px',
            backgroundColor: 'rgba(50, 50, 50, 0.8)',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Background segments (damage phases) */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex' }}>
            {[0, 1, 2].map((segment) => (
              <div
                key={segment}
                style={{
                  flex: 1,
                  borderRight: segment < 2 ? '2px solid rgba(0, 0, 0, 0.8)' : 'none',
                  backgroundColor: 'rgba(100, 100, 100, 0.3)'
                }}
              />
            ))}
          </div>

          {/* Actual health bar */}
          <div
            style={{
              position: 'absolute',
              height: '100%',
              width: `${healthPercent}%`,
              background: `linear-gradient(90deg, ${getHealthColor()}, ${getHealthColor()}dd)`,
              borderRadius: '6px',
              transition: 'width 0.5s ease-out',
              boxShadow: `0 0 20px ${getHealthGlow()}`,
              animation: `healthPulse ${2 / pulseSpeed}s ease-in-out infinite`
            }}
          >
            {/* Shine effect */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent)',
                borderRadius: '6px 6px 0 0'
              }}
            />
          </div>

          {/* Health text overlay */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '14px' : '18px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px black',
              zIndex: 10
            }}
          >
            {Math.ceil(boss.health)} / {boss.maxHealth}
          </div>
        </div>

        {/* Health percentage and phase warnings */}
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: isMobile ? '11px' : '13px',
            color: 'white',
            textShadow: '1px 1px 2px black'
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            {healthPercent.toFixed(1)}%
          </div>

          {/* Phase warnings */}
          <div
            style={{
              fontWeight: 'bold',
              color: getHealthColor(),
              animation: phase >= 2 ? `warning ${1 / pulseSpeed}s ease-in-out infinite` : 'none'
            }}
          >
            {phase === 3 && 'ENRAGED!'}
            {phase === 2 && 'STRENGTHENING!'}
            {phase === 1 && ''}
          </div>

          <div style={{ opacity: 0.8 }}>
            Phase {phase}
          </div>
        </div>

        {/* Damage indicators */}
        {healthPercent < prevHealth && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 'bold',
              color: '#ff4444',
              textShadow: '0 0 10px #ff0000',
              animation: 'damageFloat 1s ease-out',
              pointerEvents: 'none'
            }}
          >
            -{Math.ceil(boss.maxHealth * (prevHealth - healthPercent) / 100)}
          </div>
        )}
      </div>

      {/* Phase transition warning */}
      {(healthPercent <= 66.5 && healthPercent >= 65.5) && (
        <div
          style={{
            marginTop: '10px',
            textAlign: 'center',
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
            color: '#ffcc00',
            textShadow: '0 0 10px rgba(255, 200, 0, 0.8)',
            animation: 'phaseWarning 0.5s ease-in-out 3'
          }}
        >
          PHASE 2 BEGINS!
        </div>
      )}

      {(healthPercent <= 33.5 && healthPercent >= 32.5) && (
        <div
          style={{
            marginTop: '10px',
            textAlign: 'center',
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
            color: '#ff0000',
            textShadow: '0 0 10px rgba(255, 0, 0, 1)',
            animation: 'phaseWarning 0.5s ease-in-out 3'
          }}
        >
          FINAL PHASE!
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        @keyframes borderPulse {
          0%, 100% {
            box-shadow: 0 0 30px ${getHealthGlow()}, inset 0 0 20px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 50px ${getHealthGlow()}, inset 0 0 20px rgba(0, 0, 0, 0.5);
          }
        }

        @keyframes healthPulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        @keyframes warning {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes phaseWarning {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes damageFloat {
          0% {
            transform: translate(-50%, -50%) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-30px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
