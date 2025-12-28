import React, { useState, useEffect } from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useGameStore } from './store';

/**
 * PostEffects Component - Post-Processing Effects System
 *
 * Features:
 * - Bloom for portal and weapon glow
 * - Chromatic Aberration for Upside Down dimension
 * - Film Grain for 80s aesthetic
 * - Vignette for subtle depth
 * - God Rays (simulated with bloom)
 * - Quality settings toggle (Low/Med/High/Ultra)
 * - Mobile performance detection and auto-adjustment
 * - Level-specific effect intensity
 */

type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

interface QualitySettings {
  bloomIntensity: number;
  bloomLuminanceThreshold: number;
  bloomRadius: number;
  chromaticAberrationOffset: number;
  noiseOpacity: number;
  vignetteIntensity: number;
  enabled: boolean;
}

const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
  low: {
    bloomIntensity: 0.5,
    bloomLuminanceThreshold: 0.9,
    bloomRadius: 0.3,
    chromaticAberrationOffset: 0.0005,
    noiseOpacity: 0.1,
    vignetteIntensity: 0.3,
    enabled: true
  },
  medium: {
    bloomIntensity: 1.0,
    bloomLuminanceThreshold: 0.7,
    bloomRadius: 0.5,
    chromaticAberrationOffset: 0.001,
    noiseOpacity: 0.15,
    vignetteIntensity: 0.5,
    enabled: true
  },
  high: {
    bloomIntensity: 1.5,
    bloomLuminanceThreshold: 0.5,
    bloomRadius: 0.8,
    chromaticAberrationOffset: 0.002,
    noiseOpacity: 0.2,
    vignetteIntensity: 0.6,
    enabled: true
  },
  ultra: {
    bloomIntensity: 2.0,
    bloomLuminanceThreshold: 0.3,
    bloomRadius: 1.0,
    chromaticAberrationOffset: 0.003,
    noiseOpacity: 0.25,
    vignetteIntensity: 0.7,
    enabled: true
  }
};

