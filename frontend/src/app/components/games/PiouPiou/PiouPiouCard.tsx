"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

interface PiouPiouCardProps {
  cardKey: string;
  isInteractable: boolean;
  onSelect?: (cardKey: string) => void;
  isSelected?: boolean;
}

/**
 * PiouPiouCard: Minimalist Selection Logic.
 * Implementation: Locked grid positions with teal border highlights.
 * Refactored for LTR Multilingual Accessibility.
 */
export default function PiouPiouCard({
  cardKey,
  isInteractable,
  onSelect,
  isSelected,
}: PiouPiouCardProps) {
  const { t } = useTranslation(); // Destructured localization set
  const normalizedKey = cardKey.toLowerCase();

  const assetMap: Record<string, string> = {
    chicken: "/assets/games/pioupiou/chicken.png",
    rooster: "/assets/games/pioupiou/rooster.png",
    fox: "/assets/games/pioupiou/fox.png",
    nest: "/assets/games/pioupiou/nest.png",
  };

  const imageSrc =
    assetMap[normalizedKey] || "/assets/games/pioupiou/card-back.png";

  return (
    <button
      disabled={!isInteractable}
      onClick={() => onSelect?.(cardKey)}
      className={`relative aspect-[2/3] w-28 md:w-32 rounded-xl border transition-all duration-200 overflow-hidden bg-[#09090b]
        ${
          isSelected
            ? "border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
            : "border-white/10 hover:border-white/20"
        }
        ${!isInteractable && "opacity-50 grayscale cursor-not-allowed"}`}
    >
      {/* Background Gradient matching the software terminal aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-10" />

      <div className="relative h-full w-full p-2">
        <Image
          src={imageSrc}
          /* Localized alt text using cardKey as a translation key */
          alt={t[normalizedKey as keyof typeof t] || cardKey}
          fill
          className="object-contain p-2"
          sizes="128px"
          priority={isSelected}
        />
      </div>

      {/* Tiny Selection Indicator: Top-right teal dot for extra clarity */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-20">
          <span className="flex h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
        </div>
      )}
    </button>
  );
}
