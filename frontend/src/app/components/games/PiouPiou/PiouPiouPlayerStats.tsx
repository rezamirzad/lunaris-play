"use client";

import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook
import { toPersianDigits } from "@/lib/translations"; // Utility for localizing digits[cite: 2]

interface PiouPiouPlayerStatsProps {
  state: {
    eggs: number;
    chicks: number;
  };
}

/**
 * PiouPiouPlayerStats: High-fidelity, compact resource monitor.
 * Optimized for Digital Craftsmanship with full localization support.
 */
export default function PiouPiouPlayerStats({
  state,
}: PiouPiouPlayerStatsProps) {
  const { t, lang } = useTranslation(); // Destructured localization set[cite: 2]
  const isFA = lang === "fa";

  return (
    <div className="flex items-center gap-4 sm:gap-6 font-mono">
      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
          {t.chicks} {/* Localized: Chicks/POUSSINS/KÜKEN/جوجه[cite: 2] */}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
          <span className="text-xl font-black text-white tracking-tighter">
            {isFA ? toPersianDigits(state.chicks || 0) : state.chicks || 0}
          </span>
          <span className="text-xs opacity-50">
            / {isFA ? toPersianDigits(3) : 3}
          </span>
        </div>
      </div>

      {/* Vertical Divider for Technical Separation */}
      <div className="h-8 w-[1px] bg-white/10" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
          {t.eggs} {/* Localized: Eggs/OEUFS/EIER/تخم[cite: 2] */}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <span className="text-xl font-black text-white tracking-tighter">
            {isFA ? toPersianDigits(state.eggs || 0) : state.eggs || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
