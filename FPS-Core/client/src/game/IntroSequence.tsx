/**
 * Intro Sequence with Music and Dedication
 * Features:
 * - "Turn Around" song playing
 * - Dedication message to Awesome Aidan
 * - Animated intro screen
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface IntroSequenceProps {
  onComplete: () => void;
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [step, setStep] = useState<'dedication' | 'story' | 'done'>('dedication');
  const [fadeIn, setFadeIn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fade in effect
    setTimeout(() => setFadeIn(true), 100);

    // Create audio element for "Turn Around"
    // You'll need to add the audio file to public/music/turn-around.mp3
    const audio = new Audio('/music/turn-around.mp3');
    audio.volume = 0.5;
    audio.loop = false;
    audioRef.current = audio;

    // Try to play (might need user interaction first)
    const playAudio = () => {
      audio.play().catch(err => {
        console.log('Audio autoplay blocked, will play on user interaction');
      });
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleContinue = () => {
    if (step === 'dedication') {
      setStep('story');
    } else {
      setStep('done');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onComplete();
    }
  };

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onComplete();
  };

  if (step === 'done') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950 via-black to-purple-950 animate-pulse opacity-50" />

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className={`relative z-10 max-w-4xl mx-auto px-8 text-center transition-opacity duration-2000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {step === 'dedication' && (
          <div className="space-y-12 animate-fade-in">
            {/* Dedication Message */}
            <div className="space-y-6">
              <h1 className="text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x mb-4">
                ✨ DEDICATED TO ✨
              </h1>

              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50 animate-pulse" />
                <h2 className="relative text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] animate-bounce-slow">
                  AWESOME AIDAN
                </h2>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-3xl text-cyan-300 font-mono animate-pulse">
                  🎮 Game Developer Extraordinaire 🎮
                </p>
                <p className="text-xl text-purple-300 italic">
                  "The mind behind the madness"
                </p>
              </div>

              {/* Glowing border effect */}
              <div className="relative mt-12 p-8 rounded-lg border-4 border-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-padding">
                <div className="bg-black rounded p-6">
                  <p className="text-2xl text-white font-light leading-relaxed">
                    This game is a tribute to your <span className="text-cyan-400 font-bold">creativity</span>,{' '}
                    <span className="text-purple-400 font-bold">passion</span>, and{' '}
                    <span className="text-pink-400 font-bold">awesomeness</span>.
                  </p>
                  <p className="text-lg text-gray-400 mt-4">
                    May you save Hawkins with style! 🔥
                  </p>
                </div>
              </div>
            </div>

            {/* Music Note */}
            <div className="flex items-center justify-center gap-3 text-cyan-400 animate-bounce">
              <span className="text-4xl">🎵</span>
              <p className="text-xl font-mono">Now playing: "Turn Around"</p>
              <span className="text-4xl">🎵</span>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              className="mt-8 px-12 py-8 text-3xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transform hover:scale-110 transition-all duration-300 shadow-[0_0_50px_rgba(168,85,247,0.6)] font-bold animate-pulse"
            >
              CONTINUE TO ADVENTURE →
            </Button>
          </div>
        )}

        {step === 'story' && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-7xl font-bold text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-pulse">
              HAWKINS, INDIANA - 1986
            </h1>

            <div className="space-y-4 text-2xl text-white leading-relaxed">
              <p className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                The gate to the Upside Down has reopened...
              </p>
              <p className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
                Strange creatures are pouring through.
              </p>
              <p className="animate-slide-in" style={{ animationDelay: '0.6s' }}>
                You're humanity's last line of defense.
              </p>
              <p className="text-cyan-400 text-3xl font-bold mt-8 animate-slide-in" style={{ animationDelay: '0.8s' }}>
                Good luck, and don't let them reach Hawkins.
              </p>
            </div>

            <div className="flex gap-6 justify-center mt-12">
              <Button
                onClick={handleContinue}
                className="px-12 py-8 text-3xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transform hover:scale-110 transition-all shadow-[0_0_50px_rgba(255,0,0,0.6)] font-bold"
              >
                BEGIN MISSION
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="px-8 py-8 text-xl border-gray-600 text-gray-400 hover:text-white hover:border-white"
              >
                Skip Intro
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Skip button (always available) */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
      >
        Skip →
      </button>
    </div>
  );
}

// Add this to your global CSS for animations
export const introAnimationStyles = `
@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.8s ease-out forwards;
  opacity: 0;
}

.animate-twinkle {
  animation: twinkle 3s ease-in-out infinite;
}
`;
