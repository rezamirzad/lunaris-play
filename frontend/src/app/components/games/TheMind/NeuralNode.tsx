"use client";

import { motion } from "framer-motion";

interface NeuralNodeProps {
  val: number | "BACK" | string;
  isRevealed?: boolean;
  disabled?: boolean;
  isInteractable?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function NeuralNode({
  val,
  isRevealed = true,
  disabled = false,
  isInteractable = true,
  onClick,
  className = "",
}: NeuralNodeProps) {
  const isBack = val === "BACK";
  const num = typeof val === "number" ? val : parseInt(val as string) || 0;

  // Aura's Heat-Map Logic
  const getThemeClasses = () => {
    if (isBack) return "border-zinc-800 bg-zinc-900 text-zinc-700";
    if (num <= 33)
      return "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-cyan-400";
    if (num <= 66)
      return "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)] text-emerald-400";
    return "border-rose-600 shadow-[0_0_25px_rgba(225,29,72,0.3)] text-rose-500";
  };

  return (
    <motion.div
      whileHover={isInteractable && !disabled ? { scale: 1.05, y: -10 } : {}}
      whileTap={isInteractable && !disabled ? { scale: 0.95 } : {}}
      onClick={isInteractable && !disabled ? onClick : undefined}
      className={`relative w-32 h-48 sm:w-48 sm:h-72 bg-zinc-950 border-2 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all duration-500 group cursor-pointer ${getThemeClasses()} ${disabled ? "opacity-40 grayscale" : ""} ${className}`}
    >
      {/* Background Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg width="100%" height="100%">
          <pattern
            id="scanlines"
            width="100%"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#scanlines)" />
        </svg>
      </div>

      {!isBack && isRevealed ? (
        <>
          {/* Corner HUD */}
          <div className="absolute top-4 left-4 text-[10px] font-mono tracking-[0.4em] opacity-40">
            {num}
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] font-mono tracking-[0.4em] opacity-40 rotate-180">
            {num}
          </div>

          {/* Center Glow Number */}
          <span className="text-6xl sm:text-7xl font-black italic tracking-tighter drop-shadow-[0_0_15px_currentColor]">
            {num}
          </span>

          {/* Decorative Terminal Text */}
          <div className="absolute bottom-12 text-[6px] uppercase tracking-[0.3em] font-bold opacity-20">
            Frequency_Node_Sync
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 opacity-20">
          <div className="text-4xl">⚡</div>
          <span className="text-[8px] font-black tracking-[0.5em] uppercase">
            LUNARIS TECH GROUP
          </span>
        </div>
      )}
    </motion.div>
  );
}
