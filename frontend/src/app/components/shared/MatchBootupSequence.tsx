"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { GAME_REGISTRY } from "../games/registry";

import { useTranslation } from "@/hooks/useTranslation";

interface MatchBootupSequenceProps {
  onComplete: () => void;
  gameTitle: string;
  gameSlug: string;
}

/**
 * MatchBootupSequence: Ultra-high fidelity 'Top Class' transition.
 * Vibe: Cinematic game preparation.
 */
export default function MatchBootupSequence({
  onComplete,
  gameTitle,
  gameSlug,
}: MatchBootupSequenceProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const bootLogs = useMemo(() => [
    t.lobbyInitiation.toUpperCase(),
    t.boot_preparing.toUpperCase() + "...",
    t.boot_syncing.toUpperCase() + "...",
    t.boot_loading.toUpperCase() + " " + gameTitle.toUpperCase(),
    t.boot_starting.toUpperCase() + "...",
    t.boot_ready.toUpperCase(),
  ], [gameTitle, t]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    const logTimer = setInterval(() => {
      setLogIndex((prev) => (prev < bootLogs.length - 1 ? prev + 1 : prev));
    }, 1000);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete, bootLogs.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-[#020203] flex flex-col items-center justify-center p-8 font-mono"
    >
      <div className="absolute inset-0 neuro-grid opacity-20" />
      <div className="scanline opacity-10" />

      <div className="max-w-md w-full space-y-12 relative z-10">
        {/* 📟 LOG READOUT */}
        <div className="space-y-2 min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {bootLogs.slice(0, logIndex + 1).map((log, i) => (
              <motion.p
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`text-[10px] tracking-[0.3em] uppercase ${
                  i === logIndex ? "text-teal-400" : "text-zinc-600"
                }`}
              >
                {i === logIndex && ">> "}
                {log}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* 📊 PROGRESS BAR */}
        <div className="space-y-4">
          <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
            <span>{t.lobby}</span>
            <span className="text-teal-400">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full border border-white/5 overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.5)]"
            />
          </div>
        </div>

        {/* ⚛️ CORE ANIMATION */}
        <div className="flex justify-center py-8">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-32 h-32 border-4 border-dashed border-teal-500/20 rounded-full flex items-center justify-center relative"
          >
            <div className="w-24 h-24 border-2 border-blue-500/10 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-teal-400/5 blur-3xl rounded-full" />
            <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {GAME_REGISTRY[gameSlug.toLowerCase()]?.visuals.emoji}
            </span>
          </motion.div>
        </div>

        <div className="text-center pt-8 border-t border-white/5">
          <p className="text-[7px] text-zinc-700 font-bold uppercase tracking-[0.5em]">
            LUNARIS ARCADE // {t.available}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
