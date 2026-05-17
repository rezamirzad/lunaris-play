"use client";

import PlayerController from "../../shared/PlayerController";
import { useTranslation } from "@/hooks/useTranslation";
import { PlayerProps, GAME_REGISTRY } from "../registry";
import TheMindHand from "./TheMindHand";
import TheMindLogMessage from "./MatchActivity";
import { motion } from "framer-motion";
import { toPersianDigits } from "@/lib/translations";

export default function TheMindPlayerView({
  player,
  roomData,
  isMyTurn,
}: PlayerProps) {
  const { lang, t } = useTranslation();
  const isFA = lang === "fa";
  
  const board = roomData.gameBoard.gameType === "themind" ? roomData.gameBoard : null;

  return (
    <div className="relative min-h-[calc(100vh-180px)] bg-zinc-950/50 rounded-[3rem] overflow-hidden flex flex-col font-mono">
      <div className="scanline opacity-20" />

      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isMyTurn}
        className="flex-grow"
        history={board?.history || []}
        renderLog={(log) => <TheMindLogMessage log={log} />}
        statsSlot={
          <div className="flex flex-col gap-6 w-full lg:w-80">
            {/* PLAYER HUD */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">
                {GAME_REGISTRY.themind.visuals.emoji}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${isMyTurn ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-pulse" : "bg-zinc-700"}`}
                />
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">
                  {isMyTurn ? t.ready : t.waiting}
                </span>
              </div>

              <div className="mt-4 text-3xl font-black text-white italic tracking-tighter uppercase truncate">
                {player.name}
              </div>

              <div className="mt-6 border-t border-white/5 pt-6 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 mb-1 font-black opacity-60">
                    {t.themind_lives}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-4 rounded-sm ${i < (board?.lives || 0) ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-zinc-800"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
                    LEVEL
                  </span>
                  <span className="text-xs font-black uppercase text-white tracking-widest">
                    {isFA ? toPersianDigits(board?.level || 1) : board?.level || 1}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        }
        actionsSlot={
          <div className="flex-grow overflow-hidden">
            <TheMindHand room={roomData} player={player} initialLang={lang} />
          </div>
        }
      />
    </div>
  );
}
