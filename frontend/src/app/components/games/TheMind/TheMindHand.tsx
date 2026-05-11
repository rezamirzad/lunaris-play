"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog, Language } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import NeuralNode from "./NeuralNode";

export default function TheMindHand({
  room,
  player,
  initialLang,
}: {
  room: Doc<"rooms"> & { players: Doc<"players">[] };
  player: Doc<"players">;
  initialLang: Language;
}) {
  const { t } = useTranslation();
  const isFA = initialLang === "fa";

  const submitAction = useMutation(api.themind.handleAction);

  const board = room.gameBoard.gameType === "themind" ? room.gameBoard : null;
  const isLobby = room.status === "LOBBY";

  const playerHand = useMemo(() => {
    const rawHand = board?.hands[player._id] || [];
    return [...rawHand].sort((a, b) => a - b);
  }, [board?.hands, player._id]);

  const lowestCard = playerHand.length > 0 ? playerHand[0] : null;

  const handlePlayCard = async (card: number) => {
    if (card !== lowestCard || !board || board.phase !== "PLAYING") return;
    await submitAction({
      playerId: player._id,
      actionType: "PLAY_CARD",
      card,
    });
  };

  const handleToggleEMP = async (isDown: boolean) => {
    if (!board || board.phase !== "PLAYING" || board.emps <= 0) return;
    const isCurrentlyVoted = board.empVotes.includes(player._id);
    
    // We only want to fire the mutation if the state needs to change
    if (isDown !== isCurrentlyVoted) {
      await submitAction({
        playerId: player._id,
        actionType: "TOGGLE_EMP",
      });
    }
  };

  if (!board) return null;

  const amIVoting = board.empVotes.includes(player._id);
  const isTeammateRequesting = board.empVotes.length > 0 && !amIVoting;

  const isGameOver = board.phase === "GAME_OVER";
  const isVictory = board.phase === "VICTORY";
  const isFinished = isGameOver || isVictory;

  return (
    <div className={`flex flex-col h-full font-mono p-4 lg:p-8 ${isGameOver ? "animate-pulse" : ""}`}>
      {/* PHASE HEADER */}
      <div className="mb-8 text-center min-h-[80px] flex flex-col justify-center bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-500/5 scanline" />
        <AnimatePresence mode="wait">
          <motion.div
            key={board.phase}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="relative z-10 flex flex-col items-center"
          >
            {isFinished ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border mb-2 ${isGameOver ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-teal-500/10 border-teal-500/30 text-teal-500"}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isGameOver ? "bg-rose-500 animate-pulse" : "bg-teal-500"}`} />
                <span className="text-[7px] font-black tracking-[0.3em] uppercase">
                   {isGameOver ? "MISSION_FAILED" : "MISSION_SUCCESS"}
                </span>
              </motion.div>
            ) : (
              <h2 className={`font-black uppercase text-xl italic tracking-tighter ${board.phase === "PLAYING" ? "text-teal-400" : "text-rose-500"}`}>
                 {board.phase === "PLAYING" ? t.themind_playing : t.themind_game_over}
              </h2>
            )}
            
            <p className="text-[8px] text-zinc-500 uppercase tracking-[0.4em] font-black opacity-60">
               {formatLog(t.themind_level, { level: isFA ? toPersianDigits(board.level) : board.level }, initialLang)} // INTEGRITY: {board.lives}/5
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FREQUENCY NODES GRID */}
      <div className="flex-1 flex items-center justify-center gap-4 overflow-x-auto no-scrollbar pb-12 px-4" dir="ltr">
        <AnimatePresence>
          {playerHand.map((card) => (
            <NeuralNode
              key={card}
              val={card}
              isInteractable={card === lowestCard}
              disabled={card !== lowestCard || isFinished}
              onClick={() => handlePlayCard(card)}
              className={card === lowestCard && !isFinished ? "shadow-[0_0_30px_rgba(45,212,191,0.2)]" : "opacity-30"}
            />
          ))}
          {playerHand.length === 0 && board.phase === "PLAYING" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.6em]"
            >
              Uplink_Clear // Awaiting_Nodes
            </motion.div>
          )}
          {isFinished && playerHand.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.6em] text-center"
             >
               TERMINAL_LOCKED<br/>SESSION_COMPLETE
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACTION AREA */}
      <div className="mt-8 space-y-4">
        {isFinished ? (
           <motion.button
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             onClick={() => window.location.href = "/"}
             className="w-full py-8 bg-white text-black font-black text-xl tracking-[0.4em] uppercase rounded-[2.5rem] shadow-2xl hover:bg-teal-400 transition-all touch-manipulation select-none"
           >
             RETURN_TO_ARCADE
           </motion.button>
        ) : (
          <>
            <div className="flex justify-between items-end px-2">
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">EMP_OVERRIDE_CAPACITY</span>
               <span className="text-[10px] font-black text-blue-400 tabular-nums">{board.emps} Available</span>
            </div>
            
            <motion.button
              onPointerDown={() => handleToggleEMP(true)}
              onPointerUp={() => handleToggleEMP(false)}
              onPointerLeave={() => handleToggleEMP(false)}
              disabled={board.emps <= 0 || board.phase !== "PLAYING"}
              className={`w-full py-8 rounded-[2.5rem] relative overflow-hidden font-black uppercase transition-all shadow-2xl touch-manipulation select-none
                ${amIVoting ? "scale-[0.98] brightness-125" : "hover:scale-[1.01]"}
                ${board.emps > 0 
                  ? `bg-[linear-gradient(45deg,#facc15_25%,#000_25%,#000_50%,#facc15_50%,#facc15_75%,#000_75%,#000)] bg-[length:40px_40px] text-white shadow-yellow-500/20 ${isTeammateRequesting ? "animate-[pulse_0.5s_infinite] brightness-125 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.6)]" : ""}` 
                  : "bg-zinc-900 text-zinc-700 opacity-20 grayscale cursor-not-allowed"}
              `}
            >
              {/* Inner Glow */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              
              <div className="flex flex-col items-center relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                 {isTeammateRequesting && (
                   <span className="text-[10px] tracking-[0.2em] mb-1 opacity-80">TEAMMATE REQUESTS EMP</span>
                 )}
                 <span className="text-2xl tracking-[0.4em]">
                    {amIVoting ? "CHARGING..." : isTeammateRequesting ? "HOLD TO CONFIRM" : "INITIATE EMP"}
                 </span>
              </div>
              
              {/* Animated Stripes for charging state */}
              {amIVoting && (
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-white/10 skew-x-12"
                />
              )}
            </motion.button>

            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: `${(board.empVotes.length / room.players.length) * 100}%` }}
                 className="h-full bg-teal-500"
               />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
