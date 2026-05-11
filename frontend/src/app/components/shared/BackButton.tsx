"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

/**
 * BackButton: Cinematic "System Escape" Control.
 */
export default function BackButton() {
  const router = useRouter();
  const { t, lang } = useTranslation();

  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        x: -4,
        backgroundColor: "rgba(255,255,255,0.1)",
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push(`/?lang=${lang}`)}
      className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl transition-all duration-300 shadow-lg relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <svg
        className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors relative z-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>

      <div className="flex flex-col items-start relative z-10">
        <span className="text-[12px] font-black font-mono group-hover:text-white uppercase tracking-[0.2em] leading-none">
          {t.exit || "EXIT"}
        </span>
      </div>
    </motion.button>
  );
}
