"use client";

import PiouPiouCard from "./PiouPiouCard";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook for context

interface PiouPiouHandGridProps {
  hand: string[];
  isMyTurn: boolean;
  selectedCards: string[];
  onCardSelect: (uniqueKey: string) => void;
}

/**
 * PiouPiouHandGrid: High-performance card grid for the controller interface.
 * Adheres to LUMZ Dark Mode 2.0 aesthetics and LTR standards.
 */
export default function PiouPiouHandGrid({
  hand,
  isMyTurn,
  selectedCards,
  onCardSelect,
}: PiouPiouHandGridProps) {
  // Hook included to maintain access to session language if needed for dynamic labels[cite: 2]
  const { lang } = useTranslation();

  return (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center gap-4">
      {/* Visual background matching Lunaris terminal aesthetics[cite: 2] */}
      <div className="absolute inset-0 bg-[#09090b]/30 border border-white/5 rounded-[40px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent opacity-40" />
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-8 p-4">
        {hand.map((card, idx) => {
          // Technical Keying: Ensures stable re-renders in the digital henhouse[cite: 2]
          const uniqueKey = `${card}-${idx}`;
          const isSelected = selectedCards.includes(uniqueKey);

          return (
            <PiouPiouCard
              key={uniqueKey}
              cardKey={card}
              isInteractable={isMyTurn}
              onSelect={() => onCardSelect(uniqueKey)}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
