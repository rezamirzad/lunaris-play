"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog } from "@/lib/translations";

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
  const inTemple = players.filter(
    (p) => p.state.gameType === "incangold" && p.state.status === "IN_TEMPLE"
  );

  useEffect(() => {
    setPendingAction(false);
  }, [board.phase, (board as any).path?.length]);

  if (board.gameType !== "incangold") return null;

  const handleDraw = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try { await drawCard({ roomId: roomId as Id<"rooms"> }); } catch (err) { console.error(err); }
    finally { setPendingAction(false); }
  };

  const handleNextRound = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try { await nextRound({ roomId: roomId as Id<"rooms"> }); } catch (err) { console.error(err); }
    finally { setPendingAction(false); }
  };

  const handleStartDecision = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try { await startDecision({ roomId: roomId as Id<"rooms"> }); } catch (err) { console.error(err); }
    finally { setPendingAction(false); }
  };

  const handleFinishReveal = async () => {
    if (pendingAction) return;
    setPendingAction(true);
    try { await finishVoteReveal({ roomId: roomId as Id<"rooms"> }); } catch (err) { console.error(err); }
    finally { setPendingAction(false); }
  };

  const getHazardLabel = (cardId: string) => {
    if (cardId.includes("Serpent")) return "🐍";
    if (cardId.includes("Scorpion")) return "🦂";
    if (cardId.includes("Rockfall")) return "🪨";
    if (cardId.includes("Gas")) return "💨";
    if (cardId.includes("Explosion")) return "💥";
    return "⚠️";
  };

  const totalPathGems = Object.values(
    (board.cardGems as Record<string, number>) || {}
  ).reduce((a, b) => a + b, 0);

  if (board.phase === "FINAL_LEADERBOARD") {
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreA = (a.state as any).bankedScore || 0;
      const scoreB = (b.state as any).bankedScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return ((b.state as any).artifacts || 0) - ((a.state as any).artifacts || 0);
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
                  <th className="py-8 px-6 text-center italic">Artifacts</th>
                  <th className="py-8 px-6 text-right italic">{t.incangold_total_wealth}</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p, idx) => {
                  const state = p.state as any;
                  return (
                    <tr key={p._id} className={`border-b border-white/5 transition-all hover:bg-white/5 group ${idx === 0 ? "bg-amber-500/5" : ""}`}>
                      <td className="py-8 px-6">
                        <div className="flex items-center gap-6">
                          {idx === 0 && <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-4xl filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">👑</motion.span>}
                          <span className={`text-3xl font-black tracking-tight ${idx === 0 ? "text-amber-400" : "text-slate-300"}`}>{p.name}</span>
                        </div>
                      </td>
                      {[1, 2, 3, 4, 5].map((r) => {
                        const res = board.roundHistory?.find((rh) => rh.round === r)?.playerResults?.[p._id];
                        return (
                          <td key={r} className="py-8 px-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xl font-black ${res?.status === "CRASHED" ? "text-red-500/80 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "text-amber-400 group-hover:scale-110 transition-transform"}`}>
                                {res ? (res.status === "CRASHED" ? "💀" : res.gained) : "-"}
                              </span>
                              {res && res.lost > 0 && <span className="text-xs text-red-500 font-bold italic tracking-tighter opacity-60">-{res.lost}</span>}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-8 px-6 text-center text-amber-200 font-black text-2xl">{state.artifacts || 0}</td>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0d0700] text-amber-50 p-6 overflow-hidden relative font-serif">
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-stone.png')]" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#4a2c00_0%,_transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none border-[2rem] border-[#1a0f00] opacity-40 z-0" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 4% 4%, 4% 96%, 96% 96%, 96% 4%, 4% 4%)' }} />

      <header className="flex justify-between items-start mb-8 z-10 px-4">
        <div className="relative">
          <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 tracking-tighter filter drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)] italic">DIAMANT</motion.h1>
          <div className="flex items-center gap-4 mt-2">
             <div className="flex items-center gap-2 bg-black/60 border border-amber-500/30 px-4 py-1 rounded-full shadow-inner"><span className="text-amber-500 text-xs">☀️</span><span className="text-amber-400 text-xs font-bold uppercase tracking-[0.3em]">{formatLog(t.incangold_cave_n, { n: board.currentRound })}</span></div>
             <button onClick={() => setShowRules(!showRules)} className="group flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-all text-xs font-bold uppercase tracking-[0.2em] italic border-b border-amber-500/10 hover:border-amber-500/40 pb-0.5">{showRules ? t.incangold_close_rules : t.incangold_game_rules}</button>
          </div>
        </div>

        <div className="flex gap-4">
           {board.phase === "ROUND_RESULTS" ? (
             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNextRound} disabled={pendingAction} className="bg-gradient-to-b from-emerald-400 to-emerald-800 text-emerald-950 px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(6,78,59)] border-t border-emerald-300/50 uppercase tracking-tighter disabled:opacity-50">{t.incangold_next_cave}</motion.button>
           ) : board.phase === "REVEAL_PHASE" ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartDecision} disabled={pendingAction} className="bg-gradient-to-b from-amber-300 to-amber-700 text-amber-950 px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(120,53,15)] border-t border-amber-100/50 uppercase tracking-tighter italic disabled:opacity-50">{t.incangold_time_to_decide}</motion.button>
           ) : board.phase === "VOTE_REVEAL" ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleFinishReveal} disabled={pendingAction} className="bg-gradient-to-b from-amber-300 to-amber-700 text-amber-950 px-10 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(120,53,15)] border-t border-amber-100/50 uppercase tracking-tighter italic disabled:opacity-50">{t.incangold_continue_exploration}</motion.button>
           ) : (
             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDraw} disabled={pendingAction || (board.phase !== "EXPEDITION_PHASE" && board.phase !== "ROUND_INTRO")} className="group relative bg-gradient-to-b from-amber-300 to-amber-700 disabled:from-slate-800 disabled:to-slate-900 disabled:opacity-50 text-amber-950 px-12 py-5 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(120,53,15)] disabled:shadow-none border-t border-amber-100/50 disabled:border-white/5 uppercase tracking-tighter italic transition-all">{board.phase === "ROUND_INTRO" ? t.incangold_enter_cave : t.incangold_venture_deeper}</motion.button>
           )}
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6 min-h-0 z-10 relative">
        <div className="flex-1 bg-[#1a0f00]/40 rounded-[3rem] p-10 border-4 border-amber-900/20 relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {board.phase === "ROUND_RESULTS" ? (
                <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center p-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] opacity-[0.03] select-none pointer-events-none rotate-infinite">☀️</div>
                    <div className="mb-12 relative">
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="text-[14rem] opacity-20 filter blur-[2px] block">🏺</motion.span>
                        <h2 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-300 to-amber-600 tracking-tighter absolute inset-0 flex items-center justify-center drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] italic uppercase text-center w-full leading-none">{t.incangold_expedition_ends}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-12 w-full max-w-3xl mx-auto z-10">
                        <div className="bg-gradient-to-br from-amber-400 to-amber-700 text-amber-950 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center border-t-4 border-amber-200/50"><span className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">{t.incangold_wealth_found}</span><div className="flex items-center gap-4"><span className="text-8xl font-black tracking-tighter tabular-nums">{board.roundHistory?.[board.roundHistory.length - 1]?.gemsFound || 0}</span><span className="text-5xl">💎</span></div></div>
                        <div className="bg-gradient-to-br from-red-600 to-red-950 text-red-50 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(239,68,68,0.2)] flex flex-col items-center justify-center border-t-4 border-red-400/30"><span className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">{t.incangold_swallowed_by_cave}</span><div className="flex items-center gap-4"><span className="text-8xl font-black tracking-tighter tabular-nums">{board.roundHistory?.[board.roundHistory.length - 1]?.gemsLost || 0}</span><span className="text-5xl">💀</span></div></div>
                    </div>
                </motion.div>
            ) : (
                <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-center gap-8 pb-32 pt-4">
                    {board.path.map((cardId, index) => {
                        const gems = board.cardGems[index] || 0;
                        const isHazard = cardId.startsWith("H_");
                        const isArtifact = cardId.startsWith("A_");
                        return (
                        <motion.div key={`${cardId}-${index}`} initial={{ opacity: 0, scale: 0.5, rotateY: 180 }} animate={{ opacity: 1, scale: 1, rotateY: 0 }} transition={{ type: "spring", stiffness: 100, damping: 15 }} className={`relative w-44 aspect-[2/3] rounded-3xl flex flex-col items-center justify-between p-6 border-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden ${isHazard ? "bg-gradient-to-br from-[#300] to-[#0a0000] border-red-600/50 text-red-100" : isArtifact ? "bg-gradient-to-br from-[#1a0f00] to-[#050300] border-amber-400 text-amber-100 ring-4 ring-amber-500/20" : "bg-gradient-to-br from-[#0a0520] to-black border-blue-600/50 text-blue-100"}`}>
                            <div className="absolute inset-2 border border-white/5 rounded-2xl pointer-events-none" />
                            <div className="w-full flex justify-between items-start z-10 relative">
                                <span className={`text-[10px] font-black tracking-[0.2em] uppercase opacity-60 ${isHazard ? 'text-red-400' : isArtifact ? 'text-amber-400' : 'text-blue-400'}`}>
                                    {isHazard ? t.incangold_danger : isArtifact ? 'Artifact' : t.incangold_gems_label}
                                </span>
                                <span className="text-2xl filter brightness-125">{isHazard ? "💀" : isArtifact ? "🏺" : "💎"}</span>
                            </div>
                            <div className="flex flex-col items-center z-10 relative">
                                {isHazard ? <><motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="text-8xl mb-2 block filter drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">{getHazardLabel(cardId)}</motion.span><span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 text-center block w-full mt-2 border-t border-red-500/20 pt-2">{cardId.split('_')[1]}</span></> : isArtifact ? <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="text-9xl filter drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">🏺</motion.span> : <div className="relative group"><motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="relative mb-2"><span className="text-9xl filter drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">💎</span><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-white flex flex-col items-center leading-none"><span>{cardId.split('_')[1]}</span></div></motion.div></div>}
                            </div>
                            <div className="w-full h-10 flex items-center justify-center z-10 relative">{gems > 0 && <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-[0_5px_15px_rgba(245,158,11,0.4)] ring-2 ring-amber-950/20"><span className="opacity-70 uppercase tracking-tighter">{t.incangold_left}</span><span>{gems}</span><span className="text-sm">💎</span></motion.div>}</div>
                        </motion.div>
                        );
                    })}
                </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none z-20">
             <div className="bg-black/80 backdrop-blur-xl px-8 py-6 rounded-[2.5rem] border-2 border-amber-900/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[450px]"><p className="text-amber-500/40 text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center italic">{t.incangold_threat_level}</p><div className="flex justify-around gap-6">{["Serpent", "Scorpion", "Rockfall", "Gas", "Explosion"].map(type => { const foundCount = board.path.filter(id => id.includes(type)).length; return (<div key={type} className={`relative group flex flex-col items-center gap-2 transition-all duration-700 ${foundCount > 0 ? 'scale-110' : 'opacity-20 grayscale'}`}><div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-700 ${foundCount >= 2 ? 'bg-red-600 border-white text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]' : (foundCount === 1 ? 'bg-red-950/40 border-red-500/50 text-red-500' : 'bg-white/5 border-white/5')}`}>{type === "Serpent" && "🐍"}{type === "Scorpion" && "🦂"}{type === "Rockfall" && "🪨"}{type === "Gas" && "💨"}{type === "Explosion" && "💥"}</div>{foundCount > 0 && <span className={`text-[10px] font-black uppercase tracking-tighter ${foundCount >= 2 ? 'text-red-400' : 'text-slate-500'}`}>{foundCount}/2</span>}</div>); })}</div></div>
             <div className="flex flex-col gap-4">
                {board.artifactsOnPath.length > 0 && (
                    <div className="bg-amber-400 text-amber-950 px-6 py-2 rounded-2xl font-black text-xs animate-bounce border-4 border-amber-600 shadow-xl flex items-center gap-2">
                        <span>🏺</span>
                        <span>{board.artifactsOnPath.length} ARTIFACTS ON PATH</span>
                    </div>
                )}
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="bg-gradient-to-b from-amber-300 to-amber-600 text-amber-950 px-8 py-4 rounded-[2rem] shadow-[0_15px_40px_rgba(245,158,11,0.3)] flex items-center gap-4 ring-4 ring-amber-900/30 border-t-2 border-amber-100/50"><span className="text-4xl">💎</span><div className="flex flex-col leading-none"><span className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] italic mb-1">{t.incangold_path_gems}</span><span className="text-5xl font-black tracking-tighter tabular-nums">{totalPathGems}</span></div></motion.div>
             </div>
          </div>
        </div>

        {/* ADVENTURER BAR - Stepped Stone Style */}
        <div className="h-[280px] bg-gradient-to-b from-[#1a0f00] to-black rounded-[3rem] border-4 border-amber-900/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center p-8 gap-6 overflow-x-auto custom-scrollbar-h relative">
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] pointer-events-none" />
           {players.map((p) => {
              const state = p.state as any;
              const isInCave = state.status === "IN_TEMPLE";
              const roundResults = board.roundHistory?.[board.roundHistory.length - 1]?.playerResults?.[p._id];
              const crashed = roundResults?.status === "CRASHED" && board.phase === "ROUND_RESULTS";
              const hasDecided = board.decisions[p._id];
              const choiceRevealed = board.phase === "VOTE_REVEAL" || board.phase === "ROUND_RESULTS";
              const choice = board.decisions[p._id];

              return (
                <motion.div key={p._id} layout className={`min-w-[210px] h-full rounded-[2.5rem] border-2 flex flex-col p-5 transition-all duration-700 relative overflow-hidden group ${hasDecided && !choiceRevealed ? "border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] bg-amber-500/10" : isInCave ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "bg-[#0a0500]/60 border-white/5 opacity-50"}`}>
                   {hasDecided && !choiceRevealed && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-shimmer" />}
                   <div className="flex items-center justify-between mb-3 z-10 relative text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-black/50 border-2 border-white/5 shadow-inner transition-transform duration-500 ${isInCave ? "animate-bounce-subtle" : "scale-90 opacity-60"}`}>{choiceRevealed ? (choice === "LEAVE" ? "⛺" : "🤠") : (isInCave ? "🤠" : "⛺")}</div>
                        <div className="flex flex-col min-w-0"><span className={`text-[11px] font-black uppercase tracking-tight truncate ${isInCave ? 'text-emerald-400' : 'text-slate-400'}`}>{p.name}</span><div className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${isInCave ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} /><span className="text-[7px] font-bold opacity-40 uppercase tracking-widest truncate">{isInCave ? t.incangold_in_the_cave : t.incangold_at_base_camp}</span></div></div>
                      </div>
                      <div className="flex items-center gap-2">
                        {board.phase === "DECISION_PHASE" && isInCave && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${hasDecided ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-slate-800/50 border-slate-700'}`}>{hasDecided && <motion.span initial={{ y: 5 }} animate={{ y: 0 }} className="text-white text-xs">✓</motion.span>}</motion.div>)}
                        {choiceRevealed && isInCave && (<motion.div initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${choice === "LEAVE" ? "bg-amber-500 text-amber-950 border-t border-amber-300/50" : "bg-emerald-500 text-emerald-950 border-t border-emerald-300/50"}`}>{choice === "LEAVE" ? 'Camp' : 'Torch'}</motion.div>)}
                      </div>
                   </div>
                   <div className="flex-1 flex flex-col justify-end gap-2 z-10 relative">
                      <div className={`flex justify-between items-center bg-black/60 px-3.5 py-2 rounded-xl border border-white/5 transition-all ${isInCave ? 'border-amber-500/20' : 'opacity-40'}`}><span className="text-[8px] font-black text-amber-500/50 uppercase italic tracking-wider">{t.incangold_in_hand}</span><div className="flex items-center gap-1.5"><span className={`text-base font-black tabular-nums ${crashed ? 'text-red-500 line-through opacity-50' : 'text-amber-400'}`}>{state.gemsThisRound}</span><span className="text-[10px]">💎</span></div></div>
                      <div className="bg-gradient-to-br from-emerald-500/10 to-transparent px-4 py-3 rounded-[1.5rem] border-2 border-emerald-500/20 shadow-inner group-hover:border-emerald-500/40 transition-all flex flex-col relative overflow-hidden">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-emerald-500/60 uppercase italic tracking-widest">Tent Total</span>
                            <span className="text-xs">🏕️</span>
                         </div>
                         <div className="text-4xl font-black text-emerald-400 tabular-nums text-center leading-none tracking-tighter">{state.bankedScore}</div>
                         {state.artifacts > 0 && (
                             <div className="absolute bottom-1 right-2 flex items-center gap-0.5">
                                 <span className="text-[10px]">🏺</span>
                                 <span className="text-[10px] font-black text-amber-50">{state.artifacts}</span>
                             </div>
                         )}
                      </div>
                   </div>
                   {crashed && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-950/90 rounded-[2rem] flex flex-col items-center justify-center text-white backdrop-blur-[1px] z-20 border-2 border-red-500/50"><span className="text-4xl mb-1 drop-shadow-lg">💀</span><span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-red-100">{formatLog(t.incangold_lost_gems, { n: roundResults.lost })}</span></motion.div>)}
                </motion.div>
              );
           })}
        </div>
      </div>

      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/98 z-[60] p-16 overflow-y-auto backdrop-blur-2xl flex items-center justify-center">
             <div className="max-w-5xl w-full bg-[#1a0f00] border-8 border-amber-900/40 rounded-[4rem] p-16 relative shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] pointer-events-none" />
                <div className="flex justify-between items-center mb-16 relative z-10"><div className="flex items-center gap-6"><span className="text-6xl text-amber-500">☀️</span><h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 tracking-tighter italic uppercase leading-none">{t.incangold_rules_title}</h2></div><button onClick={() => setShowRules(false)} className="bg-amber-900/20 hover:bg-amber-500 hover:text-amber-950 text-amber-500 w-16 h-14 rounded-2xl transition-all text-4xl flex items-center justify-center font-black">×</button></div>
                <div className="grid grid-cols-2 gap-16 text-slate-300 leading-relaxed relative z-10"><section className="space-y-10"><div className="bg-white/5 p-8 rounded-[2.5rem] border-l-4 border-amber-500/40"><h4 className="text-amber-400 text-2xl font-black uppercase tracking-widest mb-4 italic">{t.incangold_goal_title}</h4><p className="text-lg opacity-80">{t.incangold_goal_desc}</p></div><div className="bg-white/5 p-8 rounded-[2.5rem] border-l-4 border-amber-500/40"><h4 className="text-amber-400 text-2xl font-black uppercase tracking-widest mb-4 italic">{t.incangold_gems_rules_title}</h4><p className="text-lg opacity-80">{t.incangold_gems_rules_desc}</p></div><div className="bg-red-500/5 p-8 rounded-[2.5rem] border-l-4 border-red-500/40"><h4 className="text-red-400 text-2xl font-black uppercase tracking-widest mb-4 italic">{t.incangold_dangers_rules_title}</h4><p className="text-lg opacity-80">{t.incangold_dangers_rules_desc}</p></div></section><section className="space-y-10"><div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border-l-4 border-emerald-500/40"><h4 className="text-emerald-400 text-2xl font-black uppercase tracking-widest mb-4 italic">{t.incangold_dilemma_rules_title}</h4><p className="text-lg opacity-80">{t.incangold_dilemma_rules_desc}</p></div><div className="bg-white/5 p-8 rounded-[2.5rem] border-l-4 border-amber-500/40"><h4 className="text-amber-400 text-2xl font-black uppercase tracking-widest mb-4 italic">{t.incangold_leaving_rules_title}</h4><p className="text-lg opacity-80">{t.incangold_leaving_rules_desc}</p></div><div className="bg-white/5 p-8 rounded-[2.5rem] border-l-4 border-amber-500/40"><h4 className="text-amber-400 text-2xl font-black uppercase tracking-widest mb-4 italic">{t.incangold_safety_rules_title}</h4><p className="text-lg opacity-80">{t.incangold_safety_rules_desc}</p></div></section></div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;700;900&display=swap');
        .font-serif { font-family: 'Cinzel', serif; }
        h1, h2, h3, h4, button { font-family: 'Cinzel Decorative', cursive; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar-h::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar-h::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        @keyframes rotate-infinite { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        .rotate-infinite { animation: rotate-infinite 60s linear infinite; }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default IncanGoldBoard;
