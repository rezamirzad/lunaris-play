"use client";

import { ActivityLog } from "../../shared/MatchActivity";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog } from "@/lib/translations";

export default function TheMindLogMessage({ log }: { log: ActivityLog }) {
  const { t } = useTranslation();
  const formatTime = () => {
    return new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  switch (log.key) {
    case "LOG_GAME_STARTED":
      return (
        <div className="flex gap-2">
          <span className="bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
            {t.lobbyInitiation}
          </span>
        </div>
      );
    case "LOG_DISCARD":
      return (
        <div className="flex gap-2 items-center">
          <span className="bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded text-[8px] font-black">
            {t.discard}
          </span>
          <span className="text-zinc-300 font-bold">
            {log.data.player} {t.themind_secured_by} {log.data.card}
          </span>
        </div>
      );
    case "LOG_MISTAKE":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <span className="bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded text-[8px] font-black">
              {t.themind_game_over}
            </span>
            <span className="text-zinc-300 font-bold">
              {log.data.player} {t.themind_secured_by} {log.data.played}
            </span>
          </div>
          {log.data.discarded && log.data.discarded.length > 0 && (
            <div className="ml-8 text-[9px] text-zinc-500 italic">
              {t.themind_discard_pile}: {log.data.discarded.join(", ")}
            </div>
          )}
        </div>
      );
    case "LOG_LEVEL_CLEARED":
      return (
        <div className="flex gap-2 items-center">
          <span className="text-teal-400 font-black">[{formatTime()}]</span>
          <span className="bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded text-[8px] font-black">
            {t.victory}
          </span>
          <span className="text-white font-black italic tracking-tighter uppercase">
            {formatLog(t.themind_sector_stabilized, { level: log.data.level })}
          </span>
        </div>
      );
    default:
      return (
        <div className="flex gap-2">
          <span className="text-zinc-600 font-black">[{formatTime()}]</span>
          <span className="text-zinc-500">{JSON.stringify(log.data)}</span>
        </div>
      );
  }
}
