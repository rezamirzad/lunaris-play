"use client";

import React, { useEffect, useState } from "react";
import { BoardProps } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";

export default function TimeAttackContainer({ roomData }: BoardProps) {
  const { t, lang } = useTranslation();
  const gameBoard = roomData.gameBoard;
  const nextPhase = useMutation(api.timeattack.nextPhase);
  const resetRoom = useMutation(api.engine.resetRoom);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const formatTimeLocal = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);
    const s = lang === "fa" ? toPersianDigits(seconds) : seconds;
    const m = lang === "fa" ? toPersianDigits(milliseconds) : milliseconds;
    return `${s} ${t.timeattack_s_and} ${m} ${t.timeattack_ms}`;
  };

  const phase = (gameBoard as any).phase;
  const serverStartTime = (gameBoard as any).serverStartTime;
  const targetMs = (gameBoard as any).targetMs;

  useEffect(() => {
    if (gameBoard.gameType === "timeattack" && phase === "ACTIVE_PLAY" && serverStartTime > 0) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - serverStartTime;
        const remaining = Math.max(0, targetMs - elapsed);
        setTimeLeft(remaining);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [
    gameBoard.gameType, 
    phase, 
    serverStartTime, 
    targetMs
  ]);

  if (gameBoard.gameType !== "timeattack") return null;

  // Visuals are now passed directly in the gameBoard state
  const visuals = gameBoard.visuals;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-zinc-950 text-white p-12 overflow-hidden font-mono">
      {/* HEADER */}
      <div className="w-full flex justify-between items-end">
        <div className="flex flex-col">
          <span className={`text-zinc-500 text-sm uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-[0.4em]'}`}>
            {t.timeattack_current_phase}
          </span>
          <h2 className={`text-4xl font-black italic text-teal-400 uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-tighter'}`}>
            {gameBoard.phase === "FINAL_LEADERBOARD"
              ? t.timeattack_victory_lap
              : gameBoard.phase.replace("_", " ")}
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-zinc-500 text-sm uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-[0.4em]'}`}>
            {t.timeattack_round}
          </span>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
            {lang === "fa" ? toPersianDigits(gameBoard.currentRound) : gameBoard.currentRound} <span className="text-zinc-600">/ {lang === "fa" ? toPersianDigits(10) : 10}</span>
          </h2>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {gameBoard.phase === "ROUND_INTRO" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="text-center space-y-8"
            >
              <h2 className={`text-teal-400 text-2xl font-black italic uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-[0.2em]'}`}>
                {t.timeattack_round} {lang === "fa" ? toPersianDigits(gameBoard.currentRound) : gameBoard.currentRound}:{" "}
                {(t as any)[`timeattack_round_${gameBoard.currentRound}_name`]}
              </h2>
              <h1 className={`text-8xl font-black italic uppercase text-white ${lang === 'fa' ? 'tracking-normal' : 'tracking-tighter'}`}>
                {t.timeattack_target}:{" "}
                <span 
                  dir={lang === "fa" ? "rtl" : "ltr"}
                  className="text-teal-400"
                >
                  {formatTimeLocal(gameBoard.targetMs)}
                </span>
              </h1>
              <div 
                dir={lang === "fa" ? "rtl" : "ltr"}
                className={`text-zinc-400 text-xl max-w-4xl mx-auto uppercase leading-relaxed border-teal-500 space-y-4 ${
                  lang === "fa" ? "border-r-4 pr-8 text-right tracking-normal" : "border-l-4 pl-8 text-left tracking-widest"
                }`}
              >
                <p className="text-white font-bold">
                  {t.timeattack_goal}: {(t as any)[`timeattack_round_${gameBoard.currentRound}_goal`]}
                </p>
                <p>
                  {t.timeattack_how}: {(t as any)[`timeattack_round_${gameBoard.currentRound}_how`]}
                </p>
                {(t as any)[`timeattack_round_${gameBoard.currentRound}_warning`] && (
                  <p className="text-red-400 font-bold">
                    {(t as any)[`timeattack_round_${gameBoard.currentRound}_warning`]}
                  </p>
                )}
                {(t as any)[`timeattack_round_${gameBoard.currentRound}_penalty`] && (
                  <p className="text-red-500 font-bold">
                    {(t as any)[`timeattack_round_${gameBoard.currentRound}_penalty`]}
                  </p>
                )}
              </div>
              <button
                onClick={() => nextPhase({ roomId: roomData._id })}
                className={`mt-12 px-12 py-4 bg-white text-black font-black italic uppercase rounded-full hover:bg-teal-400 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}
              >
                {t.timeattack_start_round}
              </button>
            </motion.div>
          )}

          {gameBoard.phase === "ACTIVE_PLAY" && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-4xl space-y-12"
            >
              {/* CHRONOMETER VISUAL - Only show for first 2 rounds or reaction test */}
              {gameBoard.currentRound <= 1 || gameBoard.currentRound === 4 ? (
                <div className="relative h-32 w-full bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: gameBoard.targetMs / 1000,
                      ease: "linear",
                    }}
                    className="absolute inset-y-0 left-0 bg-teal-500/40 shadow-[0_0_50px_rgba(45,212,191,0.3)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatePresence>
                      {(Date.now() - gameBoard.serverStartTime < 2000 ||
                        visuals === "FULL") && (
                        <motion.span
                          exit={{ opacity: 0, filter: "blur(20px)" }}
                          className="text-6xl font-black italic tabular-nums"
                        >
                          {lang === "fa" ? toPersianDigits((timeLeft / 1000).toFixed(2)) : (timeLeft / 1000).toFixed(2)}s
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="h-32 w-full flex items-center justify-center">
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-zinc-800 text-7xl font-black italic uppercase tracking-[0.5em]"
                  >
                    {t.timeattack_eyes_on_phone}
                  </motion.div>
                </div>
              )}

              {/* PLAYER STATUS GRID */}
              <div className="grid grid-cols-4 gap-8">
                {roomData.players.map((p) => {
                  const sub = gameBoard.submissions[p._id.toString()];
                  const hasStarted = !!sub?.personalStartTime;
                  const hasFinished = (sub?.inputs?.length ?? 0) > 0;

                  return (
                    <div
                      key={p._id}
                      className="flex flex-col items-center gap-3"
                    >
                      <motion.div
                        animate={
                          hasFinished
                            ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                            : hasStarted
                              ? { scale: [1, 1.1, 1] }
                              : {}
                        }
                        transition={
                          hasStarted && !hasFinished
                            ? { duration: 1, repeat: Infinity }
                            : {}
                        }
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-colors duration-500 ${
                          hasFinished
                            ? "bg-teal-500/20 border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                            : hasStarted
                              ? "bg-yellow-500/10 border-yellow-400 animate-pulse"
                              : "bg-zinc-900 border-white/5"
                        }`}
                      >
                        {hasFinished ? (
                          <span className="text-teal-400 font-bold text-xs">
                            {t.timeattack_done}
                          </span>
                        ) : hasStarted ? (
                          <span className="text-yellow-400 font-bold text-xs">
                            •••
                          </span>
                        ) : null}
                      </motion.div>
                      <span
                        className={`text-xs uppercase font-black ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'} ${hasFinished ? "text-teal-400" : hasStarted ? "text-yellow-400" : "text-zinc-500"}`}
                      >
                        {p.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => nextPhase({ roomId: roomData._id })}
                className={`mx-auto block px-8 py-2 border border-white/20 text-zinc-500 font-black italic uppercase rounded-full hover:text-white hover:border-white transition-colors ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}
              >
                {t.timeattack_end_input_window}
              </button>
            </motion.div>
          )}

          {gameBoard.phase === "ROUND_REVEAL" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl space-y-6"
            >
              <div className="text-center mb-8 bg-zinc-900/50 p-8 rounded-3xl border border-white/5 shadow-xl">
                <span className={`uppercase block mb-2 text-xs text-zinc-500 ${lang === 'fa' ? 'tracking-normal' : 'tracking-[0.5em]'}`}>
                  {t.timeattack_target_duration}
                </span>
                <h2 
                  dir={lang === "fa" ? "rtl" : "ltr"}
                  className="text-6xl font-black italic text-teal-400 tabular-nums"
                >
                  {formatTimeLocal(gameBoard.targetMs)}
                </h2>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(gameBoard.roundResults || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([pid, points], idx) => {
                    const player = roomData.players.find(
                      (p) => p._id.toString() === pid,
                    );
                    const sub = gameBoard.submissions[pid];
                    const isPenalty = (points as number) < 0;
                    return (
                      <motion.div
                        key={pid}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`font-black text-3xl italic ${idx === 0 ? "text-teal-400" : "text-zinc-700"}`}
                          >
                            #{lang === "fa" ? toPersianDigits(idx + 1) : idx + 1}
                          </span>
                          <span className="text-white font-bold text-xl">
                            {player?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="flex flex-col items-end">
                            <span className={`text-[10px] uppercase font-mono text-zinc-500 ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
                              {t.timeattack_actual}
                            </span>
                            <span 
                              dir={lang === "fa" ? "rtl" : "ltr"}
                              className="text-white font-mono text-lg italic tabular-nums"
                            >
                              {formatTimeLocal(sub?.actualMs || 0)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-[10px] uppercase font-mono text-zinc-500 ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
                              {t.timeattack_delta}
                            </span>
                            <span 
                              dir={lang === "fa" ? "rtl" : "ltr"}
                              className="text-zinc-400 font-mono text-sm italic tabular-nums"
                            >
                              {formatTimeLocal(sub?.finalDeltaMs || 0)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end w-24">
                            <span className={`text-[10px] uppercase font-mono text-zinc-500 ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
                              {t.timeattack_reward}
                            </span>
                            <span
                              className={`font-black italic text-2xl ${isPenalty ? "text-red-500" : "text-teal-400"}`}
                            >
                              {isPenalty ? "" : "+"}
                              {lang === "fa" ? toPersianDigits(points as number) : points}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
              <button
                onClick={() => nextPhase({ roomId: roomData._id })}
                className={`mx-auto block mt-12 px-12 py-4 bg-teal-500 text-black font-black italic uppercase rounded-full hover:bg-white transition-colors shadow-[0_0_30px_rgba(45,212,191,0.3)] ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}
              >
                {t.timeattack_next_round}
              </button>
            </motion.div>
          )}

          {gameBoard.phase === "FINAL_LEADERBOARD" && (
            <motion.div
              key="final"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-3xl space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className={`text-7xl font-black italic uppercase text-white ${lang === 'fa' ? 'tracking-normal' : 'tracking-tighter'}`}>
                  {t.timeattack_final_ranking}
                </h1>
                <p className={`text-teal-400 font-mono uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-[0.5em]'}`}>
                  {t.timeattack_sync_wave_masters}
                </p>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {roomData.players
                  .sort(
                    (a, b) =>
                      ((b.state as any).score || 0) -
                      ((a.state as any).score || 0),
                  )
                  .map((player, idx) => (
                    <motion.div
                      key={player._id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.15 }}
                      className={`p-6 rounded-3xl border flex justify-between items-center ${
                        idx === 0
                          ? "bg-teal-500/10 border-teal-500/50 shadow-[0_0_40px_rgba(45,212,191,0.1)]"
                          : "bg-zinc-900/50 border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <span
                          className={`text-4xl font-black italic ${idx === 0 ? "text-teal-400" : "text-zinc-700"}`}
                        >
                          #{lang === "fa" ? toPersianDigits(idx + 1) : idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className={`text-[10px] uppercase font-mono text-zinc-500 ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
                            {t.player}
                          </span>
                          <span className="text-white text-2xl font-black uppercase italic tracking-tight">
                            {player.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] uppercase font-mono text-zinc-500 ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
                          {t.timeattack_final_results}
                        </span>
                        <span
                          className={`text-4xl font-black italic ${idx === 0 ? "text-teal-400" : "text-white"}`}
                        >
                          {lang === "fa" ? toPersianDigits((player.state as any).score || 0) : ((player.state as any).score || 0)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
              
              <button 
                onClick={() => window.location.href = '/'}
                className={`mx-auto block px-12 py-4 border-2 border-white text-white font-black italic uppercase rounded-full hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}
              >
                {t.timeattack_return_to_arcade}
              </button>
            </motion.div>
          )}

          {roomData.status === "FINISHED" && gameBoard.phase !== "FINAL_LEADERBOARD" && (
            <motion.div
              key="finished-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <h2 className={`text-4xl font-black italic uppercase text-zinc-500 ${lang === 'fa' ? 'tracking-normal' : 'tracking-tighter'}`}>
                {t.gameOver}
              </h2>
              <button
                onClick={() => (window.location.href = "/")}
                className={`px-8 py-3 bg-white text-black font-bold uppercase rounded-xl ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}
              >
                {t.timeattack_back_to_main_menu}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER: GLOBAL LEADERBOARD MINI */}
      <div className="w-full flex justify-between items-center border-t border-white/5 pt-8">
        <div className="flex gap-8">
          {roomData.players
            .sort(
              (a, b) =>
                ((b.state as any).score || 0) - ((a.state as any).score || 0),
            )
            .slice(0, 3)
            .map((p, i) => (
              <div key={p._id} className="flex flex-col">
                <span className="text-[10px] text-zinc-600 uppercase">
                  {lang === "fa" ? toPersianDigits(i + 1) : i + 1}
                </span>
                <span className="text-sm font-bold">
                  {p.name}{" "}
                  <span className="text-teal-400">
                    {lang === "fa" ? toPersianDigits((p.state as any).score || 0) : ((p.state as any).score || 0)}
                  </span>
                </span>
              </div>
            ))}
        </div>
        <div className="text-zinc-800 font-black italic text-4xl uppercase tracking-tighter">
          {t.timeattack_sync_wave_v1}
        </div>
      </div>
    </div>
  );
}
