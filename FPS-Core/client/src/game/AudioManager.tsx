/**
 * Audio Manager - Handles all game sounds and music
 *
 * Features:
 * - Background music per level
 * - Sound effects for shooting, hits, kills
 * - Ambient sounds for atmosphere
 * - Volume control
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from './store';

class AudioSystem {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private music: HTMLAudioElement | null = null;
  private masterVolume: number = 0.7;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.5;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Sound effects using Web Audio API for better browser compatibility
    // We'll create simple synthetic sounds instead of loading files
  }

  // Create synthetic gunshot sound
  private createGunshot() {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 100;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  // Create synthetic explosion sound
  private createExplosion() {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Low frequency boom
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(this.sfxVolume * 1.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  // Create synthetic hit sound
  private createHit() {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 300;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }

  // Create ambient drone
  playAmbient(level: number) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different levels
      const frequencies = [110, 87.3, 65.4]; // Dark ambient tones
      oscillator.frequency.value = frequencies[level - 1] || 110;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.musicVolume * 0.3, audioContext.currentTime);

      oscillator.start(audioContext.currentTime);

      // Store for cleanup
      setTimeout(() => oscillator.stop(), 60000); // Stop after 1 minute
    } catch (err) {
      console.log('Ambient audio not supported');
    }
  }

  playShoot() {
    try {
      this.createGunshot();
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  playHit() {
    try {
      this.createHit();
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  playKill() {
    try {
      this.createExplosion();
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  playLevelComplete() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99]; // C, E, G chord

      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, audioContext.currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.5);

        oscillator.start(audioContext.currentTime + i * 0.1);
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.5);
      });
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  playGameOver() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [392, 349.23, 293.66, 261.63]; // G, F, D, C - descending

      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.6, audioContext.currentTime + i * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.2 + 0.4);

        oscillator.start(audioContext.currentTime + i * 0.2);
        oscillator.stop(audioContext.currentTime + i * 0.2 + 0.4);
      });
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
}

// Singleton instance
export const audioManager = new AudioSystem();

/**
 * React component to handle audio events
 */
export function AudioController() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const isPlaying = useGameStore(state => state.isPlaying);
  const isLevelComplete = useGameStore(state => state.isLevelComplete);
  const isGameOver = useGameStore(state => state.isGameOver);

  const prevLevelRef = useRef(currentLevel);
  const prevCompleteRef = useRef(isLevelComplete);
  const prevGameOverRef = useRef(isGameOver);

  // Play ambient sound when level changes
  useEffect(() => {
    if (isPlaying && currentLevel !== prevLevelRef.current) {
      audioManager.playAmbient(currentLevel);
      prevLevelRef.current = currentLevel;
    }
  }, [currentLevel, isPlaying]);

  // Play level complete sound
  useEffect(() => {
    if (isLevelComplete && !prevCompleteRef.current) {
      audioManager.playLevelComplete();
      prevCompleteRef.current = isLevelComplete;
    } else if (!isLevelComplete) {
      prevCompleteRef.current = false;
    }
  }, [isLevelComplete]);

  // Play game over sound
  useEffect(() => {
    if (isGameOver && !prevGameOverRef.current) {
      audioManager.playGameOver();
      prevGameOverRef.current = isGameOver;
    } else if (!isGameOver) {
      prevGameOverRef.current = false;
    }
  }, [isGameOver]);

  // Start ambient on game start
  useEffect(() => {
    if (isPlaying) {
      audioManager.playAmbient(currentLevel);
    }
  }, [isPlaying]);

  return null; // This component doesn't render anything
}
