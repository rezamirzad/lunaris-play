"use client";

import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook
import { toPersianDigits } from "@/lib/translations"; // Utility for numerical localization[cite: 2]

export default function DixitPlayerStats({
  state,
}: {
  state: { score: number };
}) {
  const { t, lang } = useTranslation(); // Destructured translation set and current language[cite: 2]
  const isFA = lang === "fa";

  return (
    <div className="flex justify-between items-center font-mono">
      {/* Localized Label: Score/SCORE/PUNKTE/امتیاز[cite: 2] */}
      <span className="text-zinc-500 text-xs uppercase">{t.dixit_score}</span>

      <span className="text-blue-400 font-bold">
        {/* Numerical localization for Persian digits while maintaining LTR structure[cite: 2] */}
        {isFA ? toPersianDigits(state.score) : state.score}
        <span className="ml-0.5 uppercase">pts</span>
      </span>
    </div>
  );
}
