"use client";

import { useMemo, ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";

export interface ActivityLog {
  key: string;
  data: Record<string, any>;
}

interface MatchActivityProps {
  history: ActivityLog[];
  renderLog: (log: ActivityLog) => ReactNode;
}

/**
 * MatchActivity: High-fidelity "Cyberpunk Match Log".
 * Vibe: Scrolling terminal feed with staggered reveals.
 */
export default function MatchActivity({
  history,
  renderLog,
}: MatchActivityProps) {
  const { t } = useTranslation();
  const displayLogs = useMemo(() => (history || []).slice(0, 8), [history]);

  return (
    <section className="w-full rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-3xl p-8 shadow-2xl font-mono overflow-hidden flex flex-col relative">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-2xl">
        ⚡
      </div>

      <div className="flex flex-col gap-3 min-h-[200px]">
        <AnimatePresence initial={false}>
          {displayLogs.length > 0 ? (
            displayLogs.map((log, i) => (
              <motion.div
                key={`${log.key}-${i}-${history.length}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-start text-[10px] leading-relaxed group"
              >
                <div className="flex-1 uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                  {renderLog(log)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-20">
              <div className="h-1 w-1 bg-zinc-700 rounded-full animate-ping mb-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">
                {t.noEvents}...
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
