/**
 * Model Loader Component
 * Handles loading and rendering Meshy-generated 3D models
 */

import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { Group, AnimationMixer } from 'three';
import { useFrame } from '@react-three/fiber';
import { EnemyType } from './store';

interface ModelProps {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  animations?: boolean;
}

/**
 * Generic model loader with animation support
 */
export function Model({ modelPath, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, animations = false }: ModelProps) {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);

  // Load model
  const { scene, animations: gltfAnimations } = useGLTF(modelPath);

  // Setup animations if present
  useEffect(() => {
    if (animations && gltfAnimations && gltfAnimations.length > 0 && groupRef.current) {
      mixerRef.current = new AnimationMixer(groupRef.current);
      gltfAnimations.forEach((clip) => {
        mixerRef.current?.clipAction(clip).play();
      });
    }

    return () => {
      mixerRef.current?.stopAllAction();
    };
  }, [gltfAnimations, animations]);

  // Update animation mixer
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  const scaleArray = typeof scale === 'number' ? [scale, scale, scale] : scale;

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scaleArray as [number, number, number]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

/**
 * Enemy model loader with fallback to basic geometry
 */
interface EnemyModelProps {
  type: EnemyType;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function EnemyModel({ type, position, rotation = [0, 0, 0] }: EnemyModelProps) {
  const modelPaths: Record<EnemyType, string> = {
    demogorgon: '/models/enemies/demogorgon.glb',
    mindFlayer: '/models/enemies/mindflayer.glb',
    vecna: '/models/enemies/vecna2.glb'
  };

  const scales: Record<EnemyType, number> = {
    demogorgon: 1.0,
    mindFlayer: 1.2,
    vecna: 1.5 // Boss is larger
  };

  try {
    return (
      <Model
        modelPath={modelPaths[type]}
        position={position}
        rotation={rotation}
        scale={scales[type]}
        animations={true}
      />
    );
  } catch (error) {
    // Fallback to placeholder geometry if model not found
    console.warn(`Model not found for ${type}, using fallback geometry`);
    return <FallbackEnemyGeometry type={type} position={position} rotation={rotation} />;
  }
}

/**
 * Fallback geometry when models aren't loaded
 */
function FallbackEnemyGeometry({ type, position, rotation }: EnemyModelProps) {
  const size: [number, number, number] =
    type === 'demogorgon' ? [1.5, 2, 1.5] :
    type === 'mindFlayer' ? [1.2, 1.8, 1.2] :
    [2, 2.5, 2];

  const colors = {
    demogorgon: { color: '#ff2244', emissive: '#ff0022' },
    mindFlayer: { color: '#2211aa', emissive: '#6644ff' },
    vecna: { color: '#aa0011', emissive: '#ff0044' }
  };

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        {...colors[type]}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

/**
 * Weapon model loader
 */
interface WeaponModelProps {
  weaponType: 'energyGun' | 'nailBat' | 'flamethrower';
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function WeaponModel({ weaponType, position, rotation }: WeaponModelProps) {
  const modelPaths = {
    energyGun: '/models/weapons/energyGun.glb',
    nailBat: '/models/weapons/nailBat.glb',
    flamethrower: '/models/weapons/flamethrower.glb'
  };

  const scales = {
    energyGun: 0.8,
    nailBat: 1.0,
    flamethrower: 0.9
  };

  try {
    return (
      <Model
        modelPath={modelPaths[weaponType]}
        position={position}
        rotation={rotation}
        scale={scales[weaponType]}
      />
    );
  } catch (error) {
    // Fallback weapon geometry
    return (
      <group position={position} rotation={rotation}>
        <mesh>
          <boxGeometry args={[0.1, 0.15, 0.6]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    );
  }
}

/**
 * Environment prop loader
 */
interface EnvironmentPropProps {
  propType: 'vine' | 'debris' | 'portal';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function EnvironmentProp({ propType, position, rotation = [0, 0, 0], scale = 1 }: EnvironmentPropProps) {
  const modelPaths = {
    vine: '/models/environment/upsideDownVine.glb',
    debris: '/models/environment/creelHouseDebris.glb',
    portal: '/models/environment/portal.glb'
  };

  try {
    return (
      <Model
        modelPath={modelPaths[propType]}
        position={position}
        rotation={rotation}
        scale={scale}
        animations={propType === 'portal'} // Portals might have pulsing animation
      />
    );
  } catch (error) {
    // Return null if model not found (optional props)
    return null;
  }
}

// Preload commonly used models
export function preloadModels() {
  // Preload enemy models
  useGLTF.preload('/models/enemies/demogorgon.glb');
  useGLTF.preload('/models/enemies/mindflayer.glb');
  useGLTF.preload('/models/enemies/vecna2.glb');

  // Preload weapon models
  useGLTF.preload('/models/weapons/energyGun.glb');
  useGLTF.preload('/models/weapons/nailBat.glb');

  // Preload environment assets
  useGLTF.preload('/models/environment/upsideDownVine.glb');
  useGLTF.preload('/models/environment/creelHouseDebris.glb');
  useGLTF.preload('/models/environment/portal.glb');
}
