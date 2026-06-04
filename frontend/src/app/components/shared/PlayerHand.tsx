"use client";

import { useState } from "react";
import GameCard from "./GameCard";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerHandProps {
  hand: string[];
  isMyTurn: boolean;
  playerName: string;
  onPlayCard: (cardKey: string) => void;
  gameType?: string;
}

/**
 * PlayerHand: High-fidelity 'Top Class' interaction deck.
 * Fixed at the bottom of the viewport with haptic digital effects.
 */
export default function PlayerHand({
  hand,
  isMyTurn,
  playerName,
  onPlayCard,
  gameType = "none",
}: PlayerHandProps) {
  const { t, lang } = useTranslation();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  if (!hand || hand.length === 0) return null;

  const isFA = lang === "fa";

  const THEME_MAP: Record<string, { from: string; via: string; border: string }> = {
    pioupiou: { from: "#0f0802", via: "rgba(249,115,22,0.1)", border: "border-orange-500/20" },
    dixit: { from: "#05020f", via: "rgba(59,130,246,0.1)", border: "border-blue-500/20" },
    incangold: { from: "#0f0502", via: "rgba(245,158,11,0.1)", border: "border-amber-500/20" },
    themind: { from: "#020f0a", via: "rgba(20,184,166,0.1)", border: "border-teal-500/20" },
    justone: { from: "#020b0f", via: "rgba(34,211,238,0.1)", border: "border-cyan-500/20" },
    timeattack: { from: "#0f0205", via: "rgba(244,63,94,0.1)", border: "border-rose-500/20" },
    none: { from: "#020203", via: "zinc-950/80", border: "border-white/5" },
  };

  const theme = THEME_MAP[gameType] || THEME_MAP.none;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-8 pointer-events-none overflow-hidden">
      {/* Background Terminal Gradient */}
      <div 
        className="absolute inset-0 -z-10 transition-colors duration-1000" 
        style={{ 
          background: `linear-gradient(to top, ${theme.from} 0%, ${theme.via} 50%, transparent 100%)` 
        }} 
      />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 pointer-events-auto relative">

        {/* DECORATIVE SCANLINE (LOCAL) */}
        <div className={`absolute bottom-0 w-full h-[1px] opacity-30 shadow-[0_0_15px_rgba(255,255,255,0.1)] ${theme.border}`} />

        {/* 📟 NODE_STATUS_TAG */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex items-center gap-3 bg-zinc-900/40 border ${theme.border} px-5 py-2 rounded-2xl backdrop-blur-3xl shadow-2xl`}
        >

          <div
            className={`h-2 w-2 rounded-full ${isMyTurn ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,1)] animate-pulse" : "bg-zinc-700"}`}
          />
          <span 
            dir={isFA ? "rtl" : "ltr"}
            className={`text-[10px] font-black uppercase text-zinc-400 ${isFA ? 'fa-text-fix' : 'tracking-[0.4em]'}`}
          >
            {playerName} {"//"} {t.hand}: (
            {isFA ? toPersianDigits(hand.length) : hand.length})
          </span>
        </motion.div>

        {/* 🎴 HAPTIC DECK GRID */}
        <div className="flex justify-center -space-x-8 sm:-space-x-4 pb-4">
          <AnimatePresence mode="popLayout">
            {hand.map((card, idx) => (
              <motion.div
                key={`${card}-${idx}`}
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: idx * 0.05 
                }}
                whileHover={{ y: -10, zIndex: 10 }}
              >
                <GameCard
                  cardKey={card}
                  isInteractable={isMyTurn}
                  isSelected={selectedCard === card}
                  onSelect={(key) =>
                    setSelectedCard(key === selectedCard ? null : key)
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ⚡ EXECUTION TRIGGER */}
        <AnimatePresence>
          {selectedCard && isMyTurn && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10 }}
              className="mt-2"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(45,212,191,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onPlayCard(selectedCard);
                  setSelectedCard(null);
                }}
                className={`bg-white text-black font-black py-4 px-12 rounded-[2rem] text-sm uppercase transition-all shadow-2xl relative overflow-hidden group ${isFA ? 'fa-text-fix' : 'tracking-[0.3em]'}`}
              >
                <div className="absolute inset-0 bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span 
                  dir={isFA ? "rtl" : "ltr"}
                  className="relative z-10 group-hover:text-white transition-colors"
                >
                  {t.action || "INITIALIZE_PROTOCOL"}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
