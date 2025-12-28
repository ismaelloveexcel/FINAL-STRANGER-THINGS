import { create } from 'zustand';

export type EnemyType = 'demogorgon' | 'mindFlayer' | 'vecna';

export interface LevelConfig {
  level: number;
  name: string;
  enemyType: EnemyType;
  requiredKills: number;
  spawnRate: number;
  maxEnemies: number;
  backgroundColor: string;
  fogColor: string;
  fogDensity: number;
  lightingColor: string;
  lightingIntensity: number;
  particleColor: string;
  enemyHealth: number;
  enemySpeed: number;
  enemyDamage: number;
  enemyPoints: number;
}

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    name: "Demogorgon Hunt",
    enemyType: 'demogorgon',
    requiredKills: 15,
    spawnRate: 2000,
    maxEnemies: 5,
    backgroundColor: '#1a0000',
    fogColor: '#3d0000',
    fogDensity: 0.08,
    lightingColor: '#ff4400',
    lightingIntensity: 0.8,
    particleColor: '#ff6644',
    enemyHealth: 100,
    enemySpeed: 3,
    enemyDamage: 10,
    enemyPoints: 100
  },
  2: {
    level: 2,
    name: "Mind Flayer Invasion",
    enemyType: 'mindFlayer',
    requiredKills: 25,
    spawnRate: 1500,
    maxEnemies: 8,
    backgroundColor: '#0a0a1a',
    fogColor: '#1a0a3d',
    fogDensity: 0.12,
    lightingColor: '#6644ff',
    lightingIntensity: 1.2,
    particleColor: '#aa44ff',
    enemyHealth: 200,
    enemySpeed: 4,
    enemyDamage: 15,
    enemyPoints: 250
  },
  3: {
    level: 3,
    name: "Vecna's Curse",
    enemyType: 'vecna',
    requiredKills: 1,
    spawnRate: 0,
    maxEnemies: 1,
    backgroundColor: '#0f0000',
    fogColor: '#2d0000',
    fogDensity: 0.15,
    lightingColor: '#ff0022',
    lightingIntensity: 1.5,
    particleColor: '#ff0044',
    enemyHealth: 5000,
    enemySpeed: 2,
    enemyDamage: 25,
    enemyPoints: 10000
  }
};

interface Enemy {
  id: string;
  position: [number, number, number];
  type: EnemyType;
  health: number;
  maxHealth: number;
}

interface GameState {
  score: number;
  health: number;
  isGameOver: boolean;
  isPlaying: boolean;
  enemies: Enemy[];

  // Level System
  currentLevel: number;
  enemiesKilled: number;
  levelProgress: number;
  isLevelComplete: boolean;
  showLevelTransition: boolean;

  // Actions
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  spawnEnemy: (id: string, position: [number, number, number], type: EnemyType) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, damage: number) => void;

  // Level Actions
  incrementKills: () => void;
  nextLevel: () => void;
  startLevel: (level: number) => void;
  completeLevelTransition: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  health: 100,
  isGameOver: false,
  isPlaying: false,
  enemies: [],

  // Level System
  currentLevel: 1,
  enemiesKilled: 0,
  levelProgress: 0,
  isLevelComplete: false,
  showLevelTransition: false,

  addScore: (points) => set((state) => ({ score: state.score + points })),

  takeDamage: (amount) => set((state) => {
    const newHealth = Math.max(0, state.health - amount);
    return {
      health: newHealth,
      isGameOver: newHealth <= 0
    };
  }),

  startGame: () => set({
    isPlaying: true,
    isGameOver: false,
    score: 0,
    health: 100,
    enemies: [],
    currentLevel: 1,
    enemiesKilled: 0,
    levelProgress: 0,
    isLevelComplete: false,
    showLevelTransition: false
  }),

  endGame: () => set({ isPlaying: false, isGameOver: true }),

  resetGame: () => set({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    health: 100,
    enemies: [],
    currentLevel: 1,
    enemiesKilled: 0,
    levelProgress: 0,
    isLevelComplete: false,
    showLevelTransition: false
  }),

  spawnEnemy: (id, position, type) => {
    const config = LEVEL_CONFIGS[get().currentLevel];
    set((state) => ({
      enemies: [...state.enemies, {
        id,
        position,
        type,
        health: config.enemyHealth,
        maxHealth: config.enemyHealth
      }]
    }));
  },

  removeEnemy: (id) => set((state) => ({
    enemies: state.enemies.filter(e => e.id !== id)
  })),

  damageEnemy: (id, damage) => set((state) => {
    const enemies = state.enemies.map(enemy => {
      if (enemy.id === id) {
        const newHealth = Math.max(0, enemy.health - damage);
        return { ...enemy, health: newHealth };
      }
      return enemy;
    });

    // Remove dead enemies
    const aliveEnemies = enemies.filter(e => e.health > 0);
    const killedCount = enemies.length - aliveEnemies.length;

    return { enemies: aliveEnemies };
  }),

  incrementKills: () => set((state) => {
    const config = LEVEL_CONFIGS[state.currentLevel];
    const newKills = state.enemiesKilled + 1;
    const progress = (newKills / config.requiredKills) * 100;
    const isComplete = newKills >= config.requiredKills;

    return {
      enemiesKilled: newKills,
      levelProgress: Math.min(progress, 100),
      isLevelComplete: isComplete,
      showLevelTransition: isComplete && state.currentLevel < 3
    };
  }),

  nextLevel: () => set((state) => {
    const newLevel = Math.min(state.currentLevel + 1, 3);
    return {
      currentLevel: newLevel,
      enemiesKilled: 0,
      levelProgress: 0,
      isLevelComplete: false,
      enemies: [],
      health: 100 // Restore health for next level
    };
  }),

  startLevel: (level) => set({
    currentLevel: level,
    enemiesKilled: 0,
    levelProgress: 0,
    isLevelComplete: false,
    showLevelTransition: false,
    enemies: []
  }),

  completeLevelTransition: () => set({
    showLevelTransition: false
  })
}));
