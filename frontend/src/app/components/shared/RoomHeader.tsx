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
}

export default function RoomHeader({
  gameTitle,
  roomCode,
  status,
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

      <div className="container mx-auto px-6 py-4 flex flex-col gap-4 relative z-10">
        {/* TOP ROW: Primary Brand & Navigation Control */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.9 }}>
              <BackButton />
            </motion.div>
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                {t.title}
              </h1>
              <h2 className="text-[16px] lg:text-[20px] font-bold uppercase tracking-[0.3em] text-teal-400 italic">
                {gameTitle?.toUpperCase() || t.lobby}
              </h2>
            </div>
          </div>

          <div className="hidden lg:block">
            <LanguageSelector />
          </div>
        </div>

        {/* BOTTOM ROW: Technical Metadata & Status */}
        <div className="flex items-center justify-between w-full border-t border-white/5 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-[0.5em] text-[12px] uppercase">
                {t.roomPlaceholder}:
              </span>
              <span className="text-white font-black tracking-widest bg-zinc-900 px-3 py-1 rounded border border-zinc-800 text-[12px] lg:text-xs shadow-inner">
                {roomCode}
              </span>
            </div>

            <div className="h-3 w-[1px] bg-zinc-800" />

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
                className={`text-[9px] font-black tracking-[0.3em] uppercase ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="lg:hidden scale-90 origin-right">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
