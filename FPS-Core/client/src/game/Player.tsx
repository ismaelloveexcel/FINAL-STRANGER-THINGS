import { useEffect, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from './store';

const SPEED = 5;
const JUMP_FORCE = 4;

export function Player() {
  const { camera } = useThree();
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 2, 0],
    fixedRotation: true,
    userData: { isPlayer: true }
  }));

  // Velocity reference
  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  // Input state (keyboard + mobile)
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });
  const mobileInput = useRef({ moveX: 0, moveY: 0, lookDeltaX: 0, lookDeltaY: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': keys.current.w = true; break;
        case 'KeyS': keys.current.s = true; break;
        case 'KeyA': keys.current.a = true; break;
        case 'KeyD': keys.current.d = true; break;
        case 'Space': keys.current.space = true; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': keys.current.w = false; break;
        case 'KeyS': keys.current.s = false; break;
        case 'KeyA': keys.current.a = false; break;
        case 'KeyD': keys.current.d = false; break;
        case 'Space': keys.current.space = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Expose mobile input setter for MobileControls
  useEffect(() => {
    (window as any).setPlayerMobileInput = (moveX: number, moveY: number) => {
      mobileInput.current.moveX = moveX;
      mobileInput.current.moveY = moveY;
    };
    (window as any).setPlayerLookDelta = (deltaX: number, deltaY: number) => {
      mobileInput.current.lookDeltaX = deltaX;
      mobileInput.current.lookDeltaY = deltaY;
    };
    return () => {
      delete (window as any).setPlayerMobileInput;
      delete (window as any).setPlayerLookDelta;
    };
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    // Sync camera to physics body
    camera.position.copy(new Vector3(
      // @ts-ignore
      ref.current.position.x,
      ref.current.position.y + 0.5, // Eye level offset
      ref.current.position.z
    ));

    // Apply mobile look rotation
    if (mobileInput.current.lookDeltaX !== 0 || mobileInput.current.lookDeltaY !== 0) {
      camera.rotation.y -= mobileInput.current.lookDeltaX * 0.002;
      camera.rotation.x -= mobileInput.current.lookDeltaY * 0.002;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
      mobileInput.current.lookDeltaX = 0;
      mobileInput.current.lookDeltaY = 0;
    }

    // Movement Logic - combine keyboard and mobile
    const direction = new Vector3();

    // Keyboard input
    const frontVector = new Vector3(
      0,
      0,
      Number(keys.current.s) - Number(keys.current.w)
    );
    const sideVector = new Vector3(
      Number(keys.current.a) - Number(keys.current.d),
      0,
      0
    );

    // Mobile joystick input (forward/backward = -y, strafe = -x)
    if (Math.abs(mobileInput.current.moveX) > 0.1 || Math.abs(mobileInput.current.moveY) > 0.1) {
      frontVector.z = -mobileInput.current.moveY;
      sideVector.x = -mobileInput.current.moveX;
    }

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    // Jump
    if (keys.current.space && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }
  });

  return (
    <mesh ref={ref as any}>
      {/* Invisible collider mesh for player */}
      <sphereGeometry args={[0.5]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}
