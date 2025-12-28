import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, LEVEL_CONFIGS } from './store';

/**
 * EnvironmentInteractive Component - Environmental Hazards & Interactive Objects
 *
 * Features:
 * - Upside Down Vines (damage on touch)
 * - Dimensional Rifts (teleport player)
 * - Mind Flayer Storms (lightning strikes)
 * - Vecna's Curse Zones (slow + vision distort)
 * - Interactive: Exploding Barrels, Flickering Lights, Portals, Health Stations
 * - Level-specific spawning and behavior
 */

interface VineProps {
  position: [number, number, number];
  onPlayerTouch: (damage: number) => void;
}

/**
 * Upside Down Vine - Damages player on contact
 */
function UpsideDownVine({ position, onPlayerTouch }: VineProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const playerPosition = useGameStore(state => state.playerPosition);
  const [isAnimating, setIsAnimating] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !playerPosition) return;

    // Animate vine sway
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.z = Math.sin(time * 2) * 0.2;
    meshRef.current.position.y = position[1] + Math.sin(time * 3) * 0.1;

    // Check player collision
    const playerVec = new THREE.Vector3(...playerPosition);
    const vineVec = new THREE.Vector3(...position);
    const distance = playerVec.distanceTo(vineVec);

    if (distance < 1.5 && !isAnimating) {
      setIsAnimating(true);
      onPlayerTouch(5); // 5 damage per touch

      setTimeout(() => setIsAnimating(false), 1000);
    }
  });

  return (
    <group position={position}>
      {/* Vine stem */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 3, 8]} />
        <meshStandardMaterial
          color="#2d4d1f"
          roughness={0.8}
          metalness={0.2}
          emissive={isAnimating ? '#ff0000' : '#1a2d0f'}
          emissiveIntensity={isAnimating ? 0.5 : 0.1}
        />
      </mesh>

      {/* Vine tendrils */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i * Math.PI / 2) * 0.3, 0, Math.sin(i * Math.PI / 2) * 0.3]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <cylinderGeometry args={[0.05, 0.02, 1.5, 6]} />
          <meshStandardMaterial color="#3d5d2f" roughness={0.9} />
        </mesh>
      ))}

      {/* Glow effect */}
      <pointLight
        color={isAnimating ? '#ff0000' : '#4d7d3f'}
        intensity={isAnimating ? 2 : 0.5}
        distance={3}
      />
    </group>
  );
}

interface RiftProps {
  position: [number, number, number];
  onPlayerEnter: (newPosition: [number, number, number]) => void;
}

/**
 * Dimensional Rift - Teleports player to random location
 */
function DimensionalRift({ position, onPlayerEnter }: RiftProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const playerPosition = useGameStore(state => state.playerPosition);
  const [cooldown, setCooldown] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !playerPosition) return;

    const time = state.clock.elapsedTime;

    // Animate rift rotation and pulsing
    meshRef.current.rotation.y = time * 2;
    meshRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);

    // Check player collision
    if (!cooldown) {
      const playerVec = new THREE.Vector3(...playerPosition);
      const riftVec = new THREE.Vector3(...position);
      const distance = playerVec.distanceTo(riftVec);

      if (distance < 2) {
        // Teleport to random location
        const newX = (Math.random() - 0.5) * 40;
        const newZ = (Math.random() - 0.5) * 40;
        onPlayerEnter([newX, 0.5, newZ]);

        setCooldown(true);
        setTimeout(() => setCooldown(false), 5000);
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.5, 16, 32]} />
        <meshStandardMaterial
          color="#6644ff"
          emissive="#aa44ff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Inner portal effect */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial
          color="#2200aa"
          emissive="#4422ff"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight color="#6644ff" intensity={3} distance={8} />
    </group>
  );
}

interface LightningStrikeProps {
  center: [number, number, number];
  radius: number;
  onStrike: (damage: number) => void;
}

/**
 * Mind Flayer Storm - Random lightning strikes
 */
