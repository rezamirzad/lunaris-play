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
    <div className="flex items-center gap-6 sm:gap-8 font-mono">
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col"
      >
        <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 mb-2 font-black opacity-60">
          {t.chicks}
        </span>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-teal-400 rounded-full shadow-[0_0_12px_rgba(45,212,191,0.6)] animate-pulse" />
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white tracking-tighter tabular-nums">
              {isFA ? toPersianDigits(chicks) : chicks}
            </span>
            <span className="text-[10px] font-black text-zinc-600 tracking-widest">
              / {isFA ? toPersianDigits(3) : 3}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="h-10 w-[1px] bg-white/5" />

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col"
      >
        <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 mb-2 font-white opacity-60">
          {t.eggs}
        </span>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          <span className="text-3xl font-black text-white tracking-tighter tabular-nums">
            {isFA ? toPersianDigits(eggs) : eggs}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
