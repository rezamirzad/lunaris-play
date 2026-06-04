"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

interface ArcadeVictoryOverlayProps {
  winnerName?: ReactNode;
  championLabel: string;
  accentColor: "orange" | "teal" | "blue" | "cyan" | "amber" | "rose";
  onExit?: () => void;
  icon?: ReactNode;
}

const THEME_MAP = {
  orange: {
    bg: "bg-[#0a0602]/98",
    glow: "rgba(249,115,22,0.4)",
    gradient: "from-orange-400 to-orange-700",
    buttonText: "text-orange-950",
    border: "border-orange-500/40",
    shadow: "rgba(249,115,22,0.4)",
  },
  teal: {
    bg: "bg-[#020808]/98",
    glow: "rgba(45,212,191,0.4)",
    gradient: "from-teal-400 to-teal-700",
    buttonText: "text-teal-950",
    border: "border-teal-500/40",
    shadow: "rgba(45,212,191,0.4)",
  },
  blue: {
    bg: "bg-[#05030a]/98",
    glow: "rgba(59,130,246,0.4)",
    gradient: "from-blue-400 to-blue-700",
    buttonText: "text-white",
    border: "border-blue-500/40",
    shadow: "rgba(59,130,246,0.4)",
  },
  cyan: {
    bg: "bg-[#020a0a]/98",
    glow: "rgba(34,211,238,0.4)",
    gradient: "from-cyan-400 to-cyan-700",
    buttonText: "text-cyan-950",
    border: "border-cyan-500/40",
    shadow: "rgba(34,211,238,0.4)",
  },
  amber: {
    bg: "bg-[#0a0500]/98",
    glow: "rgba(245,158,11,0.4)",
    gradient: "from-amber-400 to-amber-700",
    buttonText: "text-amber-950",
    border: "border-amber-500/40",
    shadow: "rgba(245,158,11,0.4)",
  },
  rose: {
    bg: "bg-[#050101]/98",
    glow: "rgba(244,63,94,0.4)",
    gradient: "from-rose-400 to-rose-700",
    buttonText: "text-rose-950",
    border: "border-rose-500/40",
    shadow: "rgba(244,63,94,0.4)",
  },
};

export default function ArcadeVictoryOverlay({
  winnerName,
  championLabel,
  accentColor,
  onExit,
  icon = "👑",
}: ArcadeVictoryOverlayProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const theme = THEME_MAP[accentColor];

  const handleExit = onExit || (() => (window.location.href = "/"));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute inset-0 ${theme.bg} backdrop-blur-3xl z-[60] flex flex-col items-center justify-center p-16 text-center overflow-y-auto no-scrollbar`}
    >
      <div className="relative mb-4">
        <motion.span
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className={`text-[5rem] lg:text-[2rem] block filter drop-shadow-[0_0_50px_${theme.glow}]`}
        >
          {icon}
        </motion.span>
      </div>

      <h2 className="text-5xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 uppercase leading-none mb-3">
        {championLabel}
      </h2>

      <div className="flex items-center justify-center gap-4 text-xl lg:text-5xl font-black text-yellow-500 uppercase mb-12 italic pb-2 px-12 max-w-3xl drop-shadow-lg leading-tight">
        {winnerName || championLabel}
      </div>

      <div className="flex flex-col gap-6 w-full max-w-md items-center">
        {!isAuthenticated && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-2xl relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
               <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mb-2 block">
                  Hall of Fame // Persistence
               </span>
               <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
                  Save Your Legacy
               </h3>
               <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider font-bold mb-6">
                  Sign in to link your session stats to a permanent profile and unlock global rankings.
               </p>
               
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => signIn("github")}
                    className="py-3.5 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all group/btn"
                  >
                    <span className="text-xl">🐙</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">GitHub</span>
                  </button>
                  <button 
                    onClick={() => signIn("google")}
                    className="py-3.5 bg-white text-black rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-accent transition-all group/btn"
                  >
                    <span className="text-xl">💎</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Google</span>
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleExit}
          className={`px-16 py-5 bg-gradient-to-b ${theme.gradient} ${theme.buttonText} font-black text-2xl uppercase italic rounded-3xl shadow-[0_10px_50px_${theme.shadow}] hover:scale-105 active:scale-95 transition-all border-t-2 border-white/20`}
        >
          {t.exit}
        </button>
      </div>
    </motion.div>
  );
}
