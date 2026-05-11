"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { GAME_REGISTRY } from "../registry";

interface PiouPiouCardProps {
  cardKey: string;
  isInteractable: boolean;
  onSelect?: (cardKey: string) => void;
  isSelected?: boolean;
}

/**
 * PiouPiouCard: Cinematic Haptic Card.
 */
export default function PiouPiouCard({
  cardKey,
  isInteractable,
  onSelect,
  isSelected,
}: PiouPiouCardProps) {
  const { t } = useTranslation();
  const normalizedKey = cardKey.toLowerCase();
  const visuals = GAME_REGISTRY.pioupiou.visuals;
  const imageSrc =
    visuals.assets?.cards[normalizedKey] || visuals.assets?.cards.back;

  return (
    <motion.button
      whileHover={isInteractable ? { 
        scale: 1.05, 
        rotate: 1,
        boxShadow: "0 0 30px rgba(45,212,191,0.2)" 
      } : {}}
      whileTap={isInteractable ? { scale: 0.95 } : {}}
      disabled={!isInteractable}
      onClick={() => onSelect?.(cardKey)}
      className={`relative aspect-[2/3] w-28 md:w-36 rounded-[2rem] border transition-all duration-500 overflow-hidden bg-zinc-900 shadow-2xl
        ${
          isSelected
            ? "border-teal-400 ring-4 ring-teal-400/20 z-10 shadow-[0_0_40px_rgba(45,212,191,0.4)] scale-105"
            : "border-white/10"
        }
        ${!isInteractable && "opacity-20 grayscale cursor-not-allowed scale-95"}`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5 z-10 pointer-events-none" />

      {/* Safari Fix: Use absolute inset-0 to force bounds propagation */}
      <div className="absolute inset-0 p-3 z-20">
        <div className="relative h-full w-full">
          <Image
            src={imageSrc}
            alt={t[normalizedKey as keyof typeof t] || cardKey}
            fill
            className={`object-contain p-4 transition-transform duration-1000 ${isSelected ? "scale-110" : "scale-100"}`}
            sizes="150px"
            priority={isSelected}
          />
        </div>
      </div>

      {/* Internal atmosphere glow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 z-30"
        >
          <span className="flex h-3 w-3 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
        </motion.div>
      )}
    </motion.button>
  );
}
