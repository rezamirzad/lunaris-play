"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

/**
 * BackButton: Next-Gen navigation protocol.
 * Optimized for immersive game-to-lobby transitions.
 * Refactored for LTR Multilingual support.
 */
export default function BackButton() {
  const router = useRouter();
  const { t, lang } = useTranslation(); // Destructured localization set

  return (
    <button
      onClick={() => router.push(`/?lang=${lang}`)}
      className="group flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-95"
    >
      <svg
        className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
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
      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-200 uppercase tracking-widest">
        {/* Localized Label: Back/QUITTER/BEENDEN/خروج */}
        {t.exit}
      </span>
    </button>
  );
}
