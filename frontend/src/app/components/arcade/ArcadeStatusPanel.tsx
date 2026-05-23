"use client";

import { ReactNode } from "react";

interface StatusRow {
  label: string;
  value: ReactNode;
  valueColor?: string;
}

interface ArcadeStatusPanelProps {
  title: string;
  protocolLabel: string;
  protocolValue: string;
  rows: StatusRow[];
  accentColor: "orange" | "teal" | "blue" | "cyan" | "amber" | "rose";
}

const THEME_MAP = {
  orange: {
    title: "text-orange-500/60",
    protocolValue: "text-teal-400",
    valueDefault: "text-orange-400",
  },
  teal: {
    title: "text-teal-500/60",
    protocolValue: "text-teal-400",
    valueDefault: "text-teal-400",
  },
  blue: {
    title: "text-blue-500/60",
    protocolValue: "text-teal-400",
    valueDefault: "text-blue-400",
  },
  cyan: {
    title: "text-cyan-500/60",
    protocolValue: "text-teal-400",
    valueDefault: "text-cyan-400",
  },
  amber: {
    title: "text-amber-500/60",
    protocolValue: "text-teal-400",
    valueDefault: "text-amber-400",
  },
  rose: {
    title: "text-rose-500/60",
    protocolValue: "text-teal-400",
    valueDefault: "text-rose-400",
  },
};

export default function ArcadeStatusPanel({
  title,
  protocolLabel,
  protocolValue,
  rows,
  accentColor,
}: ArcadeStatusPanelProps) {
  const theme = THEME_MAP[accentColor];

  return (
    <section className="bg-black/40 rounded-[2rem] border border-white/5 p-8 flex flex-col justify-center gap-4 shadow-2xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-2">
        <span className={`text-[8px] font-black ${theme.title} uppercase tracking-[0.4em]`}>
          {protocolLabel}
        </span>
        <span className={`text-[10px] font-black ${theme.protocolValue} uppercase tracking-widest`}>
          {protocolValue}
        </span>
      </div>
      
      {title && (
         <h3 className={`text-[8px] font-black ${theme.title} uppercase tracking-[0.4em] mb-2`}>
            {title}
         </h3>
      )}

      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              {row.label}:
            </span>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${row.valueColor || theme.valueDefault}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
