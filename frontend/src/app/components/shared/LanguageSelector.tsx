"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * LanguageSelector: Cinematic Technical Toggle Strip.
 */
export default function LanguageSelector() {
  const { lang: currentLang, setLanguage } = useTranslation();
  const availableLanguages = Object.keys(translations) as Language[];

  return (
    <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/5 backdrop-blur-xl shadow-inner w-fit">
      {availableLanguages.map((lang) => (
        <motion.button
          key={lang}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLanguage(lang)}
          className={`px-2.5 py-1.5 text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-tighter transition-all duration-300 rounded-lg relative overflow-hidden ${
            currentLang === lang
              ? "bg-teal-500 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)]"
              : "text-zinc-100 hover:text-white hover:bg-white/5"
          }`}
        >
          {lang}
        </motion.button>
      ))}
    </div>
  );
}
