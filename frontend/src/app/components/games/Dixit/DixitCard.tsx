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
      whileHover={
        selectable && !disabled
          ? {
              scale: 1.05,
              rotate: -1,
              boxShadow: "0 0 30px rgba(59,130,246,0.3)",
            }
          : {}
      }
      whileTap={selectable && !disabled ? { scale: 0.95 } : {}}
      onPointerDown={(e) => {
        if (selectable && !disabled && e.pointerType === 'touch') onClick?.();
      }}
      onClick={(e) => {
        if (selectable && !disabled && (e as any).pointerType !== 'touch') onClick?.();
      }}
      className={`
        relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden transition-all duration-700 border-2
        ${selected ? "border-blue-500 ring-4 ring-blue-500/20 z-10 shadow-[0_0_40px_rgba(59,130,246,0.4)]" : "border-white/5 shadow-2xl"}
        ${isStorytellerCard ? "border-blue-400 ring-4 ring-blue-400/40 z-10 shadow-[0_0_50px_rgba(59,130,246,0.6)]" : ""}
        ${disabled && !isLobby ? "opacity-30 grayscale cursor-not-allowed scale-95" : "cursor-pointer"}
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
                  className="bg-zinc-950/80 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white/10 self-start shadow-xl"
                >
                  <span className="text-[7px] font-black uppercase text-zinc-500 tracking-[0.3em] block mb-1">{t.dixit_node_owner}</span>
                  <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.1em] leading-none">
                    {ownerName}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🗳️ VOTER TOKENS */}
          <div className="flex flex-col items-end gap-1.5">
            {voters.length > 0 && (
              <span className="text-[7px] font-black uppercase text-zinc-500 tracking-[0.3em] bg-black/40 px-2 py-0.5 rounded-full mb-1">{formatLog(t.dixit_received_guesses, { count: voters.length }, lang)}</span>
            )}
            <div className="flex flex-col gap-1.5 items-end max-h-[60%] overflow-hidden">
              <AnimatePresence>
                {voters.map((voter, i) => (
                  <motion.div
                    key={voter._id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                    className="bg-white/95 text-black px-3 py-1 rounded-lg border-l-4 border-blue-500 shadow-lg flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-tight truncate max-w-[80px]">
                      {voter.name}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
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
