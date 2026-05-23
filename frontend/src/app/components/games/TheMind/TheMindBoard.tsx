"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { BoardProps } from "../registry";
import PlayerCard from "../../shared/PlayerCard";
import MatchActivity from "../../shared/MatchActivity";
import NeuralNode from "./NeuralNode";
import TheMindLogMessage from "./MatchActivity";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { toPersianDigits, formatLog } from "@/lib/translations";
import { useMemo, useState, useEffect, useRef } from "react";
import MissionBriefing from "../../arcade/MissionBriefing";
import ArcadeVictoryOverlay from "../../arcade/ArcadeVictoryOverlay";

export default function TheMindBoard({ roomData }: BoardProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const board = roomData.gameBoard.gameType === "themind" ? roomData.gameBoard : null;
  const players = roomData.players;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  const startNextLevel = useMutation(api.themind.startNextLevelAction);
  const [flash, setFlash] = useState(false);
  const [lastTopCard, setLastTopCard] = useState<number | null>(null);

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
        const timer = setTimeout(() => setMistakeToShow(null), 8000);
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

  // 1. LOBBY MISSION BRIEFING
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.themind_title}
        subtitle={t.themind_calibrating}
        briefingTitle={t.themind_briefing_title}
        briefingDesc={t.themind_briefing_desc}
        loadingText={t.themind_syncing}
        accentColor="teal"
        background={<div className="neuro-grid opacity-20" />}
      />
    );
  }

  if (!board) return null;

  const isGameOver = board.phase === "GAME_OVER";
  const isVictory = board.phase === "VICTORY";
  const isAwaitingNextLevel = board.phase === "AWAITING_NEXT_LEVEL";
  const isFinished = isGameOver || isVictory;
  const isEMPPending = board.empVotes.length > 0 && board.empVotes.length < players.length;

  return (
    <SharedArcadeLayout
      containerClassName={`bg-[#020808] text-teal-100 font-mono ${board.lives < 3 ? "animate-shake" : ""}`}
      background={<div className="neuro-grid opacity-20" />}
      header={
        <header className="flex justify-between items-center bg-teal-950/20 px-8 py-4 rounded-3xl border border-teal-500/10 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-teal-400 tracking-tighter uppercase italic leading-none">
                {t.themind_title}
              </h1>
              <span className="text-[8px] font-bold text-teal-600 uppercase tracking-widest mt-1 italic">
                {t.themind_link_integrity}: {isGameOver ? t.themind_terminated : t.themind_stable}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">{t.themind_transmission_lives}</span>
                <div className="flex gap-1.5">
                   {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-2 h-5 rounded-sm ${i < board.lives ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "bg-zinc-800 border border-white/5"}`} />
                   ))}
                </div>
             </div>
             
             <div className="h-10 w-[1px] bg-white/5" />

             <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">{t.themind_emps}</span>
                <div className="flex gap-1.5">
                   {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${i < board.emps ? "bg-blue-500/10 border-blue-400/40 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]" : "bg-zinc-900/50 border-white/5 text-zinc-700"}`}>
                         <span className="text-xs">✦</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </header>
      }
      main={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
           {/* LEFT: TACTICAL FEED */}
           <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
             <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-6 overflow-hidden flex flex-col shadow-2xl relative">
                <h3 className="text-[8px] font-black text-teal-500/60 uppercase tracking-[0.4em] mb-4 shrink-0">
                   {t.themind_discard_pile}
                </h3>
                <div className="flex-1 min-h-0">
                   <MatchActivity 
                     history={board.history}
                     renderLog={(log) => <TheMindLogMessage log={log} />}
                   />
                </div>
             </div>
           </div>

           {/* CENTER: THE UPLINK CORE */}
           <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-teal-500/5 rounded-[3rem] border border-teal-500/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2dd4bf_0%,_transparent_70%)] opacity-[0.03]" />
              
              {/* Spinning Rings */}
              <div className="relative">
                 <div className="w-[500px] h-[500px] rounded-full border-4 border-dashed border-teal-500/10 flex items-center justify-center animate-[spin_60s_linear_infinite]" />
                 <div className="absolute inset-0 m-auto w-[420px] h-[420px] rounded-full border border-teal-500/20" />
                 
                 <div className="absolute inset-0 m-auto w-72 h-72 rounded-full bg-black border border-teal-500/40 shadow-[0_0_100px_rgba(45,212,191,0.15)] flex flex-col items-center justify-center overflow-hidden z-20">
                    <div className="absolute inset-0 bg-teal-500/5 scanline" />
                    
                    <AnimatePresence mode="wait">
                       {mistakeToShow ? (
                         <motion.div key="mistake" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="flex flex-col items-center p-8 text-center z-30">
                            <span className="text-[10px] text-rose-500 font-black tracking-[0.4em] mb-4 uppercase">{t.themind_miscalculated}</span>
                            <span className="text-xl text-zinc-300 mb-2 uppercase font-black">{mistakeToShow.data?.player}</span>
                            <span className="text-8xl font-black text-rose-500 [text-shadow:0_0_30px_rgba(244,63,94,0.5)]">{mistakeToShow.data?.played}</span>
                         </motion.div>
                       ) : board.topCard ? (
                         <motion.div key={board.topCard} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="flex flex-col items-center">
                            <NeuralNode val={board.topCard} isInteractable={false} className="scale-110 shadow-[0_0_50px_rgba(45,212,191,0.2)]" />
                         </motion.div>
                       ) : (
                         <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                            <div className="text-6xl animate-pulse text-teal-500/60">⚡</div>
                            <span className="text-[8px] text-teal-500/40 font-black tracking-[0.8em] uppercase italic text-center px-6">
                               {t.themind_establishing_freq}
                            </span>
                         </motion.div>
                       )}
                    </AnimatePresence>

                    {/* Central Result Badge */}
                    {isFinished && (
                      <ArcadeVictoryOverlay
                        winnerName={board.winner}
                        championLabel={isGameOver ? t.themind_terminal_locked : t.themind_victory}
                        accentColor={isGameOver ? "rose" : "teal"}
                        icon={isVictory ? "🏆" : "🏁"}
                      />
                    )}
                 </div>
              </div>

              {/* Awaiting Next Level Overlay */}
              <AnimatePresence>
                 {isAwaitingNextLevel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                       <div className="bg-[#051111] p-12 rounded-[4rem] border-2 border-teal-500/30 shadow-2xl flex flex-col items-center text-center max-w-xl">
                          <span className="text-teal-400 font-black tracking-[0.5em] uppercase text-[10px] mb-8 italic">{t.themind_frequency_refined}</span>
                          <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-12 leading-none">
                             {formatLog(t.themind_level_cleared, { level: isFA ? toPersianDigits(board.level) : board.level }, lang)}
                          </h2>
                          <button onClick={() => startNextLevel({ roomId: roomData._id })} className="group relative px-16 py-8 bg-teal-500 text-black font-black text-2xl tracking-[0.4em] uppercase rounded-full shadow-[0_0_60px_rgba(45,212,191,0.5)] hover:scale-105 active:scale-95 transition-all">
                             {t.themind_sync_next}
                          </button>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>

              {/* EMP Request Signal */}
              {isEMPPending && !isFinished && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-12 bg-yellow-500 text-black font-black text-xs tracking-[0.6em] uppercase skew-x-[-12deg] px-12 py-5 shadow-2xl z-40 border-r-8 border-black/20">
                   {t.themind_uplink_request_sent}
                </motion.div>
              )}
           </div>

           {/* RIGHT: SYSTEM STATUS */}
           <div className="lg:col-span-3 flex flex-col h-full gap-6">
              <section className="bg-black/40 rounded-[2rem] border border-white/5 p-8 flex flex-col justify-center gap-6">
                 <div className="flex flex-col gap-1 border-b border-white/5 pb-4 mb-2">
                    <span className="text-[8px] font-black text-teal-500/60 uppercase tracking-[0.4em]">{t.themind_level_progress}</span>
                    <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">
                       {formatLog(t.themind_level, { level: isFA ? toPersianDigits(board.level) : board.level }, lang)}
                    </h2>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.shared_status}:</span>
                       <span className="text-[10px] font-black uppercase tracking-tighter text-teal-400">{isFinished ? t.statusArchived : t.statusLive}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.themind_uplink_active}:</span>
                       <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400">SYNC-v{board.level}.0</span>
                    </div>
                 </div>
              </section>
           </div>
        </div>
      }
      footer={
        <div className="bg-gradient-to-b from-[#051111] to-black rounded-[2.5rem] border-4 border-teal-900/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-6 relative">
          <div className="flex justify-center items-center h-full relative z-10">
            <div className="flex gap-6 overflow-x-auto custom-scrollbar-h pb-2 w-full max-w-7xl justify-center px-10">
              {players.map((player) => {
                const playerHand = board?.hands?.[player._id] || [];
                const cardsLeft = playerHand.length;
                const isVoting = board?.empVotes?.includes(player._id) || false;

                return (
                  <motion.div
                    key={player._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`min-w-[240px] rounded-[2rem] p-5 border-2 transition-all duration-500 relative group ${isVoting ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)] scale-105 z-20' : (cardsLeft === 0 ? 'bg-teal-900/10 border-teal-500/20' : 'bg-black/50 border-white/5 opacity-80')}`}
                  >
                    {cardsLeft === 0 && !isFinished && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/10 to-transparent animate-shimmer rounded-[2rem] overflow-hidden pointer-events-none" />
                    )}

                    <PlayerCard
                      name={player.name}
                      isReady={player.isReady}
                      isCurrentTurn={false}
                      className="bg-transparent border-none p-0 shadow-none relative z-10"
                    >
                       <div className="flex flex-col gap-4 mt-2">
                          <div className="flex justify-between items-center">
                             <div className="flex gap-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${i < cardsLeft ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" : "bg-zinc-800"}`} />
                                ))}
                             </div>
                             <span className="text-2xl font-black text-teal-400 tabular-nums">
                                {isFA ? toPersianDigits(cardsLeft) : cardsLeft}
                             </span>
                          </div>
                          
                          {isVoting && !isFinished && (
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                               <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">{t.themind_shuriken_vote}</span>
                            </div>
                          )}
                       </div>
                    </PlayerCard>

                    {/* Status Indicator Badge */}
                    <div className="absolute -top-3 -right-3 z-30 flex flex-col items-end gap-1.5">
                       {cardsLeft === 0 && !isFinished ? (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm text-black shadow-xl ring-2 ring-[#020808] font-black">✓</motion.div>
                       ) : isVoting ? (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-sm text-black shadow-xl ring-2 ring-[#020808] font-black animate-pulse">✦</motion.div>
                       ) : (
                           <div className={`w-4 h-4 rounded-full border-2 border-[#020808] ${player.isReady ? 'bg-teal-500 animate-pulse' : 'bg-slate-700'}`} />
                       )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      }
    />
  );
}
