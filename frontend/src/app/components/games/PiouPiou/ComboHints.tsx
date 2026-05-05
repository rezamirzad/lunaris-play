"use client";

import { translations, Language } from "@/lib/translations";

/**
 * ComboHints: Technical Move-Set Detector
 * Logic: Validates hand state against game rules in real-time.
 */
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

  // Logic Mapping
  const hasRooster = hand.includes("ROOSTER");
  const hasChicken = hand.includes("CHICKEN");
  const hasNest = hand.includes("NEST");
  const hasFox = hand.includes("FOX");
  const chickenCount = hand.filter((c) => c === "CHICKEN").length;

  const canLay = hasRooster && hasChicken && hasNest;
  const canHatch = chickenCount >= 2 && eggs > 0;
  const someoneHasEggs = otherPlayers.some((p) => (p.state?.eggs || 0) > 0);
  const canSteal = hasFox && someoneHasEggs;

  const moves = [
    {
      label: t.hintLayEgg,
      active: canLay,
      icon: "🥚",
      activeClass: "border-white text-white bg-white/5",
      idleClass: "border-white/5 text-zinc-600 opacity-30",
    },
    {
      label: t.hintHatch,
      active: canHatch,
      icon: "🐣",
      activeClass: "border-teal-500/50 text-teal-400 bg-teal-500/5",
      idleClass: "border-white/5 text-zinc-600 opacity-30",
    },
    {
      label: t.hintSteal,
      active: canSteal,
      icon: "🦊",
      activeClass:
        "border-orange-500/50 text-orange-400 bg-orange-500/5 shadow-[0_0_15px_rgba(251,146,60,0.1)]",
      idleClass: "border-white/5 text-zinc-600 opacity-30",
    },
  ];

  return (
    <div className="space-y-3 font-mono">
      <p className="text-[8px] font-black tracking-[0.2em] text-zinc-500 uppercase px-1">
        {t.availableMoves || "AVAILABLE_PROTOCOLS"}
      </p>

      <div className="grid grid-cols-1 gap-2">
        {moves.map((move) => (
          <div
            key={move.label}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-300 ${
              move.active ? move.activeClass : move.idleClass
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={move.active ? "grayscale-0" : "grayscale"}>
                {move.icon}
              </span>
              <span className="text-[9px] font-black uppercase tracking-tight">
                {move.label}
              </span>
            </div>

            {/* Technical Status Indicator */}
            <div
              className={`h-1 w-1 rounded-full ${move.active ? "bg-current animate-pulse" : "bg-zinc-800"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
