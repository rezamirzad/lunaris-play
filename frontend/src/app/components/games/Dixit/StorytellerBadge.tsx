"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

/**
StorytellerBadge */
export default function StorytellerBadge() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ scale: 0, rotate: 10 }}
      animate={{ scale: 1, rotate: 0 }}
      className="absolute -top-4 -right-3 z-30 flex items-center gap-2 rounded-xl border-2 border-yellow-500/50 bg-zinc-950 px-4 py-2 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
    >
      <div className="flex flex-col items-end">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white font-mono leading-none">
          {t.storyteller || "STORYTELLER"}
        </span>
      </div>
    </motion.div>
  );
}
