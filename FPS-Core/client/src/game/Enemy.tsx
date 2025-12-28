/**
 * Enhanced Enemy Component with Meshy Model Support
 *
 * This version supports both:
 * 1. Meshy-generated 3D models (when available)
 * 2. Fallback to placeholder geometry
 *
 * To use Meshy models, generate them first with: npm run generate-assets
 */

import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Vector3, Mesh, Group } from 'three';
import { useGameStore, EnemyType, LEVEL_CONFIGS } from './store';
import { EnemyModel } from './ModelLoader';
import { useEnemyAI } from './EnemyAI';

interface EnemyProps {
  id: string;
  position: [number, number, number];
  type: EnemyType;
  health: number;
  maxHealth: number;
}

const USE_MESHY_MODELS = true; // Toggle to enable/disable Meshy models

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

  const modelRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [bobOffset] = useState(Math.random() * Math.PI * 2);

  // USE ADVANCED AI INSTEAD OF SIMPLE AI
  const { movement, rotation, isAttacking } = useEnemyAI(id, type, position, api);

  // Sync model position with physics body and apply AI
  useFrame((state) => {
    if (ref.current && modelRef.current) {
      const time = state.clock.getElapsedTime();

      // Copy physics position to visual model
      modelRef.current.position.copy(ref.current.position as any);
      modelRef.current.rotation.copy(ref.current.rotation as any);

      // Add bobbing motion
      const bobAmount = type === 'vecna' ? 0.3 : 0.15;
      const bobSpeed = type === 'mindFlayer' ? 2 : 1;
      const bob = Math.sin(time * bobSpeed + bobOffset) * bobAmount;
      modelRef.current.position.y += bob;

      // Use AI-calculated rotation instead of simple rotation
      modelRef.current.rotation.y = rotation;

      // Apply AI movement
      if (movement.x !== 0 || movement.z !== 0) {
        api.velocity.set(movement.x, 0, movement.z);
      }
    }

    // Pulsating effect for fallback geometry
    if (meshRef.current && !USE_MESHY_MODELS) {
      const time = state.clock.getElapsedTime();
      const pulseIntensity = Math.sin(time * 2 + bobOffset) * 0.5 + 0.5;

      if (meshRef.current.material && 'emissiveIntensity' in meshRef.current.material) {
        (meshRef.current.material as any).emissiveIntensity = pulseIntensity * 2;
      }
    }
  });

  // Color scheme based on enemy type (fallback)
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
      {/* Invisible physics collider */}
      <mesh ref={ref as any} visible={false}>
        <boxGeometry args={size} />
      </mesh>

      {/* Visual representation */}
      <group ref={modelRef}>
        {USE_MESHY_MODELS ? (
          // Meshy-generated model
          <EnemyModel
            type={type}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
          />
        ) : (
          // Fallback placeholder geometry
          <>
            <mesh ref={meshRef} castShadow receiveShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial
                {...colors}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Glow outline */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={size.map(s => s * 1.1) as [number, number, number]} />
              <meshStandardMaterial
                {...colors}
                transparent
                opacity={0.3}
                wireframe
              />
            </mesh>
          </>
        )}

        {/* Health bar for tougher enemies */}
        {(type === 'mindFlayer' || type === 'vecna') && (
          <group position={[0, size[1] + 0.5, 0]}>
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

            {/* Boss name tag for Vecna */}
            {type === 'vecna' && (
              <mesh position={[0, 0.4, 0]}>
                <planeGeometry args={[3, 0.4]} />
                <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        )}

        {/* Particle glow effect for Mind Flayer */}
        {type === 'mindFlayer' && (
          <pointLight
            color={config.particleColor}
            intensity={0.5}
            distance={5}
          />
        )}

        {/* Dramatic lighting for Vecna */}
        {type === 'vecna' && (
          <>
            <pointLight
              color="#ff0044"
              intensity={isAttacking ? 3 : 1.5}
              distance={10}
              castShadow
            />
            {/* Ominous red glow particles */}
            <mesh position={[0, 1, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#ff0044" transparent opacity={0.6} />
            </mesh>
          </>
        )}

        {/* Attack indicator - glows when attacking */}
        {isAttacking && (
          <mesh position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]}>
            <sphereGeometry args={[size[0], 16, 16]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.3} wireframe />
          </mesh>
        )}
      </group>
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

    const currentTime = clock.getElapsedTime() * 1000;

    if (
      currentTime - lastSpawnTime.current >= config.spawnRate &&
      enemies.length < config.maxEnemies &&
      config.spawnRate > 0
    ) {
      const id = Math.random().toString(36).substr(2, 9);
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

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
