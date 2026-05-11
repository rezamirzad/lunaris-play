"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import { motion } from "framer-motion";

/**
 * LanguageSelector: Cinematic Technical Toggle Strip.
 */
export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLang = (searchParams.get("lang") as Language) || "en";
  const availableLanguages = Object.keys(translations) as Language[];

  const handleLanguageChange = (newLang: Language) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-xl shadow-inner">
        {availableLanguages.map((lang) => (
          <motion.button
            key={lang}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLanguageChange(lang)}
            className={`px-3 py-1.5 text-[11px] font-mono font-black uppercase tracking-tighter transition-all duration-300 rounded-lg relative overflow-hidden ${
              currentLang === lang
                ? "bg-teal-500 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                : "text-zinc-100 hover:text-white hover:bg-white/5"
            }`}
          >
            {lang}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
