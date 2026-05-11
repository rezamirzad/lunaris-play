"use client";

import { motion } from "framer-motion";

interface DataPacketProps {
  clue: string;
  isCanceled?: boolean;
  isInteractable?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function DataPacket({
  clue,
  isCanceled = false,
  isInteractable = false,
  onClick,
  className = "",
}: DataPacketProps) {
  return (
    <motion.div
      whileHover={isInteractable ? { scale: 1.02 } : {}}
      whileTap={isInteractable ? { scale: 0.98 } : {}}
      onClick={isInteractable ? onClick : undefined}
      className={`relative p-6 rounded-2xl border-2 font-black uppercase tracking-widest transition-all duration-300 ${
        isInteractable ? "cursor-pointer" : ""
      } ${
        isCanceled
          ? "border-rose-900/40 bg-rose-900/10 text-rose-800 opacity-40 grayscale skew-x-[-12deg]"
          : "border-cyan-500/40 bg-cyan-500/5 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
      } ${className}`}
    >
      <div className="relative z-10">{clue}</div>

      {isCanceled && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute inset-x-4 top-1/2 h-0.5 bg-rose-600/60 -rotate-2 origin-left z-20"
        />
      )}

      {/* Decorative Corner Bits */}
      <div className="absolute top-2 left-2 w-1 h-1 bg-current opacity-20" />
      <div className="absolute bottom-2 right-2 w-1 h-1 bg-current opacity-20" />
    </motion.div>
  );
}
