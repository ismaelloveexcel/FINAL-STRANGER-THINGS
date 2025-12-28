import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster } from 'three';
import { useGameStore, LEVEL_CONFIGS } from './store';
import { audioManager } from './AudioManager';
import { useProgressionStore } from './ProgressionSystem';

const WEAPON_OFFSET = new Vector3(0.5, -0.3, 0.5);

export function Weapon() {
  const { camera, scene } = useThree();
  const weaponRef = useRef<THREE.Group>(null);
  const raycaster = useRef(new Raycaster());
  const isPlaying = useGameStore(state => state.isPlaying);

  const [recoil, setRecoil] = useState(0);
  const [muzzleFlash, setMuzzleFlash] = useState(false);

  const damageEnemy = useGameStore(state => state.damageEnemy);
  const incrementKills = useGameStore(state => state.incrementKills);
  const addScore = useGameStore(state => state.addScore);
  const currentLevel = useGameStore(state => state.currentLevel);
  const enemies = useGameStore(state => state.enemies);
  const addProgressionKill = useProgressionStore(state => state.addKill);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Allow shooting without pointer lock for mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isPlaying) return;
      if (!isMobile && document.pointerLockElement !== document.body) return;

      if (e.button === 0) { // Left click
        shoot();
      }
    };

    // Expose shoot function for mobile
    (window as any).mobileShoot = shoot;

    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      delete (window as any).mobileShoot;
    };
  }, [isPlaying, enemies, currentLevel]);

  useFrame((state, delta) => {
    if (weaponRef.current) {
      // Update recoil
      if (recoil > 0) {
        setRecoil(prev => Math.max(0, prev - delta * 8));
      }

      // Weapon sway and bob
      const time = state.clock.getElapsedTime();
      const bob = Math.sin(time * 10) * 0.01;
      const sway = Math.sin(time * 5) * 0.005;

      weaponRef.current.position.copy(camera.position);
      weaponRef.current.rotation.copy(camera.rotation);
      weaponRef.current.translateX(0.4 + sway);
      weaponRef.current.translateY(-0.3 + bob);
      weaponRef.current.translateZ(-0.5 - recoil);
    }
  });

  const shoot = () => {
    // Trigger recoil and muzzle flash
    setRecoil(0.15);
    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 50);

    // Play shoot sound
    audioManager.playShoot();

    // Raycast from center of screen
    raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    let hitSomething = false;

    for (const hit of intersects) {
      // Check if we hit an enemy
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (obj.userData?.isEnemy) {
          const enemyId = obj.userData.id;
          const enemy = enemies.find(e => e.id === enemyId);

          if (enemy) {
            hitSomething = true;

            // Deal 100 damage per shot
            const damageAmount = 100;
            const newHealth = enemy.health - damageAmount;

            damageEnemy(enemyId, damageAmount);

            // Play hit sound
            audioManager.playHit();

            // If enemy dies (health <= 0), award points and increment kills
            if (newHealth <= 0) {
              // Use progression system for scoring with combo multiplier
              const scoreEarned = addProgressionKill(enemy.type);
              addScore(scoreEarned);
              incrementKills();

              // Play kill sound
              audioManager.playKill();
            }
          }

          break;
        }
        obj = obj.parent;
      }
      if (hitSomething) break;
    }
  };

  return (
    <group ref={weaponRef}>
      {/* Simple Sci-fi Gun Model */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.15, 0.6]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0.05, -0.35]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Energy Glow - pulsating */}
      <mesh position={[0, 0.05, -0.4]}>
        <boxGeometry args={[0.04, 0.04, 0.1]} />
        <meshBasicMaterial color="#0ff" />
      </mesh>

      {/* Muzzle flash */}
      {muzzleFlash && (
        <>
          <mesh position={[0, 0.05, -0.6]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
          </mesh>
          <pointLight position={[0, 0.05, -0.6]} color="#ffaa00" intensity={3} distance={2} />
        </>
      )}
    </group>
  );
}
