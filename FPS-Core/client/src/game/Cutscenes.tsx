import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './store';

/**
 * Cutscenes Component - Cinematic Camera System
 *
 * Features:
 * - Camera animation using CatmullRomCurve3 for smooth paths
 * - Pre-Level 1: Hawkins Lab map zoom
 * - Post-Level 1: Mind Flayer portal emergence
 * - Pre-Level 3: Vecna reveal
 * - Final Victory: Party celebration
 * - Skip button (ESC key)
 * - Text overlays with StorySystem integration
 */

interface CutsceneProps {
  type: 'intro' | 'level1-complete' | 'level2-start' | 'level3-start' | 'victory';
  onComplete: () => void;
}

export default function Cutscene({ type, onComplete }: CutsceneProps) {
  const { camera } = useThree();
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const cameraPathRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Define cutscene configurations
  const cutsceneConfigs = {
    intro: {
      duration: 8000,
      cameraPoints: [
        new THREE.Vector3(0, 30, 30),
        new THREE.Vector3(15, 25, 20),
        new THREE.Vector3(0, 20, 10),
        new THREE.Vector3(0, 5, 5)
      ],
      lookAtPoints: [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -5)
      ],
      texts: [
        'Hawkins National Laboratory',
        'November 1983',
        'The Upside Down has breached our world...',
        'Eliminate the threats before they spread'
      ],
      textTimings: [0, 2000, 4000, 6000]
    },
    'level1-complete': {
      duration: 6000,
      cameraPoints: [
        new THREE.Vector3(0, 3, 10),
        new THREE.Vector3(-5, 5, 5),
        new THREE.Vector3(0, 8, 0),
        new THREE.Vector3(5, 10, -5)
      ],
      lookAtPoints: [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 8, 0)
      ],
      texts: [
        'The Demogorgons have been eliminated...',
        'But something darker stirs...',
        'The Mind Flayer approaches'
      ],
      textTimings: [0, 2500, 4500]
    },
    'level2-start': {
      duration: 5000,
      cameraPoints: [
        new THREE.Vector3(0, 20, 20),
        new THREE.Vector3(10, 15, 10),
        new THREE.Vector3(0, 10, 5)
      ],
      lookAtPoints: [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0)
      ],
      texts: [
        'A telepathic presence invades your mind',
        'The Mind Flayer seeks to possess you',
        'Fight back!'
      ],
      textTimings: [0, 2000, 4000]
    },
    'level3-start': {
      duration: 7000,
      cameraPoints: [
        new THREE.Vector3(0, 25, 25),
        new THREE.Vector3(-10, 20, 15),
        new THREE.Vector3(0, 15, 10),
        new THREE.Vector3(0, 8, 8)
      ],
      lookAtPoints: [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3(0, 2, 0)
      ],
      texts: [
        'The Creel House',
        'Vecna awakens...',
        'The source of the curse',
        'This ends now'
      ],
      textTimings: [0, 2000, 4000, 6000]
    },
    victory: {
      duration: 10000,
      cameraPoints: [
        new THREE.Vector3(0, 5, 15),
        new THREE.Vector3(10, 8, 10),
        new THREE.Vector3(0, 12, 5),
        new THREE.Vector3(-10, 15, 10),
        new THREE.Vector3(0, 20, 20)
      ],
      lookAtPoints: [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0)
      ],
      texts: [
        'VICTORY',
        'Vecna has been defeated',
        'The Upside Down sealed',
        'Hawkins is safe... for now',
        'Thanks for playing!'
      ],
      textTimings: [0, 2000, 4000, 6500, 8500]
    }
  };

  const config = cutsceneConfigs[type];

  // Initialize camera path
  useEffect(() => {
    cameraPathRef.current = new THREE.CatmullRomCurve3(config.cameraPoints);
    startTimeRef.current = Date.now();
  }, [type]);

  // Handle ESC key to skip
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onComplete]);

  // Update text based on timing
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      for (let i = config.textTimings.length - 1; i >= 0; i--) {
        if (elapsed >= config.textTimings[i]) {
          setCurrentTextIndex(i);
          break;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [config.textTimings]);

  // Animate camera along path
  useFrame(() => {
    if (!cameraPathRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min(elapsed / config.duration, 1);
    setProgress(newProgress);

    // Get camera position on curve
    const cameraPos = cameraPathRef.current.getPoint(newProgress);
    camera.position.copy(cameraPos);

    // Interpolate look-at target
    const lookAtIndex = Math.min(
      Math.floor(newProgress * (config.lookAtPoints.length - 1)),
      config.lookAtPoints.length - 1
    );
    const nextLookAtIndex = Math.min(lookAtIndex + 1, config.lookAtPoints.length - 1);

    const lookAtProgress = (newProgress * (config.lookAtPoints.length - 1)) - lookAtIndex;
    const lookAtTarget = new THREE.Vector3().lerpVectors(
      config.lookAtPoints[lookAtIndex],
      config.lookAtPoints[nextLookAtIndex],
      lookAtProgress
    );

    camera.lookAt(lookAtTarget);

    // Complete cutscene
    if (newProgress >= 1) {
      onComplete();
    }
  });

  return (
    <>
      {/* Scene Elements */}
      <SceneElements type={type} progress={progress} />

      {/* Text Overlay */}
      {showText && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: type === 'victory' ? '48px' : '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px black, 0 0 10px rgba(255, 100, 100, 0.5)',
            zIndex: 1000,
            pointerEvents: 'none',
            maxWidth: '80vw',
            animation: 'fadeIn 1s ease-in-out'
          }}
        >
          {config.texts[currentTextIndex]}
        </div>
      )}

      {/* Skip Button */}
      <button
        onClick={onComplete}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000,
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.8)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Skip (ESC)
      </button>

      {/* Progress Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
          zIndex: 1000
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: '#ff4444',
            transition: 'width 0.1s linear'
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

/**
 * Scene Elements for each cutscene type
 */
function SceneElements({ type, progress }: { type: string; progress: number }) {
  switch (type) {
    case 'intro':
      return <IntroScene progress={progress} />;
    case 'level1-complete':
      return <PortalEmergenceScene progress={progress} />;
    case 'level3-start':
      return <VecnaRevealScene progress={progress} />;
    case 'victory':
      return <VictoryScene progress={progress} />;
    default:
      return null;
  }
}

/**
 * Intro Scene - Hawkins Lab
 */
function IntroScene({ progress }: { progress: number }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.elapsedTime;
      lightRef.current.intensity = 1 + Math.sin(time * 3) * 0.3;
    }
  });

  return (
    <>
      {/* Lab building representation */}
      <mesh position={[0, 2, 0]} scale={[10, 4, 10]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#333333"
          roughness={0.8}
          metalness={0.2}
          opacity={0.8}
          transparent
        />
      </mesh>

      {/* Lab sign */}
      <mesh position={[0, 5, 5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6, 1.5]} />
        <meshStandardMaterial
          color="#222222"
          emissive="#ff0000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Flickering light */}
      <pointLight ref={lightRef} position={[0, 8, 0]} color="#ff4444" intensity={1} distance={30} />

      {/* Particle effects */}
      {[...Array(20)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 15,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color="#ff6644"
            emissive="#ff6644"
            emissiveIntensity={1}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Portal Emergence Scene
 */
function PortalEmergenceScene({ progress }: { progress: number }) {
  const portalRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (portalRef.current) {
      const time = state.clock.elapsedTime;
      portalRef.current.rotation.y = time * 2;
      portalRef.current.scale.setScalar(1 + progress * 3);
    }
  });

  return (
    <>
      {/* Portal */}
      <mesh ref={portalRef} position={[0, 5, 0]}>
        <torusGeometry args={[2, 0.8, 16, 32]} />
        <meshStandardMaterial
          color="#6644ff"
          emissive="#aa44ff"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Portal center */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial
          color="#2200aa"
          emissive="#4422ff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight position={[0, 5, 0]} color="#6644ff" intensity={5 * progress} distance={20} />

      {/* Lightning effects */}
      {progress > 0.5 && [...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI * 0.4) * 3,
            5,
            Math.sin(i * Math.PI * 0.4) * 3
          ]}
        >
          <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
          <meshStandardMaterial
            color="#6644ff"
            emissive="#aa44ff"
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Vecna Reveal Scene
 */
function VecnaRevealScene({ progress }: { progress: number }) {
  const houseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (houseRef.current) {
      const time = state.clock.elapsedTime;
      houseRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <group ref={houseRef}>
      {/* Creel House */}
      <mesh position={[0, 3, 0]} scale={[8, 6, 8]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#1a0000"
          roughness={0.9}
          metalness={0.1}
          emissive="#3d0000"
          emissiveIntensity={0.3 * progress}
        />
      </mesh>

      {/* Windows with red glow */}
      {[[-2, 3, 4.1], [2, 3, 4.1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <planeGeometry args={[1, 1.5]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={2 * progress}
          />
        </mesh>
      ))}

      {/* Ominous red light */}
      <pointLight
        position={[0, 3, 0]}
        color="#ff0022"
        intensity={3 * progress}
        distance={15}
      />

      {/* Floating debris */}
      {progress > 0.3 && [...Array(10)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 15,
            3 + Math.sin(Date.now() * 0.001 + i) * 2,
            (Math.random() - 0.5) * 15
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#442222"
            emissive="#ff0022"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Victory Scene
 */
function VictoryScene({ progress }: { progress: number }) {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <>
      {/* Victory monument/pedestal */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[2, 2.5, 2, 32]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.8}
          roughness={0.2}
          emissive="#ffaa00"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Celebration particles */}
      <group ref={particlesRef}>
        {[...Array(30)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(i * 0.2) * (5 + Math.random() * 5),
              2 + Math.sin(Date.now() * 0.001 + i) * 3,
              Math.sin(i * 0.2) * (5 + Math.random() * 5)
            ]}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffff00'}
              emissive={i % 3 === 0 ? '#ff00ff' : i % 3 === 1 ? '#00ffff' : '#ffff00'}
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>

      {/* Ambient celebration lights */}
      <pointLight position={[0, 5, 0]} color="#ffffff" intensity={2} distance={20} />
      <pointLight position={[5, 3, 5]} color="#ff00ff" intensity={1.5} distance={15} />
      <pointLight position={[-5, 3, -5]} color="#00ffff" intensity={1.5} distance={15} />
    </>
  );
}

export { IntroScene, PortalEmergenceScene, VecnaRevealScene, VictoryScene };
