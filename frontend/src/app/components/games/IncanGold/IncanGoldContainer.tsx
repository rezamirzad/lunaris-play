"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog, toPersianDigits } from "@/lib/translations";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadeStatusPanel from "../../arcade/ArcadeStatusPanel";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";
import MissionBriefing from "../../arcade/MissionBriefing";
import ArcadeVictoryOverlay from "../../arcade/ArcadeVictoryOverlay";
import AITelemetryLog from "../../arcade/AITelemetryLog";
import RulesModal from "../../shared/RulesModal";
import { useAdmin } from "@/app/admin/AdminGateway";

const IncanGoldBoard: React.FC<BoardProps> = ({ roomId, roomData, history = [] }) => {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const { isAdmin, adminPassword } = useAdmin();
  const incanApi = (api as any).incangold;

  const drawCard = useMutation(incanApi.drawCard);
  const nextRound = useMutation(incanApi.nextRound);
  const startDecision = useMutation(incanApi.startDecision);
  const finishVoteReveal = useMutation(incanApi.finishVoteReveal);
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);

  const [showRules, setShowRules] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);

  const board = roomData.gameBoard;
  if (board.gameType !== "incangold") return null;

  const isLobby = roomData.status?.toUpperCase() === "LOBBY";
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.incangold_title}
        subtitle={t.lobbyInitiation}
        briefingTitle={t.incangold_briefing_title}
        briefingDesc={t.incangold_briefing_desc}
        loadingText={t.incangold_waiting_sync}
        accentColor="amber"
        background={<div className="neuro-grid opacity-20" />}
        room={roomData}
        players={roomData.players}
      />
    );
  }

  const isFinished = roomData.status?.toUpperCase() === "FINISHED";
  const winnerPlayer = roomData.players.find(p => board.winnerId ? String(p._id) === String(board.winnerId) : false);
  const winnerName = board.winner || winnerPlayer?.name;

  const totalPathGems = Object.values((board.cardGems as Record<string, number>) || {}).reduce((a, b) => a + b, 0);

  // 1. Calculate Crash Probability for UI
  const hazardTypesOnPath = new Set<string>();
  board.path.forEach((id: string) => {
    if (id.startsWith("H_")) {
      const type = id.split("_")[1];
      hazardTypesOnPath.add(type);
    }
  });

  let lethalCardsInDeck = 0;
  hazardTypesOnPath.forEach(type => {
    const countOnPath = board.path.filter((id: string) => id.includes(type)).length;
    if (countOnPath === 1) lethalCardsInDeck += 2;
  });

  const cardsLeft = board.deck.length || 1;
  const crashProb = Math.min(100, Math.round((lethalCardsInDeck / cardsLeft) * 100));

  const getHazardEmoji = (id: string) => {
    if (id.includes("Serpent")) return "🐍";
    if (id.includes("Scorpion")) return "🦂";
    if (id.includes("Rockfall")) return "🪨";
    if (id.includes("Gas")) return "💨";
    if (id.includes("Explosion")) return "💥";
    return "⚠️";
  };

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#050300] text-amber-50 font-mono"
      background={<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#4a2c00_0%,_transparent_70%)]" />}
      extra={
        <>
          <AITelemetryLog players={roomData.players} />
          <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameType="incangold" />
        </>
      }
      header={
        <ArcadeHUD
          title={t.incangold_title_alt}
          statusLabel={formatLog(t.incangold_round, { round: isFA ? toPersianDigits(board.currentRound) : board.currentRound })}
          badgeContent={board.phase === "DECISION_PHASE" ? "VOTING ACTIVE" : t.statusLive}
          accentColor="amber"
          onHaltToggle={isAdmin && adminPassword ? () => toggleHaltMutation({ roomId: roomId as any, adminPassword }) : undefined}
          isHalted={roomData.botsHalted}
          onRulesClick={() => setShowRules(true)}
        />
      }
      main={
        <div className="grid grid-cols-12 gap-8 h-full">
          {/* LEFT: THREAT MONITOR */}
          <div className="col-span-3 space-y-6">
            <div className="bg-black/60 border border-amber-900/30 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
               <div 
                 className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all duration-1000" 
                 style={{ width: `${crashProb}%` }} 
               />
              <h3 className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.4em] mb-4 text-center italic">
                {t.incangold_threat_level}
              </h3>
              
              <div className="flex flex-col items-center mb-6">
                 <span className={`text-4xl font-black italic ${crashProb > 50 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
                    {isFA ? toPersianDigits(crashProb) : crashProb}%
                 </span>
                 <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                    Risk Index
                 </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {["Serpent", "Scorpion", "Rockfall", "Gas", "Explosion"].map(type => {
                  const count = board.path.filter((id: string) => id.includes(type)).length;
                  return (
                    <div key={type} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${count > 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/5 opacity-30"}`}>
                      <span className="text-2xl">{getHazardEmoji(type)}</span>
                      <div className="flex-1">
                        <div className="text-[8px] font-black uppercase text-zinc-500">{type}</div>
                        <div className="flex gap-1 mt-1">
                          {[1, 2].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${count >= i ? "bg-red-500" : "bg-zinc-800"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 rounded-[2rem] p-6 text-center">
                <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest block mb-2">{t.incangold_path_gems}</span>
                <div className="text-6xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    {isFA ? toPersianDigits(totalPathGems) : totalPathGems}<span className="text-2xl ml-2">💎</span>
                </div>
            </div>
          </div>

          {/* CENTER: THE EXPEDITION PATH */}
          <div className="col-span-6 relative flex flex-col items-center justify-center bg-black/40 rounded-[3rem] border border-white/5 shadow-inner overflow-hidden">
            <div className="absolute inset-0 neuro-grid opacity-10 pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {board.phase === "ROUND_INTRO" && (
                <motion.div key="intro" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="text-center z-10">
                  <h2 className="text-8xl font-black text-amber-500 italic uppercase tracking-tighter mb-4">ROUND {isFA ? toPersianDigits(board.currentRound) : board.currentRound}</h2>
                  <p className="text-amber-200/40 text-xl font-black uppercase tracking-[0.5em] italic">Preparing Expedition...</p>
                </motion.div>
              )}

              {board.phase === "EXPEDITION_PHASE" && (
                <motion.div key="expedition" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 z-10 w-full max-w-2xl px-8">
                   <div className="flex flex-wrap justify-center gap-4">
                      {board.path.map((cardId: string, i: number) => (
                        <motion.div 
                          key={`${cardId}-${i}`}
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className={`w-24 h-32 rounded-xl border-2 flex items-center justify-center text-3xl shadow-2xl relative ${cardId.startsWith("H_") ? "bg-red-950/40 border-red-500/40" : cardId.startsWith("A_") ? "bg-amber-500/20 border-amber-400/50" : "bg-zinc-900 border-white/10"}`}
                        >
                           {cardId.startsWith("T_") ? "💎" : cardId.startsWith("A_") ? "🏺" : getHazardEmoji(cardId)}
                           {board.cardGems[i] > 0 && (
                             <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg">
                               {board.cardGems[i]}
                             </div>
                           )}
                        </motion.div>
                      ))}
                      <div className="w-24 h-32 rounded-xl border-4 border-dashed border-white/5 flex items-center justify-center text-zinc-800 text-4xl italic font-black">?</div>
                   </div>

                   {isAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,158,11,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => drawCard({ roomId: roomId as any })}
                        className="bg-amber-500 text-black px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl transition-all"
                      >
                         DRAW NEXT CARD
                      </motion.button>
                   )}
                </motion.div>
              )}

              {board.phase === "DECISION_PHASE" && (
                <motion.div key="decision" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-10 z-10">
                   <div className="flex flex-col items-center gap-4">
                      <div className="text-[12rem] animate-bounce">🏺</div>
                      <h2 className="text-5xl font-black text-amber-500 italic uppercase tracking-tighter">THE DILEMMA</h2>
                      <p className="text-zinc-500 font-bold uppercase tracking-[0.4em]">Players are deciding their fate...</p>
                   </div>
                   
                   <div className="flex gap-4">
                      {roomData.players.filter(p => (p.state as any).status === "IN_TEMPLE").map(p => (
                        <div key={p._id} className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${board.decisions[p._id] ? "bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-black/40 border-white/10"}`}>
                           <span className="text-white font-black">{p.name[0].toUpperCase()}</span>
                        </div>
                      ))}
                   </div>

                   {isAdmin && (
                      <button onClick={() => startDecision({ roomId: roomId as any })} className="text-[10px] text-zinc-600 uppercase font-black tracking-widest hover:text-amber-500 transition-colors">Force Reveal</button>
                   )}
                </motion.div>
              )}

              {board.phase === "VOTE_REVEAL" && (
                 <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12 z-10">
                    <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">CHOICES REVEALED</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                       {roomData.players.map(p => {
                          const choice = board.decisions[p._id];
                          if (!choice) return null;
                          return (
                            <motion.div key={p._id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4">
                               <div className={`w-32 h-32 rounded-3xl border-4 flex flex-col items-center justify-center gap-2 shadow-2xl ${choice === "STAY" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-rose-500/20 border-rose-500 text-rose-400"}`}>
                                  <span className="text-5xl">{choice === "STAY" ? "🤠" : "🏃‍♂️"}</span>
                                  <span className="font-black text-[10px] uppercase tracking-widest">{choice}</span>
                               </div>
                               <span className="font-black uppercase italic text-sm">{p.name}</span>
                            </motion.div>
                          );
                       })}
                    </div>
                    {isAdmin && (
                       <button onClick={() => finishVoteReveal({ roomId: roomId as any })} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase italic tracking-widest shadow-2xl transition-all">Proceed</button>
                    )}
                 </motion.div>
              )}

              {board.phase === "ROUND_RESULTS" && (
                 <motion.div key="results" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-8 z-10 text-center">
                    <span className="text-9xl">🏛️</span>
                    <h2 className="text-7xl font-black text-amber-500 italic uppercase tracking-tighter">EXPEDITION COMPLETE</h2>
                    {isAdmin && (
                       <button onClick={() => nextRound({ roomId: roomId as any })} className="bg-amber-500 text-black px-16 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl">Start Next Round</button>
                    )}
                 </motion.div>
              )}
            </AnimatePresence>

            {isFinished && (
              <ArcadeVictoryOverlay
                winnerName={winnerName}
                championLabel={t.champion}
                accentColor="amber"
              />
            )}
          </div>

          {/* RIGHT: SYSTEM STATUS */}
          <div className="col-span-3 flex flex-col h-full gap-6">
             <ArcadeStatusPanel
              title="Temple Telemetry"
              protocolLabel="Excavation Unit"
              protocolValue="Secure Uplink"
              accentColor="amber"
              rows={[
                { label: "Vault Depth", value: `${board.currentRound} / 5` },
                { label: "Hazard Level", value: crashProb > 40 ? "HIGH" : "NOMINAL", valueColor: crashProb > 40 ? "text-rose-500" : "text-emerald-500" },
                { label: "Artifacts on Path", value: board.artifactsOnPath.length },
              ]}
            />
          </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={roomData.players}
          isGameEnd={isFinished}
          accentColor="amber"
          renderStats={(player) => {
            const pState = player.state as any;
            return (
              <div className="flex flex-col gap-4 w-full">
                 <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest">In Hand</span>
                    <span className="text-xl font-black text-amber-400 tabular-nums">{isFA ? toPersianDigits(pState.gemsThisRound) : pState.gemsThisRound} 💎</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Banked</span>
                    <span className="text-xl font-black text-emerald-400 tabular-nums">{isFA ? toPersianDigits(pState.bankedScore) : pState.bankedScore} ⛺</span>
                 </div>
              </div>
            );
          }}
          renderBadge={(player) => {
             const pState = player.state as any;
             if (pState.status === "AT_CAMP") return (
               <div className="bg-zinc-800 text-zinc-400 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter flex items-center gap-1 shadow-lg ring-1 ring-white/10">
                 <span>⛺</span> AT_CAMP
               </div>
             );
             return null;
          }}
        />
      }
    />
  );
};

export default IncanGoldBoard;
