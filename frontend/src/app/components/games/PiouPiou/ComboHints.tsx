"use client";

import { translations, Language } from "@/lib/translations";

export default function ComboHints({
  hand,
  eggs,
  lang,
  otherPlayers,
}: {
  hand: string[];
  eggs: number;
  lang: Language;
  otherPlayers: any[];
}) {
  const t = translations[lang];

  const hasRooster = hand.includes("ROOSTER");
  const hasChicken = hand.includes("CHICKEN");
  const hasNest = hand.includes("NEST");
  const hasFox = hand.includes("FOX");
  const chickenCount = hand.filter((c) => c === "CHICKEN").length;

  // Logic checks
  const canLay = hasRooster && hasChicken && hasNest;
  const canHatch = chickenCount >= 2 && eggs > 0;

  // Check if any opponent actually has an egg to steal
  const someoneHasEggs = otherPlayers.some((p) => (p.state?.eggs || 0) > 0);
  const canSteal = hasFox && someoneHasEggs;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase px-1">
        {t.availableMoves}
      </p>
      <div className="flex flex-wrap gap-2">
        {/* LAY EGG */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            canLay
              ? "bg-white/10 border-white text-white"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-600 opacity-40"
          }`}
        >
          <span>🥚</span>
          <span className="text-[9px] font-black uppercase tracking-tight">
            {t.hintLayEgg}
          </span>
        </div>

        {/* HATCH */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            canHatch
              ? "bg-teal-500/20 border-teal-400 text-teal-400"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-600 opacity-40"
          }`}
        >
          <span>🐣</span>
          <span className="text-[9px] font-black uppercase tracking-tight">
            {t.hintHatch}
          </span>
        </div>

        {/* STEAL (FOX) - Only bright if an opponent has an egg */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            canSteal
              ? "bg-orange-500/20 border-orange-400 text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.1)]"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-600 opacity-40"
          }`}
        >
          <span>🦊</span>
          <span className="text-[9px] font-black uppercase tracking-tight">
            {t.hintSteal}
          </span>
        </div>
      </div>
    </div>
  );
}
