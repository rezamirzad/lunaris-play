"use client";

import React from "react";
import { motion } from "framer-motion";
import { parseFlip7Card, Flip7CardInfo } from "../../../../../../convex/flip7_deck";

interface Flip7CardProps {
  cardId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  isFlipped?: boolean;
  isCrossedOut?: boolean;
  isGrayedOut?: boolean;
}

export const Flip7Card: React.FC<Flip7CardProps> = ({
  cardId,
  size = "md",
  className = "",
  isFlipped = false,
  isCrossedOut = false,
  isGrayedOut = false,
}) => {
  const card: Flip7CardInfo = parseFlip7Card(cardId);

  // Determine size dimensions
  const sizeClasses =
    size === "xs"
      ? "w-8 h-12 text-[10px] rounded-lg border"
      : size === "sm"
        ? "w-11 h-15 text-xs rounded-xl border-2"
        : size === "lg"
          ? "w-24 h-36 text-2xl rounded-2xl border-3"
          : "w-14 h-20 text-sm rounded-xl border-2";

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
    }
  }

  // Tooltip Text Description
  let tooltipText = `${card.label} Card`;
  if (card.type === "NUMBER") {
    tooltipText = `${card.numberValue} Number Card (+${card.numberValue} pts)`;
  } else if (card.type === "MODIFIER") {
    tooltipText = `${card.label} Modifier Card (${card.label === 'x2' ? 'Doubles round score' : '+' + card.numberValue + ' bonus pts'})`;
  } else if (card.type === "ACTION") {
    if (card.actionType === "SECOND_CHANCE") {
      tooltipText = "Second Chance Shield - Absorbs one duplicate number bust";
    } else if (card.actionType === "FREEZE") {
      tooltipText = "Freeze Card - Forces target player to freeze and bank points";
    } else if (card.actionType === "FLIP_THREE") {
      tooltipText = "Flip Three Card - Forces target player to flip 3 cards sequentially";
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.5, rotateY: 180, opacity: 0, y: -20 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      whileHover={{ y: -6, scale: 1.08, zIndex: 30 }}
      title={tooltipText + (isGrayedOut || isCrossedOut ? " (Used/Spent)" : "")}
      className={`bg-gradient-to-br ${themeGradient} ${sizeClasses} aspect-[2/3] flex flex-col justify-between items-center p-1.5 select-none relative overflow-hidden font-black transition-all backdrop-blur-md shadow-md ${
        isGrayedOut || isCrossedOut
          ? "grayscale brightness-50 opacity-60 border-dashed border-zinc-500/70"
          : ""
      } ${className}`}
    >
      {/* Background Texture Detail */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top,_white_0%,_transparent_70%)]" />

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
        <span className="text-[8px] font-mono uppercase tracking-widest opacity-70 block leading-none truncate">
          {subLabel || card.label}
        </span>
      </div>
    </motion.div>
  );
};

export default Flip7Card;
