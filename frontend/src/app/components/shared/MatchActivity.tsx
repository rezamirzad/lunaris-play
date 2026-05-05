"use client";

import { useMemo, ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

export interface ActivityLog {
  key: string;
  data: Record<string, any>;
}

interface MatchActivityProps {
  history: ActivityLog[];
  /**
   * renderLog: A function passed from the specific game folder
   * to handle localized emojis and logic.
   */
  renderLog: (log: ActivityLog) => ReactNode;
}

/**
 * MatchActivity: Shared high-performance event feed.
 * Optimized for the "Dark Mode 2.0" developer-cool aesthetic.
 * Refactored for LTR Multilingual support.
 */
export default function MatchActivity({
  history,
  renderLog,
}: MatchActivityProps) {
  const { t } = useTranslation(); // Destructured localization set

  // High-performance memoization for the event stack[cite: 2]
  const displayLogs = useMemo(() => history.slice(0, 5), [history]);

  return (
    <div className="w-full max-w-sm rounded-[24px] border border-white/5 bg-[#050505] p-6 shadow-2xl font-mono overflow-hidden">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
          {/* Localized Header: 5 Last Events / 5 DERNIERS ÉVÉNEMENTS / 5 LETZTE EREIGNISSE / ۵ گزارش آخر[cite: 2] */}
          {t.lastEvents || "Last 5 events"}
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {displayLogs.length > 0 ? (
          displayLogs.map((log, i) => (
            <div
              key={`${log.key}-${i}`}
              className="flex items-start text-xs leading-relaxed transition-all duration-300 animate-in fade-in slide-in-from-top-1"
            >
              <span className="text-zinc-700 mr-3 select-none">›</span>
              <div className="flex flex-col">{renderLog(log)}</div>
            </div>
          ))
        ) : (
          <p className="text-zinc-800 text-[10px] italic py-4">
            {/* Localized Fallback: No events recorded / Aucun événement / Keine Ereignisse / گزارشی ثبت نشده[cite: 2] */}
            {t.noEvents || "No events recorded"}
          </p>
        )}
      </div>
    </div>
  );
}
