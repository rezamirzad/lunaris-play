"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog } from "@/lib/translations";
import MissionBriefing from "../../arcade/MissionBriefing";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadeStatusPanel from "../../arcade/ArcadeStatusPanel";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";

const IncanGoldBoard: React.FC<BoardProps> = ({ roomId, roomData }) => {
  const { t } = useTranslation();

  const anyApi = api as any;
  const incanApi = anyApi.incangold;

  const drawCard = useMutation(incanApi.drawCard);
  const nextRound = useMutation(incanApi.nextRound);
  const startDecision = useMutation(incanApi.startDecision);
  const finishVoteReveal = useMutation(incanApi.finishVoteReveal);

  const [showRules, setShowRules] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);

  const board = roomData.gameBoard;
  const players = roomData.players;
  
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  // 1. LOBBY MISSION BRIEFING
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.incangold_title}
        subtitle={t.lobbyInitiation}
        briefingTitle={t.incangold_goal_title}
        briefingDesc={t.incangold_desc}
        loadingText={t.incangold_exploring}
        accentColor="amber"
        background={
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        }
      />
    );
  }

  if (board.gameType !== "incangold") return null;

  const inTempleCount = players.filter(
    (p) => p.state.gameType === "incangold" && p.state.status === "IN_TEMPLE",
  ).length;

  const totalPathGems = Object.values(
    (board.cardGems as Record<string, number>) || {},
  ).reduce((a, b) => a + b, 0);

  const isFinished = roomData.status?.toUpperCase() === "FINISHED" || roomData.status?.toUpperCase() === "ARCHIVED";

  const handleDraw = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try {
      await drawCard({ roomId: roomId as Id<"rooms"> });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingAction(false);
    }
  };

  const handleNextRound = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try {
      await nextRound({ roomId: roomId as Id<"rooms"> });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingAction(false);
    }
  };

  const handleStartDecision = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try {
      await startDecision({ roomId: roomId as Id<"rooms"> });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingAction(false);
    }
  };

  const handleFinishReveal = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try {
      await finishVoteReveal({ roomId: roomId as Id<"rooms"> });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingAction(false);
    }
  };

  const getHazardLabel = (cardId: string) => {
    if (cardId.includes("Serpent")) return "🐍";
    if (cardId.includes("Scorpion")) return "🦂";
    if (cardId.includes("Rockfall")) return "🪨";
    if (cardId.includes("Gas")) return "💨";
    if (cardId.includes("Explosion")) return "💥";
    return "⚠️";
  };

  if (board.phase === "FINAL_LEADERBOARD") {
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreA = (a.state as any).bankedScore || 0;
      const scoreB = (b.state as any).bankedScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return (
        ((b.state as any).artifacts || 0) - ((a.state as any).artifacts || 0)
      );
    });

    return (
      <div className="flex flex-col h-full w-full bg-[#0a0500] text-amber-50 p-12 overflow-hidden relative font-serif">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden flex items-center justify-center">
          <span className="text-[40rem] rotate-12">☀️</span>
        </div>
        <div className="z-10 flex flex-col h-full">
          <header className="text-center mb-12 relative">
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 tracking-tighter italic uppercase">
              {t.incangold_expedition_complete}
            </h1>
            <div className="h-1 w-64 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-4" />
            <p className="text-amber-500/60 font-bold uppercase tracking-[0.5em] mt-4 italic">
              {t.incangold_hall_of_riches}
            </p>
          </header>
          <div className="flex-1 bg-[#1a0f00]/80 backdrop-blur-lg rounded-[4rem] border-4 border-amber-900/30 shadow-2xl p-12 overflow-auto custom-scrollbar relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rotate-45 translate-x-32 -translate-y-32" />
            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="border-b-2 border-amber-500/20 text-amber-500/60 uppercase text-sm tracking-[0.2em]">
                  <th className="py-8 px-6 italic">{t.incangold_adventurer}</th>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <th key={r} className="py-8 px-6 text-center italic">
                      {formatLog(t.incangold_cave_n, { n: r })}
                    </th>
                  ))}
                  <th className="py-8 px-6 text-center italic">{t.incangold_artifacts}</th>
                  <th className="py-8 px-6 text-right italic">
                    {t.incangold_total_wealth}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p, idx) => {
                  const state = p.state as any;
                  return (
                    <tr
                      key={p._id}
                      className={`border-b border-white/5 transition-all hover:bg-white/5 group ${idx === 0 ? "bg-amber-500/5" : ""}`}
                    >
                      <td className="py-8 px-6">
                        <div className="flex items-center gap-6">
                          {idx === 0 && (
                            <motion.span
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 3 }}
                              className="text-4xl filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                            >
                              👑
                            </motion.span>
                          )}
                          <span
                            className={`text-3xl font-black tracking-tight ${idx === 0 ? "text-amber-400" : "text-slate-300"}`}
                          >
                            {p.name}
                          </span>
                        </div>
                      </td>
                      {[1, 2, 3, 4, 5].map((r) => {
                        const res = board.roundHistory?.find(
                          (rh) => rh.round === r,
                        )?.playerResults?.[p._id];
                        return (
                          <td key={r} className="py-8 px-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`text-xl font-black ${res?.status === "CRASHED" ? "text-red-500/80 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "text-amber-400 group-hover:scale-110 transition-transform"}`}
                              >
                                {res
                                  ? res.status === "CRASHED"
                                    ? "💀"
                                    : res.gained
                                  : "-"}
                              </span>
                              {res && res.lost > 0 && (
                                <span className="text-xs text-red-500 font-bold italic tracking-tighter opacity-60">
                                  -{res.lost}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-8 px-6 text-center text-amber-200 font-black text-2xl">
                        {state.artifacts || 0}
                      </td>
                      <td className="py-8 px-6 text-right">
                        <div className="flex items-center justify-end gap-3 text-5xl font-black text-emerald-400 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                          <span>{state.bankedScore}</span>
                          <span className="text-3xl opacity-60">💎</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-12 flex justify-center pb-8">
               <button onClick={() => (window.location.href = "/")} className="px-20 py-6 bg-gradient-to-b from-amber-400 to-amber-700 text-amber-950 font-black text-2xl uppercase italic rounded-3xl shadow-[0_10px_50px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all border-t-2 border-amber-100/30">
                  {t.exit}
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#0d0700] text-amber-50 font-serif"
      background={
        <>
           <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-stone.png')]" />
           <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#4a2c00_0%,_transparent_70%)]" />
        </>
      }
      header={
        <ArcadeHUD
          title={t.incangold_title_alt}
          statusLabel={formatLog(t.incangold_cave_n, { n: board.currentRound })}
          badgeContent={
            <button
              onClick={() => setShowRules(!showRules)}
              className="group flex items-center gap-2 transition-all"
            >
              {showRules ? t.incangold_close_rules : t.incangold_game_rules}
            </button>
          }
          accentColor="amber"
        />
      }
      main={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden pt-4">
           {/* Action Controls are part of header area usually, but here they are dynamic */}
           <div className="absolute top-4 right-8 z-30 flex gap-4">
              {board.phase === "ROUND_RESULTS" ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextRound}
                  disabled={pendingAction}
                  className="bg-gradient-to-b from-emerald-400 to-emerald-800 text-emerald-950 px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(6,78,59)] border-t border-emerald-300/50 uppercase tracking-tighter disabled:opacity-50"
                >
                  {t.incangold_next_cave}
                </motion.button>
              ) : board.phase === "REVEAL_PHASE" ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartDecision}
                  disabled={pendingAction}
                  className="bg-gradient-to-b from-amber-300 to-amber-700 text-amber-950 px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(120,53,15)] border-t border-amber-100/50 uppercase tracking-tighter italic disabled:opacity-50"
                >
                  {t.incangold_time_to_decide}
                </motion.button>
              ) : board.phase === "VOTE_REVEAL" ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinishReveal}
                  disabled={pendingAction}
                  className="bg-gradient-to-b from-amber-300 to-amber-700 text-amber-950 px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(120,53,15)] border-t border-amber-100/50 uppercase tracking-tighter italic disabled:opacity-50"
                >
                  {t.incangold_continue_exploration}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDraw}
                  disabled={
                    pendingAction ||
                    (board.phase !== "EXPEDITION_PHASE" &&
                      board.phase !== "ROUND_INTRO")
                  }
                  className="group relative bg-gradient-to-b from-amber-300 to-amber-700 disabled:from-slate-800 disabled:to-slate-900 disabled:opacity-50 text-amber-950 px-12 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(120,53,15)] disabled:shadow-none border-t border-amber-100/50 disabled:border-white/5 uppercase tracking-tighter italic transition-all"
                >
                  {board.phase === "ROUND_INTRO"
                    ? t.incangold_enter_cave
                    : t.incangold_venture_deeper}
                </motion.button>
              )}
           </div>

          <div className="lg:col-span-9 bg-[#1a0f00]/40 rounded-[3rem] p-10 border-4 border-amber-900/20 relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {board.phase === "ROUND_RESULTS" ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8 relative"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] opacity-[0.03] select-none pointer-events-none rotate-infinite">
                    ☀️
                  </div>
                  <div className="mb-12 relative">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: "linear",
                      }}
                      className="text-[14rem] opacity-20 filter blur-[2px] block"
                    >
                      🏺
                    </motion.span>
                    <h2 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-300 to-amber-600 tracking-tighter absolute inset-0 flex items-center justify-center drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] italic uppercase text-center w-full leading-none">
                      {t.incangold_expedition_ends}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-12 w-full max-w-3xl mx-auto z-10">
                    <div className="bg-gradient-to-br from-amber-400 to-amber-700 text-amber-950 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center border-t-4 border-amber-200/50">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">
                        {t.incangold_wealth_found}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-8xl font-black tracking-tighter tabular-nums">
                          {board.roundHistory?.[board.roundHistory.length - 1]
                            ?.gemsFound || 0}
                        </span>
                        <span className="text-5xl">💎</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-600 to-red-950 text-red-50 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(239,68,68,0.2)] flex flex-col items-center justify-center border-t-4 border-red-400/30">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">
                        {t.incangold_swallowed_by_cave}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-8xl font-black tracking-tighter tabular-nums">
                          {board.roundHistory?.[board.roundHistory.length - 1]
                            ?.gemsLost || 0}
                        </span>
                        <span className="text-5xl">💀</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="path"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap items-center justify-center gap-8 pb-32 pt-4"
                >
                  {board.path.map((cardId, index) => {
                    const gems = board.cardGems[index] || 0;
                    const isHazard = cardId.startsWith("H_");
                    const isArtifact = cardId.startsWith("A_");
                    return (
                      <motion.div
                        key={`${cardId}-${index}`}
                        initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 15,
                        }}
                        className={`relative w-44 aspect-[2/3] rounded-3xl flex flex-col items-center justify-between p-6 border-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden ${isHazard ? "bg-gradient-to-br from-[#300] to-[#0a0000] border-red-600/50 text-red-100" : isArtifact ? "bg-gradient-to-br from-[#1a0f00] to-[#050300] border-amber-400 text-amber-100 ring-4 ring-amber-500/20" : "bg-gradient-to-br from-[#0a0520] to-black border-blue-600/50 text-blue-100"}`}
                      >
                        <div className="absolute inset-2 border border-white/5 rounded-2xl pointer-events-none" />
                        <div className="w-full flex justify-between items-start z-10 relative">
                          <span
                            className={`text-[10px] font-black tracking-[0.2em] uppercase opacity-60 ${isHazard ? "text-red-400" : isArtifact ? "text-amber-400" : "text-blue-400"}`}
                          >
                            {isHazard
                              ? t.incangold_danger
                              : isArtifact
                                ? t.incangold_goal_title
                                : t.incangold_gems_label}
                          </span>
                          <span className="text-2xl filter brightness-125">
                            {isHazard ? "💀" : isArtifact ? "🏺" : "💎"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center z-10 relative">
                          {isHazard ? (
                            <>
                              <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="text-8xl mb-2 block filter drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                              >
                                {getHazardLabel(cardId)}
                              </motion.span>
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 text-center block w-full mt-2 border-t border-red-500/20 pt-2">
                                {cardId.split("_")[1]}
                              </span>
                            </>
                          ) : isArtifact ? (
                            <motion.span
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 6 }}
                              className="text-9xl filter drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                            >
                              🏺
                            </motion.span>
                          ) : (
                            <div className="relative group">
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 5 }}
                                className="relative mb-2"
                              >
                                <span className="text-9xl filter drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
                                  💎
                                </span>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-white flex flex-col items-center leading-none">
                                  <span>{cardId.split("_")[1]}</span>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </div>
                        <div className="w-full h-10 flex items-center justify-center z-10 relative">
                          {gems > 0 && (
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-[0_5px_15px_rgba(245,158,11,0.4)] ring-2 ring-amber-950/20"
                            >
                              <span className="opacity-70 uppercase tracking-tighter">
                                {t.incangold_left}
                              </span>
                              <span>{gems}</span>
                              <span className="text-sm">💎</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none z-20">
              <div className="bg-black/80 backdrop-blur-xl px-8 py-6 rounded-[2.5rem] border-2 border-amber-900/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[450px]">
                <p className="text-amber-500/40 text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center italic">
                  {t.incangold_threat_level}
                </p>
                <div className="flex justify-around gap-6">
                  {["Serpent", "Scorpion", "Rockfall", "Gas", "Explosion"].map(
                    (type) => {
                      const foundCount = board.path.filter((id) =>
                        id.includes(type),
                      ).length;
                      return (
                        <div
                          key={type}
                          className={`relative group flex flex-col items-center gap-2 transition-all duration-700 ${foundCount > 0 ? "scale-110" : "opacity-20 grayscale"}`}
                        >
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-700 ${foundCount >= 2 ? "bg-red-600 border-white text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]" : foundCount === 1 ? "bg-red-950/40 border-red-500/50 text-red-500" : "bg-white/5 border-white/5"}`}
                          >
                            {type === "Serpent" && "🐍"}
                            {type === "Scorpion" && "🦂"}
                            {type === "Rockfall" && "🪨"}
                            {type === "Gas" && "💨"}
                            {type === "Explosion" && "💥"}
                          </div>
                          {foundCount > 0 && (
                            <span
                              className={`text-[10px] font-black uppercase tracking-tighter ${foundCount >= 2 ? "text-red-400" : "text-slate-500"}`}
                            >
                              {foundCount}/2
                            </span>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {board.artifactsOnPath.length > 0 && (
                  <div className="bg-amber-400 text-amber-950 px-6 py-2 rounded-2xl font-black text-xs animate-bounce border-4 border-amber-600 shadow-xl flex items-center gap-2">
                    <span>🏺</span>
                    <span>{formatLog(t.incangold_on_path_bonus, { n: board.artifactsOnPath.length })}</span>
                  </div>
                )}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="bg-gradient-to-b from-amber-300 to-amber-600 text-amber-950 px-8 py-4 rounded-[2rem] shadow-[0_15px_40px_rgba(245,158,11,0.3)] flex items-center gap-4 ring-4 ring-amber-900/30 border-t-2 border-amber-100/50"
                >
                  <span className="text-4xl">💎</span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] italic mb-1">
                      {t.incangold_path_gems}
                    </span>
                    <span className="text-5xl font-black tracking-tighter tabular-nums">
                      {totalPathGems}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <ArcadeStatusPanel
              protocolLabel={t.incangold_threat_level}
              protocolValue={formatLog(t.incangold_cave_n, { n: board.currentRound })}
              accentColor="amber"
              rows={[
                { label: t.incangold_in_temple, value: String(inTempleCount), valueColor: "text-emerald-400" },
                { label: t.incangold_gems_label, value: String(totalPathGems), valueColor: "text-blue-400" },
                { label: t.shared_status, value: board.phase },
              ]}
              title=""
            />
          </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={players}
          currentTurnId={undefined}
          winnerId={board.winnerId}
          isGameEnd={isFinished}
          accentColor="amber"
          renderStats={(p) => {
            const state = p.state as any;
            const isInCave = state.status === "IN_TEMPLE";
            const roundResults = board.roundHistory?.[board.roundHistory.length - 1]?.playerResults?.[p._id];
            const crashed = roundResults?.status === "CRASHED" && board.phase === "ROUND_RESULTS";
            const hasDecided = board.decisions[p._id];
            const choiceRevealed = board.phase === "VOTE_REVEAL" || board.phase === "ROUND_RESULTS";
            const choice = board.decisions[p._id];

            return (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center bg-black/60 px-3.5 py-2 rounded-xl border border-white/5">
                  <span className="text-[8px] font-black text-amber-500/50 uppercase italic tracking-wider">
                    {t.incangold_in_hand}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base font-black tabular-nums ${crashed ? "text-red-500 line-through opacity-50" : "text-amber-400"}`}>
                      {state.gemsThisRound}
                    </span>
                    <span className="text-[10px]">💎</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-black/60 px-3.5 py-2 rounded-xl border border-white/5 transition-all">
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase italic tracking-wider">
                    {t.incangold_banked}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tabular-nums text-emerald-400">
                      {state.bankedScore}
                    </span>
                    <span className="text-[10px]">🏕️</span>
                  </div>
                </div>
                
                {choiceRevealed && isInCave && (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`mt-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center ${choice === "LEAVE" ? "bg-amber-500 text-amber-950" : "bg-emerald-500 text-emerald-950"}`}>
                    {choice === "LEAVE" ? t.incangold_choice_leave : t.incangold_choice_stay}
                  </motion.div>
                )}
                
                {crashed && (
                  <div className="absolute inset-0 bg-red-950/90 rounded-[2rem] flex flex-col items-center justify-center text-white backdrop-blur-[1px] z-20 border-2 border-red-500/50">
                    <span className="text-4xl mb-1">💀</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-red-100">
                      {formatLog(t.incangold_lost_gems, { n: roundResults.lost })}
                    </span>
                  </div>
                )}
              </div>
            );
          }}
        />
      }
    />
  );
};

export default IncanGoldBoard;
