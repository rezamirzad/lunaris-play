"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { BoardProps } from "../registry";
import PlayerCard from "../../shared/PlayerCard";
import MatchActivity from "../../shared/MatchActivity";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import { toPersianDigits, formatLog } from "@/lib/translations";
import { ROUNDS_CONFIG } from "convex/timeattackPlugin";
import MissionBriefing from "../../arcade/MissionBriefing";
import ArcadeVictoryOverlay from "../../arcade/ArcadeVictoryOverlay";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadeStatusPanel from "../../arcade/ArcadeStatusPanel";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";
import { useAdmin } from "@/app/admin/AdminGateway";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

export default function TimeAttackContainer({ roomId, roomData, history = [] }: BoardProps) {
  const { t, lang } = useTranslation();
  const { isAdmin, pin: adminPin } = useAdmin();
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);
  const isFA = lang === "fa";

  const board =
    roomData.gameBoard.gameType === "timeattack" ? roomData.gameBoard : null;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";
  const players = roomData.players;

  const nextPhase = useMutation(api.timeattack.nextPhase);

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
      header={
        <ArcadeHUD
          title={t.timeattack_title}
          statusLabel={formatLog(t.timeattack_round_protocol, { round: isFA ? toPersianDigits(board.currentRound) : board.currentRound }, lang)}
          badgeContent={board.phase === "ROUND_REVEAL" ? t.timeattack_round_victor : t.statusLive}
          accentColor="rose"
          onHaltToggle={isAdmin ? () => toggleHaltMutation({ roomId: roomId as any, adminPin }) : undefined}
          isHalted={roomData.botsHalted}
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f43f5e_0%,_transparent_70%)] opacity-[0.03]" />

              <AnimatePresence mode="wait">
                 {board.phase === "ROUND_INTRO" ? (
                    <motion.div 
                      key="intro" 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center text-center max-w-xl"
                    >
                       <div className="w-24 h-24 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-8">
                          <span className="text-4xl">📡</span>
                       </div>
                       <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                          {currentRoundConfig?.name}
                       </h2>
                       <p className="text-zinc-400 text-sm leading-relaxed mb-12 whitespace-pre-wrap">
                          {currentRoundConfig?.description}
                       </p>

                       {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(244,63,94,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nextPhase({ roomId: roomId as any })}
                            className="bg-white text-black px-12 py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-2xl"
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
                    <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                       <div className="w-64 h-64 rounded-full border-4 border-rose-500/20 flex items-center justify-center relative mb-12">
                          <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping" />
                          <div className="w-48 h-48 rounded-full border border-rose-500/10 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                             <div className="w-1 h-24 bg-rose-500/40 origin-bottom" />
                          </div>
                          <span className="absolute text-4xl font-black text-rose-500">{t.timeattack_transmitting}</span>
                       </div>
                       <h2 className="text-2xl font-black text-rose-400 tracking-[0.5em] uppercase italic mb-12">{t.timeattack_eyes_on_phone}</h2>

                       {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(244,63,94,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => nextPhase({ roomId: roomId as any })}
                            className="bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 px-8 py-3 rounded-2xl font-black uppercase italic tracking-widest transition-all"
                          >
                             {t.timeattack_extract_data || "EXTRACT DATA"}
                          </motion.button>
                       )}
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
                            onClick={() => nextPhase({ roomId: roomId as any })}
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
