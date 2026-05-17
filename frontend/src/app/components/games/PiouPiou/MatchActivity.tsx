"use client";

import { ActivityLog } from "../../shared/MatchActivity"; // Named type import
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook
import { formatLog, TranslationSet } from "@/lib/translations"; // Localization utilities[cite: 2]

const CARD_ASSETS: Record<
  string,
  { labelKey: string; icon: string; color: string }
> = {
  // Mapping to translation keys instead of hardcoded labels[cite: 2]
  CHICKEN: { labelKey: "chicken", icon: "🐔", color: "text-orange-400" },
  ROOSTER: { labelKey: "rooster", icon: "🐓", color: "text-red-400" },
  NEST: { labelKey: "nest", icon: "🪺", color: "text-green-400" },
  FOX: { labelKey: "fox", icon: "🦊", color: "text-orange-600" },
};

export default function MatchActivity({ log }: { log: ActivityLog }) {
  const { t, lang } = useTranslation(); // Destructured localization set[cite: 2]

  const player = log.data.player;
  const cardKey = log.data.card?.toUpperCase();
  const asset = CARD_ASSETS[cardKey] || {
    labelKey: log.data.card,
    icon: "🃏",
    color: "text-zinc-400",
  };

  const translatedCardName = t[asset.labelKey as keyof TranslationSet] || log.data.card;
  // Safely map the log key (e.g., "LOG_VICTORY") to the translation set[cite: 2]
  const template = t[log.key as keyof TranslationSet] || log.key;

  switch (log.key) {
    case "LOG_VICTORY":
      return (
        <span className="text-yellow-500 font-black italic">
          🏆 {formatLog(template, log.data, lang)}
        </span>
      );
    case "LOG_HATCH":
      return (
        <span className="text-emerald-400 font-bold">
          {formatLog(template, log.data, lang)}
        </span>
      );
    case "LOG_LAY_EGG":
      return (
        <span className="text-zinc-200">
          {formatLog(template, log.data, lang)}
        </span>
      );
    case "LOG_FOX_SUCCESS":
      return (
        <span className="text-orange-500 font-bold">
          {formatLog(template, log.data, lang)}
        </span>
      );
    case "LOG_FOX_BLOCKED":
      return (
        <span className="text-blue-400 font-bold">
          🛡️ {formatLog(template, log.data, lang)}
        </span>
      );
    case "LOG_DISCARD":
      return (
        <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-zinc-500">♻️</span>
          <span className="text-white tracking-tighter">
            {formatLog(
              template,
              { ...log.data, card: `${asset.icon} ${translatedCardName}` },
              lang,
            )}
          </span>
        </span>
      );
    default:
      return (
        <span className="text-zinc-500 uppercase tracking-widest">
          {player}: {log.key.replace("LOG_", "")}
        </span>
      );
  }
}
