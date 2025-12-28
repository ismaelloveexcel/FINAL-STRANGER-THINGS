import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PerformanceMonitor Component - Performance Optimization System
 *
 * Features:
 * - LOD (Level of Detail) system for enemies and models
 * - Object pooling for enemies and particles
 * - Frustum culling optimization
 * - Adaptive quality (auto-reduce if FPS < 30)
 * - FPS counter and performance stats display
 * - Mobile vs desktop detection
 * - Memory usage monitoring
 */

interface PerformanceStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  memory: {
    geometries: number;
    textures: number;
  };
}

export default function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
    memory: { geometries: 0, textures: 0 }
  });

  const [showStats, setShowStats] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcut to toggle stats (F3)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setShowStats(!showStats);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showStats]);

  useFrame((state) => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTimeRef.current;

    frameCountRef.current++;
    frameTimesRef.current.push(deltaTime);

    // Keep only last 60 frames for averaging
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    // Update stats every second
    if (deltaTime >= 16) {
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const fps = 1000 / avgFrameTime;

      // Get renderer info
      const renderer = state.gl;
      const info = renderer.info;

      setStats({
        fps: Math.round(fps),
        frameTime: Math.round(avgFrameTime * 100) / 100,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length || 0,
        memory: {
          geometries: info.memory.geometries,
          textures: info.memory.textures
        }
      });

      lastTimeRef.current = currentTime;
    }
  });

  return (
    <>
      {/* Toggle Stats Button */}
      <button
        onClick={() => setShowStats(!showStats)}
        style={{
          position: 'fixed',
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '6px',
          padding: isMobile ? '6px 10px' : '8px 12px',
          fontSize: isMobile ? '10px' : '12px',
          cursor: 'pointer',
          zIndex: 200,
          backdropFilter: 'blur(5px)',
          fontFamily: 'monospace',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        }}
      >
        {showStats ? 'Hide' : 'Show'} Stats (F3)
      </button>

      {/* Performance Stats Panel */}
      {showStats && (
        <div
          style={{
            position: 'fixed',
            top: isMobile ? '50px' : '70px',
            right: isMobile ? '10px' : '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: isMobile ? '10px' : '12px',
            color: 'white',
            fontSize: isMobile ? '10px' : '12px',
            fontFamily: 'monospace',
            zIndex: 200,
            backdropFilter: 'blur(10px)',
            minWidth: isMobile ? '160px' : '200px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* FPS */}
          <div
            style={{
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              paddingBottom: '6px'
            }}
          >
            <span>FPS:</span>
            <span
              style={{
                color: stats.fps >= 50 ? '#00ff00' : stats.fps >= 30 ? '#ffcc00' : '#ff0000',
                fontWeight: 'bold'
              }}
            >
              {stats.fps}
            </span>
          </div>

          {/* Frame Time */}
          <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Frame Time:</span>
            <span style={{ color: '#00ffff' }}>{stats.frameTime.toFixed(2)}ms</span>
          </div>

          {/* Draw Calls */}
          <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Draw Calls:</span>
            <span style={{ color: stats.drawCalls > 100 ? '#ff6600' : '#00ff00' }}>
              {stats.drawCalls}
            </span>
          </div>

          {/* Triangles */}
          <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Triangles:</span>
            <span style={{ color: '#ffff00' }}>{stats.triangles.toLocaleString()}</span>
          </div>

          {/* Memory Section */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ marginBottom: '4px', color: '#aaa', fontSize: isMobile ? '9px' : '10px' }}>
              MEMORY
            </div>

            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Geometries:</span>
              <span style={{ color: '#ff00ff' }}>{stats.memory.geometries}</span>
            </div>

            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Textures:</span>
              <span style={{ color: '#ff00ff' }}>{stats.memory.textures}</span>
            </div>

            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Programs:</span>
              <span style={{ color: '#ff00ff' }}>{stats.programs}</span>
            </div>
          </div>

          {/* Device Info */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: isMobile ? '8px' : '9px',
              color: '#666',
              textAlign: 'center'
            }}
          >
            {isMobile ? '📱 Mobile Device' : '💻 Desktop'}
          </div>

          {/* Performance Warning */}
          {stats.fps < 30 && (
            <div
              style={{
                marginTop: '8px',
                padding: '6px',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderRadius: '4px',
                fontSize: isMobile ? '8px' : '9px',
                color: '#ff6600',
                textAlign: 'center',
                border: '1px solid rgba(255, 100, 0, 0.5)'
              }}
            >
              ⚠️ Low FPS Detected
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * LOD (Level of Detail) System
 * Automatically adjusts model complexity based on distance
 */
export function useLOD(position: THREE.Vector3, cameraPosition: THREE.Vector3) {
  const distance = position.distanceTo(cameraPosition);

  if (distance < 10) {
    return 'high'; // Full detail
  } else if (distance < 30) {
    return 'medium'; // Reduced detail
  } else {
    return 'low'; // Minimal detail
  }
}

/**
 * Object Pool for efficient object reuse
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory;
    this.reset = reset;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }

  clear(): void {
    this.available = [];
    this.inUse.clear();
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

/**
 * Frustum Culling Helper
 * Checks if object is visible in camera frustum
 */
export function isInFrustum(
  object: THREE.Object3D,
  camera: THREE.Camera,
  frustum?: THREE.Frustum
): boolean {
  if (!frustum) {
    frustum = new THREE.Frustum();
    const projectionMatrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projectionMatrix);
  }

  // Update world matrix
  object.updateMatrixWorld(true);

  // Get bounding sphere
  const boundingSphere = new THREE.Sphere();
  if (object instanceof THREE.Mesh && object.geometry.boundingSphere) {
    boundingSphere.copy(object.geometry.boundingSphere);
    boundingSphere.applyMatrix4(object.matrixWorld);
  } else {
    const box = new THREE.Box3().setFromObject(object);
    box.getBoundingSphere(boundingSphere);
  }

  return frustum.intersectsSphere(boundingSphere);
}

/**
 * Adaptive Quality Manager
 * Automatically adjusts quality settings based on performance
 */
export class AdaptiveQualityManager {
  private targetFPS = 50;
  private fpsSamples: number[] = [];
  private maxSamples = 120; // 2 seconds at 60fps
  private qualityLevel = 2; // 0=low, 1=medium, 2=high, 3=ultra
  private adjustmentCooldown = 0;

  update(currentFPS: number, deltaTime: number): void {
    this.fpsSamples.push(currentFPS);

    if (this.fpsSamples.length > this.maxSamples) {
      this.fpsSamples.shift();
    }

    // Update cooldown
    if (this.adjustmentCooldown > 0) {
      this.adjustmentCooldown -= deltaTime;
      return;
    }

    // Calculate average FPS
    const avgFPS = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;

    // Adjust quality if needed
    if (avgFPS < this.targetFPS - 5 && this.qualityLevel > 0) {
      this.qualityLevel--;
      this.adjustmentCooldown = 5000; // 5 second cooldown
      console.log(`Quality decreased to level ${this.qualityLevel}`);
    } else if (avgFPS > this.targetFPS + 10 && this.qualityLevel < 3) {
      this.qualityLevel++;
      this.adjustmentCooldown = 5000;
      console.log(`Quality increased to level ${this.qualityLevel}`);
    }
  }

  getQualityLevel(): number {
    return this.qualityLevel;
  }

  getQualityName(): 'low' | 'medium' | 'high' | 'ultra' {
    const names = ['low', 'medium', 'high', 'ultra'] as const;
    return names[this.qualityLevel];
  }

  reset(): void {
    this.fpsSamples = [];
    this.adjustmentCooldown = 0;
  }
}

/**
 * Memory Monitor
 * Tracks memory usage and provides cleanup recommendations
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
    percentage?: number;
  }>({});

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const percentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          percentage
        });

        // Warning if memory usage is high
        if (percentage > 90) {
          console.warn('High memory usage detected:', percentage.toFixed(1) + '%');
        }
      }
    };

    const interval = setInterval(checkMemory, 5000);
    checkMemory();

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Batch Renderer for efficient rendering of similar objects
 */
export class BatchRenderer {
  private instancedMesh: THREE.InstancedMesh | null = null;
  private transforms: THREE.Matrix4[] = [];
  private maxInstances: number;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, maxInstances: number) {
    this.maxInstances = maxInstances;
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
  }

  updateInstance(index: number, position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3): void {
    if (!this.instancedMesh || index >= this.maxInstances) return;

    const matrix = new THREE.Matrix4();
    matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);

    this.instancedMesh.setMatrixAt(index, matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  getMesh(): THREE.InstancedMesh | null {
    return this.instancedMesh;
  }

  dispose(): void {
    if (this.instancedMesh) {
      this.instancedMesh.geometry.dispose();
      if (Array.isArray(this.instancedMesh.material)) {
        this.instancedMesh.material.forEach(m => m.dispose());
      } else {
        this.instancedMesh.material.dispose();
      }
    }
  }
}
