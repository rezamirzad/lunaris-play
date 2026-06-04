"use client";

import { ReactNode } from "react";

interface ArcadeHUDProps {
  title: string;
  statusLabel: string;
  badgeContent: ReactNode;
  accentColor: "orange" | "teal" | "blue" | "cyan" | "amber" | "rose";
  onHaltToggle?: () => void;
  isHalted?: boolean;
  onRulesClick?: () => void;
}

const THEME_MAP = {
  orange: {
    bg: "bg-orange-950/20",
    border: "border-orange-500/10",
    title: "text-orange-400",
    sub: "text-orange-600",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-400",
    badgeBorder: "border-blue-500/20",
  },
  teal: {
    bg: "bg-teal-950/20",
    border: "border-teal-500/10",
    title: "text-teal-400",
    sub: "text-teal-600",
    badgeBg: "bg-teal-500/10",
    badgeText: "text-teal-400",
    badgeBorder: "border-teal-500/20",
  },
  blue: {
    bg: "bg-blue-950/20",
    border: "border-blue-500/10",
    title: "text-blue-400",
    sub: "text-blue-600",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-400",
    badgeBorder: "border-blue-500/20",
  },
  cyan: {
    bg: "bg-cyan-950/20",
    border: "border-cyan-500/10",
    title: "text-cyan-400",
    sub: "text-cyan-600",
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/20",
  },
  amber: {
    bg: "bg-amber-950/20",
    border: "border-amber-500/10",
    title: "text-amber-400",
    sub: "text-amber-600",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    badgeBorder: "border-amber-500/20",
  },
  rose: {
    bg: "bg-rose-950/20",
    border: "border-rose-500/10",
    title: "text-rose-400",
    sub: "text-rose-600",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/20",
  },
};

export default function ArcadeHUD({
  title,
  statusLabel,
  badgeContent,
  accentColor,
  onHaltToggle,
  isHalted = false,
  onRulesClick,
}: ArcadeHUDProps) {
  const theme = THEME_MAP[accentColor];

  return (
    <header className={`flex justify-between items-center ${theme.bg} px-8 py-4 rounded-3xl border ${theme.border} backdrop-blur-md`}>
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className={`text-2xl font-black ${theme.title} tracking-tighter uppercase italic leading-none`}>
            {title}
          </h1>
          <span className={`text-[8px] font-bold ${theme.sub} uppercase tracking-widest mt-1`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onRulesClick && (
            <button 
                onClick={onRulesClick}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all mr-2 flex items-center gap-2"
            >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                RULES
            </button>
        )}
        {onHaltToggle && (
            <button 
                onClick={onHaltToggle}
                className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border transition-all ${isHalted ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}
            >
                {isHalted ? '▶ Resume AI' : '⏹ Halt AI'}
            </button>
        )}
        <div className={`text-[10px] ${theme.badgeBg} ${theme.badgeText} px-4 py-1.5 rounded-full uppercase tracking-widest border ${theme.badgeBorder} font-black shadow-inner`}>
          {badgeContent}
        </div>
      </div>
    </header>
  );
}
