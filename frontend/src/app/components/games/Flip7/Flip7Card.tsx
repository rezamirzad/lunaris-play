"use client";

import React from "react";
import { motion } from "framer-motion";
import { parseFlip7Card, Flip7CardInfo } from "../../../../../../convex/flip7_deck";

interface Flip7CardProps {
  cardId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isFlipped?: boolean;
}

export const Flip7Card: React.FC<Flip7CardProps> = ({
  cardId,
  size = "md",
  className = "",
  isFlipped = false,
}) => {
  const card: Flip7CardInfo = parseFlip7Card(cardId);

  // Determine size dimensions
  const sizeClasses =
    size === "sm"
      ? "w-12 h-16 text-xs rounded-xl border-2"
      : size === "lg"
        ? "w-36 h-52 text-4xl rounded-3xl border-4"
        : "w-20 h-28 text-xl rounded-2xl border-2";

  // Color Theme & Styling Mapping
  let themeGradient = "from-zinc-800 to-zinc-950 border-white/10 text-white";
  let badgeIcon = "";
  let subLabel = "";

  if (card.type === "NUMBER") {
    const val = card.numberValue ?? 0;
    if (val === 0) {
      // 0: Royal Crown Card
      themeGradient = "from-amber-400 via-purple-700 to-slate-900 border-amber-300 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)]";
      badgeIcon = "👑";
      subLabel = "RARE 0";
    } else if (val >= 1 && val <= 3) {
      // 1-3: Low Numbers (Coral / Gold)
      themeGradient = "from-orange-500 via-amber-600 to-amber-900 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(249,115,22,0.3)]";
    } else if (val >= 4 && val <= 8) {
      // 4-8: Mid Numbers (Emerald / Teal)
      themeGradient = "from-emerald-500 via-teal-700 to-teal-950 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    } else {
      // 9-12: High Numbers (Cobalt / Indigo / Violet)
      themeGradient = "from-blue-600 via-indigo-700 to-slate-950 border-indigo-400 text-blue-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]";
    }
  } else if (card.type === "MODIFIER") {
    themeGradient = "from-emerald-400 via-teal-500 to-amber-400 border-emerald-200 text-black shadow-[0_0_20px_rgba(52,211,153,0.4)]";
    badgeIcon = "✨";
    subLabel = "BONUS";
  } else if (card.type === "ACTION") {
    if (card.actionType === "SECOND_CHANCE") {
      themeGradient = "from-cyan-400 via-blue-600 to-indigo-950 border-cyan-300 text-white shadow-[0_0_25px_rgba(6,182,212,0.5)]";
      badgeIcon = "🛡️";
      subLabel = "SHIELD";
    } else if (card.actionType === "FREEZE") {
      themeGradient = "from-sky-300 via-cyan-600 to-blue-950 border-sky-200 text-white shadow-[0_0_25px_rgba(56,189,248,0.5)]";
      badgeIcon = "❄️";
      subLabel = "FREEZE";
    } else if (card.actionType === "FLIP_THREE") {
      themeGradient = "from-amber-300 via-orange-500 to-red-900 border-yellow-300 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)]";
      badgeIcon = "⚡";
      subLabel = "FLIP x3";
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.8, rotateY: 90 }}
      animate={{ scale: 1, rotateY: 0 }}
      whileHover={{ y: -5, scale: 1.05 }}
      className={`bg-gradient-to-br ${themeGradient} ${sizeClasses} flex flex-col justify-between p-2 select-none relative overflow-hidden font-black transition-all backdrop-blur-md ${className}`}
    >
      {/* Background Texture Detail */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top,_white_0%,_transparent_70%)]" />

      {/* Top Corner Identifier */}
      <div className="flex justify-between items-center w-full z-10 opacity-80">
        <span className="text-[10px] font-mono leading-none">{card.label}</span>
        {badgeIcon && <span className="text-xs leading-none">{badgeIcon}</span>}
      </div>

      {/* Center Big Symbol */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 leading-none">
        {card.type === "NUMBER" && (
          <span className="font-black italic tracking-tighter drop-shadow-md">{card.numberValue}</span>
        )}
        {card.type === "MODIFIER" && (
          <span className="font-black italic tracking-tighter drop-shadow-md">{card.label}</span>
        )}
        {card.type === "ACTION" && (
          <span className="text-2xl drop-shadow-md">{badgeIcon}</span>
        )}
      </div>

      {/* Bottom Sublabel */}
      <div className="w-full text-center z-10">
        <span className="text-[8px] font-mono uppercase tracking-widest opacity-70 block leading-none">
          {subLabel}
        </span>
      </div>
    </motion.div>
  );
};

export default Flip7Card;