function MindFlayerStorm({ center, radius, onStrike }: LightningStrikeProps) {
  const [strikes, setStrikes] = useState<Array<{ pos: THREE.Vector3; time: number; id: number }>>([]);
  const playerPosition = useGameStore(state => state.playerPosition);

  useFrame(() => {
    // Spawn lightning every 2-4 seconds
    if (Math.random() < 0.01) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const pos = new THREE.Vector3(
        center[0] + Math.cos(angle) * distance,
        10,
        center[2] + Math.sin(angle) * distance
      );

      const newStrike = { pos, time: Date.now(), id: Math.random() };
      setStrikes(prev => [...prev, newStrike]);

      // Check if player is hit
      if (playerPosition) {
        const playerVec = new THREE.Vector3(...playerPosition);
        if (playerVec.distanceTo(new THREE.Vector3(pos.x, 0, pos.z)) < 3) {
          onStrike(20); // 20 damage
        }
      }

      // Remove strike after 0.5 seconds
      setTimeout(() => {
        setStrikes(prev => prev.filter(s => s.id !== newStrike.id));
      }, 500);
    }
  });

  return (
    <>
      {/* Storm cloud effect */}
      <mesh position={[center[0], 15, center[2]]}>
        <sphereGeometry args={[radius * 0.8, 16, 16]} />
        <meshStandardMaterial
          color="#0a0a1a"
          emissive="#1a0a3d"
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Lightning strikes */}
      {strikes.map(strike => (
        <group key={strike.id}>
          <mesh position={[strike.pos.x, 5, strike.pos.z]}>
            <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
            <meshStandardMaterial
              color="#6644ff"
              emissive="#aa44ff"
              emissiveIntensity={3}
            />
          </mesh>
          <pointLight
            position={[strike.pos.x, 0, strike.pos.z]}
            color="#6644ff"
            intensity={10}
            distance={10}
          />
        </group>
      ))}
    </>
  );
}

interface CurseZoneProps {
  position: [number, number, number];
  radius: number;
  onPlayerInZone: (isInZone: boolean) => void;
}

/**
 * Vecna's Curse Zone - Slows player and distorts vision
 */
function VecnaCurseZone({ position, radius, onPlayerInZone }: CurseZoneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const playerPosition = useGameStore(state => state.playerPosition);

  useFrame((state) => {
    if (!meshRef.current || !playerPosition) return;

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.y = time * 0.5;

    // Check if player is in zone
    const playerVec = new THREE.Vector3(...playerPosition);
    const zoneVec = new THREE.Vector3(...position);
    const distance = playerVec.distanceTo(zoneVec);

    onPlayerInZone(distance < radius);
  });

  return (
    <group position={position}>
      {/* Curse zone area */}
      <mesh ref={meshRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.5, radius, 32]} />
        <meshStandardMaterial
          color="#ff0022"
          emissive="#ff0044"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating particles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 2.5) * (radius * 0.7),
            0.5 + Math.sin(Date.now() * 0.001 + i) * 0.3,
            Math.sin(i * Math.PI / 2.5) * (radius * 0.7)
          ]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color="#ff0022"
            emissive="#ff0044"
            emissiveIntensity={1}
          />
        </mesh>
      ))}

      <pointLight color="#ff0022" intensity={1} distance={radius * 1.5} />
    </group>
  );
}

interface BarrelProps {
  position: [number, number, number];
  onExplode: (position: THREE.Vector3, damage: number, radius: number) => void;
}

/**
 * Exploding Barrel - Explodes when shot
 */
function ExplodingBarrel({ position, onExplode }: BarrelProps) {
  const [isExploded, setIsExploded] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const handleShot = () => {
    if (!isExploded && meshRef.current) {
      setIsExploded(true);
      const pos = new THREE.Vector3(...position);
      onExplode(pos, 50, 5); // 50 damage in 5 unit radius
    }
  };

  if (isExploded) return null;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleShot}
        onPointerDown={handleShot}
        castShadow
      >
        <cylinderGeometry args={[0.5, 0.6, 1.5, 16]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Warning symbol */}
      <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ff6600"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

interface HealthStationProps {
  position: [number, number, number];
  onUse: () => void;
}

/**
 * Health Station - Restores health when used
 */
function HealthStation({ position, onUse }: HealthStationProps) {
  const [isUsed, setIsUsed] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const playerPosition = useGameStore(state => state.playerPosition);

  useFrame((state) => {
    if (!meshRef.current || !playerPosition || cooldown) return;

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.y = time;

    // Check player proximity
    const playerVec = new THREE.Vector3(...playerPosition);
    const stationVec = new THREE.Vector3(...position);
    const distance = playerVec.distanceTo(stationVec);

    if (distance < 2 && !isUsed) {
      onUse();
      setIsUsed(true);
      setCooldown(true);

      setTimeout(() => {
        setIsUsed(false);
        setCooldown(false);
      }, 10000); // 10 second cooldown
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, 1, 0]}>
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial
          color={isUsed ? '#555' : '#00ff00'}
          emissive={isUsed ? '#000' : '#00ff00'}
          emissiveIntensity={isUsed ? 0 : 0.8}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Health cross */}
      <mesh position={[0, 1.2, 0.41]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={isUsed ? 0 : 1}
        />
      </mesh>

      {!isUsed && (
        <pointLight color="#00ff00" intensity={2} distance={4} />
      )}
    </group>
  );
}

