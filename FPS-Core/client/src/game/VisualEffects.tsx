/**
 * Visual Effects System
 *
 * Includes:
 * - Hit sparks
 * - Kill explosions
 * - Muzzle flash
 * - Blood particles
 * - Screen shake
 */

import { useFrame } from '@react-three/fiber';
import { useState, useRef, useEffect } from 'react';
import { Vector3, Group } from 'three';
import { useGameStore } from './store';

interface Particle {
  id: string;
  position: Vector3;
  velocity: Vector3;
  lifetime: number;
  color: string;
  size: number;
}

export function ParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useFrame((state, delta) => {
    setParticles(prev => {
      return prev
        .map(p => ({
          ...p,
          position: p.position.clone().add(p.velocity.clone().multiplyScalar(delta)),
          velocity: p.velocity.clone().add(new Vector3(0, -9.8 * delta, 0)), // Gravity
          lifetime: p.lifetime - delta
        }))
        .filter(p => p.lifetime > 0);
    });
  });

  return (
    <>
      {particles.map(particle => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={particle.lifetime / 2}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Explosion effect when enemy dies
 */
interface ExplosionProps {
  position: [number, number, number];
  color: string;
  onComplete?: () => void;
}

export function Explosion({ position, color, onComplete }: ExplosionProps) {
  const groupRef = useRef<Group>(null);
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);

  useFrame((state, delta) => {
    if (scale < 3) {
      setScale(prev => prev + delta * 8);
      setOpacity(prev => Math.max(0, prev - delta * 2));
    } else if (onComplete) {
      onComplete();
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Core explosion */}
      <mesh scale={[scale, scale, scale]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Outer ring */}
      <mesh scale={[scale * 1.5, scale * 1.5, scale * 1.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={opacity * 0.3}
          wireframe
        />
      </mesh>

      {/* Point light */}
      <pointLight
        color={color}
        intensity={opacity * 10}
        distance={scale * 5}
      />
    </group>
  );
}

/**
 * Muzzle flash when shooting
 */
interface MuzzleFlashProps {
  position: [number, number, number];
  direction: [number, number, number];
}

export function MuzzleFlash({ position, direction }: MuzzleFlashProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Flash cone */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {/* Point light */}
      <pointLight
        color="#ffaa00"
        intensity={5}
        distance={3}
      />
    </group>
  );
}

/**
 * Hit spark effect
 */
export function HitSpark({ position }: { position: [number, number, number] }) {
  const [particles] = useState(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      return {
        id: `${i}`,
        position: new Vector3(...position),
        velocity: new Vector3(
          Math.cos(angle) * speed,
          Math.random() * 3,
          Math.sin(angle) * speed
        ),
        lifetime: 0.3 + Math.random() * 0.2,
        color: '#ffaa00',
        size: 0.05
      };
    });
  });

  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime(prev => prev + delta);
  });

  if (time > 0.5) return null;

  return (
    <>
      {particles.map(p => {
        const currentPos = p.position.clone().add(
          p.velocity.clone().multiplyScalar(time)
        ).add(new Vector3(0, -9.8 * time * time * 0.5, 0));

        return (
          <mesh key={p.id} position={currentPos}>
            <sphereGeometry args={[p.size, 4, 4]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={1 - time / 0.5}
            />
          </mesh>
        );
      })}
    </>
  );
}

/**
 * Blood splatter particles
 */
export function BloodSplatter({ position }: { position: [number, number, number] }) {
  const [particles] = useState(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 1 + Math.random() * 2;

      return {
        id: `blood-${i}`,
        position: new Vector3(...position),
        velocity: new Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        ),
        lifetime: 0.5 + Math.random() * 0.3,
        color: '#8b0000',
        size: 0.08 + Math.random() * 0.04
      };
    });
  });

  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime(prev => prev + delta);
  });

  if (time > 0.8) return null;

  return (
    <>
      {particles.map(p => {
        const currentPos = p.position.clone().add(
          p.velocity.clone().multiplyScalar(time)
        ).add(new Vector3(0, -9.8 * time * time * 0.5, 0));

        return (
          <mesh key={p.id} position={currentPos}>
            <sphereGeometry args={[p.size, 6, 6]} />
            <meshStandardMaterial
              color={p.color}
              transparent
              opacity={1 - time / 0.8}
              roughness={0.8}
            />
          </mesh>
        );
      })}
    </>
  );
}

/**
 * Screen shake effect manager
 */
export function useScreenShake() {
  const [shake, setShake] = useState({ x: 0, y: 0, intensity: 0 });

  useFrame(() => {
    if (shake.intensity > 0) {
      setShake(prev => ({
        x: (Math.random() - 0.5) * prev.intensity,
        y: (Math.random() - 0.5) * prev.intensity,
        intensity: prev.intensity * 0.9
      }));
    }
  });

  const triggerShake = (intensity: number) => {
    setShake({ x: 0, y: 0, intensity });
  };

  return { shake, triggerShake };
}

/**
 * Damage vignette overlay
 */
export function DamageVignette() {
  const health = useGameStore(state => state.health);
  const [flashIntensity, setFlashIntensity] = useState(0);

  const prevHealth = useRef(health);

  useEffect(() => {
    if (health < prevHealth.current) {
      setFlashIntensity(1);
    }
    prevHealth.current = health;
  }, [health]);

  useFrame((state, delta) => {
    if (flashIntensity > 0) {
      setFlashIntensity(prev => Math.max(0, prev - delta * 3));
    }
  });

  const dangerLevel = Math.max(0, 1 - health / 100);
  const totalOpacity = Math.max(dangerLevel * 0.5, flashIntensity * 0.8);

  if (totalOpacity === 0) return null;

  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial
        color="#ff0000"
        transparent
        opacity={totalOpacity}
      />
    </mesh>
  );
}
