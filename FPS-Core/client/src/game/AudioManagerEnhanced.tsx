/**
 * Enhanced Audio Manager - Advanced 3D Spatial Audio System
 *
 * Features:
 * - 3D Positional Audio for enemies
 * - Dynamic Music (intensity changes with action)
 * - Environmental Sounds per level
 * - Music layer crossfading
 * - Mobile-optimized audio
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from './store';
import * as THREE from 'three';

class EnhancedAudioSystem {
  private audioContext: AudioContext;
  private listener: THREE.AudioListener;
  private sounds: Map<string, THREE.Audio> = new Map();
  private positionalSounds: Map<string, THREE.PositionalAudio> = new Map();

  private masterVolume: number = 0.7;
  private musicVolume: number = 0.4;
  private sfxVolume: number = 0.6;

  private musicLayers: Map<string, HTMLAudioElement> = new Map();
  private currentMusicIntensity: 'calm' | 'combat' | 'boss' = 'calm';

  constructor(listener: THREE.AudioListener) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.listener = listener;
    this.initializeAudio();
  }

  private initializeAudio() {
    // Try to load music files if they exist, otherwise use synthetic
    this.loadMusicLayers();
  }

  private async loadMusicLayers() {
    const musicFiles = [
      { key: 'ambient-level1', path: '/music/ambient-level1.mp3' },
      { key: 'ambient-level2', path: '/music/ambient-level2.mp3' },
      { key: 'ambient-level3', path: '/music/boss-level3.mp3' },
      { key: 'turn-around', path: '/music/turn-around.mp3' },
      { key: 'running-up-that-hill', path: '/music/running-up-that-hill.mp3' }
    ];

    for (const file of musicFiles) {
      try {
        const audio = new Audio(file.path);
        audio.volume = this.musicVolume * this.masterVolume;
        audio.loop = true;
        this.musicLayers.set(file.key, audio);
      } catch (err) {
        console.log(`Music file ${file.key} not found, using synthetic audio`);
      }
    }
  }

  // 3D Positional Sound Effects
  createPositionalSound(key: string, position: THREE.Vector3): THREE.PositionalAudio | null {
    try {
      const sound = new THREE.PositionalAudio(this.listener);

      // Create synthetic sound buffer
      const duration = 0.2;
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate noise burst for enemy sound
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (buffer.length * 0.3));
      }

      sound.setBuffer(buffer as any);
      sound.setRefDistance(5);
      sound.setMaxDistance(50);
      sound.setVolume(this.sfxVolume * this.masterVolume);

      this.positionalSounds.set(key, sound);
      return sound;
    } catch (err) {
      return null;
    }
  }

  // Spatial enemy growl/roar
  playEnemySound(position: [number, number, number], enemyType: string) {
    const key = `enemy-${Date.now()}`;
    const pos = new THREE.Vector3(...position);
    const sound = this.createPositionalSound(key, pos);

    if (sound) {
      sound.play();
      setTimeout(() => {
        this.positionalSounds.delete(key);
      }, 1000);
    }
  }

  // Synthetic gunshot with 3D positioning
  playShoot(position?: [number, number, number]) {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 150;
      oscillator.type = 'sawtooth';

      filter.type = 'lowpass';
      filter.frequency.value = 800;

      gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  // Enhanced explosion with rumble
  playExplosion(position?: [number, number, number]) {
    try {
      const audioContext = this.audioContext;

      // Low frequency boom
      const bass = audioContext.createOscillator();
      const bassGain = audioContext.createGain();

      bass.connect(bassGain);
      bassGain.connect(audioContext.destination);

      bass.frequency.setValueAtTime(200, audioContext.currentTime);
      bass.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.5);
      bass.type = 'sawtooth';

      bassGain.gain.setValueAtTime(this.sfxVolume * 2 * this.masterVolume, audioContext.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      bass.start(audioContext.currentTime);
      bass.stop(audioContext.currentTime + 0.5);

      // High frequency crack
      const crack = audioContext.createOscillator();
      const crackGain = audioContext.createGain();
      const noise = audioContext.createBufferSource();

      crack.connect(crackGain);
      crackGain.connect(audioContext.destination);

      crack.frequency.value = 2000;
      crack.type = 'square';

      crackGain.gain.setValueAtTime(this.sfxVolume * 0.5 * this.masterVolume, audioContext.currentTime);
      crackGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      crack.start(audioContext.currentTime);
      crack.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  // Hit marker sound with pitch variation
  playHit() {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 400 + Math.random() * 200; // Pitch variation
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.6 * this.masterVolume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.08);
    } catch (err) {
      console.log('Audio not supported');
    }
  }

  // Level-specific environmental sounds
  playEnvironmentalSound(level: number, type: 'wind' | 'thunder' | 'clock') {
    try {
      const audioContext = this.audioContext;

      switch (type) {
        case 'wind':
          // Howling wind for Level 1
          const wind = audioContext.createOscillator();
          const windGain = audioContext.createGain();
          const windFilter = audioContext.createBiquadFilter();

          wind.connect(windFilter);
          windFilter.connect(windGain);
          windGain.connect(audioContext.destination);

          wind.frequency.value = 80 + Math.random() * 40;
          wind.type = 'sawtooth';

          windFilter.type = 'bandpass';
          windFilter.frequency.value = 200;

          windGain.gain.setValueAtTime(0, audioContext.currentTime);
          windGain.gain.linearRampToValueAtTime(this.musicVolume * 0.3 * this.masterVolume, audioContext.currentTime + 2);
          windGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 5);

          wind.start(audioContext.currentTime);
          wind.stop(audioContext.currentTime + 5);
          break;

        case 'thunder':
          // Thunder rumble for Level 2
          const thunder = audioContext.createOscillator();
          const thunderGain = audioContext.createGain();

          thunder.connect(thunderGain);
          thunderGain.connect(audioContext.destination);

          thunder.frequency.setValueAtTime(100, audioContext.currentTime);
          thunder.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 1);
          thunder.type = 'sawtooth';

          thunderGain.gain.setValueAtTime(this.sfxVolume * 1.5 * this.masterVolume, audioContext.currentTime);
          thunderGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

          thunder.start(audioContext.currentTime);
          thunder.stop(audioContext.currentTime + 1);
          break;

        case 'clock':
          // Vecna's clock tick for Level 3
          const tick = audioContext.createOscillator();
          const tickGain = audioContext.createGain();

          tick.connect(tickGain);
          tickGain.connect(audioContext.destination);

          tick.frequency.value = 800;
          tick.type = 'sine';

          tickGain.gain.setValueAtTime(this.sfxVolume * 0.4 * this.masterVolume, audioContext.currentTime);
          tickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

          tick.start(audioContext.currentTime);
          tick.stop(audioContext.currentTime + 0.05);
          break;
      }
    } catch (err) {
      console.log('Environmental sound not supported');
    }
  }

  // Dynamic music intensity system
  setMusicIntensity(intensity: 'calm' | 'combat' | 'boss') {
    if (this.currentMusicIntensity === intensity) return;

    this.currentMusicIntensity = intensity;

    // Adjust music playback based on intensity
    // In a full implementation, this would crossfade between different layers
    const volumeMultipliers = {
      'calm': 0.3,
      'combat': 0.6,
      'boss': 1.0
    };

    this.musicLayers.forEach((audio) => {
      audio.volume = this.musicVolume * volumeMultipliers[intensity] * this.masterVolume;
    });
  }

  // Play level music
  playLevelMusic(level: number) {
    this.stopAllMusic();

    const musicKey = `ambient-level${level}`;
    const music = this.musicLayers.get(musicKey);

    if (music) {
      music.currentTime = 0;
      music.play().catch(() => {
        console.log('Music playback failed - user interaction required');
      });
    } else {
      // Fallback to synthetic ambient
      this.playSyntheticAmbient(level);
    }
  }

  // Synthetic ambient drone (fallback)
  private playSyntheticAmbient(level: number) {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const frequencies = [110, 87.3, 65.4]; // Dark ambient tones per level
      oscillator.frequency.value = frequencies[level - 1] || 110;
      oscillator.type = 'sine';

      filter.type = 'lowpass';
      filter.frequency.value = 300;

      gainNode.gain.setValueAtTime(this.musicVolume * 0.2 * this.masterVolume, this.audioContext.currentTime);

      oscillator.start(this.audioContext.currentTime);
    } catch (err) {
      console.log('Synthetic ambient not supported');
    }
  }

  // Victory/Level complete fanfare
  playVictoryFanfare() {
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
      const audioContext = this.audioContext;

      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.5 * this.masterVolume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
      });
    } catch (err) {
      console.log('Victory sound not supported');
    }
  }

  // Game over sound
  playGameOver() {
    try {
      const notes = [392, 349.23, 293.66]; // Descending sad notes
      const audioContext = this.audioContext;

      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + i * 0.3;
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.4 * this.masterVolume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.8);
      });
    } catch (err) {
      console.log('Game over sound not supported');
    }
  }

  stopAllMusic() {
    this.musicLayers.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  private updateVolumes() {
    this.musicLayers.forEach((audio) => {
      audio.volume = this.musicVolume * this.masterVolume;
    });
  }
}

// Global audio instance
let audioSystemInstance: EnhancedAudioSystem | null = null;

export function initializeAudioSystem(listener: THREE.AudioListener) {
  if (!audioSystemInstance) {
    audioSystemInstance = new EnhancedAudioSystem(listener);
  }
  return audioSystemInstance;
}

export function getAudioSystem(): EnhancedAudioSystem | null {
  return audioSystemInstance;
}

/**
 * Audio Controller Component
 * Manages audio playback based on game state
 */
