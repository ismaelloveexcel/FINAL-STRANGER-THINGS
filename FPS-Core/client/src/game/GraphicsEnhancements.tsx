/**
 * Graphics Enhancements
 * Adds realistic post-processing effects for better visuals
 */

import { EffectComposer, Bloom, ChromaticAberration, Vignette as VignetteEffect, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useGameStore } from './store';

interface GraphicsEnhancementsProps {
  quality?: 'low' | 'medium' | 'high';
}

export function GraphicsEnhancements({ quality = 'high' }: GraphicsEnhancementsProps) {
  const currentLevel = useGameStore(state => state.currentLevel);
  const health = useGameStore(state => state.health);

  // Adjust effects based on quality setting
  const bloomIntensity = quality === 'low' ? 0.3 : quality === 'medium' ? 0.5 : 0.8;
  const samples = quality === 'low' ? 3 : quality === 'medium' ? 5 : 8;

  // Level-specific bloom colors
  const bloomColor = currentLevel === 1 ? '#ff4400' : currentLevel === 2 ? '#6644ff' : '#ff0044';

  // Vignette intensity based on health
  const vignetteIntensity = health < 30 ? 0.8 : health < 50 ? 0.5 : 0.3;

  return (
    <EffectComposer multisampling={samples}>
      {/* Bloom effect - makes lights glow */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.ADD}
      />

      {/* Chromatic Aberration - slight color fringing for realism */}
      <ChromaticAberration
        offset={[0.001, 0.001]}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Vignette - darkens edges */}
      <VignetteEffect
        offset={0.3}
        darkness={vignetteIntensity}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Depth of Field - realistic camera focus (optional, can impact performance) */}
      {quality === 'high' && (
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.05}
          bokehScale={2}
        />
      )}
    </EffectComposer>
  );
}

/**
 * Enhanced Material Presets
 * Use these for better-looking materials
 */
export const MaterialPresets = {
  // Metallic surfaces
  metal: {
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1.5
  },

  // Organic/creature materials
  creature: {
    metalness: 0.2,
    roughness: 0.8,
    envMapIntensity: 0.5
  },

  // Glowing materials
  emissive: (color: string, intensity: number = 1.0) => ({
    emissive: color,
    emissiveIntensity: intensity,
    toneMapped: false
  }),

  // Stone/concrete
  stone: {
    metalness: 0.1,
    roughness: 0.9,
    envMapIntensity: 0.3
  },

  // Glass/transparent
  glass: {
    metalness: 0.0,
    roughness: 0.0,
    transparent: true,
    opacity: 0.3,
    envMapIntensity: 2.0
  }
};

/**
 * Enhanced lighting setup
 */
export function EnhancedLighting() {
  return (
    <>
      {/* HDRI-style ambient */}
      <ambientLight intensity={0.15} color="#ffffff" />

      {/* Fill lights for better illumination */}
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#ffffff" distance={30} />
      <pointLight position={[-10, 10, -10]} intensity={0.3} color="#ffffff" distance={30} />

      {/* Rim lighting for depth */}
      <spotLight
        position={[0, 15, -10]}
        angle={0.5}
        penumbra={1}
        intensity={0.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
    </>
  );
}
