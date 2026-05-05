"use client";

/**
 * WinnerBadge: A high-fidelity indicator for the match winner.
 * Uses a gold-to-transparent gradient and monospaced typography
 * to align with the software terminal aesthetic.
 */
export default function WinnerBadge() {
  return (
    <div className="absolute -top-3 -right-2 z-20 flex items-center gap-1.5 rounded-md border border-yellow-500/50 bg-[#000000] px-2 py-1 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-in zoom-in-90 duration-500">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 font-mono">
        Winner
      </span>
      <span className="text-sm" role="img" aria-label="crown">
        👑
      </span>
    </div>
  );
}
