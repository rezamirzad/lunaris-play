"use client";

import { useMemo } from "react";

interface ActivityLog {
  key: string;
  data: Record<string, any>;
}

interface MatchActivityProps {
  history: ActivityLog[];
  gameType: "dixit" | "pioupiou";
}

/**
 * MatchActivity: A terminal-style event logger.
 * Refactored for uniform visual intensity and increased legibility.
 */
export default function MatchActivity({
  history,
  gameType,
}: MatchActivityProps) {
  // Limited to 5 entries as per the new header requirement
  const displayLogs = useMemo(() => history.slice(0, 5), [history]);

  const renderLogMessage = (log: ActivityLog) => {
    const player = log.data.player;

    if (gameType === "pioupiou") {
      switch (log.key) {
        case "LOG_VICTORY":
          return (
            <span className="text-yellow-500 font-black italic">
              🏆 {player} won the match!
            </span>
          );
        case "LOG_HATCH":
          return (
            <span className="text-emerald-400 font-bold">
              🐣 {player} hatched a chick!
            </span>
          );
        case "LOG_LAY_EGG":
          return (
            <span className="text-zinc-200">🥚 {player} laid an egg!</span>
          );
        case "LOG_FOX_SUCCESS":
          return (
            <span className="text-orange-500 font-bold">
              🦊 {player} stole an egg!
            </span>
          );
        case "LOG_FOX_BLOCKED":
          return (
            <span className="text-blue-400 font-bold">
              🛡️ {player} defended against an attack!
            </span>
          );
        case "LOG_DISCARD":
          return (
            <span className="text-zinc-400">
              ♻️ {player} discarded a {log.data.card} card.
            </span>
          );
        default:
          return (
            <span className="text-zinc-500 uppercase tracking-widest">
              {player}_EVENT: {log.key.replace("LOG_", "")}
            </span>
          );
      }
    }

    return (
      <span className="text-blue-400">
        [{log.key}] {player}
      </span>
    );
  };

  return (
    <div className="w-full max-w-sm rounded-[24px] border border-white/5 bg-[#050505] p-6 shadow-2xl font-mono overflow-hidden">
      {/* Terminal Header Dashboard */}
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
            Last 5 events
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {displayLogs.length > 0 ? (
          displayLogs.map((log, i) => (
            <div
              key={`${log.key}-${i}-${log.data.player}`}
              className="flex items-start text-xs leading-relaxed transition-all duration-300 animate-in fade-in slide-in-from-top-1"
            >
              <span className="text-zinc-700 mr-3 select-none">›</span>
              <div className="flex flex-col">{renderLogMessage(log)}</div>
            </div>
          ))
        ) : (
          <p className="text-zinc-800 text-[10px] italic py-4">
            No events recorded
          </p>
        )}
      </div>
    </div>
  );
}
