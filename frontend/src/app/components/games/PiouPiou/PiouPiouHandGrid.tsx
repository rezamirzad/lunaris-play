"use client";

import PiouPiouCard from "./PiouPiouCard";

interface PiouPiouHandGridProps {
  hand: string[];
  isMyTurn: boolean;
  selectedCards: string[];
  onCardSelect: (uniqueKey: string) => void;
}

export default function PiouPiouHandGrid({
  hand,
  isMyTurn,
  selectedCards,
  onCardSelect,
}: PiouPiouHandGridProps) {
  return (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center gap-4">
      {/* Visual background matching Lunaris terminal aesthetics */}
      <div className="absolute inset-0 bg-[#09090b]/30 border border-white/5 rounded-[40px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent opacity-40" />
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-8 p-4">
        {hand.map((card, idx) => {
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