export default function PostEffects() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const isPlaying = useGameStore(state => state.isPlaying);
  const activePowerUps = useGameStore(state => state.activePowerUps);

  const [quality, setQuality] = useState<QualityPreset>('medium');
  const [isMobile, setIsMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fps, setFps] = useState(60);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);

      // Auto-set quality based on device
      if (mobile) {
        setQuality('low');
      } else {
        // Check GPU tier (simplified)
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Simple heuristic: integrated graphics = medium, dedicated = high
            if (renderer.toLowerCase().includes('intel') || renderer.toLowerCase().includes('integrated')) {
              setQuality('medium');
            } else {
              setQuality('high');
            }
          }
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Monitor FPS and auto-adjust quality
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const currentFps = (frameCount * 1000) / (currentTime - lastTime);
        setFps(currentFps);

        // Auto-adjust quality if FPS is too low
        if (currentFps < 30 && quality !== 'low') {
          const qualityLevels: QualityPreset[] = ['ultra', 'high', 'medium', 'low'];
          const currentIndex = qualityLevels.indexOf(quality);
          if (currentIndex > 0) {
            setQuality(qualityLevels[currentIndex + 1]);
            console.log(`Auto-adjusted quality to ${qualityLevels[currentIndex + 1]} due to low FPS`);
          }
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [quality]);

  const settings = QUALITY_PRESETS[quality];

  // Level-specific intensity modifiers
  const getLevelMultiplier = (): number => {
    switch (currentLevel) {
      case 1:
        return 1.2; // More bloom for Upside Down
      case 2:
        return 1.5; // Even more for Mind Flayer
      case 3:
        return 1.8; // Maximum for Vecna
      default:
        return 1.0;
    }
  };

  // Check if Eleven's power is active (extra glow)
  const hasElevenPower = activePowerUps.some(p => p.type === 'eleven-power');

  const levelMultiplier = getLevelMultiplier();
  const powerMultiplier = hasElevenPower ? 1.5 : 1.0;

  if (!settings.enabled) {
    return null;
  }

  return (
    <>
      <EffectComposer multisampling={quality === 'ultra' ? 8 : quality === 'high' ? 4 : 0}>
        {/* Bloom - For glowing effects (portals, weapons, energy) */}
        <Bloom
          intensity={settings.bloomIntensity * levelMultiplier * powerMultiplier}
          luminanceThreshold={settings.bloomLuminanceThreshold}
          luminanceSmoothing={0.9}
          radius={settings.bloomRadius}
          mipmapBlur={quality === 'high' || quality === 'ultra'}
        />

        {/* Chromatic Aberration - Upside Down dimension effect */}
        {(currentLevel === 1 || currentLevel === 2) && (
          <ChromaticAberration
            offset={
              new THREE.Vector2(
                settings.chromaticAberrationOffset * levelMultiplier,
                settings.chromaticAberrationOffset * levelMultiplier
              )
            }
            radialModulation={false}
            modulationOffset={0}
          />
        )}

        {/* Film Grain/Noise - 80s aesthetic */}
        <Noise
          opacity={settings.noiseOpacity}
          premultiply
          blendFunction={BlendFunction.ADD}
        />

        {/* Vignette - Subtle depth and focus */}
        <Vignette
          offset={0.3}
          darkness={settings.vignetteIntensity}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>

      {/* Quality Settings UI */}
      {isPlaying && (
        <>
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              position: 'fixed',
              bottom: isMobile ? '20px' : '30px',
              right: isMobile ? '20px' : '30px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: isMobile ? '45px' : '50px',
              height: isMobile ? '45px' : '50px',
              fontSize: isMobile ? '20px' : '24px',
              cursor: 'pointer',
              zIndex: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ⚙️
          </button>

          {/* Settings Panel */}
          {showSettings && (
            <div
              style={{
                position: 'fixed',
                bottom: isMobile ? '75px' : '90px',
                right: isMobile ? '20px' : '30px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: isMobile ? '12px' : '16px',
                color: 'white',
                zIndex: 100,
                backdropFilter: 'blur(10px)',
                minWidth: isMobile ? '200px' : '250px',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                  paddingBottom: '8px'
                }}
              >
                Graphics Settings
              </h3>

              {/* FPS Display */}
              <div
                style={{
                  fontSize: isMobile ? '11px' : '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>FPS:</span>
                <span
                  style={{
                    color: fps >= 50 ? '#00ff00' : fps >= 30 ? '#ffcc00' : '#ff0000',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                >
                  {Math.round(fps)}
                </span>
              </div>

              {/* Quality Selector */}
              <div style={{ fontSize: isMobile ? '11px' : '12px', marginBottom: '8px' }}>
                Quality Preset:
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '12px'
                }}
              >
                {(['low', 'medium', 'high', 'ultra'] as QualityPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setQuality(preset)}
                    style={{
                      backgroundColor:
                        quality === preset ? 'rgba(100, 50, 200, 0.8)' : 'rgba(50, 50, 50, 0.6)',
                      color: 'white',
                      border:
                        quality === preset
                          ? '2px solid rgba(150, 100, 255, 0.8)'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: isMobile ? '10px' : '11px',
                      fontWeight: quality === preset ? 'bold' : 'normal',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (quality !== preset) {
                        e.currentTarget.style.backgroundColor = 'rgba(70, 70, 70, 0.7)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (quality !== preset) {
                        e.currentTarget.style.backgroundColor = 'rgba(50, 50, 50, 0.6)';
                      }
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Effect Details */}
              <div
                style={{
                  fontSize: isMobile ? '9px' : '10px',
                  color: '#aaa',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  paddingTop: '8px'
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ opacity: 0.7 }}>Bloom:</span>{' '}
                  <span style={{ color: '#00ffff' }}>
                    {(settings.bloomIntensity * levelMultiplier * powerMultiplier).toFixed(1)}
                  </span>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ opacity: 0.7 }}>Chromatic:</span>{' '}
                  <span style={{ color: '#ff00ff' }}>
                    {currentLevel <= 2 ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ opacity: 0.7 }}>Film Grain:</span>{' '}
                  <span style={{ color: '#ffff00' }}>{(settings.noiseOpacity * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span style={{ opacity: 0.7 }}>Vignette:</span>{' '}
                  <span style={{ color: '#00ff00' }}>{(settings.vignetteIntensity * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Auto-adjust notice */}
              {fps < 30 && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 100, 0, 0.2)',
                    borderRadius: '6px',
                    fontSize: isMobile ? '9px' : '10px',
                    color: '#ffaa00',
                    textAlign: 'center'
                  }}
                >
                  ⚠️ Low FPS detected
                  <br />
                  Auto-adjusting quality
                </div>
              )}

              {/* Device Info */}
              <div
                style={{
                  marginTop: '12px',
                  fontSize: isMobile ? '8px' : '9px',
                  color: '#666',
                  textAlign: 'center'
                }}
              >
                {isMobile ? '📱 Mobile' : '💻 Desktop'} | Level {currentLevel}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

/**
 * Utility function to check WebGL support and capabilities
 */
export function checkWebGLCapabilities(): {
  supported: boolean;
  tier: 'low' | 'medium' | 'high';
  renderer: string;
} {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    return { supported: false, tier: 'low', renderer: 'Unknown' };
  }

  const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
  let renderer = 'Unknown';
  let tier: 'low' | 'medium' | 'high' = 'medium';

  if (debugInfo) {
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    // Simple tier detection
    const lowerRenderer = renderer.toLowerCase();
    if (
      lowerRenderer.includes('intel') ||
      lowerRenderer.includes('integrated') ||
      lowerRenderer.includes('mali') ||
      lowerRenderer.includes('adreno 5')
    ) {
      tier = 'low';
    } else if (
      lowerRenderer.includes('nvidia') ||
      lowerRenderer.includes('amd') ||
      lowerRenderer.includes('radeon') ||
      lowerRenderer.includes('geforce')
    ) {
      tier = 'high';
    }
  }

  return { supported: true, tier, renderer };
}
