"use client";
import { translations, Language } from "@/lib/translations";

interface ComboHintsProps {
  hand: string[];
  eggs: number;
  lang: Language;
}

export default function ComboHints({ hand, eggs, lang }: ComboHintsProps) {
  const t = translations[lang];

  const hasRooster = hand.includes("ROOSTER");
  const hasChicken = hand.includes("CHICKEN");
  const hasNest = hand.includes("NEST");
  const chickenCount = hand.filter((c) => c === "CHICKEN").length;

  const canLayEgg = hasRooster && hasChicken && hasNest;
  const canHatch = chickenCount >= 2 && eggs > 0;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-4 flex flex-col gap-3">
      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
        {t.availableMoves}
      </p>

      <div className="flex flex-wrap gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all ${canLayEgg ? "bg-teal-500/10 border-teal-500 text-teal-400" : "bg-zinc-800/50 border-transparent text-zinc-600 opacity-40"}`}
        >
          <span>🥚</span>
          <span className="text-[10px] font-black uppercase">
            {t.hintLayEgg}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all ${canHatch ? "bg-yellow-500/10 border-yellow-500 text-yellow-400" : "bg-zinc-800/50 border-transparent text-zinc-600 opacity-40"}`}
        >
          <span>🐣</span>
          <span className="text-[10px] font-black uppercase">
            {t.hintHatch}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-zinc-800/50 bg-zinc-800/20 text-zinc-500 opacity-80">
          <span>♻️</span>
          <span className="text-[10px] font-black uppercase">{t.discard}</span>
        </div>
      </div>
    </div>
  );
}
