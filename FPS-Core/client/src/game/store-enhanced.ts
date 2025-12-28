import { create } from 'zustand';
import type { PowerUpType } from './PowerUps';

export type EnemyType = 'demogorgon' | 'mindFlayer' | 'vecna';
export type WeaponType = 'energy-pistol' | 'nail-bat' | 'flamethrower';
export type GameMode = 'story' | 'survival' | 'speed-run' | 'one-hit' | 'boss-rush' | 'horde';
export type CharacterType = 'default' | 'eleven' | 'hopper' | 'steve' | 'dustin' | 'nancy' | 'max';

export interface EnemyAIConfig {
  chaseSpeed: number;
  attackRange: number;
  attackCooldown: number;
  pathfindingEnabled: boolean;
  coordinated: boolean; // For Mind Flayer group tactics
  leapAttack: boolean; // For Demogorgon
  telegraphedAttacks: boolean; // For Vecna boss
}

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
  aiConfig: EnemyAIConfig;
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
    enemyPoints: 100,
    aiConfig: {
      chaseSpeed: 3.5,
      attackRange: 2,
      attackCooldown: 1500,
      pathfindingEnabled: true,
      coordinated: false,
      leapAttack: true,
      telegraphedAttacks: false
    }
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
    enemyPoints: 250,
    aiConfig: {
      chaseSpeed: 4.5,
      attackRange: 8, // Ranged attacks
      attackCooldown: 2000,
      pathfindingEnabled: true,
      coordinated: true, // Group tactics
      leapAttack: false,
      telegraphedAttacks: false
    }
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
    enemyPoints: 10000,
    aiConfig: {
      chaseSpeed: 2.5,
      attackRange: 12,
      attackCooldown: 3000,
      pathfindingEnabled: true,
      coordinated: false,
      leapAttack: false,
      telegraphedAttacks: true // Boss with pattern attacks
    }
  }
};

export interface WeaponConfig {
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  range: number;
  ammo?: number; // undefined = unlimited
  reloadTime?: number;
  isArea: boolean; // For flamethrower
  isMelee: boolean; // For nail bat
  lifeSteal?: number; // For nail bat
  upgradeCost: number;
}

export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  'energy-pistol': {
    type: 'energy-pistol',
    name: 'Energy Pistol',
    damage: 50,
    fireRate: 300,
    range: 100,
    isArea: false,
    isMelee: false,
    upgradeCost: 500
  },
  'nail-bat': {
    type: 'nail-bat',
    name: "Steve's Nail Bat",
    damage: 150,
    fireRate: 800,
    range: 3,
    isArea: false,
    isMelee: true,
    lifeSteal: 0.2, // 20% of damage as healing
    upgradeCost: 1000
  },
  'flamethrower': {
    type: 'flamethrower',
    name: 'Flamethrower',
    damage: 30, // Per tick
    fireRate: 100, // Continuous
    range: 10,
    ammo: 200,
    reloadTime: 3000,
    isArea: true,
    isMelee: false,
    upgradeCost: 1500
  }
};

export interface CharacterConfig {
  type: CharacterType;
  name: string;
  healthBonus: number;
  speedBonus: number;
  damageBonus: number;
  specialAbility: string;
  unlockScore: number;
}

export const CHARACTER_CONFIGS: Record<CharacterType, CharacterConfig> = {
  'default': {
    type: 'default',
    name: 'Default',
    healthBonus: 0,
    speedBonus: 0,
    damageBonus: 0,
    specialAbility: 'None',
    unlockScore: 0
  },
  'eleven': {
    type: 'eleven',
    name: 'Eleven',
    healthBonus: 0,
    speedBonus: 0,
    damageBonus: 0,
    specialAbility: 'Start with Telekinesis Shield',
    unlockScore: 10000
  },
  'hopper': {
    type: 'hopper',
    name: 'Hopper',
    healthBonus: 20,
    speedBonus: 0,
    damageBonus: 0,
    specialAbility: '+20% Health',
    unlockScore: 5000
  },
  'steve': {
    type: 'steve',
    name: 'Steve',
    healthBonus: 0,
    speedBonus: 0,
    damageBonus: 0.15,
    specialAbility: 'Melee Damage Bonus',
    unlockScore: 8000
  },
  'dustin': {
    type: 'dustin',
    name: 'Dustin',
    healthBonus: 0,
    speedBonus: 0,
    damageBonus: 0,
    specialAbility: 'See enemies through walls',
    unlockScore: 12000
  },
  'nancy': {
    type: 'nancy',
    name: 'Nancy',
    healthBonus: 0,
    speedBonus: 0,
    damageBonus: 0.15,
    specialAbility: 'Weapon Damage +15%',
    unlockScore: 7000
  },
  'max': {
    type: 'max',
    name: 'Max',
    healthBonus: 0,
    speedBonus: 0.25,
    damageBonus: 0,
    specialAbility: 'Movement Speed +25%',
    unlockScore: 6000
  }
};

