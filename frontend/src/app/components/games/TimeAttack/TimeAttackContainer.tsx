"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { BoardProps } from "../registry";
import PlayerCard from "../../shared/PlayerCard";
import MatchActivity from "../../shared/MatchActivity";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import { toPersianDigits, formatLog } from "@/lib/translations";
import { ROUNDS_CONFIG } from "convex/timeattackPlugin";
import MissionBriefing from "../../arcade/MissionBriefing";
import ArcadeVictoryOverlay from "../../arcade/ArcadeVictoryOverlay";
import AITelemetryLog from "../../arcade/AITelemetryLog";
import RulesModal from "../../shared/RulesModal";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadeStatusPanel from "../../arcade/ArcadeStatusPanel";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";
import { useAdmin } from "@/app/admin/AdminGateway";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

export default function TimeAttackContainer({ roomId, roomData, history = [] }: BoardProps) {
  const { t, lang } = useTranslation();
  const { isAdmin, adminPassword } = useAdmin();
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);
  const isFA = lang === "fa";

  const board =
    roomData.gameBoard.gameType === "timeattack" ? roomData.gameBoard : null;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";
  const players = roomData.players;

  const nextPhase = useMutation(api.timeattack.nextPhase);
  const [showRules, setShowRules] = useState(false);

  // 1. LOBBY MISSION BRIEFING
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.timeattack_title}
        subtitle={t.timeattack_syncing_oscillators}
        briefingTitle={t.timeattack_briefing_title}
        briefingDesc={t.timeattack_briefing_desc}
        loadingText={t.timeattack_neural_link_readiness}
        accentColor="rose"
        background={
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#e11d48_0%,_transparent_70%)]" />
        }
        room={roomData}
        players={players}
      />
    );
  }

  if (!board) return null;

  const isFinished = roomData.status?.toUpperCase() === "FINISHED" || roomData.status?.toUpperCase() === "ARCHIVED";

  const currentRoundConfig = ROUNDS_CONFIG[board.currentRound];

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#050101] text-rose-100 font-mono"
      background={
        <>
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="neuro-grid opacity-10" />
        </>
      }
      extra={
        <>
          <AITelemetryLog players={roomData.players} />
          <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameType="timeattack" />
        </>
      }
      header={
        <ArcadeHUD
          title={t.timeattack_title}
          statusLabel={formatLog(t.timeattack_round_protocol, { round: isFA ? toPersianDigits(board.currentRound) : board.currentRound }, lang)}
          badgeContent={board.phase === "ROUND_REVEAL" ? t.timeattack_round_victor : t.statusLive}
          accentColor="rose"
          onHaltToggle={isAdmin && adminPassword ? () => toggleHaltMutation({ roomId: roomId as any, adminPassword }) : undefined}
          isHalted={roomData.botsHalted}
          onRulesClick={() => setShowRules(true)}
        />
      }
      main={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
           {/* LEFT: DATA STREAM */}
           <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
             <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-6 overflow-hidden flex flex-col shadow-2xl relative">
                <h3 className="text-[8px] font-black text-rose-500/60 uppercase tracking-[0.4em] mb-4 shrink-0">
                   {t.timeattack_extraction_sequences}
                </h3>
                <div className="flex-1 min-h-0">
                   <MatchActivity 
                     history={history}
                     renderLog={(log) => (
                        <div className="flex items-center gap-2">
                           <span className="text-rose-500/50">›</span>
                           <span className={log.key.includes("VICTORY") ? "text-rose-400 font-black italic" : "text-zinc-500"}>
                              {t[log.key as keyof typeof t] ? formatLog(t[log.key as keyof typeof t] as string, log.data, lang) : log.key}
                           </span>
                        </div>
                     )}
                   />
                </div>
             </div>
           </div>

           {/* CENTER: PRIMARY PULSE AREA */}
           <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-rose-500/5 rounded-[3rem] border border-rose-500/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f43f5e_0%,_transparent_70%)] opacity-[0.03] pointer-events-none" />

              <AnimatePresence mode="wait">
                 {board.phase === "ROUND_INTRO" ? (
                    <motion.div 
                      key="intro" 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center text-center max-w-xl w-full"
                    >
                       <div className="flex items-center gap-6 mb-8">
                          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                             <span className="text-3xl">
                                {currentRoundConfig?.scoring === "SURVIVAL" ? "☢️" : 
                                 currentRoundConfig?.visuals === "DISTRACTED" ? "🌀" : "🎯"}
                             </span>
                          </div>
                          <div className="flex flex-col items-start">
                             <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">
                                {currentRoundConfig?.scoring === "SURVIVAL" ? t.timeattack_survival_protocol : t.timeattack_precision_uplink}
                             </span>
                             <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                                {t[currentRoundConfig?.nameKey as keyof typeof t] || currentRoundConfig?.nameKey}
                             </h2>
                          </div>
                       </div>

                       <div className="w-full bg-black/40 border border-white/5 rounded-[2rem] p-8 mb-10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <span className="text-6xl font-black italic">{(board.targetMs / 1000).toFixed(3)}s</span>
                          </div>
                          
                          <div className="relative z-10 space-y-6">
                             <div className="flex flex-col items-center gap-2">
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.6em]">{t.timeattack_target_interval}</span>
                                <span className="text-6xl font-black text-rose-500 italic drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                                   {isFA ? toPersianDigits((board.targetMs / 1000).toFixed(2)) : (board.targetMs / 1000).toFixed(2)}s
                                </span>
                             </div>

                             <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap px-4">
                                {t[currentRoundConfig?.descKey as keyof typeof t] || currentRoundConfig?.descKey}
                             </p>
                          </div>
                       </div>

                       {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(244,63,94,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nextPhase({ roomId: roomData._id })}
                            className="bg-white text-black px-16 py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl transition-all"
                          >
                             {t.timeattack_start_protocol || "START PROTOCOL"}
                          </motion.button>
                       )}
                    </motion.div>
                 ) : board.phase === "ACTIVE_PLAY" && board.serverStartTime === 0 ? (
                    <motion.div key="countdown" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                       <span className="text-[12rem] font-black text-rose-500 italic leading-none animate-pulse">
                          ⚠️
                       </span>
                       <span className="text-sm font-black text-rose-500/40 uppercase tracking-[1em] mt-8">{t.timeattack_calibrating}</span>
                    </motion.div>
                 ) : board.phase === "ACTIVE_PLAY" ? (
                    <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center w-full relative">
                       {/* 🎯 VISUAL OVERLAYS BASED ON CONFIG */}
                       {board.visuals === "DISTRACTED" && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem]">
                             <motion.div 
                               animate={{ 
                                 opacity: [0, 0.2, 0, 0.4, 0],
                                 backgroundColor: ["#f43f5e", "transparent", "#3b82f6", "transparent", "#10b981"]
                               }}
                               transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                               className="absolute inset-0 z-0"
                             />
                             <div className="scanline opacity-30" />
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20" />
                          </div>
                       )}

                       {board.visuals === "FULL" && board.currentRound === 1 && (
                          <div className="mb-12">
                             <motion.div 
                               initial={{ opacity: 1 }}
                               animate={{ opacity: 0 }}
                               transition={{ delay: 2, duration: 1 }}
                               className="flex flex-col items-center"
                             >
                                <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.5em] mb-4">{t.timeattack_calibration_uplink}</span>
                                <div className="flex gap-4">
                                   {[...Array(5)].map((_, i) => (
                                      <motion.div 
                                        key={i}
                                        initial={{ scale: 0.8, opacity: 0.3 }}
                                        animate={{ scale: 1.2, opacity: 1 }}
                                        transition={{ duration: 1, delay: i, repeat: Infinity }}
                                        className="w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                                      />
                                   ))}
                                </div>
                             </motion.div>
                          </div>
                       )}

                       {board.visuals === "BLIND" && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-[-1] rounded-[3rem] transition-opacity duration-1000" />
                       )}

                       {/* 📡 CORE TRANSMISSION ANIMATION */}
                       <div className="w-64 h-64 rounded-full border-4 border-rose-500/20 flex items-center justify-center relative mb-12 z-10">
                          <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping" />
                          <div className="w-48 h-48 rounded-full border border-rose-500/10 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                             <div className="w-1 h-24 bg-rose-500/40 origin-bottom" />
                          </div>
                          
                          {/* 🔢 GLITCHY COUNTER FOR DISTRACTED MODE */}
                          {board.visuals === "DISTRACTED" ? (
                             <motion.span 
                               animate={{ 
                                 scale: [1, 1.2, 0.9, 1.1],
                                 x: [0, 5, -5, 0]
                               }}
                               transition={{ duration: 0.1, repeat: Infinity }}
                               className="absolute text-5xl font-black text-rose-600/50 blur-[1px]"
                             >
                                ERR_707
                             </motion.span>
                          ) : (
                             <span className="absolute text-4xl font-black text-rose-500">{t.timeattack_transmitting}</span>
                          )}
                       </div>
                       
                       <h2 className="text-2xl font-black text-rose-400 tracking-[0.5em] uppercase italic mb-12 z-10">
                          {board.visuals === "BLIND" ? t.timeattack_sensory_deprivation : t.timeattack_eyes_on_phone}
                       </h2>

                       {/* 👤 PLAYER READINESS SLOTS */}
                       <div className="flex gap-4 z-10">
                          {players.map(p => {
                             const isDone = !!board.submissions[p._id];
                             return (
                                <div key={p._id} className="flex flex-col items-center gap-2">
                                   <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isDone ? 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,1)]' : 'bg-zinc-800'}`} />
                                   <span className={`text-[8px] font-black uppercase ${isDone ? 'text-teal-400' : 'text-zinc-600'}`}>{p.name}</span>
                                </div>
                             );
                          })}
                       </div>
                    </motion.div>
                 ) : board.phase === "ROUND_REVEAL" ? (
                    <motion.div key="results" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full max-w-2xl">
                       <span className="text-[6rem] mb-6">⚡</span>
                       <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-8">{t.timeattack_extraction_decrypted}</h2>
                       <div className="w-full bg-black/60 rounded-3xl border border-rose-500/20 p-8 space-y-6">
                          <div className="flex justify-between border-b border-white/5 pb-4">
                             <span className="text-zinc-500 font-black uppercase text-xs tracking-widest">{t.timeattack_target_duration}:</span>
                             <span className="text-rose-400 font-black text-2xl italic">{(board.targetMs / 1000).toFixed(3)}s</span>
                          </div>
                          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                             {Object.entries(board.submissions || {})
                                .sort(([,a], [,b]) => {
                                   const target = board.targetMs;
                                   const actualA = (a as any).actualMs || 0;
                                   const actualB = (b as any).actualMs || 0;
                                   return Math.abs(actualA - target) - Math.abs(actualB - target);
                                })
                                .map(([pid, sub], i) => {
                                   const p = players.find(player => player._id === pid);
                                   const actual = (sub as any).actualMs || 0;
                                   const variance = Math.abs(actual - board.targetMs);
                                   return (
                                      <div key={pid} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                         <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-zinc-600">{i + 1}</span>
                                            <span className="font-bold text-white uppercase text-sm">{p?.name}</span>
                                         </div>
                                         <div className="flex flex-col items-end">
                                            <span className="text-lg font-black text-rose-500 italic">{(actual / 1000).toFixed(3)}s</span>
                                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Δ {(variance / 1000).toFixed(3)}s</span>
                                         </div>
                                      </div>
                                   );
                                })}
                          </div>
                       </div>

                       {isAdmin && !isFinished && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(244,63,94,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nextPhase({ roomId: roomData._id })}
                            className="mt-8 bg-white text-black px-12 py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl"
                          >
                             {t.timeattack_next_sequence || "NEXT SEQUENCE"}
                          </motion.button>
                       )}
                    </motion.div>
                 ) : null}
              </AnimatePresence>

              {isFinished && (
                <ArcadeVictoryOverlay
                  winnerName={board.winner}
                  championLabel={t.timeattack_global_champion}
                  accentColor="rose"
                  icon="🏆"
                />
              )}
           </div>

           {/* RIGHT: SYSTEM HUD */}
           <div className="lg:col-span-3 flex flex-col h-full gap-6">
              <ArcadeStatusPanel
                protocolLabel={t.timeattack_objective_sequence}
                protocolValue={`${isFA ? toPersianDigits(board.currentRound) : board.currentRound} / ${isFA ? toPersianDigits(10) : 10}`}
                accentColor="rose"
                rows={[
                  { label: t.shared_status, value: board.phase },
                  { label: t.timeattack_transmission_locked, value: "ENCRYPTED", valueColor: "text-blue-400" },
                ]}
                title=""
              />

              <section className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-8 overflow-hidden flex flex-col">
                 <h3 className="text-[8px] font-black text-rose-500/60 uppercase tracking-[0.4em] mb-4 shrink-0">{t.timeattack_arcade_rankings}</h3>
                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {players
                      .sort((a, b) => (b.state.gameType === "timeattack" ? b.state.score || 0 : 0) - (a.state.gameType === "timeattack" ? a.state.score || 0 : 0))
                      .map((p, i) => (
                         <div key={p._id} className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] text-white font-black uppercase italic tracking-tighter">{i+1}. {p.name}</span>
                            <span className="text-[10px] font-black text-rose-500 tabular-nums">{p.state.gameType === "timeattack" ? p.state.score : 0}</span>
                         </div>
                      ))}
                 </div>
              </section>
           </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={players}
          currentTurnId={undefined}
          winnerId={board.winnerId}
          isGameEnd={isFinished}
          accentColor="rose"
          renderStats={(player) => {
            const hasSubmitted = board.submissions?.[player._id] !== undefined;
            return (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest">{t.shared_score}: {player.state.gameType === "timeattack" ? player.state.score : 0}</span>
                {hasSubmitted && board.phase === "ACTIVE_PLAY" && (
                  <span className="text-[8px] text-rose-400 font-black animate-pulse uppercase tracking-tighter italic">{t.timeattack_locked}</span>
                )}
              </div>
            );
          }}
        />
      }
    />
  );
}
