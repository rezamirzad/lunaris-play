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
    <div className="flex items-start gap-2 py-1 border-l border-white/5 pl-3 hover:bg-white/[0.02] transition-colors"></div>
  );
}