interface Enemy {
  id: string;
  position: [number, number, number];
  type: EnemyType;
  health: number;
  maxHealth: number;
  aiState?: 'idle' | 'chase' | 'attack' | 'retreat';
  targetPosition?: [number, number, number];
  lastAttackTime?: number;
}

interface PowerUp {
  id: string;
  position: [number, number, number];
  type: PowerUpType;
}

interface ActivePowerUp {
  id: string;
  type: PowerUpType;
  activatedAt: number;
  expiresAt?: number;
  duration?: number;
  charges?: number;
}

interface KillFeedEntry {
  id: string;
  enemyType: EnemyType;
  points: number;
  combo: number;
  timestamp: number;
}

interface WeaponUpgrade {
  damageLevel: number;
  fireRateLevel: number;
  reloadLevel: number;
  ammoLevel: number;
}

interface GameState {
  score: number;
  health: number;
  maxHealth: number;
  isGameOver: boolean;
  isPlaying: boolean;
  enemies: Enemy[];
  playerPosition?: [number, number, number];

  // Level System
  currentLevel: number;
  enemiesKilled: number;
  levelProgress: number;
  isLevelComplete: boolean;
  showLevelTransition: boolean;

  // Game Modes
  gameMode: GameMode;
  survivalWave: number;
  speedRunStartTime?: number;

  // Weapon System
  currentWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
  weaponUpgrades: Record<WeaponType, WeaponUpgrade>;
  weaponPoints: number; // Currency for upgrades

  // Power-Up System
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  isInvincible: boolean;
  hasFlashlight: boolean;
  hasSpeedBoost: boolean;
  shieldCharges: number;
  explosiveAmmoCount: number;

  // Kill Feed & Combo
  killFeed: KillFeedEntry[];
  comboMultiplier: number;
  lastKillTime?: number;
  killStreak: number;

  // Character System
  selectedCharacter: CharacterType;
  unlockedCharacters: CharacterType[];
  totalScore: number; // Lifetime score for unlocks

