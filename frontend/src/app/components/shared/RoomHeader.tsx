"use client";

import { useMemo } from "react";
import BackButton from "./BackButton";
import LanguageSelector from "../shared/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook
import { toPersianDigits } from "@/lib/translations"; // Numerical localization utility

interface RoomHeaderProps {
  gameTitle: string; // e.g., "Dixit" or "PiouPiou"
  roomCode: string; // e.g., "YXQI"
  status: string; // e.g., "LOBBY", "PLAYING", "FINISHED"
}

/**
 * RoomHeader: Global header visually synced with the main page header.
 * Optimized for Digital Craftsmanship with integrated navigation and localization.
 */
export default function RoomHeader({
  gameTitle,
  roomCode,
  status,
}: RoomHeaderProps) {
  const { t, lang } = useTranslation(); // Destructured localization set
  const isFA = lang === "fa";

  const statusConfig = useMemo(() => {
    switch (status.toUpperCase()) {
      case "PLAYING":
      case "ACTIVE":
        return {
          color: "text-green-500",
          label: t.statusLive || "LIVE", // Localized: LIVE/EN DIRECT/LIVE/در حال بازی
          pulse: true,
        };
      case "FINISHED":
      case "ENDED":
      case "ARCHIVED":
        return {
          color: "text-zinc-500",
          label: t.statusArchived || "ARCHIVED", // Localized: ARCHIVED/ARCHIVÉ/ARCHIVIERT/بایگانی شده[cite: 2]
          pulse: false,
        };
      default:
        return {
          color: "text-blue-500",
          label: t.statusLobby || "INITIALIZING", // Localized: INITIALIZING/INITIALISATION/INITIALISIERUNG/آماده‌سازی[cite: 2]
          pulse: true,
        };
    }
  }, [status, t]);

  return (
    <header className="w-full border-b border-white/5 bg-[#000000]/80 backdrop-blur-xl sticky top-0 z-50 font-mono">
      <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
        {/* TOP ROW: Primary Brand & Navigation Control */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <BackButton />
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                LUNARIS
              </h1>
              <h2 className="text-[16px] lg:text-[20px] font-bold uppercase tracking-[0.3em] text-[#14b8a6] italic">
                {gameTitle || t.lobby}
              </h2>
            </div>
          </div>

          <div className="hidden lg:block">
            <LanguageSelector />
          </div>
        </div>

        {/* BOTTOM ROW: Technical Metadata & Status[cite: 2] */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-[0.3em] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[10px] lg:text-xs">
                {/* Localized: ROOM/SALLE/RAUM/اتاق[cite: 2] */}
                {t.room}: {isFA ? toPersianDigits(roomCode) : roomCode}
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
                className={`text-[9px] font-bold tracking-[0.2em] uppercase ${statusConfig.color}`}
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
