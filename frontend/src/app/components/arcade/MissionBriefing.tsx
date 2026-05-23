"use client";

import { ReactNode } from "react";
import SharedArcadeLayout from "../shared/SharedArcadeLayout";

interface MissionBriefingProps {
  title: string;
  subtitle: string;
  briefingTitle: string;
  briefingDesc: string;
  loadingText: string;
  accentColor: "orange" | "teal" | "blue" | "cyan" | "amber" | "rose";
  background?: ReactNode;
}

const COLOR_MAP = {
  orange: {
    bg: "bg-[#1a0f05]",
    text: "text-orange-50",
    gradient: "from-orange-300 to-orange-600",
    sub: "text-orange-400",
    panel: "bg-orange-900/10 border-orange-500/20",
    innerTitle: "text-orange-300",
    loading: "text-orange-500/50",
  },
  teal: {
    bg: "bg-[#051111]",
    text: "text-teal-50",
    gradient: "from-teal-300 to-teal-600",
    sub: "text-teal-400",
    panel: "bg-teal-900/10 border-teal-500/20",
    innerTitle: "text-teal-300",
    loading: "text-teal-500/50",
  },
  blue: {
    bg: "bg-[#0a0614]",
    text: "text-blue-50",
    gradient: "from-blue-300 to-blue-600",
    sub: "text-blue-400",
    panel: "bg-blue-900/10 border-blue-500/20",
    innerTitle: "text-blue-300",
    loading: "text-blue-500/50",
  },
  cyan: {
    bg: "bg-[#051111]",
    text: "text-cyan-50",
    gradient: "from-cyan-300 to-cyan-600",
    sub: "text-cyan-400",
    panel: "bg-cyan-900/10 border-cyan-500/20",
    innerTitle: "text-cyan-300",
    loading: "text-cyan-500/50",
  },
  amber: {
    bg: "bg-[#0d0700]",
    text: "text-amber-50",
    gradient: "from-amber-200 to-amber-600",
    sub: "text-amber-500",
    panel: "bg-amber-900/10 border-amber-500/20",
    innerTitle: "text-amber-300",
    loading: "text-amber-500/50",
  },
  rose: {
    bg: "bg-[#0a0202]",
    text: "text-rose-50",
    gradient: "from-rose-300 to-rose-600",
    sub: "text-rose-400",
    panel: "bg-rose-900/10 border-rose-500/20",
    innerTitle: "text-rose-300",
    loading: "text-rose-500/50",
  },
};

export default function MissionBriefing({
  title,
  subtitle,
  briefingTitle,
  briefingDesc,
  loadingText,
  accentColor,
  background,
}: MissionBriefingProps) {
  const theme = COLOR_MAP[accentColor];

  return (
    <SharedArcadeLayout
      containerClassName={`${theme.bg} ${theme.text}`}
      background={background}
      header={
        <div className="text-center pt-10">
          <h1 className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b ${theme.gradient} tracking-tighter uppercase italic`}>
            {title}
          </h1>
          <p className={`text-[10px] ${theme.sub} font-bold uppercase tracking-[0.5em] mt-2`}>
            {subtitle}
          </p>
        </div>
      }
      main={
        <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto text-center space-y-12">
          <div className={`p-12 rounded-[3rem] border ${theme.panel} shadow-2xl`}>
            <h2 className={`text-3xl font-black ${theme.innerTitle} mb-6 italic uppercase`}>
              {briefingTitle}
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              &quot;{briefingDesc}&quot;
            </p>
          </div>
          <div className={`text-[10px] ${theme.loading} uppercase tracking-[0.4em] animate-pulse`}>
            {loadingText}
          </div>
        </div>
      }
    />
  );
}
