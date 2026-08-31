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

  const getTreasureValue = (id: string): number | null => {
    if (!id.startsWith("T_")) return null;
    const match = id.match(/^T_(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const renderPathCard = (cardId: string, i: number) => {
    const isTreasure = cardId.startsWith("T_");
    const isArtifact = cardId.startsWith("A_");
    const isHazard = cardId.startsWith("H_");
    const treasureVal = getTreasureValue(cardId);
    const cardGemsMap = (board.cardGems || {}) as Record<string | number, number>;
    const leftoverGems = cardGemsMap[i] ?? cardGemsMap[String(i)] ?? 0;

    return (
      <motion.div 
        key={`${cardId}-${i}`}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        className={`w-24 h-32 rounded-2xl border-2 flex flex-col items-center justify-between p-2 shadow-2xl relative select-none ${
          isHazard 
            ? "bg-red-950/60 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
            : isArtifact 
              ? "bg-amber-500/20 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
              : "bg-zinc-900/90 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        }`}
      >
        {isTreasure ? (
          <>
            <div className="w-full flex items-center justify-between text-[8px] font-black text-amber-400/70 border-b border-amber-500/20 pb-1">
              <span>💎</span>
              <span className="tracking-tighter">VALUE</span>
            </div>

            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-3xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] font-mono leading-none">
                {treasureVal ?? "?"}
              </span>
              <span className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest mt-1">
                GEMS
              </span>
            </div>

            {leftoverGems > 0 ? (
              <div className="w-full bg-amber-500 text-black font-black text-[9px] py-0.5 rounded-md text-center shadow-lg uppercase tracking-tight">
                LEFT: {leftoverGems} 💎
              </div>
            ) : (
              <div className="w-full bg-black/40 text-zinc-500 font-black text-[7px] py-0.5 rounded-md text-center uppercase tracking-tighter border border-white/5">
                0 LEFT
              </div>
            )}
          </>
        ) : isArtifact ? (
          <>
            <div className="w-full flex items-center justify-between text-[8px] font-black text-amber-400/70 border-b border-amber-500/20 pb-1">
              <span>🏺</span>
              <span className="tracking-tighter">RELIC</span>
            </div>
            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-3xl">🏺</span>
            </div>
            <div className="w-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[8px] py-0.5 rounded-md text-center uppercase tracking-tighter">
              ARTIFACT
            </div>
          </>
        ) : (
          <>
            <div className="w-full flex items-center justify-between text-[8px] font-black text-red-400/70 border-b border-red-500/20 pb-1">
              <span>⚠️</span>
              <span className="tracking-tighter">DANGER</span>
            </div>
            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-3xl">{getHazardEmoji(cardId)}</span>
            </div>
            <div className="w-full bg-red-500/20 text-red-400 border border-red-500/30 font-black text-[8px] py-0.5 rounded-md text-center uppercase tracking-tighter">
              HAZARD
            </div>
          </>
        )}
      </motion.div>
    );
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
          audioSrc="/assets/games/incangold/audio/ambience_cave_00.wav"
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

            <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/30 rounded-[2rem] p-6 text-center space-y-4 shadow-xl">
                <div>
                    <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest block mb-1">{t.incangold_path_treasures}</span>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                            {isFA ? toPersianDigits(totalPathGems) : totalPathGems}
                        </span>
                        <span className="text-2xl">💎</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-amber-500/20">
                    <span className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest block mb-2">
                        {t.incangold_artifacts_on_path}
                    </span>
                    {board.artifactsOnPath && board.artifactsOnPath.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {board.artifactsOnPath.map((artId: string, idx: number) => (
                                <div key={idx} className="bg-amber-500/20 border border-amber-400/50 rounded-xl px-2.5 py-1 text-amber-300 font-black text-[10px] flex items-center gap-1 shadow-md">
                                    <span>🏺</span>
                                    <span>Relic #{artId.split("_")[1] || idx + 1}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold text-zinc-500 italic uppercase tracking-wider">
                            0 Relics
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* CENTER: THE EXPEDITION PATH */}
          <div className="col-span-6 relative flex flex-col items-center justify-center bg-black/40 rounded-[3rem] border border-white/5 shadow-inner overflow-hidden p-6">
            <div className="absolute inset-0 neuro-grid opacity-10 pointer-events-none" />

            {/* CARD REVEAL GEMS ADDED INFORMATION DISPLAY */}
            {board.lastEvent?.type === "TREASURE" && (board.phase === "REVEAL_PHASE" || board.phase === "EXPEDITION_PHASE" || board.phase === "DECISION_PHASE") && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-xl bg-amber-950/80 border border-amber-500/40 rounded-2xl p-4 mb-4 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md z-20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-bounce">💎</span>
                  <div className="text-left">
                    <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      {formatLog(t.incangold_gems_added_per_player, { 
                        n: isFA ? toPersianDigits(board.lastEvent.sharePerPlayer) : board.lastEvent.sharePerPlayer 
                      })}
                    </div>
                    <div className="text-[10px] font-bold text-amber-200/80 mt-0.5">
                      {formatLog(t.incangold_gems_added_desc, {
                        val: isFA ? toPersianDigits(board.lastEvent.value) : board.lastEvent.value,
                        count: isFA ? toPersianDigits(board.lastEvent.activePlayersCount) : board.lastEvent.activePlayersCount,
                        share: isFA ? toPersianDigits(board.lastEvent.sharePerPlayer) : board.lastEvent.sharePerPlayer,
                        rem: isFA ? toPersianDigits(board.lastEvent.remainder) : board.lastEvent.remainder,
                      })}
                    </div>
                  </div>
                </div>
                {board.lastEvent.remainder > 0 && (
                  <div className="bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 text-[10px] font-black text-amber-300 whitespace-nowrap">
                    +{isFA ? toPersianDigits(board.lastEvent.remainder) : board.lastEvent.remainder} 💎 {t.incangold_left}
                  </div>
                )}
              </motion.div>
            )}
            
            <AnimatePresence mode="wait">
              {board.phase === "ROUND_INTRO" && (
                <motion.div key="intro" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="text-center z-10">
                  <h2 className="text-8xl font-black text-amber-500 italic uppercase tracking-tighter mb-4">ROUND {isFA ? toPersianDigits(board.currentRound) : board.currentRound}</h2>
                  <p className="text-amber-200/40 text-xl font-black uppercase tracking-[0.5em] italic">Preparing Expedition...</p>
                   {isAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,158,11,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => drawCard({ roomId: roomId as any })}
                        className="mt-8 bg-amber-500 text-black px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl transition-all"
                      >
                         START EXPEDITION
                      </motion.button>
                   )}
                </motion.div>
              )}

               {board.phase === "REVEAL_PHASE" && (
                <motion.div key="reveal-phase" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 z-10 w-full max-w-2xl px-8">
                   <div className="flex flex-wrap justify-center gap-4">
                      {board.path.map((cardId: string, i: number) => renderPathCard(cardId, i))}
                      <div className="w-24 h-32 rounded-xl border-4 border-dashed border-amber-500/50 flex items-center justify-center text-amber-500 text-4xl italic font-black animate-pulse">!</div>
                   </div>

                   {isAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(245,158,11,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startDecision({ roomId: roomId as any })}
                        className="bg-amber-500 text-black px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl transition-all"
                      >
                         START DECISION PHASE
                      </motion.button>
                   )}
                </motion.div>
              )}

              {board.phase === "EXPEDITION_PHASE" && (
                <motion.div key="expedition" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 z-10 w-full max-w-2xl px-8">
                   <div className="flex flex-wrap justify-center gap-4">
                      {board.path.map((cardId: string, i: number) => renderPathCard(cardId, i))}
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
                <motion.div key="decision" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6 z-10">
                   {board.path.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-4 max-w-2xl px-4">
                        {board.path.map((cardId: string, i: number) => renderPathCard(cardId, i))}
                      </div>
                   )}
                   <div className="flex flex-col items-center gap-2">
                      <h2 className="text-4xl font-black text-amber-500 italic uppercase tracking-tighter">THE DILEMMA</h2>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em]">Players are deciding their fate...</p>
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
                 <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 z-10 w-full max-w-2xl">
                    <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">CHOICES REVEALED</h2>
                    
                    {/* LEAVING PLAYERS BANKING BREAKDOWN DISPLAY */}
                    {board.lastEvent?.type === "LEAVE" && board.lastEvent.leavingPlayers && board.lastEvent.leavingPlayers.length > 0 && (
                      <div className="w-full bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 shadow-xl text-center space-y-2 backdrop-blur-md">
                        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                          RETREAT & BANKING SUMMARY
                        </h4>
                        <div className="flex flex-col gap-2">
                          {board.lastEvent.leavingPlayers.map((lp: any) => (
                            <div key={lp.playerId} className="text-xs font-bold text-slate-200 flex justify-between items-center bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                              <span className="font-black text-emerald-300">{lp.playerName}</span>
                              <span className="text-emerald-400 font-mono font-black">
                                +{isFA ? toPersianDigits(lp.totalBanked) : lp.totalBanked} 💎
                                <span className="text-[9px] text-zinc-400 font-normal ml-2">
                                  ({isFA ? toPersianDigits(lp.hand) : lp.hand} {t.incangold_from_hand}, {isFA ? toPersianDigits(lp.path) : lp.path} {t.incangold_from_path}{lp.artifactPoints > 0 ? `, +${lp.artifactPoints} pts artifact` : ""})
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-6">
                       {roomData.players.map(p => {
                          const choice = board.decisions[p._id];
                          if (!choice) return null;
                          const leaveDetail = board.lastEvent?.type === "LEAVE" 
                            ? board.lastEvent.leavingPlayers?.find((lp: any) => lp.playerId === p._id) 
                            : undefined;

                          return (
                            <motion.div key={p._id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3">
                               <div className={`w-32 h-32 rounded-3xl border-4 flex flex-col items-center justify-center gap-1 p-2 shadow-2xl ${choice === "STAY" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-rose-500/20 border-rose-500 text-rose-400"}`}>
                                  <span className="text-4xl">{choice === "STAY" ? "🤠" : "🏃‍♂️"}</span>
                                  <span className="font-black text-[10px] uppercase tracking-widest">{choice}</span>
                                  {choice === "LEAVE" && leaveDetail && (
                                    <div className="text-[9px] font-black text-emerald-300 text-center leading-tight">
                                      +{isFA ? toPersianDigits(leaveDetail.totalBanked) : leaveDetail.totalBanked} 💎
                                    </div>
                                  )}
                               </div>
                               <span className="font-black uppercase italic text-sm">{p.name}</span>
                            </motion.div>
                          );
                       })}
                    </div>
                    {isAdmin && (
                       <button onClick={() => finishVoteReveal({ roomId: roomId as any })} className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase italic tracking-widest shadow-2xl transition-all mt-4">Proceed</button>
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
            const gemsInHand = pState.status === "AT_CAMP" ? 0 : (pState.gemsThisRound || 0);
            return (
              <div className="flex flex-col gap-4 w-full">
                 <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest">{t.incangold_in_hand}</span>
                    <span className="text-xl font-black text-amber-400 tabular-nums">{isFA ? toPersianDigits(gemsInHand) : gemsInHand} 💎</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">{t.incangold_chest_total}</span>
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
