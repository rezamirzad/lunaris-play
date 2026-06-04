"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { translations, Language } from "@/lib/translations";

const STORAGE_KEY = "lunaris_preferred_language";
const VALID_LANGUAGES: Language[] = ["en", "fr", "de", "fa"];

export function useTranslation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [lang, setLangState] = useState<Language>("en");
  const [isChanging, setIsChanging] = useState(false);

  const updateLang = useCallback((newLang: Language, updateUrl = true) => {
    if (!VALID_LANGUAGES.includes(newLang)) return;
    
    setIsChanging(true);
    setTimeout(() => {
      setLangState(newLang);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, newLang);
        document.documentElement.lang = newLang;
        
        if (updateUrl) {
          const params = new URLSearchParams(window.location.search);
          if (params.get("lang") !== newLang) {
            params.set("lang", newLang);
            router.replace(`${pathname}?${params.toString()}`);
          }
        }
      }
      // Brief delay after state update to allow React to reconcile before fading back in
      setTimeout(() => setIsChanging(false), 50);
    }, 150);
  }, [pathname, router]);

  // Initial Sync
  useEffect(() => {
    setMounted(true);
    
    // 1. Check URL
    const urlLang = searchParams.get("lang") as Language;
    
    // 2. Check Storage
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
    
    // 3. Check Browser
    const browserLang = navigator.language.split("-")[0] as Language;
    
    let targetLang: Language = "en";
    
    if (VALID_LANGUAGES.includes(urlLang)) {
      targetLang = urlLang;
    } else if (VALID_LANGUAGES.includes(savedLang)) {
      targetLang = savedLang;
    } else if (VALID_LANGUAGES.includes(browserLang)) {
      targetLang = browserLang;
    }
    
    updateLang(targetLang, false);
  }, [searchParams, updateLang]); // Initial Sync only, but dependencies must be declared

  // Sync with URL changes (e.g. back button or manual URL edit)
  useEffect(() => {
    const urlLang = searchParams.get("lang") as Language;
    if (VALID_LANGUAGES.includes(urlLang) && urlLang !== lang) {
      setLangState(urlLang);
      localStorage.setItem(STORAGE_KEY, urlLang);
      document.documentElement.lang = urlLang;
    }
  }, [searchParams, lang]);

  const t = translations[lang];

  return { 
    t, 
    lang, 
    isChanging,
    isMounted: mounted,
    setLanguage: (l: Language) => updateLang(l, true)
  };
}
