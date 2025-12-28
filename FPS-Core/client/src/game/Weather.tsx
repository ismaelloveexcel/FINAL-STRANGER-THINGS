import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './store';

/**
 * Weather Component - Dynamic Weather System
 *
 * Features:
 * - Level 1: Ash falling with ember bursts
 * - Level 2: Heavy rain with lightning flashes
 * - Level 3: Dust particles with candle flicker effects
 * - Wind sway on camera for immersion
 * - Particle systems optimized for mobile
 * - GPU-accelerated particle rendering
 */

export default function Weather() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const isPlaying = useGameStore(state => state.isPlaying);

  if (!isPlaying) return null;

  return (
    <>
      {currentLevel === 1 && <AshAndEmbers />}
      {currentLevel === 2 && <RainAndLightning />}
      {currentLevel === 3 && <DustAndCandles />}
      <WindEffect />
    </>
  );
}

/**
 * Level 1: Ash and Embers
 * Falling ash particles with occasional glowing embers
 */
function AshAndEmbers() {
  const ashRef = useRef<THREE.Points>(null);
  const embersRef = useRef<THREE.Points>(null);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const particleCount = isMobile ? 300 : 800;
  const emberCount = isMobile ? 50 : 150;

  // Create ash particles
  const { ashPositions, ashVelocities, ashSizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      velocities[i] = 0.5 + Math.random() * 1.5;
      sizes[i] = 0.1 + Math.random() * 0.3;
    }

    return { ashPositions: positions, ashVelocities: velocities, ashSizes: sizes };
  }, [particleCount]);

  // Create ember particles
  const { emberPositions, emberVelocities, emberSizes } = useMemo(() => {
    const positions = new Float32Array(emberCount * 3);
    const velocities = new Float32Array(emberCount);
    const sizes = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      velocities[i] = 0.2 + Math.random() * 0.8;
      sizes[i] = 0.2 + Math.random() * 0.4;
    }

    return { emberPositions: positions, emberVelocities: velocities, emberSizes: sizes };
  }, [emberCount]);

  useFrame((state, delta) => {
    if (ashRef.current) {
      const positions = ashRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= ashVelocities[i] * delta;

        // Add horizontal drift
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;

        // Reset particle when it falls below ground
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 50;
          positions[i * 3] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
      }

      ashRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (embersRef.current) {
      const positions = embersRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < emberCount; i++) {
        // Embers rise slightly before falling
        positions[i * 3 + 1] += (Math.sin(state.clock.elapsedTime * 2 + i) * 0.5 - emberVelocities[i]) * delta;

        // Spiral motion
        const angle = state.clock.elapsedTime + i;
        positions[i * 3] += Math.cos(angle) * 0.02;
        positions[i * 3 + 2] += Math.sin(angle) * 0.02;

        // Reset ember
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 40;
          positions[i * 3] = (Math.random() - 0.5) * 80;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
      }

      embersRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Ash particles */}
      <points ref={ashRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={ashPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={ashSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#888888"
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Ember particles */}
      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={emberCount}
            array={emberPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={emberCount}
            array={emberSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          color="#ff6644"
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

/**
 * Level 2: Rain and Lightning
 * Heavy rain with occasional lightning flashes
 */
function RainAndLightning() {
  const rainRef = useRef<THREE.Points>(null);
  const lightningRef = useRef<THREE.PointLight>(null);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const particleCount = isMobile ? 500 : 1500;

  const { rainPositions, rainVelocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      velocities[i] = 10 + Math.random() * 10;
    }

    return { rainPositions: positions, rainVelocities: velocities };
  }, [particleCount]);

  useFrame((state, delta) => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= rainVelocities[i] * delta;

        // Wind effect
        positions[i * 3] += Math.sin(state.clock.elapsedTime) * 0.1 * delta;

        // Reset raindrop
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 60;
          positions[i * 3] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
      }

      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Lightning effect
    if (lightningRef.current) {
      // Random lightning flash
      if (Math.random() < 0.01) {
        lightningRef.current.intensity = 20;
        setTimeout(() => {
          if (lightningRef.current) {
            lightningRef.current.intensity = 0;
          }
        }, 100);
      }
    }
  });

  return (
    <>
      {/* Rain particles */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={rainPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#6699ff"
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Lightning light */}
      <pointLight
        ref={lightningRef}
        position={[0, 30, 0]}
        color="#6699ff"
        intensity={0}
        distance={100}
      />
    </>
  );
}

/**
 * Level 3: Dust and Candles
 * Floating dust particles with flickering candle-like lights
 */
function DustAndCandles() {
  const dustRef = useRef<THREE.Points>(null);
  const candles = useRef<THREE.PointLight[]>([]);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const particleCount = isMobile ? 200 : 600;

  const { dustPositions, dustVelocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      velocities[i * 3] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 1] = 0.1 + Math.random() * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    return { dustPositions: positions, dustVelocities: velocities };
  }, [particleCount]);

  useFrame((state, delta) => {
    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Slow floating motion
        positions[i * 3] += dustVelocities[i * 3] * delta;
        positions[i * 3 + 1] += dustVelocities[i * 3 + 1] * delta;
        positions[i * 3 + 2] += dustVelocities[i * 3 + 2] * delta;

        // Brownian motion
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.01;

        // Reset particle
        if (positions[i * 3 + 1] > 30) {
          positions[i * 3 + 1] = 0;
        }

        // Boundary check
        if (Math.abs(positions[i * 3]) > 30) {
          positions[i * 3] = (Math.random() - 0.5) * 60;
        }
        if (Math.abs(positions[i * 3 + 2]) > 30) {
          positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
      }

      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Candle flicker
    candles.current.forEach((candle, i) => {
      if (candle) {
        candle.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 5 + i * 2) * 0.3;
      }
    });
  });

  return (
    <>
      {/* Dust particles */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#cccccc"
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Candle lights */}
      {[
        [-10, 1, -10],
        [10, 1, -10],
        [-10, 1, 10],
        [10, 1, 10],
        [0, 1, -15],
        [0, 1, 15]
      ].map((pos, i) => (
        <pointLight
          key={i}
          ref={(ref) => {
            if (ref) candles.current[i] = ref;
          }}
          position={pos as [number, number, number]}
          color="#ff8844"
          intensity={1}
          distance={8}
          decay={2}
        />
      ))}
    </>
  );
}

/**
 * Wind Effect - Subtle camera sway
 */
function WindEffect() {
  const { camera } = useThree();
  const originalPosition = useRef(new THREE.Vector3());
  const originalRotation = useRef(new THREE.Euler());
  const initialized = useRef(false);

  useFrame((state) => {
    if (!initialized.current) {
      originalPosition.current.copy(camera.position);
      originalRotation.current.copy(camera.rotation);
      initialized.current = true;
    }

    const time = state.clock.elapsedTime;

    // Very subtle sway
    const swayX = Math.sin(time * 0.5) * 0.02;
    const swayY = Math.sin(time * 0.3) * 0.01;
    const swayZ = Math.cos(time * 0.4) * 0.02;

    // Apply to camera rotation (very subtle)
    camera.rotation.x += swayY * 0.001;
    camera.rotation.y += swayX * 0.001;
    camera.rotation.z += swayZ * 0.0005;
  });

  return null;
}

export { AshAndEmbers, RainAndLightning, DustAndCandles, WindEffect };
