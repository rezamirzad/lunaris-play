"use client";

import { useMemo } from "react";
import BackButton from "./BackButton";
import LanguageSelector from "../shared/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { motion } from "framer-motion";

interface RoomHeaderProps {
  gameTitle: string;
  roomCode: string;
  status: string;
  playerName?: string;
  currentTurnPlayerName?: string;
  isMyTurn?: boolean;
  isRoundEnded?: boolean;
  isBoardView?: boolean;
}

export default function RoomHeader({
  gameTitle,
  roomCode,
  status,
  playerName,
  currentTurnPlayerName,
  isMyTurn,
  isRoundEnded,
  isBoardView = false,
}: RoomHeaderProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const statusConfig = useMemo(() => {
    switch (status.toUpperCase()) {
      case "PLAYING":
      case "ACTIVE":
        return {
          color: "text-teal-400",
          glow: "shadow-[0_0_10px_rgba(45,212,191,0.8)]",
          label: t.statusLive || "LIVE_NODE",
          pulse: true,
        };
      case "FINISHED":
      case "ENDED":
      case "ARCHIVED":
        return {
          color: "text-red-500",
          glow: "shadow-[0_0_10px_rgba(239,68,68,0.5)]",
          label: t.statusArchived || "TERMINATED",
          pulse: false,
        };
      default:
        return {
          color: "text-orange-500",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.5)]",
          label: t.statusLobby,
          pulse: true,
        };
    }
  }, [status, t]);

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 font-mono overflow-hidden">
      {/* Background terminal scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 relative z-10">
        {/* TOP ROW: Primary Brand & Navigation Control */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.9 }} className="shrink-0">
              <BackButton />
            </motion.div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-4 min-w-0">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-none truncate">
                {t.title}
              </h1>
              <h2 
                dir={isFA ? "rtl" : "ltr"}
                className={`text-[10px] sm:text-[16px] lg:text-[20px] font-bold uppercase italic text-teal-400 truncate ${isFA ? 'fa-text-fix' : 'tracking-[0.2em] sm:tracking-[0.3em]'}`}
              >
                {gameTitle?.toUpperCase() || t.lobby}
              </h2>
            </div>
          </div>

          <div className="scale-75 sm:scale-100 origin-right shrink-0">
            <LanguageSelector />
          </div>
        </div>

        {/* BOTTOM ROW: Technical Metadata & Live Status */}
        <div className="flex items-center justify-between w-full border-t border-white/5 pt-3 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-[10px] sm:text-[12px] uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-[0.3em]'}`}>
                {t.roomPlaceholder}:
              </span>
              <span className="text-white font-black tracking-widest bg-zinc-900 px-3 py-1 rounded border border-zinc-800 text-[10px] sm:text-[12px] lg:text-xs shadow-inner">
                {roomCode}
              </span>
            </div>

            {/* Player Name Badge on Phone View */}
            {!isBoardView && playerName && (
              <>
                <div className="h-3 w-[1px] bg-zinc-800" />
                <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                  <span className="text-[10px]">👤</span>
                  <span className="text-[11px] font-black text-white italic truncate max-w-[120px] sm:max-w-[180px]">
                    {playerName}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Live Round & Turn Status Badge on Phone View */}
            {!isBoardView && status.toUpperCase() === "PLAYING" ? (
              <div className="flex items-center">
                {isRoundEnded ? (
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <span>🏁</span>
                    <span>ROUND ENDED</span>
                  </span>
                ) : isMyTurn ? (
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] font-mono font-black uppercase tracking-wider bg-teal-400 text-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.5)] flex items-center gap-1"
                  >
                    <span>⚡</span>
                    <span>YOUR TURN</span>
                  </motion.span>
                ) : currentTurnPlayerName ? (
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full flex items-center gap-1">
                    <span>🎮</span>
                    <span>TURN: {currentTurnPlayerName}</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <motion.span
                        animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inline-flex h-full w-full rounded-full bg-teal-400"
                      />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-teal-400 tracking-[0.3em]">
                      {statusConfig.label}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  {statusConfig.pulse && (
                    <motion.span
                      animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inline-flex h-full w-full rounded-full ${statusConfig.color.replace("text", "bg")}`}
                    />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.color.replace("text", "bg")} ${statusConfig.glow}`}
                  />
                </div>
                <span
                  dir={isFA ? "rtl" : "ltr"}
                  className={`text-[8px] sm:text-[9px] font-black uppercase ${statusConfig.color} ${isFA ? 'fa-text-fix' : 'tracking-[0.3em]'}`}
                >
                  {statusConfig.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
