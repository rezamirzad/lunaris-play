"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface ArcadeVictoryOverlayProps {
  winnerName?: string;
  championLabel: string;
  accentColor: "orange" | "teal" | "blue" | "cyan" | "amber" | "rose";
  onExit?: () => void;
  icon?: ReactNode;
}

const THEME_MAP = {
  orange: {
    bg: "bg-[#0a0602]/98",
    glow: "rgba(249,115,22,0.4)",
    gradient: "from-orange-400 to-orange-700",
    buttonText: "text-orange-950",
    border: "border-orange-500/40",
    shadow: "rgba(249,115,22,0.4)",
  },
  teal: {
    bg: "bg-[#020808]/98",
    glow: "rgba(45,212,191,0.4)",
    gradient: "from-teal-400 to-teal-700",
    buttonText: "text-teal-950",
    border: "border-teal-500/40",
    shadow: "rgba(45,212,191,0.4)",
  },
  blue: {
    bg: "bg-[#05030a]/98",
    glow: "rgba(59,130,246,0.4)",
    gradient: "from-blue-400 to-blue-700",
    buttonText: "text-white",
    border: "border-blue-500/40",
    shadow: "rgba(59,130,246,0.4)",
  },
  cyan: {
    bg: "bg-[#020a0a]/98",
    glow: "rgba(34,211,238,0.4)",
    gradient: "from-cyan-400 to-cyan-700",
    buttonText: "text-cyan-950",
    border: "border-cyan-500/40",
    shadow: "rgba(34,211,238,0.4)",
  },
  amber: {
    bg: "bg-[#0a0500]/98",
    glow: "rgba(245,158,11,0.4)",
    gradient: "from-amber-400 to-amber-700",
    buttonText: "text-amber-950",
    border: "border-amber-500/40",
    shadow: "rgba(245,158,11,0.4)",
  },
  rose: {
    bg: "bg-[#050101]/98",
    glow: "rgba(244,63,94,0.4)",
    gradient: "from-rose-400 to-rose-700",
    buttonText: "text-rose-950",
    border: "border-rose-500/40",
    shadow: "rgba(244,63,94,0.4)",
  },
};

export default function ArcadeVictoryOverlay({
  winnerName,
  championLabel,
  accentColor,
  onExit,
  icon = "👑",
}: ArcadeVictoryOverlayProps) {
  const { t } = useTranslation();
  const theme = THEME_MAP[accentColor];

  const handleExit = onExit || (() => (window.location.href = "/"));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute inset-0 ${theme.bg} backdrop-blur-3xl z-[60] flex flex-col items-center justify-center p-16 text-center`}
    >
      <div className="relative mb-4">
        <motion.span
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className={`text-[5rem] lg:text-[2rem] block filter drop-shadow-[0_0_50px_${theme.glow}]`}
        >
          {icon}
        </motion.span>
      </div>

      <h2 className="text-5xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 uppercase leading-none mb-3">
        {championLabel}
      </h2>

      <p className="text-xl lg:text-5xl font-black text-yellow-500 uppercase  mb-12 italic  pb-2 px-12 max-w-3xl drop-shadow-lg">
        {winnerName || championLabel}
      </p>

      <button
        onClick={handleExit}
        className={`px-16 py-5 bg-gradient-to-b ${theme.gradient} ${theme.buttonText} font-black text-2xl uppercase italic rounded-3xl shadow-[0_10px_50px_${theme.shadow}] hover:scale-105 active:scale-95 transition-all border-t-2 border-white/20`}
      >
        {t.exit}
      </button>
    </motion.div>
  );
}
