/**
 * Mobile Touch Controls
 *
 * Provides:
 * - Virtual joystick for movement
 * - Touch area for camera rotation
 * - Shoot button
 * - Jump button
 */

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store';

interface JoystickData {
  x: number;
  y: number;
  active: boolean;
}

interface TouchControlsProps {
  onMove: (x: number, y: number) => void;
  onLook: (deltaX: number, deltaY: number) => void;
  onShoot: () => void;
  onJump: () => void;
}

export function MobileControls({ onMove, onLook, onShoot, onJump }: TouchControlsProps) {
  const isPlaying = useGameStore(state => state.isPlaying);
  const [joystick, setJoystick] = useState<JoystickData>({ x: 0, y: 0, active: false });
  const [isShooting, setIsShooting] = useState(false);

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const lookAreaRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  useEffect(() => {
    if (!isPlaying || !isMobile) return;

    // Joystick touch handling
    const handleJoystickTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch || !joystickBaseRef.current) return;

      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = touch.clientX - centerX;
      const deltaY = touch.clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = rect.width / 2;

      const clampedDistance = Math.min(distance, maxDistance);
      const angle = Math.atan2(deltaY, deltaX);

      const x = (Math.cos(angle) * clampedDistance) / maxDistance;
      const y = (Math.sin(angle) * clampedDistance) / maxDistance;

      setJoystick({ x, y, active: true });
      onMove(x, y);
    };

    const handleJoystickEnd = () => {
      setJoystick({ x: 0, y: 0, active: false });
      onMove(0, 0);
    };

    // Look area touch handling
    const handleLookTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;

      if (lastTouchRef.current) {
        const deltaX = touch.clientX - lastTouchRef.current.x;
        const deltaY = touch.clientY - lastTouchRef.current.y;
        onLook(deltaX * 0.5, deltaY * 0.5); // Sensitivity adjustment
      }

      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleLookEnd = () => {
      lastTouchRef.current = null;
    };

    // Add event listeners
    const joystickBase = joystickBaseRef.current;
    const lookArea = lookAreaRef.current;

    if (joystickBase) {
      joystickBase.addEventListener('touchstart', handleJoystickTouch);
      joystickBase.addEventListener('touchmove', handleJoystickTouch);
      joystickBase.addEventListener('touchend', handleJoystickEnd);
    }

    if (lookArea) {
      lookArea.addEventListener('touchstart', handleLookTouch);
      lookArea.addEventListener('touchmove', handleLookTouch);
      lookArea.addEventListener('touchend', handleLookEnd);
    }

    return () => {
      if (joystickBase) {
        joystickBase.removeEventListener('touchstart', handleJoystickTouch);
        joystickBase.removeEventListener('touchmove', handleJoystickTouch);
        joystickBase.removeEventListener('touchend', handleJoystickEnd);
      }
      if (lookArea) {
        lookArea.removeEventListener('touchstart', handleLookTouch);
        lookArea.removeEventListener('touchmove', handleLookTouch);
        lookArea.removeEventListener('touchend', handleLookEnd);
      }
    };
  }, [isPlaying, isMobile, onMove, onLook]);

  if (!isPlaying || !isMobile) return null;

  return (
    <div className="mobile-controls fixed inset-0 pointer-events-none z-40">
      {/* Look/Aim Touch Area - Right side, top half */}
      <div
        ref={lookAreaRef}
        className="absolute top-0 right-0 w-2/3 h-2/3 pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <div className="absolute top-4 right-4 text-white/30 text-xs font-mono pointer-events-none">
          SWIPE TO AIM
        </div>
      </div>

      {/* Movement Joystick - Bottom left */}
      <div
        ref={joystickBaseRef}
        className="absolute bottom-24 left-8 w-32 h-32 bg-white/10 rounded-full border-2 border-cyan-500/30 pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        {/* Joystick stick */}
        <div
          className="absolute w-16 h-16 bg-cyan-500/50 rounded-full border-2 border-cyan-400 transition-transform"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${joystick.x * 32}px, ${joystick.y * 32}px)`,
            boxShadow: joystick.active ? '0 0 20px rgba(0,255,255,0.5)' : 'none'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs font-mono pointer-events-none">
          MOVE
        </div>
      </div>

      {/* Shoot Button - Bottom right */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          setIsShooting(true);
          onShoot();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          setIsShooting(false);
        }}
        className="absolute bottom-24 right-8 w-24 h-24 bg-red-500/30 rounded-full border-4 border-red-500 pointer-events-auto active:bg-red-500/60 transition-all"
        style={{
          touchAction: 'none',
          boxShadow: isShooting ? '0 0 30px rgba(255,0,0,0.8)' : '0 0 10px rgba(255,0,0,0.3)'
        }}
      >
        <div className="text-white font-bold text-xl">🔫</div>
        <div className="text-white/70 text-xs font-mono">SHOOT</div>
      </button>

      {/* Jump Button - Bottom right, above shoot */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onJump();
        }}
        className="absolute bottom-52 right-8 w-20 h-20 bg-cyan-500/30 rounded-full border-3 border-cyan-400 pointer-events-auto active:bg-cyan-500/60 transition-all"
        style={{
          touchAction: 'none',
          boxShadow: '0 0 10px rgba(0,255,255,0.3)'
        }}
      >
        <div className="text-white font-bold text-lg">⬆️</div>
        <div className="text-white/70 text-xs font-mono">JUMP</div>
      </button>

      {/* Helper text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-300/50 text-center font-mono text-xs pointer-events-none">
        <p>Swipe right side to look around</p>
        <p className="mt-1">Use joystick to move</p>
      </div>
    </div>
  );
}

/**
 * Mobile-optimized settings
 */
export const MOBILE_SETTINGS = {
  // Reduced poly count for better performance
  maxParticles: 20,
  particleLifetime: 0.5,

  // Lower quality shadows
  shadowMapSize: 512,

  // Reduced enemy count
  maxEnemies: 3,

  // Simplified physics
  physicsSteps: 3,

  // Touch sensitivity
  lookSensitivity: 0.5,
  movementSpeed: 1.0,

  // Graphics quality
  antialias: false,
  pixelRatio: Math.min(window.devicePixelRatio, 2),

  // Model LOD (Level of Detail)
  useLowPolyModels: true,
};

/**
 * Detect if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
}
