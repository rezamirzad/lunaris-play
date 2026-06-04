"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { motion } from "framer-motion";

interface PiouPiouPlayerStatsProps {
  state?: {
    eggs?: number;
    chicks?: number;
  } | null;
}

export default function PiouPiouPlayerStats({
  state,
}: PiouPiouPlayerStatsProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const chicks = state?.chicks ?? 0;
  const eggs = state?.eggs ?? 0;

  return (
    <div className="flex items-center gap-6 sm:gap-10 font-mono">
      {/* 🐥 CHICKS SLOT */}
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex flex-col items-center sm:items-start group"
      >
        <span className="text-[7px] uppercase tracking-[0.4em] text-teal-500/60 mb-2 font-black group-hover:text-teal-400 transition-colors">
          {t.chicks}
        </span>
        <div className="flex items-center gap-3">
          <div className="relative">
             <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(45,212,191,0.4)] group-hover:scale-110 transition-transform block">🐣</span>
             <motion.div 
               animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute -inset-1 bg-teal-500/10 rounded-full -z-10" 
             />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-lg">
              {isFA ? toPersianDigits(chicks) : chicks}
            </span>
            <span className="text-[10px] font-black text-zinc-600 tracking-widest opacity-40">
              / {isFA ? toPersianDigits(3) : 3}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="h-12 w-[1px] bg-white/5 rotate-12" />

      {/* 🥚 EGGS SLOT */}
      <motion.div
        initial={{ x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center sm:items-start group"
      >
        <span className="text-[7px] uppercase tracking-[0.4em] text-amber-500/60 mb-2 font-black group-hover:text-amber-400 transition-colors">
          {t.eggs}
        </span>
        <div className="flex items-center gap-3">
           <div className="relative">
             <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] group-hover:rotate-12 transition-transform block text-amber-50">🥚</span>
          </div>
          <span className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-lg">
            {isFA ? toPersianDigits(eggs) : eggs}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
