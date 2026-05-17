"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog, TranslationSet } from "@/lib/translations";

interface ActivityLog {
  key: string;
  data: Record<string, string | number>;
}

/**
 * DixitLogMessage: Specialized renderer for Dixit-specific events.
 * Adheres to LUMZ technical transparency and LTR standards.
 */
export default function MatchActivity({ log }: { log: ActivityLog }) {
  const { t, lang } = useTranslation();

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-start gap-2 py-1 border-l border-white/5 pl-3 hover:bg-white/[0.02] transition-colors">
       <span className="text-[8px] font-black text-zinc-600 tabular-nums shrink-0 mt-1">[{formatTime()}]</span>
       <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">
             {t[log.key as keyof TranslationSet] ? formatLog(t[log.key as keyof TranslationSet], log.data, lang) : log.key}
          </span>
       </div>
    </div>
  );
}
