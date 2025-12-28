import React, { useState, useEffect } from 'react';
import { useGameStore, WEAPON_CONFIGS, WeaponType } from './store';

/**
 * WeaponSelector Component - Advanced Weapon System
 *
 * Features:
 * - 3 weapons: Energy Pistol, Steve's Nail Bat (melee + lifesteal), Flamethrower (area damage)
 * - Weapon switching UI (mobile-friendly with touch controls)
 * - Upgrade system for damage, fire rate, reload speed, and ammo capacity
 * - Real-time weapon stats display
 * - Uses WEAPON_CONFIGS from store
 * - Visual feedback for weapon unlocks and upgrades
 */

export default function WeaponSelector() {
  const currentWeapon = useGameStore(state => state.currentWeapon);
  const unlockedWeapons = useGameStore(state => state.unlockedWeapons);
  const weaponUpgrades = useGameStore(state => state.weaponUpgrades);
  const weaponPoints = useGameStore(state => state.weaponPoints);
  const isPlaying = useGameStore(state => state.isPlaying);
  const switchWeapon = useGameStore(state => state.switchWeapon);
  const upgradeWeapon = useGameStore(state => state.upgradeWeapon);
  const unlockWeapon = useGameStore(state => state.unlockWeapon);

  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  const [selectedWeaponForUpgrade, setSelectedWeaponForUpgrade] = useState<WeaponType | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts for weapon switching (1, 2, 3)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      const weaponMap: Record<string, WeaponType> = {
        '1': 'energy-pistol',
        '2': 'nail-bat',
        '3': 'flamethrower'
      };

      const weapon = weaponMap[e.key];
      if (weapon && unlockedWeapons.includes(weapon)) {
        switchWeapon(weapon);
      }

      // U key for upgrade menu
      if (e.key === 'u' || e.key === 'U') {
        setShowUpgradeMenu(!showUpgradeMenu);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, unlockedWeapons, switchWeapon, showUpgradeMenu]);

  const handleWeaponSwitch = (weapon: WeaponType) => {
    if (unlockedWeapons.includes(weapon)) {
      switchWeapon(weapon);
    }
  };

  const handleUnlockWeapon = (weapon: WeaponType) => {
    const config = WEAPON_CONFIGS[weapon];
    const unlockCost = config.upgradeCost * 2;

    if (weaponPoints >= unlockCost && !unlockedWeapons.includes(weapon)) {
      unlockWeapon(weapon);
      // Deduct points (handled in store)
    }
  };

  const handleUpgrade = (weapon: WeaponType, type: 'damage' | 'fireRate' | 'reload' | 'ammo') => {
    const upgrades = weaponUpgrades[weapon];
    const currentLevel = upgrades[`${type}Level`];

    if (currentLevel < 5) { // Max 5 levels per upgrade
      upgradeWeapon(weapon, type);
    }
  };

  const calculateUpgradedStat = (weapon: WeaponType, stat: 'damage' | 'fireRate' | 'reload' | 'ammo'): number => {
    const config = WEAPON_CONFIGS[weapon];
    const upgrades = weaponUpgrades[weapon];

    switch (stat) {
      case 'damage':
        return config.damage * (1 + upgrades.damageLevel * 0.2);
      case 'fireRate':
        return config.fireRate * (1 - upgrades.fireRateLevel * 0.1);
      case 'reload':
        return (config.reloadTime || 0) * (1 - upgrades.reloadLevel * 0.15);
      case 'ammo':
        return (config.ammo || 0) * (1 + upgrades.ammoLevel * 0.25);
      default:
        return 0;
    }
  };

  const getWeaponIcon = (weapon: WeaponType): string => {
    switch (weapon) {
      case 'energy-pistol':
        return '🔫';
      case 'nail-bat':
        return '⚾';
      case 'flamethrower':
        return '🔥';
      default:
        return '❓';
    }
  };

  if (!isPlaying) return null;

  return (
    <>
      {/* Weapon Selection Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: isMobile ? '80px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '12px',
          borderRadius: '15px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}
      >
        {(['energy-pistol', 'nail-bat', 'flamethrower'] as WeaponType[]).map((weapon, index) => {
          const config = WEAPON_CONFIGS[weapon];
          const isUnlocked = unlockedWeapons.includes(weapon);
          const isCurrent = currentWeapon === weapon;
          const unlockCost = config.upgradeCost * 2;

          return (
            <div
              key={weapon}
              onClick={() => isUnlocked ? handleWeaponSwitch(weapon) : handleUnlockWeapon(weapon)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (isUnlocked) {
                  setSelectedWeaponForUpgrade(weapon);
                  setShowUpgradeMenu(true);
                }
              }}
              style={{
                position: 'relative',
                width: isMobile ? '70px' : '90px',
                height: isMobile ? '70px' : '90px',
                backgroundColor: isCurrent
                  ? 'rgba(255, 100, 100, 0.3)'
                  : isUnlocked
                  ? 'rgba(50, 50, 50, 0.5)'
                  : 'rgba(30, 30, 30, 0.5)',
                border: isCurrent
                  ? '3px solid #ff4444'
                  : isUnlocked
                  ? '2px solid rgba(255, 255, 255, 0.3)'
                  : '2px solid rgba(100, 100, 100, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                opacity: isUnlocked ? 1 : 0.5,
                transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isCurrent ? '0 0 20px rgba(255, 100, 100, 0.5)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isCurrent ? 'scale(1.1)' : 'scale(1)';
              }}
            >
              {/* Keyboard hint */}
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '-8px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'white',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {index + 1}
              </div>

              {/* Weapon icon */}
              <div style={{ fontSize: isMobile ? '28px' : '36px', marginBottom: '4px' }}>
                {getWeaponIcon(weapon)}
              </div>

              {/* Weapon name */}
              <div
                style={{
                  fontSize: isMobile ? '9px' : '11px',
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px black'
                }}
              >
                {config.name.split(' ')[0]}
              </div>

              {/* Lock or upgrade indicator */}
              {!isUnlocked ? (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    fontSize: '9px',
                    color: '#ffcc00',
                    fontWeight: 'bold'
                  }}
                >
                  🔒 {unlockCost}pts
                </div>
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    display: 'flex',
                    gap: '1px'
                  }}
                >
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      style={{
                        width: '3px',
                        height: '6px',
                        backgroundColor:
                          weaponUpgrades[weapon].damageLevel > level
                            ? '#00ff00'
                            : 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '1px'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weapon Stats Display */}
      <div
        style={{
          position: 'fixed',
          top: isMobile ? '120px' : '80px',
          right: isMobile ? '10px' : '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '12px',
          borderRadius: '10px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          minWidth: isMobile ? '140px' : '180px',
          color: 'white',
          fontSize: isMobile ? '11px' : '13px',
          zIndex: 99,
          backdropFilter: 'blur(5px)'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#ff4444' }}>
          {WEAPON_CONFIGS[currentWeapon].name}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            💥 Damage: <span style={{ color: '#00ff00' }}>{Math.round(calculateUpgradedStat(currentWeapon, 'damage'))}</span>
          </div>
          <div>
            ⚡ Fire Rate: <span style={{ color: '#00ffff' }}>{Math.round(calculateUpgradedStat(currentWeapon, 'fireRate'))}ms</span>
          </div>
          {WEAPON_CONFIGS[currentWeapon].reloadTime && (
            <div>
              🔄 Reload: <span style={{ color: '#ffff00' }}>{(calculateUpgradedStat(currentWeapon, 'reload') / 1000).toFixed(1)}s</span>
            </div>
          )}
          {WEAPON_CONFIGS[currentWeapon].ammo && (
            <div>
              📦 Ammo: <span style={{ color: '#ff9900' }}>{Math.round(calculateUpgradedStat(currentWeapon, 'ammo'))}</span>
            </div>
          )}
          {WEAPON_CONFIGS[currentWeapon].lifeSteal && (
            <div>
              ❤️ Life Steal: <span style={{ color: '#ff00ff' }}>{(WEAPON_CONFIGS[currentWeapon].lifeSteal! * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#ffcc00' }}>
            Upgrade Points: {weaponPoints}
          </div>
        </div>
      </div>

      {/* Upgrade Menu */}
      {showUpgradeMenu && selectedWeaponForUpgrade && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            padding: isMobile ? '20px' : '30px',
            borderRadius: '15px',
            border: '3px solid rgba(255, 100, 100, 0.5)',
            minWidth: isMobile ? '280px' : '400px',
            maxWidth: '90vw',
            color: 'white',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px' }}>
              Upgrade: {WEAPON_CONFIGS[selectedWeaponForUpgrade].name}
            </h2>
            <button
              onClick={() => setShowUpgradeMenu(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0 10px'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginBottom: '15px', fontSize: isMobile ? '12px' : '14px', color: '#ffcc00' }}>
            Available Points: {weaponPoints}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(['damage', 'fireRate', 'reload', 'ammo'] as const).map(type => {
              const upgrades = weaponUpgrades[selectedWeaponForUpgrade];
              const currentLevel = upgrades[`${type}Level`];
              const maxLevel = 5;
              const cost = 500;
              const canUpgrade = weaponPoints >= cost && currentLevel < maxLevel;

              // Skip reload/ammo if weapon doesn't have them
              if (type === 'reload' && !WEAPON_CONFIGS[selectedWeaponForUpgrade].reloadTime) return null;
              if (type === 'ammo' && !WEAPON_CONFIGS[selectedWeaponForUpgrade].ammo) return null;

              const labels = {
                damage: '💥 Damage',
                fireRate: '⚡ Fire Rate',
                reload: '🔄 Reload Speed',
                ammo: '📦 Ammo Capacity'
              };

              return (
                <div
                  key={type}
                  style={{
                    backgroundColor: 'rgba(50, 50, 50, 0.5)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: isMobile ? '12px' : '14px' }}>{labels[type]}</div>
                    <button
                      onClick={() => handleUpgrade(selectedWeaponForUpgrade, type)}
                      disabled={!canUpgrade}
                      style={{
                        backgroundColor: canUpgrade ? '#ff4444' : '#555',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '5px',
                        cursor: canUpgrade ? 'pointer' : 'not-allowed',
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 'bold',
                        opacity: canUpgrade ? 1 : 0.5
                      }}
                    >
                      Upgrade ({cost}pts)
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: '10px',
                          backgroundColor: currentLevel > level ? '#00ff00' : 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '3px',
                          border: '1px solid rgba(0, 0, 0, 0.5)'
                        }}
                      />
                    ))}
                    <div style={{ fontSize: isMobile ? '11px' : '12px', marginLeft: '8px', color: '#aaa' }}>
                      {currentLevel}/{maxLevel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', fontSize: isMobile ? '10px' : '11px', color: '#aaa', textAlign: 'center' }}>
            Right-click weapon icon or press U to open upgrades
          </div>
        </div>
      )}
    </>
  );
}
