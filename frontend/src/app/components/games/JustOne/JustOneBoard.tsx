"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog } from "@/lib/translations";
import PlayerCard from "../../shared/PlayerCard";
import MatchActivity from "../../shared/MatchActivity";
import { BoardProps } from "../registry";
import JustOneLogMessage from "./JustOneMatchActivity";

export default function JustOneBoard({ roomData }: BoardProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const board =
    roomData.gameBoard.gameType === "justone" ? roomData.gameBoard : null;
  const players = roomData.players;

  if (!board) return null;

  const activePlayer = players.find((p) => p._id === board.activePlayerId);
  const isGuessing = board.phase === "GUESSING";
  const isLenient = board.phase === "LENIENT_VALIDATION";
  const isRoundResults = board.phase === "ROUND_RESULTS";
  const isGameOver = board.phase === "GAME_OVER";

  // Display word in mission language for the TV
  const mysteryWordObj = board.mysteryWord as Record<string, string>;
  const missionMysteryWord =
    mysteryWordObj[board.language] || mysteryWordObj["en"];

  // Filter valid clues
  const validClues = Object.entries(board.clues || {})
    .filter(
      ([pId]) => !board.canceledClues.includes(pId as Doc<"players">["_id"]),
    )
    .map(([, clue]) => clue);

  return (
    <div className="game-container relative min-h-[calc(100vh-180px)] font-mono">
      <div className="neuro-grid opacity-20" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10 p-4 lg:p-8 h-full">
        {/* PLAYER SIDEBAR */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-2 w-2 bg-teal-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
                {t.shared_players}
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {players.map((player) => {
                const isInfiltrator = player._id === board.activePlayerId;
                const hasSubmitted = !!board.clues?.[player._id];
                const hasConfirmed = board.confirmedPlayers?.includes(
                  player._id,
                );
                const lenientVotesObj = (board.lenientVotes || {}) as Record<
                  string,
                  boolean
                >;
                const lenientVote = lenientVotesObj[player._id];

                return (
                  <PlayerCard
                    key={player._id}
                    name={player.name}
                    isReady={player.isReady}
                    isCurrentTurn={isInfiltrator}
                    statusOverride={isInfiltrator ? t.justone_guesser : undefined}
                    className={`glass-card p-4 transition-all duration-300 ${isInfiltrator ? "border-orange-500/40 bg-orange-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : ""}`}
                  >
                    {!isInfiltrator && (
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${hasSubmitted ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" : "bg-zinc-800"}`}
                          />
                          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">
                            {hasSubmitted
                              ? t.justone_clue_submitted
                              : t.justone_awaiting_clues}
                          </span>
                        </div>
                        {board.phase === "VALIDATION" && hasConfirmed && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded px-1.5 py-0.5"
                          >
                            <div className="w-1 h-1 rounded-full bg-teal-400 animate-pulse" />
                            <span className="text-[6px] font-black text-teal-400 uppercase tracking-widest">
                              {t.justone_validated}
                            </span>
                          </motion.div>
                        )}
                        {isLenient && lenientVote !== undefined && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex items-center gap-2 border rounded px-1.5 py-0.5 ${lenientVote ? "bg-teal-500/10 border-teal-500/30 text-teal-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"}`}
                          >
                            <div
                              className={`w-1 h-1 rounded-full ${lenientVote ? "bg-teal-400" : "bg-rose-400"} animate-pulse`}
                            />
                            <span className="text-[6px] font-black uppercase tracking-widest">
                              {lenientVote ? t.justone_accepted : t.justone_rejected}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </PlayerCard>
                );
              })}
            </div>
          </section>
        </div>

        {/* CENTRAL AREA */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-12 py-12">
          {/* TOP HUD */}
          <div className="w-full flex justify-between px-12 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                {t.shared_score}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-teal-500 italic tracking-tighter drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                  {isFA ? toPersianDigits(board.score) : board.score}
                </span>
                <span className="text-xs text-zinc-600 font-bold">/ 13</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                {t.justone_round_count}
              </span>
              <span className="text-2xl font-black text-white tabular-nums tracking-tighter uppercase italic">
                {isFA ? toPersianDigits(board.round) : board.round} / 13
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLenient ? (
              <motion.div
                key="lenient-board"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center gap-12 text-center"
              >
                <div className="space-y-4">
                  <span className="text-xs font-black text-orange-500 tracking-[0.4em] uppercase">
                    VERIFY THE RESPONSE
                  </span>
                  <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase">
                    &quot;{board.lastGuess}&quot;
                  </h2>
                </div>

                <div className="h-px w-24 bg-zinc-800" />

                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-zinc-500 tracking-[0.3em] uppercase">
                    The actual word was
                  </span>
                  <div className="text-4xl font-black text-teal-400 uppercase tracking-widest">
                    {missionMysteryWord}
                  </div>
                </div>

                <div className="px-8 py-3 bg-white/5 border border-white/10 rounded-full animate-pulse">
                  <span className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase">
                    Waiting for confirmation
                  </span>
                </div>
              </motion.div>
            ) : !isGuessing ? (
              <motion.div
                key="mystery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-8"
              >
                <span className="text-[10px] text-zinc-500 font-black tracking-[0.8em] uppercase">
                  {t.justone_mystery_word}
                </span>

                {/* Aura's Masked Letter Blocks */}
                <div className="flex gap-4">
                  {missionMysteryWord
                    .split("")
                    .map((char: string, i: number) => (
                      <div
                        key={i}
                        className="w-12 h-16 border-b-4 border-zinc-800 flex items-center justify-center font-black text-4xl text-white"
                      >
                        <motion.span
                          animate={
                            isRoundResults
                              ? { opacity: 1 }
                              : { opacity: [0.2, 0.4, 0.2] }
                          }
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {isRoundResults || isGameOver ? char : "_"}
                        </motion.span>
                      </div>
                    ))}
                </div>

                {!isRoundResults && !isGameOver && (
                  <div className="mt-4 px-6 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg animate-pulse">
                    <span className="text-[10px] font-black text-teal-400 tracking-[0.3em] uppercase">
                      {t.justone_awaiting_clues}
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="clues"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-wrap justify-center gap-6 max-w-2xl px-12"
              >
                {validClues.map((clue, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                    className="px-10 py-6 bg-teal-500/5 border border-teal-500/30 rounded-[2rem] text-3xl font-black italic tracking-tighter text-white shadow-[0_0_30px_rgba(45,212,191,0.15)]"
                  >
                    {clue}
                  </motion.div>
                ))}
                {validClues.length === 0 && (
                  <div className="flex flex-col items-center gap-4 py-12 opacity-40">
                    <div className="text-6xl">🚫</div>
                    <span className="text-[10px] font-black tracking-[0.5em] text-rose-500 uppercase">
                      {t.justone_all_canceled}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 text-[8px] text-zinc-700 font-black tracking-[0.5em] uppercase">
            {t.shared_status}: {board.phase.replace("_", " ")}
          </div>
        </div>

        {/* SYSTEM STATUS & LOGS */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-6 border-zinc-800">
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-[8px] font-black text-teal-500 uppercase tracking-[0.3em]">
                {t.justone_guesser}
              </span>
              <h2 className="text-xl font-black italic text-white tracking-tighter uppercase">
                {activePlayer?.name || t.waiting}
              </h2>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-6">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 font-bold uppercase tracking-widest">
                  LANGUAGE:
                </span>
                <span className="text-white font-black uppercase">
                  {board.language}
                </span>
              </div>
            </div>
          </section>

          <MatchActivity
            history={board.history}
            renderLog={(log) => <JustOneLogMessage log={log} />}
          />
        </div>
      </div>

      {/* MISSION OVERLAY */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[#020203]/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="text-9xl mb-8">📡</div>
            <h1 className="text-7xl font-black italic tracking-tighter text-white uppercase mb-4 logo-glow">
              {t.justone_session_ended}
            </h1>
            <p className="text-teal-500 font-mono tracking-[0.6em] uppercase text-xl mb-12">
              {t.shared_score}: {board.score} / 13
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-12 py-4 bg-white text-black font-black uppercase rounded-2xl hover:bg-teal-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {t.exit}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
