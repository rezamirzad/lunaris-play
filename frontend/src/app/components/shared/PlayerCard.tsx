"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WinnerBadge from "./WinnerBadge";
import DangerBadge from "./DangerBadge";
import NodeGlyph from "./NodeGlyph";
import { useTranslation } from "@/hooks/useTranslation";

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
 * PlayerCard: Ultra-premium 'Top Class' participant node.
 * Features glassmorphic surfaces, animated pulses, and Node Glyphs.
 */
export default function PlayerCard({
  name,
  isReady,
  isCurrentTurn,
  isGameFinished,
  isWinner,
  isMatchpoint,
  children,
  statusOverride,
  className = "",
}: PlayerCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative p-6 rounded-[2rem] border-2 transition-all duration-700 font-mono ${className} ${
        isWinner
          ? "bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.15)]"
          : isCurrentTurn
            ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            : "bg-zinc-950/40 border-white/5 backdrop-blur-3xl"
      }`}
    >
      {/* 📡 ACTIVE TURN PULSE */}
      {isCurrentTurn && !isGameFinished && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-500 rounded-[2rem] pointer-events-none"
        />
      )}

      {/* 🏆 BADGE OVERLAYS */}
      <AnimatePresence>
        {isWinner && <WinnerBadge />}
        {isMatchpoint && !isWinner && <DangerBadge />}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <NodeGlyph name={name} size="md" />
          
          <div className="flex flex-col min-w-0">
            <h4 className="text-white font-black italic uppercase tracking-tighter text-lg leading-none truncate">
              {name}
            </h4>
            
            {/* STATUS_MONITOR */}
            {!isGameFinished && (
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-1 w-1 rounded-full ${
                  isCurrentTurn ? "bg-blue-400 animate-pulse" : 
                  isReady ? "bg-teal-400" : "bg-zinc-700"
                }`} />
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${
                  isCurrentTurn ? "text-blue-400" : 
                  isReady ? "text-teal-400/70" : "text-zinc-600"
                }`}>
                  {statusOverride || (isCurrentTurn ? t.activeTurn : isReady ? t.ready : t.waiting)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RESOURCE_DATA_SLOT */}
        <div className="border-t border-white/5 pt-4">
          {children}
        </div>
      </div>

      {/* DECORATIVE CORNER ELEMENT */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <div className="h-4 w-4 border-t-2 border-r-2 border-white rounded-tr-md" />
      </div>
    </motion.div>
  );
}
