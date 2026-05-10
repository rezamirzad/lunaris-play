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
}: PlayerHandProps) {
  const { t, lang } = useTranslation();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  if (!hand || hand.length === 0) return null;

  const isFA = lang === "fa";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-8 pointer-events-none overflow-hidden">
      {/* Background Terminal Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-zinc-950/80 to-transparent -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 pointer-events-auto relative">
        
        {/* DECORATIVE SCANLINE (LOCAL) */}
        <div className="absolute bottom-0 w-full h-[1px] bg-teal-400/10 shadow-[0_0_15px_rgba(45,212,191,0.3)]" />

        {/* 📟 NODE_STATUS_TAG */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 bg-zinc-900/40 border border-white/5 px-5 py-2 rounded-2xl backdrop-blur-3xl shadow-2xl"
        >
          <div
            className={`h-2 w-2 rounded-full ${isMyTurn ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,1)] animate-pulse" : "bg-zinc-700"}`}
          />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
            {playerName}_UPLINK // {t.hand || "HAND"}: (
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
                className="bg-white text-black font-black py-4 px-12 rounded-[2rem] text-sm uppercase tracking-[0.3em] transition-all shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 group-hover:text-white transition-colors">
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
