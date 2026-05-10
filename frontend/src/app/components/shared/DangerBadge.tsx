"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

/**
 * DangerBadge: High-fidelity tactical warning.
 */
export default function DangerBadge() {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute -top-4 -left-3 z-30 flex items-center gap-3 rounded-xl border-2 border-orange-500/50 bg-zinc-950 px-4 py-2 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
    >
      <div className="relative flex h-3 w-3">
        <motion.span 
          animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inline-flex h-full w-full rounded-full bg-orange-400"
        />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" />
      </div>
      
      <div className="flex flex-col">
        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-orange-500/50 leading-none mb-1">
          MATCHPOINT_PROTOCOL
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white font-mono leading-none">
          {t.nearlyWinning}
        </span>
      </div>
    </motion.div>
  );
}
