"use client";

import { useState } from "react";
import GameCard from "./GameCard";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook
import { toPersianDigits } from "@/lib/translations"; // Numerical localization[cite: 2]

interface PlayerHandProps {
  hand: string[];
  isMyTurn: boolean;
  playerName: string;
  onPlayCard: (cardKey: string) => void;
}

/**
 * PlayerHand: Fixed at the bottom of the viewport.
 * Uses Dark Mode 2.0 aesthetics with subtle gradients[cite: 2].
 * Refactored for LTR Multilingual support.
 */
export default function PlayerHand({
  hand,
  isMyTurn,
  playerName,
  onPlayCard,
}: PlayerHandProps) {
  const { t, lang } = useTranslation(); // Destructured localization set[cite: 2]
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  if (!hand || hand.length === 0) return null;

  const isFA = lang === "fa";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
      {/* Background Gradient for readability matching terminal aesthetic[cite: 2] */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 pointer-events-auto">
        {/* Hand Status Label localized[cite: 2] */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-4 py-1.5 rounded-full backdrop-blur-md">
          <div
            className={`h-1.5 w-1.5 rounded-full ${isMyTurn ? "bg-teal-500 animate-pulse" : "bg-zinc-600"}`}
          />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
            {playerName} | {t.hand || "Hand"} (
            {isFA ? toPersianDigits(hand.length) : hand.length})
          </span>
        </div>

        {/* The Actual Cards rendered as localized assets */}
        <div className="flex justify-center -space-x-4 sm:-space-x-2">
          {hand.map((card, idx) => (
            <GameCard
              key={`${card}-${idx}`}
              cardKey={card}
              isInteractable={isMyTurn}
              isSelected={selectedCard === card}
              onSelect={(key) =>
                setSelectedCard(key === selectedCard ? null : key)
              }
            />
          ))}
        </div>

        {/* Localized Action Execution Button */}
        {selectedCard && isMyTurn && (
          <button
            onClick={() => {
              onPlayCard(selectedCard);
              setSelectedCard(null);
            }}
            className="mt-2 bg-teal-500 hover:bg-teal-400 text-black font-black py-3 px-8 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-[0_10px_20px_rgba(20,184,166,0.3)] animate-in fade-in slide-in-from-bottom-2"
          >
            {t.action || "Execute Action"}
          </button>
        )}
      </div>
    </div>
  );
}
