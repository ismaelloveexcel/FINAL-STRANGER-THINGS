/**
 * Power-Ups & Collectibles System
 *
 * Power-Ups:
 * - Eggo Waffles: Restore 25 HP
 * - Eleven's Power: Invincibility 5s
 * - Flashlight: Reveal enemies 10s
 * - Speed Boost: Movement +50% for 8s
 * - Shield: Absorb 3 hits
 * - Explosive Ammo: Area damage 10 shots
 *
 * Collectibles:
 * - D&D Dice: Bonus points
 * - Walkie-Talkie: Story hints
 * - Arcade Token: Secret level unlock
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from './store';
import * as THREE from 'three';

export type PowerUpType =
  | 'eggo'
  | 'eleven-power'
  | 'flashlight'
  | 'speed-boost'
  | 'shield'
  | 'explosive-ammo'
  | 'dd-dice'
  | 'walkie-talkie'
  | 'arcade-token';

interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  description: string;
  color: string;
  emissiveColor: string;
  duration?: number;
  value?: number;
  symbol: string;
}

export const POWERUP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  'eggo': {
    type: 'eggo',
    name: 'Eggo Waffles',
    description: '+25 Health',
    color: '#FFD700',
    emissiveColor: '#FFA500',
    value: 25,
    symbol: '🧇'
  },
  'eleven-power': {
    type: 'eleven-power',
    name: "Eleven's Power",
    description: 'Invincibility 5s',
    color: '#FF1493',
    emissiveColor: '#FF00FF',
    duration: 5000,
    symbol: '⚡'
  },
  'flashlight': {
    type: 'flashlight',
    name: 'Flashlight',
    description: 'Reveal Enemies 10s',
    color: '#FFFF00',
    emissiveColor: '#FFD700',
    duration: 10000,
    symbol: '🔦'
  },
  'speed-boost': {
    type: 'speed-boost',
    name: "Max's Skateboard",
    description: 'Speed +50% 8s',
    color: '#00FFFF',
    emissiveColor: '#00CED1',
    duration: 8000,
    symbol: '🏃'
  },
  'shield': {
    type: 'shield',
    name: 'Telekinesis Shield',
    description: 'Absorb 3 hits',
    color: '#4169E1',
    emissiveColor: '#1E90FF',
    value: 3,
    symbol: '🛡️'
  },
  'explosive-ammo': {
    type: 'explosive-ammo',
    name: 'Explosive Ammo',
    description: 'Area damage x10',
    color: '#FF4500',
    emissiveColor: '#FF6347',
    value: 10,
    symbol: '💥'
  },
  'dd-dice': {
    type: 'dd-dice',
    name: 'D&D Dice',
    description: 'Bonus Points',
    color: '#9370DB',
    emissiveColor: '#BA55D3',
    value: Math.floor(Math.random() * 400) + 100,
    symbol: '🎲'
  },
  'walkie-talkie': {
    type: 'walkie-talkie',
    name: 'Walkie-Talkie',
    description: 'Story Hint',
    color: '#FFD700',
    emissiveColor: '#FFA500',
    symbol: '📻'
  },
  'arcade-token': {
    type: 'arcade-token',
    name: 'Arcade Token',
    description: 'Secret Level',
    color: '#C0C0C0',
    emissiveColor: '#A9A9A9',
    symbol: '🎮'
  }
};

interface PowerUpProps {
  id: string;
  position: [number, number, number];
  type: PowerUpType;
  onCollect: (id: string, type: PowerUpType) => void;
}

export function PowerUp({ id, position, type, onCollect }: PowerUpProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [collected, setCollected] = useState(false);

  const config = POWERUP_CONFIGS[type];
  const playerPosition = useGameStore(state => state.playerPosition);

  useFrame((state) => {
    if (!meshRef.current || collected) return;

    // Rotate power-up
    meshRef.current.rotation.y += 0.02;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;

    // Rotate particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.01;
    }

    // Check collision with player
    if (playerPosition) {
      const distance = Math.sqrt(
        Math.pow(playerPosition[0] - position[0], 2) +
        Math.pow(playerPosition[1] - position[1], 2) +
        Math.pow(playerPosition[2] - position[2], 2)
      );

      if (distance < 1.5) {
        setCollected(true);
        onCollect(id, type);
      }
    }
  });

  // Create particle geometry
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 30;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  if (collected) return null;

  return (
    <group position={position}>
      {/* Main power-up mesh */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissiveColor}
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glow effect */}
      <pointLight
        color={config.emissiveColor}
        intensity={2}
        distance={5}
      />

      {/* Particle halo */}
      <points ref={particlesRef}>
        <bufferGeometry {...particleGeometry} />
        <pointsMaterial
          color={config.color}
          size={0.05}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Power-Up Spawner Component
 */
export function PowerUpSpawner() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const isPlaying = useGameStore(state => state.isPlaying);
  const activatePowerUp = useGameStore(state => state.activatePowerUp);
  const removePowerUp = useGameStore(state => state.removePowerUp);
  const powerUps = useGameStore(state => state.powerUps);

  useEffect(() => {
    if (!isPlaying) return;

    // Spawn power-ups periodically
    const spawnInterval = setInterval(() => {
      const powerUpTypes: PowerUpType[] = [
        'eggo', 'eleven-power', 'flashlight',
        'speed-boost', 'shield', 'explosive-ammo',
        'dd-dice', 'walkie-talkie'
      ];

      // Random type weighted by rarity
      const weights = [15, 5, 8, 10, 8, 7, 20, 10]; // Eggo and dice more common
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;

      let selectedType: PowerUpType = 'eggo';
      for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
          selectedType = powerUpTypes[i];
          break;
        }
        random -= weights[i];
      }

      // Random position in play area
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 15;
      const position: [number, number, number] = [
        Math.cos(angle) * distance,
        0.5,
        Math.sin(angle) * distance
      ];

      const id = `powerup-${Date.now()}-${Math.random()}`;

      useGameStore.getState().spawnPowerUp(id, position, selectedType);

      // Auto-remove after 20 seconds if not collected
      setTimeout(() => {
        removePowerUp(id);
      }, 20000);

    }, 8000); // Spawn every 8 seconds

    return () => clearInterval(spawnInterval);
  }, [isPlaying, removePowerUp]);

  const handleCollect = (id: string, type: PowerUpType) => {
    activatePowerUp(type);
    removePowerUp(id);
  };

  return (
    <>
      {powerUps.map((powerUp) => (
        <PowerUp
          key={powerUp.id}
          id={powerUp.id}
          position={powerUp.position}
          type={powerUp.type}
          onCollect={handleCollect}
        />
      ))}
    </>
  );
}

/**
 * Active Power-Ups UI Display
 */
export function ActivePowerUpsUI() {
  const activePowerUps = useGameStore(state => state.activePowerUps);

  if (activePowerUps.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 space-y-2 z-30">
      {activePowerUps.map((powerUp) => {
        const config = POWERUP_CONFIGS[powerUp.type];
        const remaining = powerUp.expiresAt ? Math.max(0, powerUp.expiresAt - Date.now()) : 0;
        const progress = powerUp.duration ? (remaining / powerUp.duration) * 100 : 100;

        return (
          <div
            key={powerUp.id}
            className="bg-black/70 border-2 rounded-lg p-2 min-w-[150px] backdrop-blur-sm"
            style={{ borderColor: config.color }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.symbol}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-white">{config.name}</div>
                {powerUp.duration && (
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: config.color
                      }}
                    />
                  </div>
                )}
                {powerUp.charges !== undefined && (
                  <div className="text-xs text-white/70">x{powerUp.charges}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
