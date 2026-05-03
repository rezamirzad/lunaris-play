"use client";
import { Language } from "@/lib/translations";

export default function LanguagePicker({
  current,
  onChange,
}: {
  current: Language;
  onChange: (l: Language) => void;
}) {
  const languages: { code: Language; flag: string }[] = [
    { code: "en", flag: "🇺🇸" },
    { code: "fr", flag: "🇫🇷" },
    { code: "de", flag: "🇩🇪" },
    { code: "fa", flag: "🇮🇷" },
  ];

  return (
    <div className="flex gap-2 mb-8 justify-center lg:justify-start">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`p-2 rounded-lg border transition-all ${
            current === lang.code
              ? "border-teal-500 bg-teal-500/10"
              : "border-zinc-800 bg-zinc-900"
          }`}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
