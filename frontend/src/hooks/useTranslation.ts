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

  const lang = (searchParams.get("lang") as Language) || "en";
  const t = translations[lang];

  // Return default English/Server-safe values until mounted
  if (!mounted) {
    return { t: translations["en"], lang: "en" as Language, isMounted: false };
  }

  return { t, lang, isMounted: true };
}
