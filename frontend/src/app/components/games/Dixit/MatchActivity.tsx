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

  // Safely map the log key to our translation set
  const template = t[log.key as keyof TranslationSet] || log.key;

  return (
    <div className="flex items-start gap-2 py-1 border-l border-white/5 pl-3 hover:bg-white/[0.02] transition-colors">
      <span className="text-teal-500/50 font-mono text-[8px] mt-0.5">
        {">_"}
      </span>
      <p className="text-zinc-400 font-mono text-[10px] tracking-wider leading-relaxed">
        {/* formatLog handles the player name injection and Persian digit conversion */}
        {formatLog(template, log.data, lang)}
      </p>
    </div>
  );
}
