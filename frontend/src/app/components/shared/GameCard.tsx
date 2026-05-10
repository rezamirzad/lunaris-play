"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

interface GameCardProps {
  cardKey: string;
  isInteractable: boolean;
  onSelect?: (cardKey: string) => void;
  isSelected?: boolean;
}

/**
 * GameCard: High-fidelity asset resolver for PiouPiou and Dixit.
 * Optimized for the "Top Class" cinematic aesthetic.
 */
export default function GameCard({
  cardKey,
  isInteractable,
  onSelect,
  isSelected,
}: GameCardProps) {
  const { t } = useTranslation();
  const isDixit = cardKey.includes("dixit_");
  const normalizedKey = cardKey.toLowerCase();

  const piouPiouMap: Record<string, string> = {
    chicken: "/assets/games/pioupiou/cards/chicken.png",
    rooster: "/assets/games/pioupiou/cards/rooster.png",
    fox: "/assets/games/pioupiou/cards/fox.png",
    nest: "/assets/games/pioupiou/cards/nest.png",
  };

  const imageSrc = isDixit 
    ? `/assets/games/dixit/cards/${cardKey}.png`
    : piouPiouMap[normalizedKey];

  return (
    <button
      disabled={!isInteractable}
      onClick={() => onSelect?.(cardKey)}
      className={`relative group aspect-[2/3] w-24 md:w-32 rounded-[2rem] border transition-all duration-300 overflow-hidden shadow-2xl
        ${
          isSelected
            ? "border-teal-400 scale-105 -translate-y-4 z-10 shadow-[0_0_30px_rgba(45,212,191,0.2)]"
            : "border-white/10 hover:border-white/30 hover:-translate-y-2"
        }
        ${!isInteractable && "opacity-50 grayscale cursor-not-allowed"}
        bg-[#09090b]`}
    >
      {/* Visual Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-10" />

      {/* Safari Fix: Use absolute inset-0 to force bounds propagation */}
      <div className="absolute inset-0 p-2 z-20 flex flex-col items-center justify-center text-center">
        {imageSrc ? (
          <div className="relative h-full w-full">
            <Image
              src={imageSrc}
              alt={t[normalizedKey as keyof typeof t] || cardKey}
              fill
              className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 96px, 128px"
              priority={isSelected}
            />
          </div>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic leading-tight px-2">
            {isDixit ? `NODE_${cardKey.split("_")[1]}` : t[normalizedKey as keyof typeof t] || cardKey}
          </span>
        )}
      </div>

      <div
        className={`absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-20`}
      />
    </button>
  );
}
