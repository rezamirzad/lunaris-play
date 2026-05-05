import { useSearchParams } from "next/navigation";
import { translations, Language, TranslationSet } from "@/lib/translations";

export function useTranslation() {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") as Language) || "en";

  const t = translations[lang] || translations.en;

  return { t, lang };
}
