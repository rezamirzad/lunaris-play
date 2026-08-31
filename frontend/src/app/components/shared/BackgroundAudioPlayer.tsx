"use client";

import React, { useEffect, useRef, useState } from "react";

export interface YouTubePreset {
  id: string;
  name: string;
  youtubeId?: string;
  type: "local" | "youtube";
}

export const INCANGOLD_YOUTUBE_PRESETS: YouTubePreset[] = [
  { id: "local", name: "🦇 Cavern Ambience (Local)", type: "local" },
  { id: "UiZNMDrEbko", name: "🤠 Indiana Jones Temple 1", type: "youtube", youtubeId: "UiZNMDrEbko" },
  { id: "vzulc7RlNpA", name: "🏺 Lost Tomb Expedition", type: "youtube", youtubeId: "vzulc7RlNpA" },
  { id: "205meIww0zg", name: "💧 Deep Cavern & Water Echoes", type: "youtube", youtubeId: "205meIww0zg" },
  { id: "naU5pbyFHEs", name: "🔥 Fire & Shamanic Drums", type: "youtube", youtubeId: "naU5pbyFHEs" },
  { id: "1Pe5MKvrvdk", name: "🏛️ Ancient Incan Sanctuary", type: "youtube", youtubeId: "1Pe5MKvrvdk" },
];

interface BackgroundAudioPlayerProps {
  /** Source URL or array of source URLs for the background track (.mp3, .webm, .ogg) */
  src?: string | string[];
  /** Default volume between 0.0 and 1.0 (default: 0.3) */
  initialVolume?: number;
  /** Whether to loop the final background track (default: true) */
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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("local");

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
      const savedPreset = localStorage.getItem("lunaris_ambient_preset");
      if (savedPreset) {
        setSelectedPresetId(savedPreset);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Update audio element volume & muted state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Attempt to play current track
  const attemptPlay = React.useCallback(async () => {
    if (!audioRef.current || sources.length === 0) return;
    try {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      // Autoplay policy prevented playback until user interaction
      setIsPlaying(false);
    }
  }, [sources.length, volume, isMuted]);

  // Handle track ending (Option B: Sequential Intro -> Looping Ambient)
  const handleTrackEnded = () => {
    if (currentTrackIndex < sources.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    } else if (!loop) {
      setIsPlaying(false);
    }
  };

  // Play audio whenever currentTrackIndex changes
  useEffect(() => {
    if (selectedPresetId === "local" && audioRef.current) {
      attemptPlay();
    }
  }, [currentTrackIndex, selectedPresetId, attemptPlay]);

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
    if (selectedPresetId === "local") {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        attemptPlay();
      }
    } else {
      setIsPlaying(!isPlaying);
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

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    try {
      localStorage.setItem("lunaris_ambient_preset", presetId);
    } catch {}
    if (presetId !== "local" && audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (sources.length === 0) return null;

  const currentSrc = sources[currentTrackIndex] || sources[0];
  const isFinalTrack = currentTrackIndex === sources.length - 1;
  const activePreset = INCANGOLD_YOUTUBE_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Local HTML5 Audio Player */}
      {selectedPresetId === "local" && (
        <audio
          ref={audioRef}
          key={currentSrc}
          src={currentSrc}
          loop={isFinalTrack ? loop : false}
          preload="auto"
          onEnded={handleTrackEnded}
        />
      )}

      {/* YouTube Embedded Audio Player (Hidden Iframe Streaming) */}
      {activePreset?.type === "youtube" && activePreset.youtubeId && !isMuted && (
        <iframe
          key={activePreset.youtubeId}
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/${activePreset.youtubeId}?autoplay=1&loop=1&playlist=${activePreset.youtubeId}&controls=0`}
          title={activePreset.name}
          allow="autoplay"
          className="absolute opacity-0 pointer-events-none w-0 h-0"
        />
      )}

      {showControls && (
        <div className="flex items-center gap-2 bg-black/70 border border-white/15 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg text-xs font-mono select-none">
          {/* Play / Pause Toggle */}
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

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="text-slate-300 hover:text-white transition-colors p-1"
          >
            {isMuted || volume === 0 ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
          </button>

          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500 hidden sm:block"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />

          {/* YouTube & Local Soundtrack Preset Selector */}
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="bg-black/80 text-amber-300 border border-white/20 text-[10px] rounded-lg px-2 py-0.5 outline-none cursor-pointer hover:border-amber-400 transition-colors"
            title="Select Ambient Soundtrack Preset"
          >
            {INCANGOLD_YOUTUBE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-zinc-900 text-amber-200">
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default BackgroundAudioPlayer;
