"use client";

import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

/**
 * LoadingSpinner: Next-Gen performance indicator.
 * Optimized for immersive state transitions in the Lunaris template.
 */
export function LoadingSpinner() {
  const { t } = useTranslation(); // Destructured localization set

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* High-fidelity spinner matching brand aesthetics */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-900/20 border-t-blue-600" />

      <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
        {/* Localized Label: Initializing... / Initialisation... / آماده‌سازی... */}
        {t.statusLobby || "Initializing Engine..."}
      </p>
    </div>
  );
}
