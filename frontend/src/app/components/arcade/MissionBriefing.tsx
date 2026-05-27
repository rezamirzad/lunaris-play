"use client";

import { ReactNode } from "react";
import SharedArcadeLayout from "../shared/SharedArcadeLayout";
import LobbyInitialization from "../shared/LobbyInitialization";
import { Doc } from "convex/_generated/dataModel";

interface MissionBriefingProps {
  title: string;
  subtitle: string;
  briefingTitle: string;
  briefingDesc: string;
  loadingText: string;
  accentColor: "orange" | "teal" | "blue" | "cyan" | "amber" | "rose";
  background?: ReactNode;
  room: Doc<"rooms">;
  players: any[];
  me?: any;
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
  room,
  players,
  me,
}: MissionBriefingProps) {
  const theme = COLOR_MAP[accentColor];

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen w-full flex flex-col relative overflow-hidden`}>
      {background && <div className="absolute inset-0 z-0">{background}</div>}
      
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 lg:p-12 relative z-10 overflow-y-auto no-scrollbar">
        <div className="max-w-7xl w-full space-y-12">
            {/* 1. CINEMATIC HEADER */}
            <div className="text-center">
                <h1 className={`text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b ${theme.gradient} tracking-tighter uppercase italic leading-tight`}>
                    {title}
                </h1>
                <p className={`text-[10px] md:text-xs ${theme.sub} font-bold uppercase tracking-[0.6em] mt-2`}>
                    {subtitle}
                </p>
            </div>

            {/* 2. BRIEFING PANEL & LOBBY LOGIC */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-8">
                    <div className={`p-10 rounded-[3rem] border ${theme.panel} shadow-2xl backdrop-blur-xl bg-black/40`}>
                        <h2 className={`text-2xl font-black ${theme.innerTitle} mb-4 italic uppercase tracking-tight`}>
                            {briefingTitle}
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed italic opacity-80">
                            &quot;{briefingDesc}&quot;
                        </p>
                        <div className={`text-[10px] ${theme.loading} uppercase tracking-[0.4em] animate-pulse mt-10`}>
                            {loadingText}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <LobbyInitialization 
                        room={room}
                        players={players}
                        me={me}
                        isBoardView={true}
                        localizedGameTitle={title}
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
