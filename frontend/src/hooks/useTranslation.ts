"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { translations, Language } from "@/lib/translations";

export function useTranslation() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Prevention of Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const langParam = searchParams.get("lang");
  const lang: Language = (["en", "fr", "de", "fa"].includes(langParam || "") ? langParam : "en") as Language;
  const t = translations[lang];

  // Return default English/Server-safe values until mounted
  if (!mounted) {
    return { t: translations["en"], lang: "en" as Language, isMounted: false };
  }

  return { t, lang, isMounted: true };
}
