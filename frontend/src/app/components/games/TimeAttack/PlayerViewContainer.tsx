"use client";

import React, { useState, useEffect } from "react";
import { PlayerProps } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import { useTimeAttack } from "@/hooks/useTimeAttack";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import PlayerController from "../../shared/PlayerController";
import { ROUNDS_CONFIG } from "convex/timeattackPlugin";

export default function PlayerViewContainer({ player, roomData }: PlayerProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const { gameBoard, handleAction } = useTimeAttack(roomData, player);
  const [localStarted, setLocalStarted] = useState(false);

  const playerSub = gameBoard.submissions[player._id.toString()];
  const hasStarted = (!!playerSub?.personalStartTime || localStarted) && gameBoard.phase === "ACTIVE_PLAY";
  const hasFinished = (playerSub?.inputs?.length ?? 0) > 0;

  useEffect(() => {
    if (gameBoard.phase === "ROUND_INTRO") {
      setLocalStarted(false);
    }
  }, [gameBoard.phase]);

  if (gameBoard.gameType !== "timeattack") return null;

  const isActive = gameBoard.phase === "ACTIVE_PLAY";
  const isFinal = gameBoard.phase === "FINAL_LEADERBOARD" || roomData.status === "FINISHED";

  const onInteraction = (type: "TAP" | "PRESS" | "RELEASE") => {
    if (!isActive) return;
    if (gameBoard.interaction === "TAP" && type === "TAP") {
      if (!hasStarted) setLocalStarted(true);
    } else if (gameBoard.interaction === "PRESS_RELEASE") {
      if (type === "PRESS") setLocalStarted(true);
    }
    handleAction(type);
  };

  const currentRoundConfig = ROUNDS_CONFIG[gameBoard.currentRound];

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-between p-6 bg-zinc-950 overflow-hidden text-white font-mono">
      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isActive && !hasFinished}
        gameType="timeattack"
        statsSlot={
          <div className="w-full flex justify-between items-start pt-4 px-2">
             <div className="flex flex-col">
               <span className={`text-zinc-500 font-mono text-[10px] uppercase ${isFA ? "tracking-normal" : "tracking-widest"}`}>
                 {t.player}
               </span>
               <span className="text-white font-black italic uppercase tracking-tighter text-xl truncate max-w-[150px]">
                 {player.name}
               </span>
             </div>
             {!isFinal && (
               <div className="flex flex-col items-end">
                  <span className={`text-rose-500 font-mono text-[10px] uppercase ${isFA ? "tracking-normal" : "tracking-[0.4em]"}`}>
                   {t.timeattack_target}
                 </span>
                 <span className="text-white font-black italic text-xl">
                    {isFA ? toPersianDigits((gameBoard.targetMs / 1000).toFixed(2)) : (gameBoard.targetMs / 1000).toFixed(2)}s
                 </span>
               </div>
             )}
          </div>
        }
        actionsSlot={
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-6">
            <AnimatePresence mode="wait">
              {isActive ? (
                <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                  {/* ROUND DESCRIPTION */}
                  <div className="text-center px-4">
                     <h3 className="text-rose-500 text-[8px] font-black uppercase tracking-[0.5em] mb-2">
                        {t[currentRoundConfig?.nameKey as keyof typeof t] || currentRoundConfig?.nameKey}
                     </h3>
                     <p className="text-zinc-500 text-[10px] leading-relaxed line-clamp-3">
                        {t[currentRoundConfig?.descKey as keyof typeof t] || currentRoundConfig?.descKey}
                     </p>
                  </div>

                  {/* STATUS DISPLAY */}
                  <div className="text-center h-16 flex items-center justify-center">
                    {hasFinished ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <span className="text-teal-500 font-black italic uppercase text-2xl tracking-widest">{t.timeattack_locked}</span>
                        <span className="text-zinc-500 font-mono text-[8px] mt-1 uppercase tracking-[0.2em]">{t.timeattack_waiting_reveal}</span>
                      </motion.div>
                    ) : hasStarted && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                          <span className="text-rose-500/50 text-[10px] font-black uppercase tracking-[0.4em] mb-1">{t.timeattack_recording}</span>
                          <div className="flex gap-1">
                             {[...Array(3)].map((_, i) => (
                                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                             ))}
                          </div>
                       </motion.div>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95, boxShadow: "0 0 80px rgba(244,63,94,0.3)" }}
                    onPointerDown={() => onInteraction(gameBoard.interaction === "PRESS_RELEASE" ? "PRESS" : "TAP")}
                    onPointerUp={() => gameBoard.interaction === "PRESS_RELEASE" && onInteraction("RELEASE")}
                    disabled={hasFinished}
                    className={`w-full aspect-square rounded-[3rem] border-4 flex flex-col items-center justify-center gap-2 transition-all duration-500 ${hasFinished ? "bg-zinc-950 border-zinc-800" : hasStarted ? "bg-rose-500/10 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.2)]" : "bg-zinc-900 border-zinc-700 hover:border-zinc-500"}`}
                  >
                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${hasFinished ? "bg-zinc-900 border-zinc-800" : hasStarted ? "bg-rose-500 border-rose-400 rotate-45" : "bg-zinc-800 border-zinc-600"}`}>
                      <span className={`font-black italic text-2xl transition-all ${hasFinished ? "text-zinc-700" : hasStarted ? "text-white -rotate-45" : "text-zinc-400"}`}>
                        {hasFinished ? "✓" : gameBoard.interaction === "PRESS_RELEASE" ? (hasStarted ? t.timeattack_release : t.timeattack_hold) : (hasStarted ? t.timeattack_done : t.timeattack_start)}
                      </span>
                    </div>
                    <span className={`text-zinc-500 font-mono text-[10px] uppercase mt-6 text-center px-8 ${hasStarted && !hasFinished ? "text-rose-500 font-black animate-pulse" : ""}`}>
                      {!hasStarted ? (gameBoard.interaction === "PRESS_RELEASE" ? t.timeattack_hold_to_start : t.timeattack_tap_to_start) : !hasFinished ? (gameBoard.interaction === "PRESS_RELEASE" ? t.timeattack_release_at_target : t.timeattack_tap_to_stop) : t.timeattack_time_recorded}
                    </span>
                  </motion.button>
                </div>
              ) : isFinal ? (
                <motion.div key="final" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                   <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center border-2 border-teal-500/20">🏆</div>
                   <h3 className="text-white font-black italic uppercase text-2xl">{t.timeattack_final_results}</h3>
                   <button onClick={() => (window.location.href = "/")} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase tracking-widest">{t.exit}</button>
                </motion.div>
              ) : (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                   <span className="text-6xl animate-pulse">🛰️</span>
                   <p className="text-zinc-500 uppercase tracking-widest text-[8px]">{t.waiting_for_protocol}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      {/* FOOTER: ROUND INFO */}
      <div className="w-full bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <span className="text-zinc-500 font-mono text-[10px] uppercase">{t.timeattack_round}</span>
          <span className="text-teal-400 font-black italic text-2xl">{isFA ? toPersianDigits(gameBoard.currentRound) : gameBoard.currentRound}/10</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-zinc-500 font-mono text-[10px] uppercase">{t.shared_score}</span>
          <span className="text-white font-black italic text-2xl">{isFA ? toPersianDigits(player.state.gameType === "timeattack" ? player.state.score : 0) : (player.state.gameType === "timeattack" ? player.state.score : 0)}</span>
        </div>
      </div>
    </div>
  );
}
