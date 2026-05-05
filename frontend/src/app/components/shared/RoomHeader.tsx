"use client";

import { useMemo } from "react";

interface RoomHeaderProps {
  gameTitle: string; // e.g., "Dixit" or "PiouPiou"
  roomCode: string; // e.g., "YXQI"
  status: string; // e.g., "LOBBY", "PLAYING", "FINISHED"
}

/**
 * RoomHeader: Global header visually synced with the main page header.
 * Uses bold white italic branding and teal monospaced metadata.
 */
export default function RoomHeader({
  gameTitle,
  roomCode,
  status,
}: RoomHeaderProps) {
  const statusConfig = useMemo(() => {
    switch (status.toUpperCase()) {
      case "PLAYING":
      case "ACTIVE":
        return { color: "text-green-500", label: "LIVE", pulse: true };
      case "FINISHED":
      case "ENDED":
        return { color: "text-zinc-500", label: "ARCHIVED", pulse: false };
      default:
        return { color: "text-blue-500", label: "INITIALIZING", pulse: true };
    }
  }, [status]);

  return (
    <header className="w-full border-b border-white/5 bg-[#000000]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-6 flex flex-col items-start gap-1">
        {/* Top Row: Visual Branding */}
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
            LUNARIS
          </h1>

          <h2 className="text-[20px] font-bold uppercase tracking-[0.3em] text-[#14b8a6] font-mono italic">
            {gameTitle || "System_Lobby"}
          </h2>
        </div>

        {/* Bottom Row: Game Title & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-mono font-bold tracking-[0.3em] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-xs">
              Room Code: {roomCode}
            </span>
          </div>

          <div className="h-2 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="relative flex h-1.5 w-1.5">
              {statusConfig.pulse && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.color.replace("text", "bg")}`}
                />
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusConfig.color.replace("text", "bg")}`}
              />
            </div>
            <span
              className={`font-mono text-[9px] font-bold tracking-[0.2em] uppercase ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