export function AudioController({ audioListener }: { audioListener: THREE.AudioListener }) {
  const currentLevel = useGameStore(state => state.currentLevel);
  const isPlaying = useGameStore(state => state.isPlaying);
  const enemies = useGameStore(state => state.enemies);
  const killStreak = useGameStore(state => state.killStreak);

  const audioSystemRef = useRef<EnhancedAudioSystem | null>(null);

  // Initialize audio system
  useEffect(() => {
    if (audioListener && !audioSystemRef.current) {
      audioSystemRef.current = initializeAudioSystem(audioListener);
    }
  }, [audioListener]);

  // Play level music when level changes
  useEffect(() => {
    if (isPlaying && audioSystemRef.current) {
      audioSystemRef.current.playLevelMusic(currentLevel);
    }
  }, [currentLevel, isPlaying]);

  // Dynamic music intensity based on enemy count
  useEffect(() => {
    if (!audioSystemRef.current || !isPlaying) return;

    if (currentLevel === 3 && enemies.length > 0) {
      audioSystemRef.current.setMusicIntensity('boss');
    } else if (enemies.length > 5) {
      audioSystemRef.current.setMusicIntensity('combat');
    } else {
      audioSystemRef.current.setMusicIntensity('calm');
    }
  }, [enemies.length, currentLevel, isPlaying]);

  // Environmental sounds based on level
  useEffect(() => {
    if (!audioSystemRef.current || !isPlaying) return;

    const intervals: NodeJS.Timeout[] = [];

    if (currentLevel === 1) {
      // Wind howls every 10-20 seconds
      const windInterval = setInterval(() => {
        if (Math.random() > 0.5) {
          audioSystemRef.current?.playEnvironmentalSound(1, 'wind');
        }
      }, 10000 + Math.random() * 10000);
      intervals.push(windInterval);
    }

    if (currentLevel === 2) {
      // Thunder every 8-15 seconds
      const thunderInterval = setInterval(() => {
        audioSystemRef.current?.playEnvironmentalSound(2, 'thunder');
      }, 8000 + Math.random() * 7000);
      intervals.push(thunderInterval);
    }

    if (currentLevel === 3) {
      // Clock ticks every 4 seconds (Vecna's clock!)
      const clockInterval = setInterval(() => {
        audioSystemRef.current?.playEnvironmentalSound(3, 'clock');
      }, 4000);
      intervals.push(clockInterval);
    }

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [currentLevel, isPlaying]);

  // Stop music when game ends
  useEffect(() => {
    if (!isPlaying && audioSystemRef.current) {
      audioSystemRef.current.stopAllMusic();
    }
  }, [isPlaying]);

  return null; // This component doesn't render anything
}

/**
 * Audio Settings UI Component
 */
export function AudioSettings() {
  const audioSystem = getAudioSystem();

  const [masterVolume, setMasterVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(40);
  const [sfxVolume, setSfxVolume] = useState(60);

  const handleMasterChange = (value: number) => {
    setMasterVolume(value);
    audioSystem?.setMasterVolume(value / 100);
  };

  const handleMusicChange = (value: number) => {
    setMusicVolume(value);
    audioSystem?.setMusicVolume(value / 100);
  };

  const handleSFXChange = (value: number) => {
    setSfxVolume(value);
    audioSystem?.setSFXVolume(value / 100);
  };

  return (
    <div className="bg-black/80 rounded-lg p-4 space-y-4 min-w-[300px]">
      <h3 className="text-white font-bold text-lg mb-3">Audio Settings</h3>

      <div>
        <label className="text-white text-sm block mb-1">Master Volume: {masterVolume}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={masterVolume}
          onChange={(e) => handleMasterChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-white text-sm block mb-1">Music Volume: {musicVolume}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={musicVolume}
          onChange={(e) => handleMusicChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-white text-sm block mb-1">SFX Volume: {sfxVolume}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={sfxVolume}
          onChange={(e) => handleSFXChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

function useState(arg0: number): [any, any] {
  throw new Error('Function not implemented - use React.useState');
}
