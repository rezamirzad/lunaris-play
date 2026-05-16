"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog } from "@/lib/translations";
import PlayerCard from "../../shared/PlayerCard";
import MatchActivity from "../../shared/MatchActivity";
import { BoardProps } from "../registry";
import NeuralNode from "./NeuralNode";
import TheMindLogMessage from "./MatchActivity";
import { useEffect, useState, useMemo, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

export default function TheMindBoard({ roomData }: BoardProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const board = roomData.gameBoard.gameType === "themind" ? roomData.gameBoard : null;
  const players = roomData.players;

  const startNextLevel = useMutation(api.themind.startNextLevelAction);

  const [lastTopCard, setLastTopCard] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  const latestEvent = useMemo(() => {
    return board?.history[board.history.length - 1];
  }, [board?.history]);

  const [mistakeToShow, setMistakeToShow] = useState<any>(null);
  const lastMistakeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (latestEvent?.key === "LOG_MISTAKE") {
      const mistakeId = `${board?.history.length}-${latestEvent.data.player}-${latestEvent.data.played}`;
      if (mistakeId !== lastMistakeIdRef.current) {
        lastMistakeIdRef.current = mistakeId;
        setMistakeToShow(latestEvent);
        // Extend timeout but it will be cleared by success
        const timer = setTimeout(() => setMistakeToShow(null), 10000);
        return () => clearTimeout(timer);
      }
    } else if (latestEvent?.key === "LOG_DISCARD") {
      setMistakeToShow(null);
    }
  }, [latestEvent, board?.history.length]);

  useEffect(() => {
    if (board?.topCard !== lastTopCard) {
      setLastTopCard(board?.topCard || null);
      if (board?.topCard) {
        setFlash(true);
        setTimeout(() => setFlash(false), 1000);
      }
    }
  }, [board?.topCard, lastTopCard]);

  const lastPlayedByPlayer = useMemo(() => {
    if (!board?.lastPlayedBy) return null;
    return players.find(p => p._id === board.lastPlayedBy);
  }, [board?.lastPlayedBy, players]);

  if (!board) return null;

  const syncProgress = (board.empVotes.length / players.length) * 100;
  const isEMPPending = board.empVotes.length > 0 && board.empVotes.length < players.length;

  const isGameOver = board.phase === "GAME_OVER";
  const isVictory = board.phase === "VICTORY";
  const isAwaitingNextLevel = board.phase === "AWAITING_NEXT_LEVEL";
  const isFinished = isGameOver || isVictory;

  return (
    <div className={`game-container relative min-h-[calc(100vh-180px)] font-mono ${board.lives < (board.history.length > 0 ? 3 : 10) ? "animate-shake" : ""}`}>
      <div className="neuro-grid opacity-20" />

      {/* AURA'S EMP HAZARD STATE OVERLAY */}
      <AnimatePresence>
        {isEMPPending && !isFinished && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-yellow-500/5 backdrop-blur-[1px] pointer-events-none transition-all duration-500"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 border-[16px] border-yellow-500/10 animate-[pulse_1s_infinite] pointer-events-none"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
               <motion.div
                 initial={{ scale: 0.8, opacity: 0, y: 50 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 1.2, opacity: 0 }}
                 className="bg-yellow-500 text-black font-black text-2xl tracking-[0.6em] uppercase skew-x-[-12deg] px-12 py-6 shadow-[0_0_50px_rgba(234,179,8,0.3)]"
               >
                 WARNING: EMP REQUESTED
               </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10 p-4 lg:p-8 h-full">
        {/* TEAM TELEMETRY DOCK */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-2 w-2 bg-teal-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
                TEAM_TELEMETRY_DOCK
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {players.map((player) => {
                const playerHand = board.hands[player._id] || [];
                const cardsLeft = playerHand.length;
                const isVoting = board.empVotes.includes(player._id);
                
                return (
                  <PlayerCard
                    key={player._id}
                    name={player.name}
                    isReady={player.isReady}
                    isCurrentTurn={false}
                    className={`glass-card p-4 transition-all duration-300 ${isVoting ? "border-yellow-500/40 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : ""}`}
                  >
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 mb-1 font-black opacity-60">
                            HAND_WEIGHT
                          </span>
                          <div className="flex gap-1.5">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-500 ${i < cardsLeft ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" : "bg-zinc-800"}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-teal-500 tabular-nums">
                            {isFA ? toPersianDigits(cardsLeft) : cardsLeft}
                          </span>
                        </div>
                      </div>

                      {isVoting && !isFinished && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                           <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
                           <span className="text-[7px] font-black text-yellow-500 uppercase tracking-widest">Awaiting Override...</span>
                        </motion.div>
                      )}
                    </div>
                  </PlayerCard>
                );
              })}
            </div>
          </section>
          
          {/* PURGED NODES FEED */}
          <section className="p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 font-mono">
            <h3 className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4">PURGED_NODES_FEED</h3>
            <div className="flex flex-wrap gap-2">
               {board.discardPile?.slice(-15).map((card, i) => (
                 <div key={i} className="text-[10px] font-black text-zinc-500 bg-black/40 border border-white/5 rounded px-2 py-1">
                    {card}
                 </div>
               ))}
               {!board.discardPile?.length && <span className="text-[8px] text-zinc-800 italic uppercase">No Purges Recorded</span>}
            </div>
          </section>
        </div>

        {/* MAIN UPLINK HUB */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-12 py-12">
          {/* TOP HUD */}
          <div className="w-full flex justify-between px-12 mb-12">
            {/* System Integrity */}
            <div className="flex flex-col gap-2">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                {t.themind_lives}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-8 rounded-sm ${i < board.lives ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" : "bg-zinc-900 border border-white/5"}`}
                  />
                ))}
              </div>
            </div>

            {/* EMP Overrides */}
            <div className="flex flex-col items-end gap-2">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                {t.themind_emps}
              </span>
              <div className="flex gap-2">
                {Array.from({ length: board.emps }).map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.2)]">
                     <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                  </div>
                ))}
                {board.emps === 0 && <span className="text-zinc-800 font-black italic uppercase">DEPLETED</span>}
              </div>
            </div>
          </div>

          {/* THE UPLINK CORE */}
          <div className="relative">
             {/* Outer Spinner */}
             <div className="w-[450px] h-[450px] rounded-full border-4 border-dashed border-teal-500/10 flex items-center justify-center animate-[spin_60s_linear_infinite]" />
             
             {/* Inner Static Ring */}
             <div className="absolute inset-0 m-auto w-[380px] h-[380px] rounded-full border border-teal-500/20" />

             {/* Transmission Core */}
             <div className="absolute inset-0 m-auto w-64 h-64 rounded-full bg-zinc-950 border border-teal-500/40 shadow-[0_0_80px_rgba(45,212,191,0.1)] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-teal-500/5 scanline" />
                
                <AnimatePresence mode="wait">
                  {mistakeToShow ? (
                    <motion.div
                      key="mistake"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      className="flex flex-col items-center p-4 text-center z-20"
                    >
                      <span className="text-[10px] text-rose-500 font-black tracking-[0.3em] mb-2 uppercase">Integrity_Compromised</span>
                      <span className="text-xs text-zinc-400 mb-1 uppercase font-bold">{mistakeToShow.data.player} Miscalculated</span>
                      <div className="flex gap-2 items-center justify-center flex-wrap">
                         <span className="text-2xl font-black text-rose-500">{mistakeToShow.data.played}</span>
                         <span className="text-[10px] text-zinc-600 font-black tracking-[0.4em]">PURGED:</span>
                         {mistakeToShow.data.discarded?.map((c: string) => (
                           <span key={c} className="text-lg font-black text-zinc-500">{c}</span>
                         ))}
                      </div>
                    </motion.div>
                  ) : board.topCard ? (
                    <motion.div
                      key={board.topCard}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <NeuralNode 
                        val={board.topCard} 
                        isInteractable={false}
                        className="scale-90"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-4"
                    >
                       <div className="text-3xl animate-pulse">⚡</div>
                       <span className="text-[8px] text-zinc-600 font-black tracking-[0.6em] uppercase">AWAITING_UPLINK</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Aura's Transmission Flash */}
                {flash && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    className="absolute inset-0 rounded-full bg-teal-400 shadow-[0_0_100px_rgba(45,212,191,1)]"
                  />
                )}

                {/* Central Result Badge (Added over the core when finished) */}
                {isFinished && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`absolute inset-0 m-auto z-30 flex items-center justify-center backdrop-blur-md rounded-full border-4 ${isGameOver ? "bg-rose-950/80 border-rose-500 text-rose-500" : "bg-teal-950/80 border-teal-500 text-teal-500"}`}
                  >
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-70">SESSION_STATUS</span>
                       <span className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap px-6 text-center">
                          {isGameOver ? "MISSION_FAILED" : "MISSION_SUCCESS"}
                       </span>
                    </div>
                  </motion.div>
                )}
             </div>
          </div>

          {/* Last Played By Tag (Hidden when finished) */}
          <AnimatePresence>
            {lastPlayedByPlayer && board.topCard && !isFinished && !isAwaitingNextLevel && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mt-8 px-6 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-teal-400/80">
                  UPLINK SECURED BY:
                </span>
                <span className="text-white font-black italic tracking-tighter uppercase">
                  {lastPlayedByPlayer.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* START NEXT LEVEL BUTTON */}
          <AnimatePresence>
            {isAwaitingNextLevel && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mt-12 flex flex-col items-center gap-6"
              >
                <div className="px-6 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-teal-400">
                    SECTOR_STABILIZED // READY_FOR_UPLINK
                  </span>
                </div>

                <button
                  onClick={() => startNextLevel({ roomId: roomData._id })}
                  className="group relative px-12 py-6 bg-teal-500 text-black font-black text-2xl tracking-[0.4em] uppercase rounded-full shadow-[0_0_50px_rgba(45,212,191,0.4)] hover:scale-105 active:scale-95 transition-all"
                >
                  START LEVEL {board.level + 1}
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SYNC BAR */}
          <div className="w-full max-w-md space-y-3 mt-12">
             <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em]">
                <span className="text-zinc-500">COLLECTIVE_SYNC_PROTOCOL</span>
                <span className="text-teal-400">{Math.round(syncProgress)}%</span>
             </div>
             <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${syncProgress}%` }}
                  className="h-full bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] rounded-full"
                />
             </div>
          </div>
        </div>

        {/* SYSTEM LOGS */}
        <div className="lg:col-span-2 space-y-8">
           <section className="glass-card p-6 border-zinc-800">
             <div className="flex flex-col gap-1 mb-6">
                <span className="text-[8px] font-black text-teal-500 uppercase tracking-[0.3em]">MISSION_PHASE</span>
                <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase">
                   {formatLog(t.themind_level, { level: isFA ? toPersianDigits(board.level) : board.level }, lang)}
                </h2>
             </div>

             <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">STATUS:</span>
                   <span className={`text-[9px] font-black uppercase tracking-tighter ${isFinished ? "text-rose-500" : "text-teal-400"}`}>
                      {isGameOver ? t.themind_game_over : isVictory ? t.themind_victory : t.themind_playing}
                   </span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">ENCRYPTION:</span>
                   <span className="text-[9px] text-zinc-300 font-black">MIL_GRADE</span>
                </div>
             </div>
           </section>

           <MatchActivity 
             history={board.history}
             renderLog={(log) => <TheMindLogMessage log={log} />}
           />
        </div>
      </div>

      {/* RE-ENTRY CTA (Optionally show buttons to return or review if they come back later) */}
      {isFinished && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
           <button
             onClick={() => (window.location.href = "/")}
             className="px-12 py-4 bg-white text-black font-black uppercase rounded-2xl hover:bg-teal-400 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20"
           >
             RETURN_TO_ROOT
           </button>
        </div>
      )}
    </div>
  );
}
