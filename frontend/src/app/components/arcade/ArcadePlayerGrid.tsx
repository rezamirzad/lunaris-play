"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import PlayerCard from "../shared/PlayerCard";
import { useTranslation } from "@/hooks/useTranslation";
import { Doc, Id } from "convex/_generated/dataModel";
import ArcadeBadge from "../shared/ArcadeBadge";

interface ArcadePlayerGridProps {
  players: Doc<"players">[];
  currentTurnId?: Id<"players">;
  winnerId?: Id<"players">;
  winnerIds?: Id<"players">[];
  isGameEnd: boolean;
  accentColor: "orange" | "teal" | "blue" | "cyan" | "amber" | "rose";
  renderStats: (player: Doc<"players">) => ReactNode;
  renderBadge?: (player: Doc<"players">) => ReactNode;
  hideTurnBadge?: boolean;
}

const THEME_MAP = {
  orange: {
    activeBg: "bg-orange-900/20",
    activeBorder: "border-orange-500/50",
    activeShadow: "shadow-[0_0_40px_rgba(249,115,22,0.15)]",
    winnerBg: "bg-emerald-900/20",
    winnerBorder: "border-emerald-500/50",
    shimmer: "via-orange-500/10",
    badge: "bg-orange-500",
  },
  teal: {
    activeBg: "bg-teal-900/20",
    activeBorder: "border-teal-500/50",
    activeShadow: "shadow-[0_0_40px_rgba(45,212,191,0.15)]",
    winnerBg: "bg-emerald-900/20",
    winnerBorder: "border-emerald-500/50",
    shimmer: "via-teal-500/10",
    badge: "bg-teal-500",
  },
  blue: {
    activeBg: "bg-blue-900/20",
    activeBorder: "border-blue-500/50",
    activeShadow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]",
    winnerBg: "bg-emerald-900/20",
    winnerBorder: "border-emerald-500/50",
    shimmer: "via-blue-500/10",
    badge: "bg-blue-500",
  },
  cyan: {
    activeBg: "bg-cyan-900/20",
    activeBorder: "border-cyan-500/50",
    activeShadow: "shadow-[0_0_40px_rgba(34,211,238,0.15)]",
    winnerBg: "bg-emerald-900/20",
    winnerBorder: "border-emerald-500/50",
    shimmer: "via-cyan-500/10",
    badge: "bg-cyan-500",
  },
  amber: {
    activeBg: "bg-amber-900/20",
    activeBorder: "border-amber-500/50",
    activeShadow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    winnerBg: "bg-emerald-900/20",
    winnerBorder: "border-emerald-500/50",
    shimmer: "via-amber-500/10",
    badge: "bg-amber-500",
  },
  rose: {
    activeBg: "bg-rose-900/20",
    activeBorder: "border-rose-500/50",
    activeShadow: "shadow-[0_0_40px_rgba(244,63,94,0.15)]",
    winnerBg: "bg-emerald-900/20",
    winnerBorder: "border-emerald-500/50",
    shimmer: "via-rose-500/10",
    badge: "bg-rose-500",
  },
};

export default function ArcadePlayerGrid({
  players,
  currentTurnId,
  winnerId,
  winnerIds,
  isGameEnd,
  accentColor,
  renderStats,
  renderBadge,
  hideTurnBadge = false,
}: ArcadePlayerGridProps) {
  const { t } = useTranslation();
  const theme = THEME_MAP[accentColor];

  // Smart Grid Balancing: e.g., 8 items = 4x2 grid
  const itemCount = players.length;
  const optimalCols = itemCount > 6 ? Math.ceil(itemCount / 2) : itemCount;

  return (
    <div className="bg-gradient-to-b from-black/40 to-black rounded-[2.5rem] border-4 border-white/5 p-6 relative">
      <div className="flex justify-center items-center h-full relative z-10">
        <div 
            className="grid gap-6 w-full"
            style={{ gridTemplateColumns: `repeat(${optimalCols}, minmax(0, 1fr))` }}
        >
          {players.map((player) => {
            const isWinner = winnerIds?.includes(player._id) || (winnerId && player._id === winnerId) || false;
            const isCurrentTurn = !isGameEnd && player._id === currentTurnId;

            return (
              <motion.div
                key={player._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  opacity: { duration: 0.2 } 
                }}
                className={`rounded-[2rem] p-5 border-2 transition-all duration-500 relative group ${
                  isCurrentTurn
                    ? `${theme.activeBg} ${theme.activeBorder} ${theme.activeShadow} scale-105 z-20`
                    : isWinner
                      ? `${theme.winnerBg} ${theme.winnerBorder}`
                      : "bg-black/50 border-white/5 opacity-80"
                }`}
              >
                {isCurrentTurn && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent ${theme.shimmer} to-transparent animate-shimmer rounded-[2rem] overflow-hidden`}
                  />
                )}

                <PlayerCard
                  name={player.name}
                  isReady={player.isReady}
                  isGameFinished={isGameEnd}
                  isWinner={isWinner}
                  isCurrentTurn={isCurrentTurn}
                  isAiError={player.aiError}
                  className="bg-transparent border-none p-0 shadow-none relative z-10"
                >
                  {renderStats(player)}
                </PlayerCard>

                {/* Unified Badge System */}
                <div className="absolute top-0 right-0 z-30">
                  {renderBadge && renderBadge(player)}
                  
                  {isCurrentTurn && !hideTurnBadge ? (
                    <ArcadeBadge 
                      variant="status" 
                      label="turn" 
                      icon="✓" 
                      pulse 
                      className="!bg-teal-500 !text-white !border-teal-400/50"
                    />
                  ) : isWinner ? (
                    <ArcadeBadge 
                      variant="winner" 
                      label="Champion" 
                      icon="👑" 
                    />
                  ) : (
                    <div className="absolute top-0 right-0 translate-x-2 -translate-y-2">
                      <div className={`w-3 h-3 rounded-full border-2 border-black ${player.isReady ? "bg-teal-500 animate-pulse" : "bg-slate-700"}`} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
