/**
 * Progression & Rewards System
 * Makes the game addictive and enjoyable with:
 * - Achievements
 * - Kill streaks
 * - Combo multipliers
 * - Power-ups
 * - Level unlocks
 * - Daily challenges
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  reward: number; // Bonus score
}

export interface Powerup {
  id: string;
  type: 'damage' | 'health' | 'speed' | 'shield';
  name: string;
  duration: number;
  active: boolean;
  endsAt: number;
}

interface ProgressionState {
  // Player stats
  totalKills: number;
  totalDeaths: number;
  totalScore: number;
  highestStreak: number;
  gamesPlayed: number;
  gamesWon: number;

  // Current session
  currentStreak: number;
  comboMultiplier: number;
  lastKillTime: number;

  // Achievements
  achievements: Achievement[];
  unlockedAchievements: string[];

  // Power-ups
  activePowerups: Powerup[];

  // Actions
  addKill: (enemyType: string) => number; // Returns score with multiplier
  addDeath: () => void;
  resetStreak: () => void;
  checkAchievements: () => void;
  addPowerup: (powerup: Powerup) => void;
  updatePowerups: () => void;
  completeGame: (won: boolean) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Get your first kill',
    icon: '🎯',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: 500
  },
  {
    id: 'demon_slayer',
    name: 'Demon Slayer',
    description: 'Defeat 10 Demogorgons',
    icon: '👹',
    requirement: 10,
    progress: 0,
    unlocked: false,
    reward: 1000
  },
  {
    id: 'mind_bender',
    name: 'Mind Bender',
    description: 'Defeat 25 Mind Flayers',
    icon: '🧠',
    requirement: 25,
    progress: 0,
    unlocked: false,
    reward: 2000
  },
  {
    id: 'vecna_vanquisher',
    name: 'Vecna Vanquisher',
    description: 'Defeat Vecna',
    icon: '💀',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: 5000
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Get a 10 kill streak',
    icon: '🔥',
    requirement: 10,
    progress: 0,
    unlocked: false,
    reward: 3000
  },
  {
    id: 'hawkins_hero',
    name: 'Hawkins Hero',
    description: 'Complete all 3 levels',
    icon: '🏆',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: 10000
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Reach 5x combo multiplier',
    icon: '⚡',
    requirement: 5,
    progress: 0,
    unlocked: false,
    reward: 2500
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Complete a level without dying',
    icon: '💚',
    requirement: 1,
    progress: 0,
    unlocked: false,
    reward: 4000
  }
];

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      totalKills: 0,
      totalDeaths: 0,
      totalScore: 0,
      highestStreak: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      comboMultiplier: 1.0,
      lastKillTime: 0,
      achievements: INITIAL_ACHIEVEMENTS,
      unlockedAchievements: [],
      activePowerups: [],

      addKill: (enemyType: string) => {
        const now = Date.now();
        const state = get();
        const timeSinceLastKill = now - state.lastKillTime;

        // Combo system: 3 seconds to maintain combo
        let newCombo = state.comboMultiplier;
        let newStreak = state.currentStreak + 1;

        if (timeSinceLastKill < 3000) {
          // Maintain/increase combo
          newCombo = Math.min(newCombo + 0.2, 5.0); // Max 5x multiplier
        } else {
          // Reset combo
          newCombo = 1.0;
        }

        // Update achievements
        const achievements = [...state.achievements];
        const demoIndex = achievements.findIndex(a => a.id === 'demon_slayer');
        const mindIndex = achievements.findIndex(a => a.id === 'mind_bender');
        const firstBloodIndex = achievements.findIndex(a => a.id === 'first_blood');

        if (enemyType === 'demogorgon' && demoIndex !== -1) {
          achievements[demoIndex].progress++;
        }
        if (enemyType === 'mindFlayer' && mindIndex !== -1) {
          achievements[mindIndex].progress++;
        }
        if (firstBloodIndex !== -1 && !achievements[firstBloodIndex].unlocked) {
          achievements[firstBloodIndex].progress = 1;
        }

        // Streak achievement
        const unstoppableIndex = achievements.findIndex(a => a.id === 'unstoppable');
        if (unstoppableIndex !== -1) {
          achievements[unstoppableIndex].progress = Math.max(
            achievements[unstoppableIndex].progress,
            newStreak
          );
        }

        // Combo achievement
        const comboIndex = achievements.findIndex(a => a.id === 'combo_master');
        if (comboIndex !== -1) {
          achievements[comboIndex].progress = Math.floor(newCombo);
        }

        set({
          totalKills: state.totalKills + 1,
          currentStreak: newStreak,
          comboMultiplier: newCombo,
          lastKillTime: now,
          highestStreak: Math.max(state.highestStreak, newStreak),
          achievements
        });

        get().checkAchievements();

        // Return score with multiplier
        return Math.floor(100 * newCombo);
      },

      addDeath: () => {
        set(state => ({
          totalDeaths: state.totalDeaths + 1,
          currentStreak: 0,
          comboMultiplier: 1.0
        }));
      },

      resetStreak: () => {
        set({ currentStreak: 0, comboMultiplier: 1.0 });
      },

      checkAchievements: () => {
        const state = get();
        let newUnlocks: string[] = [];

        const updatedAchievements = state.achievements.map(achievement => {
          if (!achievement.unlocked && achievement.progress >= achievement.requirement) {
            achievement.unlocked = true;
            newUnlocks.push(achievement.id);
            return { ...achievement, unlocked: true };
          }
          return achievement;
        });

        if (newUnlocks.length > 0) {
          set({
            achievements: updatedAchievements,
            unlockedAchievements: [...state.unlockedAchievements, ...newUnlocks]
          });
        }
      },

      addPowerup: (powerup: Powerup) => {
        set(state => ({
          activePowerups: [...state.activePowerups, powerup]
        }));
      },

      updatePowerups: () => {
        const now = Date.now();
        set(state => ({
          activePowerups: state.activePowerups.filter(p => p.endsAt > now)
        }));
      },

      completeGame: (won: boolean) => {
        set(state => {
          const achievements = [...state.achievements];
          const hawkinsIndex = achievements.findIndex(a => a.id === 'hawkins_hero');
          if (won && hawkinsIndex !== -1) {
            achievements[hawkinsIndex].progress = 1;
          }

          return {
            gamesPlayed: state.gamesPlayed + 1,
            gamesWon: won ? state.gamesWon + 1 : state.gamesWon,
            achievements
          };
        });

        get().checkAchievements();
      }
    }),
    {
      name: 'fps-progression-storage'
    }
  )
);

/**
 * Get combo multiplier display text
 */
export function getComboText(multiplier: number): string {
  if (multiplier >= 5) return 'GODLIKE!';
  if (multiplier >= 4) return 'LEGENDARY!';
  if (multiplier >= 3) return 'DOMINATING!';
  if (multiplier >= 2) return 'DOUBLE KILL!';
  return '';
}

/**
 * Get streak text
 */
export function getStreakText(streak: number): string {
  if (streak >= 15) return 'UNSTOPPABLE!';
  if (streak >= 10) return 'MEGA KILL!';
  if (streak >= 7) return 'KILLING SPREE!';
  if (streak >= 5) return 'ON FIRE!';
  if (streak >= 3) return 'TRIPLE KILL!';
  return '';
}
