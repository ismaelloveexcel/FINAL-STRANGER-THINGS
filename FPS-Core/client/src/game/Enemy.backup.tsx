import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Vector3, Mesh } from 'three';
import { useGameStore, EnemyType, LEVEL_CONFIGS } from './store';

interface EnemyProps {
  id: string;
  position: [number, number, number];
  type: EnemyType;
  health: number;
  maxHealth: number;
}

export function Enemy({ id, position, type, health, maxHealth }: EnemyProps) {
  const currentLevel = useGameStore(state => state.currentLevel);
  const config = LEVEL_CONFIGS[currentLevel];

  // Different sizes based on enemy type
  const size: [number, number, number] =
    type === 'demogorgon' ? [1.5, 2, 1.5] :
    type === 'mindFlayer' ? [1.2, 1.8, 1.2] :
    [2, 2.5, 2]; // vecna - boss size

  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: size,
    userData: { id, isEnemy: true, type }
  }));

  const meshRef = useRef<Mesh>(null);
  const [bobOffset] = useState(Math.random() * Math.PI * 2);
  const takeDamage = useGameStore(state => state.takeDamage);

  // Simple AI: Hover and pulsate
  useFrame((state) => {
    if (ref.current && meshRef.current) {
      const time = state.clock.getElapsedTime();

      // Bobbing motion
      const bobAmount = type === 'vecna' ? 0.3 : 0.15;
      const bobSpeed = type === 'mindFlayer' ? 2 : 1;

      // Pulsating emissive effect
      const pulseIntensity = Math.sin(time * 2 + bobOffset) * 0.5 + 0.5;

      // Update material emissive intensity
      if (meshRef.current.material && 'emissiveIntensity' in meshRef.current.material) {
        (meshRef.current.material as any).emissiveIntensity = pulseIntensity * 2;
      }
    }
  });

  // Color scheme based on enemy type
  const getEnemyColors = () => {
    switch(type) {
      case 'demogorgon':
        return {
          color: '#ff2244',
          emissive: '#ff0022',
          metalness: 0.6,
          roughness: 0.4
        };
      case 'mindFlayer':
        return {
          color: '#2211aa',
          emissive: '#6644ff',
          metalness: 0.9,
          roughness: 0.1
        };
      case 'vecna':
        return {
          color: '#aa0011',
          emissive: '#ff0044',
          metalness: 0.7,
          roughness: 0.3
        };
    }
  };

  const colors = getEnemyColors();
  const healthPercent = (health / maxHealth) * 100;

  return (
    <group>
      <mesh ref={ref as any} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          {...colors}
        />
      </mesh>

      {/* Visual mesh for pulsating effect */}
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          {...colors}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Health bar for tougher enemies */}
      {(type === 'mindFlayer' || type === 'vecna') && (
        <group position={[position[0], position[1] + size[1] + 0.5, position[2]]}>
          {/* Background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2, 0.2]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.5} />
          </mesh>
          {/* Health bar */}
          <mesh position={[-(1 - healthPercent / 100), 0, 0.01]}>
            <planeGeometry args={[2 * (healthPercent / 100), 0.15]} />
            <meshBasicMaterial color={healthPercent > 50 ? '#00ff00' : healthPercent > 25 ? '#ffff00' : '#ff0000'} />
          </mesh>
        </group>
      )}

      {/* Particle glow effect for Mind Flayer */}
      {type === 'mindFlayer' && (
        <pointLight
          position={position}
          color={config.particleColor}
          intensity={0.5}
          distance={5}
        />
      )}

      {/* Dramatic lighting for Vecna */}
      {type === 'vecna' && (
        <pointLight
          position={position}
          color="#ff0044"
          intensity={1.5}
          distance={10}
          castShadow
        />
      )}
    </group>
  );
}

export function EnemyManager() {
  const enemies = useGameStore(state => state.enemies);
  const spawnEnemy = useGameStore(state => state.spawnEnemy);
  const isPlaying = useGameStore(state => state.isPlaying);
  const currentLevel = useGameStore(state => state.currentLevel);
  const isLevelComplete = useGameStore(state => state.isLevelComplete);

  const lastSpawnTime = useRef(0);
  const config = LEVEL_CONFIGS[currentLevel];

  // Spawner logic
  useFrame(({ clock }) => {
    if (!isPlaying || isLevelComplete) return;

    const currentTime = clock.getElapsedTime() * 1000; // Convert to milliseconds

    // Check if enough time has passed and we haven't hit max enemies
    if (
      currentTime - lastSpawnTime.current >= config.spawnRate &&
      enemies.length < config.maxEnemies &&
      config.spawnRate > 0 // Don't spawn if spawnRate is 0 (boss level)
    ) {
      const id = Math.random().toString(36).substr(2, 9);
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Ensure unique ID in spawn call
      if (!enemies.find(e => e.id === id)) {
        spawnEnemy(id, [x, 5, z], config.enemyType);
        lastSpawnTime.current = currentTime;
      }
    }

    // Special spawn for Vecna boss (level 3)
    if (currentLevel === 3 && enemies.length === 0) {
      const id = 'vecna-boss';
      spawnEnemy(id, [0, 5, -15], 'vecna');
    }
  });

  return (
    <>
      {enemies.map(enemy => (
        <Enemy key={enemy.id} {...enemy} />
      ))}
    </>
  );
}
