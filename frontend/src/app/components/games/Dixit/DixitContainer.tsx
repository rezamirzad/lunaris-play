"use client";

import PlayerCard from "../../shared/PlayerCard";
import DixitPlayerStats from "./DixitPlayerStats";
import MatchActivity from "../../shared/MatchActivity";
import DixitLogMessage from "./MatchActivity";
import DixitCard from "./DixitCard";
import VotingReveal from "./VotingReveal";
import RoundResultsPanel from "./RoundResultsPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { BoardProps } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRank } from "@/lib/utils";

export default function DixitContainer({ roomData }: BoardProps) {
  const { t } = useTranslation();

  // Narrowing union: roomData.gameBoard
  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  const submittedCards = board?.submittedCards || [];
  const votes = board?.votes || [];

  const allScores = roomData.players.map((p) =>
    p.state.gameType === "dixit" ? p.state.score || 0 : 0,
  );
  const totalPlayers = roomData.players.length;

  return (
    <div className="game-container relative min-h-[calc(100vh-180px)] font-mono">
      {/* Background Neuro-Grid for the board view */}
      <div className="neuro-grid opacity-30" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10 p-4 lg:p-8">
        {/* PLAYER GRID AREA */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
                {t.dixit_participants}
              </h3>
            </motion.div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {roomData.players.map((player, index) => {
                  const storytellerId =
                    roomData.turnOrder[roomData.currentTurnIndex];
                  const isST = storytellerId === player._id;

                  const playerState =
                    player.state.gameType === "dixit" ? player.state : null;

                  const score = playerState?.score || 0;
                  const rank = calculateRank(score, allScores);

                  return (
                    <motion.div
                      key={player._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <PlayerCard
                        name={player.name}
                        isReady={player.isReady}
                        isCurrentTurn={isST}
                        statusOverride={isST ? t.storyteller : undefined}
                        className="glass-card p-4"
                      >
                        <DixitPlayerStats
                          state={playerState}
                          rank={rank}
                          totalPlayers={totalPlayers}
                          isST={isST}
                        />
                      </PlayerCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* 🖼️ CENTRAL TABLE: THE VISUAL MATRIX */}
        <div className="lg:col-span-8 space-y-4">
          <section className="min-h-[600px] flex flex-col">
            {/* CURRENT CLUE READOUT: GIANT GLOWING TEXT */}
            <AnimatePresence mode="wait">
              {board?.currentClue ? (
                <motion.div
                  key="clue"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="mb-12 p-10 bg-blue-500/5 border border-blue-500/20 rounded-[3rem] text-center backdrop-blur-3xl shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                >
                  <span className="text-[10px] tracking-[0.8em] text-blue-400 font-black mb-4 block uppercase opacity-50">
                    {t.dixit_clue_received}
                  </span>
                  <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-blue-400 uppercase [text-shadow:0_0_30px_rgba(59,130,246,0.8)] leading-tight">
                    {board.currentClue}
                  </h2>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-12 p-10 border border-zinc-800 rounded-[3rem] text-center bg-black/20"
                >
                  <p className="text-zinc-600 text-[11px] uppercase tracking-[0.5em] animate-pulse">
                    {t.dixit_awaiting_st}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUBMITTED CARDS GRID: THE VISUAL MATRIX REVEAL */}
            <VotingReveal roomData={roomData} />

            {/* ROUND SUMMARY: THE SCORING DASHBOARD */}
            <AnimatePresence>
              {board?.phase === "RESULTS" && (
                <RoundResultsPanel roomData={roomData} />
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* SYSTEM STATUS & LOGS */}
        <div className="lg:col-span-2 space-y-8">
          <motion.section
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl font-mono text-[10px]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-zinc-500 font-black uppercase tracking-[0.3em] text-blue-500/50">
                {t.game}
              </h3>
              <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">
                {t.statusLive}
              </span>
            </div>

            <div className="space-y-3 text-zinc-500 border-t border-white/5 pt-6">
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">{t.dixit_current_phase}:</span>
                <span className="text-white font-black uppercase tracking-tighter shadow-blue-500/20">
                  {board?.phase || "INIT"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">{t.dixit_integrity}:</span>
                <span className="text-teal-400/80 font-black tracking-tighter uppercase">
                  {t.activeTurn}
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
