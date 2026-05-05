"use client";

import Image from "next/image";

interface GameCardProps {
  cardKey: string;
  isInteractable: boolean;
  onSelect?: (cardKey: string) => void;
  isSelected?: boolean;
}

/**
 * GameCard: High-fidelity asset resolver for PiouPiou and Dixit.
 * Optimized for the "Dark Mode 2.0" developer-cool aesthetic.
 */
export default function GameCard({
  cardKey,
  isInteractable,
  onSelect,
  isSelected,
}: GameCardProps) {
  const isDixit = cardKey.startsWith("dixit_");

  // Normalize key for asset mapping
  const normalizedKey = cardKey.toLowerCase();

  // Map text values to your local public assets
  const assetMap: Record<string, string> = {
    chicken: "/assets/games/pioupiou/chicken.png",
    rooster: "/assets/games/pioupiou/rooster.png",
    fox: "/assets/games/pioupiou/fox.png",
    nest: "/assets/games/pioupiou/nest.png",
  };

  const imageSrc = assetMap[normalizedKey];

  return (
    <button
      disabled={!isInteractable}
      onClick={() => onSelect?.(cardKey)}
      className={`relative group aspect-[2/3] w-24 md:w-32 rounded-xl border transition-all duration-300 overflow-hidden shadow-2xl
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

      <div className="relative h-full w-full flex flex-col items-center justify-center p-2 text-center">
        {isDixit ? (
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
            Media_Node_{cardKey.split("_")[1]}
          </span>
        ) : imageSrc ? (
          /* High-Performance Image Component */
          <div className="relative h-full w-full">
            <Image
              src={imageSrc}
              alt={cardKey}
              fill
              className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 96px, 128px"
              priority={isSelected}
            />
          </div>
        ) : (
          <span className="text-xs font-black uppercase tracking-widest text-white italic leading-tight">
            {cardKey}
          </span>
        )}
      </div>

      <div
        className={`absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-20`}
      />
    </button>
  );
}