  // Actions
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  spawnEnemy: (id: string, position: [number, number, number], type: EnemyType) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, damage: number) => void;
  updateEnemyAI: (id: string, aiState: Enemy['aiState'], targetPosition?: [number, number, number]) => void;

  // Level Actions
  incrementKills: () => void;
  nextLevel: () => void;
  startLevel: (level: number) => void;
  completeLevelTransition: () => void;

  // Weapon Actions
  switchWeapon: (weapon: WeaponType) => void;
  upgradeWeapon: (weapon: WeaponType, upgradeType: 'damage' | 'fireRate' | 'reload' | 'ammo') => void;
  unlockWeapon: (weapon: WeaponType) => void;

  // Power-Up Actions
  spawnPowerUp: (id: string, position: [number, number, number], type: PowerUpType) => void;
  removePowerUp: (id: string) => void;
  activatePowerUp: (type: PowerUpType) => void;
  deactivatePowerUp: (id: string) => void;

  // Kill Feed Actions
  addKillToFeed: (enemyType: EnemyType, points: number, combo: number) => void;
  updateCombo: () => void;

  // Character Actions
  selectCharacter: (character: CharacterType) => void;
  unlockCharacter: (character: CharacterType) => void;

  // Game Mode Actions
  setGameMode: (mode: GameMode) => void;

  // Player Position
  updatePlayerPosition: (position: [number, number, number]) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  health: 100,
  maxHealth: 100,
  isGameOver: false,
  isPlaying: false,
  enemies: [],
  playerPosition: undefined,

  // Level System
  currentLevel: 1,
  enemiesKilled: 0,
  levelProgress: 0,
  isLevelComplete: false,
  showLevelTransition: false,

  // Game Modes
  gameMode: 'story',
  survivalWave: 1,
  speedRunStartTime: undefined,

  // Weapon System
  currentWeapon: 'energy-pistol',
  unlockedWeapons: ['energy-pistol'],
  weaponUpgrades: {
    'energy-pistol': { damageLevel: 0, fireRateLevel: 0, reloadLevel: 0, ammoLevel: 0 },
    'nail-bat': { damageLevel: 0, fireRateLevel: 0, reloadLevel: 0, ammoLevel: 0 },
    'flamethrower': { damageLevel: 0, fireRateLevel: 0, reloadLevel: 0, ammoLevel: 0 }
  },
  weaponPoints: 0,

  // Power-Up System
  powerUps: [],
  activePowerUps: [],
  isInvincible: false,
  hasFlashlight: false,
  hasSpeedBoost: false,
  shieldCharges: 0,
  explosiveAmmoCount: 0,

  // Kill Feed & Combo
  killFeed: [],
  comboMultiplier: 1,
  lastKillTime: undefined,
  killStreak: 0,

  // Character System
  selectedCharacter: 'default',
  unlockedCharacters: ['default'],
  totalScore: 0,

  addScore: (points) => set((state) => {
    const multipliedPoints = Math.floor(points * state.comboMultiplier);
    return {
      score: state.score + multipliedPoints,
      totalScore: state.totalScore + multipliedPoints,
      weaponPoints: state.weaponPoints + Math.floor(multipliedPoints * 0.1)
    };
  }),

  takeDamage: (amount) => set((state) => {
    // Check for shield
    if (state.shieldCharges > 0) {
      return {
        shieldCharges: state.shieldCharges - 1,
        comboMultiplier: 1, // Reset combo on hit
        lastKillTime: undefined
      };
    }

    // Check for invincibility
    if (state.isInvincible) {
      return state;
    }

    const newHealth = Math.max(0, state.health - amount);
    return {
      health: newHealth,
      isGameOver: newHealth <= 0,
      comboMultiplier: 1, // Reset combo on hit
      lastKillTime: undefined
    };
  }),

  startGame: () => set((state) => {
    const character = CHARACTER_CONFIGS[state.selectedCharacter];
    return {
      isPlaying: true,
      isGameOver: false,
      score: 0,
      health: 100 + character.healthBonus,
      maxHealth: 100 + character.healthBonus,
      enemies: [],
      currentLevel: 1,
      enemiesKilled: 0,
      levelProgress: 0,
      isLevelComplete: false,
      showLevelTransition: false,
      killFeed: [],
      comboMultiplier: 1,
      lastKillTime: undefined,
      killStreak: 0,
      powerUps: [],
      activePowerUps: [],
      isInvincible: false,
      hasFlashlight: false,
      hasSpeedBoost: false,
      shieldCharges: state.selectedCharacter === 'eleven' ? 3 : 0,
      explosiveAmmoCount: 0,
      speedRunStartTime: state.gameMode === 'speed-run' ? Date.now() : undefined
    };
  }),

  endGame: () => set({ isPlaying: false, isGameOver: true }),

  resetGame: () => set({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    health: 100,
    maxHealth: 100,
    enemies: [],
    currentLevel: 1,
    enemiesKilled: 0,
    levelProgress: 0,
    isLevelComplete: false,
    showLevelTransition: false,
    killFeed: [],
    comboMultiplier: 1,
    lastKillTime: undefined,
    killStreak: 0,
    powerUps: [],
    activePowerUps: [],
    isInvincible: false,
    hasFlashlight: false,
    hasSpeedBoost: false,
    shieldCharges: 0,
    explosiveAmmoCount: 0
  }),

  spawnEnemy: (id, position, type) => {
    const config = LEVEL_CONFIGS[get().currentLevel];
    set((state) => ({
      enemies: [...state.enemies, {
        id,
        position,
        type,
        health: config.enemyHealth,
        maxHealth: config.enemyHealth,
        aiState: 'idle',
        lastAttackTime: 0
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

    return { enemies };
  }),

  updateEnemyAI: (id, aiState, targetPosition) => set((state) => ({
    enemies: state.enemies.map(enemy =>
      enemy.id === id ? { ...enemy, aiState, targetPosition } : enemy
    )
  })),

  incrementKills: () => set((state) => {
    const config = LEVEL_CONFIGS[state.currentLevel];
    const newKills = state.enemiesKilled + 1;
    const progress = (newKills / config.requiredKills) * 100;
    const isComplete = newKills >= config.requiredKills;

    return {
      enemiesKilled: newKills,
      levelProgress: Math.min(progress, 100),
      isLevelComplete: isComplete,
      showLevelTransition: isComplete && state.currentLevel < 3,
      killStreak: state.killStreak + 1
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
      health: state.maxHealth // Restore health for next level
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
  }),

  // Weapon Actions
  switchWeapon: (weapon) => set({ currentWeapon: weapon }),

  upgradeWeapon: (weapon, upgradeType) => set((state) => {
    const cost = 500;
    if (state.weaponPoints < cost) return state;

    const newUpgrades = { ...state.weaponUpgrades };
    newUpgrades[weapon] = { ...newUpgrades[weapon] };
    newUpgrades[weapon][`${upgradeType}Level`]++;

    return {
      weaponUpgrades: newUpgrades,
      weaponPoints: state.weaponPoints - cost
    };
  }),

  unlockWeapon: (weapon) => set((state) => ({
    unlockedWeapons: [...state.unlockedWeapons, weapon]
  })),

  // Power-Up Actions
  spawnPowerUp: (id, position, type) => set((state) => ({
    powerUps: [...state.powerUps, { id, position, type }]
  })),

  removePowerUp: (id) => set((state) => ({
    powerUps: state.powerUps.filter(p => p.id !== id)
  })),

  activatePowerUp: (type) => set((state) => {
    const now = Date.now();
    const id = `active-${now}`;

    switch (type) {
      case 'eggo':
        return {
          health: Math.min(state.health + 25, state.maxHealth)
        };

      case 'eleven-power':
        return {
          isInvincible: true,
          activePowerUps: [...state.activePowerUps, {
            id,
            type,
            activatedAt: now,
            expiresAt: now + 5000,
            duration: 5000
          }]
        };

      case 'flashlight':
        return {
          hasFlashlight: true,
          activePowerUps: [...state.activePowerUps, {
            id,
            type,
            activatedAt: now,
            expiresAt: now + 10000,
            duration: 10000
          }]
        };

      case 'speed-boost':
        return {
          hasSpeedBoost: true,
          activePowerUps: [...state.activePowerUps, {
            id,
            type,
            activatedAt: now,
            expiresAt: now + 8000,
            duration: 8000
          }]
        };

      case 'shield':
        return {
          shieldCharges: state.shieldCharges + 3
        };

      case 'explosive-ammo':
        return {
          explosiveAmmoCount: 10
        };

      case 'dd-dice':
        const points = Math.floor(Math.random() * 400) + 100;
        return {
          score: state.score + points,
          totalScore: state.totalScore + points
        };

      case 'walkie-talkie':
        // Show story hint (handled in UI)
        return state;

      case 'arcade-token':
        // Unlock secret level (handled separately)
        return state;

      default:
        return state;
    }
  }),

  deactivatePowerUp: (id) => set((state) => {
    const powerUp = state.activePowerUps.find(p => p.id === id);
    if (!powerUp) return state;

    const newActivePowerUps = state.activePowerUps.filter(p => p.id !== id);
    const updates: Partial<GameState> = { activePowerUps: newActivePowerUps };

    switch (powerUp.type) {
      case 'eleven-power':
        updates.isInvincible = false;
        break;
      case 'flashlight':
        updates.hasFlashlight = false;
        break;
      case 'speed-boost':
        updates.hasSpeedBoost = false;
        break;
    }

    return { ...state, ...updates };
  }),

  // Kill Feed Actions
  addKillToFeed: (enemyType, points, combo) => set((state) => {
    const entry: KillFeedEntry = {
      id: `kill-${Date.now()}`,
      enemyType,
      points,
      combo,
      timestamp: Date.now()
    };

    return {
      killFeed: [entry, ...state.killFeed].slice(0, 5) // Keep last 5
    };
  }),

  updateCombo: () => set((state) => {
    const now = Date.now();
    const timeSinceLastKill = state.lastKillTime ? now - state.lastKillTime : 99999;

    if (timeSinceLastKill < 3000) {
      // Within combo window (3 seconds)
      return {
        comboMultiplier: Math.min(state.comboMultiplier + 0.5, 5),
        lastKillTime: now
      };
    } else {
      // Combo expired
      return {
        comboMultiplier: 1,
        lastKillTime: now
      };
    }
  }),

  // Character Actions
  selectCharacter: (character) => set({ selectedCharacter: character }),

  unlockCharacter: (character) => set((state) => ({
    unlockedCharacters: [...state.unlockedCharacters, character]
  })),

  // Game Mode Actions
  setGameMode: (mode) => set({ gameMode: mode }),

  // Player Position
  updatePlayerPosition: (position) => set({ playerPosition: position })
}));
