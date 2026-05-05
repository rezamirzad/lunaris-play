"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Language, translations } from "@/lib/translations"; // Adjust path as needed

/**
 * LanguageSelector: A high-visibility Toggle Strip.
 * Replaces the dropdown for instant access and technical transparency.
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
    router.push(`${pathname}?${params.toString()}`); // Standard Next.js navigation
  };

  return (
    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`px-2 py-1 text-[9px] font-mono font-black uppercase tracking-tighter transition-all duration-300 rounded-md ${
            currentLang === lang
              ? "bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.3)]"
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
