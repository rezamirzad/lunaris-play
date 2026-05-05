"use client";

import { ReactNode } from "react";
import WinnerBadge from "./WinnerBadge";
import DangerBadge from "./DangerBadge";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

interface PlayerCardProps {
  name: string;
  isReady: boolean;
  isCurrentTurn: boolean;
  isGameFinished?: boolean;
  isWinner?: boolean;
  isNearWinning?: boolean;
  isMatchpoint?: boolean;
  children?: ReactNode;
  statusOverride?: string;
  className?: string;
}

/**
 * PlayerCard: Displays participant data with dynamic status prioritization.
 * Logic: Winner > Matchpoint > statusOverride > Active Turn > Ready/Waiting.
 * Refactored for LTR Multilingual support.
 */
export default function PlayerCard({
  name,
  isReady,
  isCurrentTurn,
  isGameFinished,
  isWinner,
  isNearWinning,
  isMatchpoint,
  children,
  statusOverride,
  className = "",
}: PlayerCardProps) {
  const { t } = useTranslation(); // Destructured localization set

  return (
    <div
      className={`relative p-4 rounded-lg border transition-all duration-500 ${className} ${
        isWinner
          ? "bg-yellow-950/10 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] scale-105"
          : isCurrentTurn
            ? "bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            : "bg-zinc-900/50 border-white/10"
      }`}
    >
      {/* Badge Priority System */}
      {isWinner && <WinnerBadge />}

      {isMatchpoint && !isWinner && <DangerBadge />}

      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-bold tracking-tighter truncate max-w-[120px]">
            {name}
          </h4>

          {/* Status Prioritization Logic with Localization */}
          {!isGameFinished && (
            <div className="flex items-center gap-1.5">
              {statusOverride ? (
                <span
                  className={`text-[10px] uppercase tracking-widest font-mono ${
                    isCurrentTurn
                      ? "text-blue-400 animate-pulse"
                      : "text-zinc-500"
                  }`}
                >
                  ● {statusOverride}
                </span>
              ) : isCurrentTurn ? (
                <span className="text-[10px] uppercase tracking-widest font-mono text-blue-400 animate-pulse">
                  ● {t.activeTurn || "Active Player"}
                </span>
              ) : (
                <span
                  className={`text-[10px] uppercase tracking-widest font-mono ${
                    isReady ? "text-green-500" : "text-zinc-500"
                  }`}
                >
                  {isReady
                    ? `● ${t.ready || "Ready"}`
                    : `○ ${t.waiting || "Waiting"}`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-white/5">{children}</div>
    </div>
  );
}
