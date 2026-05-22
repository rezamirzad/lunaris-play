"use client";

import React, { useState, useEffect } from "react";
import { PlayerProps } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import { useTimeAttack } from "@/hooks/useTimeAttack";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";

export default function PlayerViewContainer({ player, roomData }: PlayerProps) {
  const { t, lang } = useTranslation();
  const { gameBoard, handleAction, latency } = useTimeAttack(roomData, player);
  const [localStarted, setLocalStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const playerSub = gameBoard.submissions[player._id.toString()];
  const hasStarted =
    (!!playerSub?.personalStartTime || localStarted) &&
    gameBoard.phase === "ACTIVE_PLAY";
  const hasFinished = (playerSub?.inputs?.length ?? 0) > 0;

  useEffect(() => {
    console.log(
      `[PlayerView] Phase: ${gameBoard.phase}, Round: ${gameBoard.currentRound}, hasStarted: ${hasStarted}, localStarted: ${localStarted}`,
    );
    // Reset local state when round changes or phase changes
    if (gameBoard.phase === "ROUND_INTRO") {
      setLocalStarted(false);
      setElapsed(0);
    }
  }, [gameBoard.currentRound, gameBoard.phase, hasStarted, localStarted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasStarted && !hasFinished) {
      const startTime = playerSub?.personalStartTime ?? Date.now();
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [hasStarted, hasFinished, playerSub?.personalStartTime]);

  if (gameBoard.gameType !== "timeattack") return null;

  const isActive = gameBoard.phase === "ACTIVE_PLAY";
  const isFinal =
    gameBoard.phase === "FINAL_LEADERBOARD" ||
    (gameBoard.phase === "ROUND_REVEAL" && gameBoard.currentRound >= 10) ||
    roomData.status === "FINISHED";

  const onInteraction = (type: "TAP" | "PRESS" | "RELEASE") => {
    if (!isActive) return;
    if (gameBoard.interaction === "TAP" && type === "TAP") {
      if (!hasStarted) {
        setLocalStarted(true);
      } else if (!hasFinished) {
        // Stopping
      }
    } else if (gameBoard.interaction === "PRESS_RELEASE") {
      if (type === "PRESS") setLocalStarted(true);
      if (type === "RELEASE") {
        // Stopping
      }
    }
    handleAction(type);
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-between p-6 bg-zinc-950 overflow-hidden">
      {/* HEADER: STATUS & LATENCY */}
      <div className="w-full flex justify-between items-start pt-4">
        <div className="flex flex-col">
          <span className={`text-zinc-500 font-mono text-[10px] uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
            {t.player}
          </span>
          <span className="text-white font-black italic uppercase tracking-tighter text-xl">
            {player.name}
          </span>
        </div>
        {!isFinal && (
          <div className="flex flex-col items-end">
            <span className={`text-zinc-500 font-mono text-[10px] uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
              {t.boot_syncing}
            </span>
            <span
              className={`font-mono text-sm ${latency < 50 ? "text-teal-400" : "text-yellow-400"}`}
            >
              {lang === "fa" ? toPersianDigits(Math.round(latency)) : Math.round(latency)}ms
            </span>
          </div>
        )}
      </div>

      {/* CENTER: THE CORE INTERACTION AREA */}
      <div className="flex-1 flex flex-col items-center justify-center w-full gap-8">
        <AnimatePresence mode="wait">
          {isActive ? (
            <div className="flex flex-col items-center gap-12 w-full">
              {/* LOCAL TIMER DISPLAY */}
              <div className="text-center h-20">
                {hasStarted && !hasFinished && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className={`text-zinc-600 font-mono text-xs uppercase mb-2 ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
                      {t.timeattack_personal_timer}
                    </span>
                    <span 
                      dir={lang === "fa" ? "rtl" : "ltr"}
                      className="text-5xl font-black italic text-teal-400 tabular-nums"
                    >
                      {lang === "fa" ? toPersianDigits((elapsed / 1000).toFixed(2)) : (elapsed / 1000).toFixed(2)}s
                    </span>
                  </motion.div>
                )}
                {hasFinished && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className={`text-teal-500 font-black italic uppercase text-2xl ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
                      {t.timeattack_locked}
                    </span>
                    <span className={`text-zinc-500 font-mono text-xs mt-2 uppercase ${lang === 'fa' ? 'tracking-normal' : ''}`}>
                      {t.timeattack_waiting_reveal}
                    </span>
                  </motion.div>
                )}
              </div>

              <motion.button
                key="active-btn"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{
                  scale: 0.9,
                  boxShadow: "0 0 80px rgba(45,212,191,0.4)",
                }}
                onPointerDown={() =>
                  onInteraction(
                    gameBoard.interaction === "PRESS_RELEASE" ? "PRESS" : "TAP",
                  )
                }
                onPointerUp={() =>
                  gameBoard.interaction === "PRESS_RELEASE" &&
                  onInteraction("RELEASE")
                }
                disabled={hasFinished}
                className={`w-full max-w-[280px] aspect-square rounded-full border-8 flex flex-col items-center justify-center gap-2 shadow-[0_0_40px_rgba(45,212,191,0.1)] relative group transition-all duration-300 ${
                  hasFinished
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-zinc-900 border-teal-500/30"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-full animate-pulse ${hasFinished ? "hidden" : "bg-teal-500/5"}`}
                />
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center border transition-colors ${
                    hasFinished
                      ? "bg-zinc-900 border-zinc-800"
                      : "bg-teal-500/20 border-teal-500/40"
                  }`}
                >
                  <span
                    className={`font-black italic text-2xl ${hasFinished ? "text-zinc-700" : "text-teal-400"}`}
                  >
                    {hasFinished
                      ? t.timeattack_done
                      : gameBoard.interaction === "PRESS_RELEASE"
                        ? hasStarted
                          ? t.timeattack_release
                          : t.timeattack_hold
                        : hasStarted
                          ? t.timeattack_stop
                          : t.timeattack_start}
                  </span>
                </div>
                <span className={`text-zinc-500 font-mono text-[10px] uppercase mt-4 text-center px-8 ${lang === 'fa' ? 'tracking-normal' : 'tracking-[0.2em]'}`}>
                  {!hasStarted
                    ? gameBoard.interaction === "PRESS_RELEASE"
                      ? t.timeattack_hold_to_start
                      : t.timeattack_tap_to_start
                    : !hasFinished
                      ? gameBoard.interaction === "PRESS_RELEASE"
                        ? t.timeattack_release_at_target
                        : t.timeattack_tap_to_stop
                      : t.timeattack_time_recorded}
                </span>
              </motion.button>
            </div>
          ) : isFinal ? (
            <motion.div
              key="final-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md flex flex-col gap-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center border-2 border-teal-500/20 mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className={`text-white font-black italic uppercase text-2xl ${lang === 'fa' ? 'tracking-normal' : 'tracking-tighter'}`}>
                  {t.timeattack_final_results}
                </h3>
              </div>

              {/* MINI LEADERBOARD FOR PLAYER HAND */}
              <div className="bg-zinc-900/80 rounded-[2rem] border border-white/5 overflow-hidden">
                {roomData.players
                  .sort(
                    (a, b) =>
                      ((b.state as any).score || 0) -
                      ((a.state as any).score || 0),
                  )
                  .slice(0, 5)
                  .map((p, idx) => (
                    <div
                      key={p._id}
                      className={`p-4 flex justify-between items-center ${idx < 4 ? "border-b border-white/5" : ""} ${p._id === player._id ? "bg-teal-500/10" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-xs ${idx === 0 ? "text-teal-400 font-bold" : "text-zinc-600"}`}
                        >
                          #{lang === "fa" ? toPersianDigits(idx + 1) : idx + 1}
                        </span>
                        <span
                          className={`text-sm uppercase font-black italic ${lang === 'fa' ? 'tracking-normal' : 'tracking-tight'} ${p._id === player._id ? "text-teal-400" : "text-zinc-300"}`}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-sm ${p._id === player._id ? "text-teal-400" : "text-white"}`}
                      >
                        {lang === "fa" ? toPersianDigits((p.state as any).score || 0) : ((p.state as any).score || 0)}
                      </span>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => (window.location.href = "/")}
                className={`w-full py-4 bg-white text-black font-black italic uppercase rounded-2xl hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}
              >
                {t.timeattack_leave_game}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="waiting-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 border-4 border-zinc-800 border-t-teal-500 rounded-full animate-spin mx-auto" />
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                {t.timeattack_waiting_next_round}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER: ROUND INFO */}
      <div className="w-full bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <span className={`text-zinc-500 font-mono text-[10px] uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
            {t.timeattack_round}
          </span>
          <span className="text-teal-400 font-black italic text-2xl">
            {lang === "fa" ? toPersianDigits(gameBoard.currentRound) : gameBoard.currentRound}/
            {lang === "fa" ? toPersianDigits(10) : 10}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-zinc-500 font-mono text-[10px] uppercase ${lang === 'fa' ? 'tracking-normal' : 'tracking-widest'}`}>
            {t.shared_score}
          </span>
          <span 
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="text-white font-black italic text-2xl"
          >
            {player.state.gameType === "timeattack" 
              ? (lang === "fa" ? toPersianDigits(player.state.score) : player.state.score)
              : (lang === "fa" ? toPersianDigits(0) : 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
