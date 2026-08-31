"use client";

import React, { useEffect, useRef, useState } from "react";

interface BackgroundAudioPlayerProps {
  /** Source URL or array of source URLs for the background track (.mp3, .webm, .ogg) */
  src?: string | string[];
  /** Default volume between 0.0 and 1.0 (default: 0.3) */
  initialVolume?: number;
  /** Whether to loop the track (default: true) */
  loop?: boolean;
  /** Custom label or title for the audio track */
  title?: string;
  /** Accent theme color matching arcade design */
  accentColor?: "amber" | "orange" | "teal" | "blue" | "cyan" | "rose";
  /** Optional class name override */
  className?: string;
  /** Whether to render floating compact controls UI (default: true) */
  showControls?: boolean;
}

export const BackgroundAudioPlayer: React.FC<BackgroundAudioPlayerProps> = ({
  src,
  initialVolume = 0.3,
  loop = true,
  title = "Ambient Audio",
  accentColor = "amber",
  className = "",
  showControls = true,
}) => {
  const sources = Array.isArray(src) ? src : src ? [src] : [];
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(initialVolume);

  // Load user audio preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedMute = localStorage.getItem("lunaris_audio_muted");
      if (savedMute !== null) {
        setIsMuted(savedMute === "true");
      }
      const savedVol = localStorage.getItem("lunaris_audio_volume");
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed)) setVolume(parsed);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Update audio element volume & muted state across all layered tracks
  useEffect(() => {
    audioRefs.current.forEach((el) => {
      if (el) {
        el.volume = volume;
        el.muted = isMuted;
      }
    });
  }, [volume, isMuted]);

  // Attempt to play all audio layers
  const attemptPlay = React.useCallback(async () => {
    if (sources.length === 0) return;
    let anyPlayed = false;
    for (const el of audioRefs.current) {
      if (el) {
        try {
          el.volume = volume;
          el.muted = isMuted;
          await el.play();
          anyPlayed = true;
        } catch {
          // Autoplay policy prevented playback until user interaction
        }
      }
    }
    if (anyPlayed) {
      setIsPlaying(true);
    }
  }, [sources.length, volume, isMuted]);

  // Register first user interaction listener to bypass browser autoplay policies
  useEffect(() => {
    if (sources.length === 0) return;

    attemptPlay();

    const handleUserInteraction = () => {
      attemptPlay();
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    window.addEventListener("pointerdown", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [sources.length, attemptPlay]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRefs.current.forEach((el) => el?.pause());
      setIsPlaying(false);
    } else {
      attemptPlay();
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    try {
      localStorage.setItem("lunaris_audio_muted", String(nextMute));
    } catch {}
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    try {
      localStorage.setItem("lunaris_audio_volume", String(newVol));
    } catch {}
  };

  if (sources.length === 0) return null;

  return (
    <div className={`inline-flex items-center ${className}`}>
      {sources.map((url, i) => (
        <audio
          key={url + i}
          ref={(el) => {
            audioRefs.current[i] = el;
          }}
          loop={url.includes("enter") ? false : loop}
          preload="auto"
        >
          <source src={url} type={url.endsWith(".wav") ? "audio/wav" : url.endsWith(".webm") ? "audio/webm" : "audio/mpeg"} />
        </audio>
      ))}

      {showControls && (
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg text-xs font-mono select-none">
          <button
            onClick={togglePlay}
            title={isPlaying ? "Pause Ambient Soundtrack" : "Play Ambient Soundtrack"}
            className="text-amber-400 hover:text-amber-300 transition-colors p-1 flex items-center justify-center"
          >
            {isPlaying ? (
              <span className="animate-pulse text-emerald-400">🎶</span>
            ) : (
              <span className="opacity-60">🎵</span>
            )}
          </button>

          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="text-slate-300 hover:text-white transition-colors p-1"
          >
            {isMuted || volume === 0 ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      )}
    </div>
  );
};

export default BackgroundAudioPlayer;
