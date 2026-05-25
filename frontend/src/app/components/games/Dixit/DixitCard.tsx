"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import { GAME_REGISTRY } from "../registry";
import Image from "next/image";
import { formatLog } from "@/lib/translations";

interface DixitCardProps {
  cardId: string;
  isRevealed?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  voters?: Doc<"players">[];
  ownerName?: string;
  isOwnerBot?: boolean;
  isStorytellerCard?: boolean;
  isLobby?: boolean;
}

export default function DixitCard({
  cardId,
  isRevealed = false,
  selectable = false,
  selected = false,
  disabled = false,
  onClick,
  voters = [],
  ownerName,
  isOwnerBot = false,
  isStorytellerCard = false,
  isLobby = false,
}: DixitCardProps) {
  const { t, lang } = useTranslation();
  const isBack = cardId === "BACK" || !isRevealed;
  const visuals = GAME_REGISTRY.dixit.visuals;

  const imageSrc = isBack
    ? visuals.assets?.cardBack
    : `${visuals.assets?.cardsPath}${cardId}.png`;

  return (
    <motion.div
      layoutId={isRevealed ? `card-${cardId}` : undefined}
      whileHover={
        selectable && !disabled
          ? {
              scale: 1.02,
              rotate: -0.5,
              boxShadow: "0 0 40px rgba(255,255,255,0.1)",
            }
          : {}
      }
      whileTap={selectable && !disabled ? { scale: 0.98 } : {}}
      onTap={() => {
        if (selectable && !disabled) onClick?.();
      }}
      className={`
        relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden transition-all duration-700 border-2
        ${selected ? "border-blue-500 ring-4 ring-blue-500/20 z-10 shadow-[0_0_40px_rgba(59,130,246,0.4)]" : "border-white/5 shadow-2xl"}
        ${isStorytellerCard ? "border-blue-400 ring-4 ring-blue-400/40 z-10 shadow-[0_0_50px_rgba(59,130,246,0.6)]" : ""}
        ${disabled && !isLobby ? "opacity-30 grayscale cursor-not-allowed scale-95" : "cursor-pointer"}
        ${selectable && !disabled ? "hover:ring-2 hover:ring-white/30" : ""}
        ${isLobby ? "opacity-100 grayscale-0 cursor-default" : ""}
        bg-zinc-900
      `}
    >
      {/* 🎭 CARD SURFACE MASK */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 z-10 pointer-events-none" />

      {/* 🖼️ CORE IMAGE */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageSrc}
          alt={isBack ? "CARD_HIDDEN" : cardId}
          fill
          className={`object-cover pointer-events-none transition-transform duration-1000 ${selected || isStorytellerCard ? "scale-110" : "scale-100"}`}
          draggable={false}
          sizes="(max-width: 768px) 33vw, 20vw"
        />
      </div>

      {/* 📝 METADATA OVERLAY (RESULTS PHASE) */}
      {isRevealed && cardId !== "BACK" && (
        <div className="relative z-20 h-full flex flex-col justify-between p-4 bg-black/20">
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {ownerName && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-zinc-950/80 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 self-start shadow-xl flex items-center gap-1.5"
                >
                  <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest leading-none font-mono">
                    {ownerName}
                  </p>
                  {isOwnerBot && (
                    <img
                      src="/assets/general/artificial-intelligence-design-png.webp"
                      alt="AI"
                      className="w-2.5 h-2.5 opacity-80"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🗳️ VOTER TOKENS (Docked Tray) */}
          <div className="flex flex-wrap justify-center gap-1 w-full absolute bottom-0 left-0 pb-2.5 px-2 z-30">
            <AnimatePresence>
              {voters.map((voter, i) => (
                <motion.div
                  key={voter._id}
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, type: "spring" }}
                  className="bg-gray-900/90 text-white px-2 py-1 rounded border-l-2 border-blue-500 shadow-xl flex items-center gap-1.5 backdrop-blur-sm"
                  title={voter.name}
                >
                  <span className="text-[10px] font-black uppercase tracking-wide font-mono truncate max-w-[65px]">
                    {voter.name}
                  </span>
                  {voter.isBot && (
                    <img
                      src="/assets/general/artificial-intelligence-design-png.webp"
                      alt="AI"
                      className="w-2.5 h-2.5 inline-block opacity-80"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 🌪️ INTERNAL ATMOSPHERE */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.7)]" />

      {/* 🔋 STORYTELLER PULSE */}
      {isStorytellerCard && (
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-400 pointer-events-none z-0"
        />
      )}
    </motion.div>
  );
}
