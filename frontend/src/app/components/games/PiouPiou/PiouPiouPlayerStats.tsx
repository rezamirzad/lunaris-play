"use client";

interface PiouPiouPlayerStatsProps {
  state: {
    eggs: number;
    chicks: number;
  };
}

/**
 * PiouPiouPlayerStats: High-fidelity, compact resource monitor.
 * Optimized for narrow containers in the Shared Player Layout.
 */
export default function PiouPiouPlayerStats({
  state,
}: PiouPiouPlayerStatsProps) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
          Chicks
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
          <span className="text-xl font-black text-white tracking-tighter font-mono">
            {state.chicks || 0}
          </span>
          <span className="text-xs opacity-50">/ 3</span>
        </div>
      </div>

      {/* Vertical Divider for Technical Separation */}
      <div className="h-8 w-[1px] bg-white/10" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
          Eggs
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <span className="text-xl font-black text-white tracking-tighter">
            {state.eggs || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