/**
 * Main EnvironmentInteractive Component
 */
export default function EnvironmentInteractive() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const takeDamage = useGameStore(state => state.takeDamage);
  const updatePlayerPosition = useGameStore(state => state.updatePlayerPosition);
  const health = useGameStore(state => state.health);
  const maxHealth = useGameStore(state => state.maxHealth);
  const addScore = useGameStore(state => state.addScore);
  const enemies = useGameStore(state => state.enemies);
  const damageEnemy = useGameStore(state => state.damageEnemy);

  const [inCurseZone, setInCurseZone] = useState(false);

  const handleBarrelExplode = (position: THREE.Vector3, damage: number, radius: number) => {
    // Damage nearby enemies
    enemies.forEach(enemy => {
      const enemyPos = new THREE.Vector3(...enemy.position);
      const distance = enemyPos.distanceTo(position);
      if (distance < radius) {
        damageEnemy(enemy.id, damage);
      }
    });

    addScore(50); // Bonus for using environment
  };

  const handleHealthStationUse = () => {
    const healAmount = Math.min(50, maxHealth - health);
    if (healAmount > 0) {
      takeDamage(-healAmount); // Negative damage = healing
    }
  };

  return (
    <>
      {/* Level 1: Upside Down - Vines and Barrels */}
      {currentLevel === 1 && (
        <>
          <UpsideDownVine position={[-5, 0, -10]} onPlayerTouch={takeDamage} />
          <UpsideDownVine position={[8, 0, -15]} onPlayerTouch={takeDamage} />
          <UpsideDownVine position={[-12, 0, 5]} onPlayerTouch={takeDamage} />
          <UpsideDownVine position={[15, 0, 8]} onPlayerTouch={takeDamage} />

          <ExplodingBarrel position={[-8, 0.75, -5]} onExplode={handleBarrelExplode} />
          <ExplodingBarrel position={[10, 0.75, -8]} onExplode={handleBarrelExplode} />
          <ExplodingBarrel position={[5, 0.75, 12]} onExplode={handleBarrelExplode} />

          <HealthStation position={[0, 0, -20]} onUse={handleHealthStationUse} />
        </>
      )}

      {/* Level 2: Mind Flayer - Rifts and Storms */}
      {currentLevel === 2 && (
        <>
          <DimensionalRift
            position={[-10, 1, -10]}
            onPlayerEnter={(newPos) => updatePlayerPosition(newPos)}
          />
          <DimensionalRift
            position={[15, 1, 15]}
            onPlayerEnter={(newPos) => updatePlayerPosition(newPos)}
          />

          <MindFlayerStorm center={[0, 0, 0]} radius={15} onStrike={takeDamage} />

          <ExplodingBarrel position={[-15, 0.75, 0]} onExplode={handleBarrelExplode} />
          <ExplodingBarrel position={[0, 0.75, -15]} onExplode={handleBarrelExplode} />

          <HealthStation position={[20, 0, 20]} onUse={handleHealthStationUse} />
        </>
      )}

      {/* Level 3: Vecna Boss - Curse Zones */}
      {currentLevel === 3 && (
        <>
          <VecnaCurseZone
            position={[-8, 0, -8]}
            radius={6}
            onPlayerInZone={setInCurseZone}
          />
          <VecnaCurseZone
            position={[12, 0, 12]}
            radius={6}
            onPlayerInZone={setInCurseZone}
          />
          <VecnaCurseZone
            position={[0, 0, 15]}
            radius={5}
            onPlayerInZone={setInCurseZone}
          />

          <HealthStation position={[-20, 0, -20]} onUse={handleHealthStationUse} />
          <HealthStation position={[20, 0, -20]} onUse={handleHealthStationUse} />

          <ExplodingBarrel position={[0, 0.75, -10]} onExplode={handleBarrelExplode} />
        </>
      )}

      {/* Curse zone speed debuff indicator */}
      {inCurseZone && (
        <mesh position={[0, 0.05, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshStandardMaterial
            color="#ff0022"
            emissive="#ff0044"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  );
}

export { UpsideDownVine, DimensionalRift, MindFlayerStorm, VecnaCurseZone, ExplodingBarrel, HealthStation };
