import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PointerLockControls, Stars } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { useGameStore } from '@/game/store';
import { Player } from '@/game/Player';
import { Weapon } from '@/game/Weapon';
import { Level } from '@/game/Level';
import { EnemyManager } from '@/game/Enemy';
import { Button } from '@/components/ui/button';
import { useSubmitScore, useScores } from '@/hooks/use-scores';
import { Loader2, Trophy, Skull, Target, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LEVEL_CONFIGS } from '@/game/store';
import { Progress } from '@/components/ui/progress';
import { AudioController as AudioManagerEnhanced } from '@/game/AudioManagerEnhanced';
import { DamageVignette } from '@/game/VisualEffects';
import { getLevelStory, STORY_TEXT } from '@/game/StorySystem';
import { MobileControls, isMobileDevice } from '@/game/MobileControls';
import { IntroSequence } from '@/game/IntroSequence';
import { PowerUpSpawner, ActivePowerUpsUI } from '@/game/PowerUps';
import { WeaponSelector } from '@/game/WeaponSelector';
import { KillFeed } from '@/game/KillFeed';
import { BossHealthBar } from '@/game/BossHealthBar';
import { CutsceneManager } from '@/game/Cutscenes';

function UI() {
  const {
    score,
    health,
    isGameOver,
    isPlaying,
    startGame,
    resetGame,
    currentLevel,
    enemiesKilled,
    levelProgress,
    isLevelComplete,
    showLevelTransition,
    nextLevel,
    completeLevelTransition
  } = useGameStore();
  const { mutate: submitScore, isPending } = useSubmitScore();
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const { data: scores } = useScores();

  const handleStart = () => {
    // Request pointer lock
    const canvas = document.querySelector('canvas');
    canvas?.requestPointerLock();
    startGame();
  };

  const handleSubmit = () => {
    if (!username.trim()) {
      toast({ title: "Name required", description: "Please enter a name for the leaderboard", variant: "destructive" });
      return;
    }
    submitScore({ username, score }, {
      onSuccess: () => {
        toast({ title: "Score Saved!", description: `You ranked on the leaderboard!` });
        resetGame();
        setUsername("");
      }
    });
  };

  const config = LEVEL_CONFIGS[currentLevel];
  const requiredKills = config.requiredKills;

  const handleNextLevel = () => {
    nextLevel();
    completeLevelTransition();
    const canvas = document.querySelector('canvas');
    canvas?.requestPointerLock();
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 md:p-6">
      {/* Top HUD - MOBILE FRIENDLY + STRANGER THINGS RED THEME */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full gap-2 md:gap-0">
        <div className="flex flex-col gap-2 md:gap-3 w-full md:w-auto">
          <div className="hud-text text-2xl md:text-4xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
            SCORE: {score.toString().padStart(6, '0')}
          </div>

          {/* Level Info - STRANGER THINGS RED THEME */}
          <div className="bg-black/70 border border-red-600/40 p-2 md:p-3 rounded backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              <span className="font-mono text-red-400 text-xs md:text-sm">LVL {currentLevel}: {config.name.toUpperCase()}</span>
            </div>

            {/* Kill Progress */}
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
              <span className="font-mono text-white text-xs">
                KILLS: {enemiesKilled}/{requiredKills}
              </span>
            </div>

            {/* Progress Bar - RED THEME */}
            <div className="w-full md:w-56 h-2 bg-black/50 border border-red-900 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 md:gap-2 w-full md:w-auto">
          <div className="hud-text text-xl md:text-2xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            HP: {health}%
          </div>
          <div className="w-full md:w-48 h-3 md:h-4 bg-black/50 border border-red-900 md:skew-x-[-15deg]">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="crosshair" />
      <div className="vignette" />
      <div className="scanlines" />

      {/* NEW ENHANCEMENTS */}
      <ActivePowerUpsUI />
      <KillFeed />
      <BossHealthBar />
      <WeaponSelector />

      {/* Level Transition Overlay */}
      {showLevelTransition && currentLevel < 3 && (() => {
        const victoryStory = getLevelStory(currentLevel, 'victory');
        const nextStory = getLevelStory(currentLevel + 1, 'intro');
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-auto backdrop-blur-md z-50">
            <div className="bg-zinc-900/90 border border-cyan-500/50 p-12 rounded-lg max-w-3xl w-full shadow-[0_0_80px_rgba(0,255,255,0.3)] animate-pulse">
              <h1 className="text-7xl text-center mb-6 bg-gradient-to-t from-green-600 to-green-300 bg-clip-text text-transparent font-bold">
                {victoryStory.title}
              </h1>

              <div className="text-center space-y-3 mb-8">
                {victoryStory.text.map((line, i) => (
                  <p key={i} className="text-lg text-cyan-200/80 font-mono italic">{line}</p>
                ))}
                <p className="text-xl text-white/70 font-mono pt-4">
                  KILLS: {enemiesKilled} | SCORE: +{score}
                </p>
              </div>

              <div className="border-t border-cyan-500/30 pt-6 mb-8">
                <h2 className="text-2xl text-center text-red-400 font-mono mb-4">
                  {nextStory.title}
                </h2>
                <p className="text-center text-amber-400 font-mono text-lg mb-2">
                  THREAT: {nextStory.threat}
                </p>
                {nextStory.text.map((line, i) => (
                  <p key={i} className="text-center text-white/60 text-sm font-mono">{line}</p>
                ))}
                <p className="text-center text-cyan-300 text-xs mt-4">{nextStory.tip}</p>
              </div>

              <Button
                onClick={handleNextLevel}
                className="w-full py-8 text-3xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,255,255,0.5)] font-bold"
              >
                CONTINUE MISSION
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Victory Screen (Level 3 Complete) */}
      {isLevelComplete && currentLevel === 3 && !isGameOver && (() => {
        const victoryStory = getLevelStory(3, 'victory');
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-auto backdrop-blur-md z-50">
            <div className="bg-zinc-900/90 border border-green-500/50 p-12 rounded-lg max-w-3xl w-full shadow-[0_0_80px_rgba(0,255,0,0.3)]">
              <h1 className="text-7xl text-center mb-6 bg-gradient-to-t from-green-600 to-green-300 bg-clip-text text-transparent font-bold animate-pulse">
                {victoryStory.title}
              </h1>

              <div className="text-center space-y-3 mb-8">
                {victoryStory.text.map((line, i) => (
                  <p key={i} className="text-lg text-green-200/80 font-mono italic">{line}</p>
                ))}
                <p className="text-xl text-white font-mono pt-4">
                  FINAL SCORE: {score.toString().padStart(6, '0')}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <Input
                  placeholder="ENTER CALLSIGN"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="bg-black/50 border-green-900 font-mono text-green-400 uppercase tracking-widest text-center text-xl"
                  maxLength={10}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold tracking-widest py-6 text-xl"
                >
                  {isPending ? <Loader2 className="animate-spin mr-2" /> : "SUBMIT TO LEADERBOARD"}
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full border-cyan-900 text-cyan-400 hover:bg-cyan-900/20 py-6"
                >
                  PLAY AGAIN
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Start/Game Over Overlay - STRANGER THINGS RED THEME */}
      {(!isPlaying || isGameOver) && !isLevelComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm z-50">
          <div className="bg-zinc-900/90 border border-red-600/40 p-4 md:p-8 rounded-lg max-w-2xl w-full shadow-[0_0_50px_rgba(255,0,0,0.2)]">
            <h1 className="text-4xl md:text-6xl text-center mb-6 md:mb-8 bg-gradient-to-t from-red-600 to-orange-500 bg-clip-text text-transparent">
              {isGameOver ? "MISSION FAILED" : "HAWKINS DEFENSE"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Controls / Submission */}
              <div className="space-y-6">
                {isGameOver ? (
                  <div className="space-y-4">
                    <p className="text-2xl text-center text-white font-mono">FINAL SCORE: {score}</p>
                    <div className="space-y-2">
                      <Input
                        placeholder="ENTER CALLSIGN"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="bg-black/50 border-red-900 font-mono text-red-400 uppercase tracking-widest"
                        maxLength={10}
                      />
                      <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest"
                      >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : "UPLOAD DATA"}
                      </Button>
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="w-full border-orange-700 text-orange-400 hover:bg-orange-900/20"
                      >
                        RETRY MISSION
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6 text-center">
                    <div className="text-white/70 font-mono text-xs md:text-sm space-y-2 md:space-y-3 border border-red-900/40 p-3 md:p-4 bg-black/30 rounded">
                      <p className="text-red-500 font-bold text-base md:text-lg mb-2">{STORY_TEXT.intro.title}</p>
                      {STORY_TEXT.intro.text.map((line, i) => (
                        <p key={i} className="text-white/80 italic text-xs md:text-sm">{line}</p>
                      ))}
                      <div className="border-t border-red-900/40 pt-2 md:pt-3 mt-2 md:mt-3">
                        <p className="text-red-400 font-bold text-sm md:text-base">CONTROLS:</p>
                        <p className="text-xs md:text-sm">WASD to Move | SPACE to Jump | MOUSE to Look/Shoot</p>
                      </div>
                      <p className="mt-2 md:mt-3 text-orange-400 text-xs">Fight through 3 levels:</p>
                      <p className="text-xs">Demogorgon Hunt → Mind Flayer Invasion → Vecna's Curse</p>
                    </div>
                    <Button
                      onClick={handleStart}
                      className="w-full py-6 md:py-8 text-xl md:text-2xl bg-red-600 hover:bg-red-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                    >
                      START MISSION
                    </Button>
                  </div>
                )}
              </div>

              {/* Leaderboard - STRANGER THINGS THEME */}
              <div className="border-l border-white/10 pl-4 md:pl-8 hidden md:block">
                <div className="flex items-center gap-2 mb-4 text-orange-500">
                  <Trophy className="w-5 h-5" />
                  <h3 className="text-base md:text-lg font-bold">ELITE OPERATIVES</h3>
                </div>

                <div className="space-y-2 font-mono text-xs md:text-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {scores?.sort((a,b) => b.score - a.score).slice(0, 10).map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5 hover:border-red-600/50 transition-colors">
                      <span className="text-red-400">#{i + 1} {s.username}</span>
                      <span className="text-white font-bold">{s.score}</span>
                    </div>
                  ))}
                  {(!scores || scores.length === 0) && (
                    <div className="text-white/30 text-center py-8">No records found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Game() {
  const isMobile = isMobileDevice();
  const [showIntro, setShowIntro] = useState(true);

  const handleMobileMove = (x: number, y: number) => {
    if ((window as any).setPlayerMobileInput) {
      (window as any).setPlayerMobileInput(x, y);
    }
  };

  const handleMobileLook = (deltaX: number, deltaY: number) => {
    if ((window as any).setPlayerLookDelta) {
      (window as any).setPlayerLookDelta(deltaX, deltaY);
    }
  };

  const handleMobileShoot = () => {
    if ((window as any).mobileShoot) {
      (window as any).mobileShoot();
    }
  };

  const handleMobileJump = () => {
    if ((window as any).setPlayerMobileInput) {
      // Trigger jump by simulating space key
      const event = new KeyboardEvent('keydown', { code: 'Space' });
      window.dispatchEvent(event);
      setTimeout(() => {
        const eventUp = new KeyboardEvent('keyup', { code: 'Space' });
        window.dispatchEvent(eventUp);
      }, 100);
    }
  };

  return (
    <>
      {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}

      <div className="relative w-full h-screen bg-black overflow-hidden touch-none">
        <Canvas
          shadows="soft"
          camera={{ fov: 75, near: 0.1, far: 1000 }}
          gl={{
            antialias: !isMobile,
            powerPreference: isMobile ? 'low-power' : 'high-performance',
            pixelRatio: isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio,
            toneMapping: 3, // ACESFilmicToneMapping for cinematic look
            toneMappingExposure: 1.2,
            outputColorSpace: 'srgb'
          }}
        >
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={isMobile ? 2000 : 5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.1} />
          <Physics gravity={[0, -9.8, 0]}>
            <Player />
            <Weapon />
            <EnemyManager />
            <Level />
            <PowerUpSpawner />
          </Physics>
          <CutsceneManager />
          <DamageVignette />
          {!isMobile && <PointerLockControls />}
        </Suspense>
      </Canvas>
      <AudioManagerEnhanced />
      <MobileControls
        onMove={handleMobileMove}
        onLook={handleMobileLook}
        onShoot={handleMobileShoot}
        onJump={handleMobileJump}
      />
        <UI />
      </div>
    </>
  );
}
