"use client";

import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

/**
 * DangerBadge: High-visibility alert for players near victory.
 * Uses the brand's secondary orange accent for "Verge of Winning" state.
 * Refactored for LTR Multilingual support.
 */
export default function DangerBadge() {
  const { t } = useTranslation(); // Destructured localization set

  return (
    <div className="absolute -top-3 -left-2 z-20 flex items-center gap-1.5 rounded-md border border-orange-500/50 bg-[#000000] px-2 py-1 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-bounce">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
      </span>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 font-mono">
        {/* Localized Label: NEARLY WINNING! / PRESQUE GAGNÉ! / FAST GEWONNEN! / یک قدم تا پیروزی! */}
        {t.nearlyWinning}
      </span>
    </div>
  );
}
