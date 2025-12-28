import { usePlane } from '@react-three/cannon';
import { useGameStore, LEVEL_CONFIGS } from './store';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { PointLight } from 'three';
import { Model } from './ModelLoader';

export function Level() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const config = LEVEL_CONFIGS[currentLevel];

  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static'
  }));

  const flickerLightRef = useRef<PointLight>(null);

  // Flickering light effect for Demogorgon level
  useFrame(({ clock }) => {
    if (currentLevel === 1 && flickerLightRef.current) {
      const time = clock.getElapsedTime();
      const flicker = Math.sin(time * 10) * 0.5 + Math.sin(time * 3.7) * 0.3;
      flickerLightRef.current.intensity = config.lightingIntensity + flicker;
    }
  });

  // Grid color based on level
  const gridColors = {
    1: [0xff4400, 0x330000], // Red/orange for Demogorgon
    2: [0x6644ff, 0x110033], // Purple for Mind Flayer
    3: [0xff0044, 0x220000]  // Deep red for Vecna
  };

  const [primaryColor, secondaryColor] = gridColors[currentLevel as keyof typeof gridColors];

  // Generate floating particles based on level
  const particles = useMemo(() => {
    const count = currentLevel === 3 ? 50 : currentLevel === 2 ? 40 : 30;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 80,
        Math.random() * 20 + 2,
        (Math.random() - 0.5) * 80
      ] as [number, number, number],
      scale: Math.random() * 0.3 + 0.1
    }));
  }, [currentLevel]);

  return (
    <>
      {/* Ground Plane - Enhanced with better materials */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[100, 100, 200, 200]} />
        <meshStandardMaterial
          color={config.backgroundColor}
          roughness={0.95}
          metalness={0.0}
          emissive={config.backgroundColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Grid pattern overlay */}
      <gridHelper
        args={[100, 100, primaryColor, secondaryColor]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      />

      {/* Fog effect */}
      <fog attach="fog" args={[config.fogColor, 5, 50]} />

      {/* Enhanced Multi-Layer Lighting */}
      <ambientLight intensity={0.15} color={config.lightingColor} />

      {/* Key Light - Main directional with enhanced shadows */}
      <directionalLight
        position={[15, 25, 15]}
        intensity={config.lightingIntensity * 1.5}
        color={config.lightingColor}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      {/* Fill Lights for depth */}
      <pointLight position={[-20, 10, 20]} intensity={0.4} color={config.lightingColor} distance={50} decay={2} />
      <pointLight position={[20, 10, -20]} intensity={0.4} color={config.lightingColor} distance={50} decay={2} />

      {/* Rim Light for character separation */}
      <spotLight
        position={[0, 20, -15]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.8}
        color={config.lightingColor}
        distance={40}
        decay={2}
      />

      {/* Level-specific environment elements */}
      {currentLevel === 1 && (
        <>
          {/* Demogorgon Level - Upside Down aesthetic */}
          <pointLight
            ref={flickerLightRef}
            position={[0, 10, 0]}
            color="#ff4400"
            intensity={config.lightingIntensity}
            distance={30}
          />

          {/* Portal to Upside Down */}
          <group position={[0, 3, -30]}>
            <Model
              modelPath="/models/environment/portal.glb"
              scale={2.5}
              animations={true}
            />
            <pointLight color="#ff4400" intensity={5} distance={15} />
            <mesh position={[0, 0, 0]} scale={[4, 4, 0.1]}>
              <circleGeometry args={[1, 32]} />
              <meshBasicMaterial color="#ff2200" transparent opacity={0.3} />
            </mesh>
          </group>

          {/* Enhanced Organic Structures - More realistic */}
          <mesh position={[-10, 2.5, -15]} castShadow receiveShadow>
            <boxGeometry args={[5, 5, 5]} />
            <meshStandardMaterial
              color="#1a0000"
              emissive="#ff2200"
              emissiveIntensity={0.8}
              roughness={0.85}
              metalness={0.1}
              envMapIntensity={1.2}
            />
            <pointLight position={[0, 2.5, 0]} color="#ff2200" intensity={2} distance={10} />
          </mesh>
          <mesh position={[15, 1.5, 10]} castShadow receiveShadow>
            <boxGeometry args={[3, 3, 3]} />
            <meshStandardMaterial
              color="#1a0000"
              emissive="#ff2200"
              emissiveIntensity={0.8}
              roughness={0.85}
              metalness={0.1}
              envMapIntensity={1.2}
            />
            <pointLight position={[0, 1.5, 0]} color="#ff2200" intensity={1.5} distance={8} />
          </mesh>

          {/* Additional atmospheric structures for depth */}
          <mesh position={[0, 1, -20]} castShadow receiveShadow>
            <boxGeometry args={[8, 2, 8]} />
            <meshStandardMaterial
              color="#0d0000"
              emissive="#880000"
              emissiveIntensity={0.6}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[-18, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial
              color="#1a0000"
              emissive="#ff2200"
              emissiveIntensity={0.7}
              roughness={0.85}
            />
            <pointLight position={[0, 2, 0]} color="#ff4400" intensity={1.8} distance={12} />
          </mesh>

          {/* Enhanced Glowing Particles */}
          {particles.map(p => (
            <group key={p.id} position={p.position}>
              {/* Core particle */}
              <mesh>
                <sphereGeometry args={[p.scale, 16, 16]} />
                <meshStandardMaterial
                  color={config.particleColor}
                  emissive={config.particleColor}
                  emissiveIntensity={2.0}
                  transparent
                  opacity={0.8}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>
              {/* Glow halo */}
              <mesh>
                <sphereGeometry args={[p.scale * 1.5, 16, 16]} />
                <meshBasicMaterial
                  color={config.particleColor}
                  transparent
                  opacity={0.3}
                />
              </mesh>
              {/* Light source */}
              <pointLight color={config.particleColor} intensity={0.5} distance={4} decay={2} />
            </group>
          ))}
        </>
      )}

      {currentLevel === 2 && (
        <>
          {/* Mind Flayer Level - Enhanced Storm atmosphere */}

          {/* Intense Purple Storm Lighting */}
          <pointLight
            position={[-20, 15, -20]}
            color="#6644ff"
            intensity={3}
            distance={50}
            decay={1.5}
            castShadow
          />
          <pointLight
            position={[20, 15, 20]}
            color="#aa44ff"
            intensity={3}
            distance={50}
            decay={1.5}
            castShadow
          />

          {/* Blue Portal for Level 2 */}
          <group position={[-15, 3, -25]}>
            <Model
              modelPath="/models/environment/portal-blue.glb"
              scale={2.0}
              animations={true}
            />
            <pointLight color="#4466ff" intensity={6} distance={18} />
            <mesh position={[0, 0, 0]} scale={[3.5, 3.5, 0.1]}>
              <circleGeometry args={[1, 32]} />
              <meshBasicMaterial color="#4466ff" transparent opacity={0.4} />
            </mesh>
          </group>

          {/* Enhanced Metallic Structures */}
          <mesh position={[-12, 3, -12]} castShadow receiveShadow>
            <boxGeometry args={[4, 6, 4]} />
            <meshStandardMaterial
              color="#050510"
              emissive="#3322aa"
              emissiveIntensity={1.2}
              metalness={0.95}
              roughness={0.05}
              envMapIntensity={2.0}
            />
            <pointLight position={[0, 3, 0]} color="#6644ff" intensity={2.5} distance={15} />
          </mesh>
          <mesh position={[12, 4, 12]} castShadow receiveShadow>
            <boxGeometry args={[3, 8, 3]} />
            <meshStandardMaterial
              color="#050510"
              emissive="#3322aa"
              emissiveIntensity={1.2}
              metalness={0.95}
              roughness={0.05}
              envMapIntensity={2.0}
            />
            <pointLight position={[0, 4, 0]} color="#aa44ff" intensity={2.5} distance={15} />
          </mesh>

          {/* Additional shadow towers */}
          <mesh position={[0, 5, -18]} castShadow receiveShadow>
            <boxGeometry args={[5, 10, 5]} />
            <meshStandardMaterial
              color="#0a0a1a"
              emissive="#4433cc"
              emissiveIntensity={1.0}
              metalness={0.9}
              roughness={0.1}
            />
            <pointLight position={[0, 5, 0]} color="#6644ff" intensity={3} distance={20} />
          </mesh>

          {/* Enhanced Glowing Shadow Particles */}
          {particles.map(p => (
            <group key={p.id} position={p.position}>
              <mesh>
                <sphereGeometry args={[p.scale * 1.2, 16, 16]} />
                <meshStandardMaterial
                  color={config.particleColor}
                  emissive={config.particleColor}
                  emissiveIntensity={2.5}
                  transparent
                  opacity={0.7}
                  roughness={0.0}
                  metalness={0.5}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[p.scale * 2.0, 16, 16]} />
                <meshBasicMaterial
                  color={config.particleColor}
                  transparent
                  opacity={0.2}
                />
              </mesh>
              <pointLight color={config.particleColor} intensity={0.6} distance={5} decay={2} />
            </group>
          ))}
        </>
      )}

      {currentLevel === 3 && (
        <>
          {/* Vecna Level - ULTRA DRAMATIC Creel House Ruins */}

          {/* Epic Dramatic Red Lighting */}
          <pointLight
            position={[0, 25, -20]}
            color="#ff0044"
            intensity={5}
            distance={60}
            decay={1.2}
            castShadow
            shadow-mapSize={[4096, 4096]}
          />

          {/* Blood-red key lights */}
          <spotLight
            position={[-15, 20, -10]}
            angle={0.5}
            penumbra={0.9}
            intensity={4}
            color="#cc0022"
            distance={50}
            decay={1.5}
            castShadow
          />
          <spotLight
            position={[15, 20, -10]}
            angle={0.5}
            penumbra={0.9}
            intensity={4}
            color="#cc0022"
            distance={50}
            decay={1.5}
            castShadow
          />

          {/* Massive Ruined House - Enhanced */}
          <mesh position={[0, 2, -25]} castShadow receiveShadow>
            <boxGeometry args={[15, 4, 10]} />
            <meshStandardMaterial
              color="#0d0000"
              emissive="#ff0022"
              emissiveIntensity={1.5}
              roughness={0.6}
              metalness={0.2}
              envMapIntensity={1.5}
            />
            <pointLight position={[0, 2, 5]} color="#ff0044" intensity={4} distance={20} />
          </mesh>

          {/* Dramatic Floating Debris */}
          <mesh position={[-8, 4, -18]} castShadow receiveShadow rotation={[0.3, 0.5, 0.2]}>
            <boxGeometry args={[2, 0.5, 3]} />
            <meshStandardMaterial
              color="#1a0000"
              emissive="#880000"
              emissiveIntensity={1.2}
              roughness={0.7}
              metalness={0.3}
            />
            <pointLight position={[0, 0, 0]} color="#ff0022" intensity={1.5} distance={6} />
          </mesh>
          <mesh position={[6, 5, -15]} castShadow receiveShadow rotation={[-0.2, 0.8, 0.4]}>
            <boxGeometry args={[1.5, 0.3, 2]} />
            <meshStandardMaterial
              color="#1a0000"
              emissive="#880000"
              emissiveIntensity={1.2}
              roughness={0.7}
              metalness={0.3}
            />
            <pointLight position={[0, 0, 0]} color="#ff0022" intensity={1.5} distance={6} />
          </mesh>

          {/* More debris for atmosphere */}
          <mesh position={[-12, 6, -12]} castShadow receiveShadow rotation={[0.5, -0.3, 0.6]}>
            <boxGeometry args={[1.8, 0.4, 2.5]} />
            <meshStandardMaterial
              color="#1a0000"
              emissive="#990000"
              emissiveIntensity={1.0}
              roughness={0.8}
            />
          </mesh>
          <mesh position={[10, 7, -16]} castShadow receiveShadow rotation={[-0.4, 0.6, -0.3]}>
            <boxGeometry args={[1.2, 0.3, 1.8]} />
            <meshStandardMaterial
              color="#1a0000"
              emissive="#990000"
              emissiveIntensity={1.0}
              roughness={0.8}
            />
          </mesh>

          {/* Intense Blood-Red Particles */}
          {particles.map(p => (
            <group key={p.id} position={p.position}>
              {/* Core glow */}
              <mesh>
                <sphereGeometry args={[p.scale * 2.0, 16, 16]} />
                <meshStandardMaterial
                  color={config.particleColor}
                  emissive={config.particleColor}
                  emissiveIntensity={3.0}
                  transparent
                  opacity={0.9}
                  roughness={0.1}
                  metalness={0.2}
                />
              </mesh>
              {/* Outer halo */}
              <mesh>
                <sphereGeometry args={[p.scale * 3.0, 16, 16]} />
                <meshBasicMaterial
                  color={config.particleColor}
                  transparent
                  opacity={0.25}
                />
              </mesh>
              {/* Bright light source */}
              <pointLight color={config.particleColor} intensity={0.8} distance={6} decay={2} />
            </group>
          ))}

          {/* Multiple Atmospheric Lights for Drama */}
          <pointLight
            position={[-10, 5, -10]}
            color="#ff0022"
            intensity={2.5}
            distance={18}
            decay={2}
          />
          <pointLight
            position={[10, 5, -10]}
            color="#ff0022"
            intensity={2.5}
            distance={18}
            decay={2}
          />
          <pointLight
            position={[0, 10, -5]}
            color="#cc0033"
            intensity={3}
            distance={25}
            decay={1.5}
          />
          <pointLight
            position={[-15, 8, -15]}
            color="#ff0044"
            intensity={2}
            distance={20}
            decay={2}
          />
          <pointLight
            position={[15, 8, -15]}
            color="#ff0044"
            intensity={2}
            distance={20}
            decay={2}
          />
        </>
      )}
    </>
  );
}
