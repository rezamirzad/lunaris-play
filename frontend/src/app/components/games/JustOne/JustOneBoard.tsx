"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { BoardProps } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import MatchActivity from "../../shared/MatchActivity";
import JustOneMatchActivity from "./JustOneMatchActivity";
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
import DataPacket from "./DataPacket";

export default function JustOneBoard({ roomId, roomData, history = [] }: BoardProps) {
  const { t } = useTranslation();
  const { isAdmin, adminPassword } = useAdmin();
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);
  const [showRules, setShowRules] = useState(false);

  const board = roomData.gameBoard.gameType === "justone" ? roomData.gameBoard : null;
  const players = roomData.players;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  // 1. LOBBY MISSION BRIEFING
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.justone_title}
        subtitle={t.justone_initializing_links}
        briefingTitle={t.justone_briefing_title}
        briefingDesc={t.justone_briefing_desc}
        loadingText={t.justone_waiting_sync}
        accentColor="cyan"
        background={<div className="neuro-grid opacity-20" />}
        room={roomData}
        players={players}
      />
    );
  }

  if (!board) return null;

  const isFinished = roomData.status?.toUpperCase() === "FINISHED" || roomData.status?.toUpperCase() === "ARCHIVED";

  // Calculate active clues from clues record and canceledClues array
  const activeClues = Object.entries(board.clues || {})
    .filter(([pid]) => !board.canceledClues?.includes(pid as any))
    .map(([, clue]) => clue);

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#020a0a] text-cyan-100 font-mono"
      background={<div className="neuro-grid opacity-20" />}
      extra={
        <>
          <AITelemetryLog players={roomData.players} />
          <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameType="justone" />
        </>
      }
      header={
        <ArcadeHUD
          title={t.justone_title}
          statusLabel={t.justone_signal_stream.replace("{round}", String(board.round))}
          badgeContent={isFinished ? t.justone_session_ended : board.phase}
          accentColor="cyan"
          onHaltToggle={isAdmin && adminPassword ? () => toggleHaltMutation({ roomId: roomId as any, adminPassword }) : undefined}
          isHalted={roomData.botsHalted}
          onRulesClick={() => setShowRules(true)}
        />
      }
      main={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
           {/* LEFT: TACTICAL FEED */}
           <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
             <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-6 overflow-hidden flex flex-col shadow-2xl relative">
                <h3 className="text-[8px] font-black text-cyan-500/60 uppercase tracking-[0.4em] mb-4 shrink-0">
                   {t.matchActivity}
                </h3>
                <div className="flex-1 min-h-0">
                   <MatchActivity 
                     history={history}
                     renderLog={(log) => <JustOneMatchActivity log={log} />}
                   />
                </div>
             </div>
           </div>

           {/* CENTER: PRIMARY INTERACTION AREA */}
           <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-cyan-500/5 rounded-[3rem] border border-cyan-500/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#22d3ee_0%,_transparent_70%)] opacity-[0.03]" />

              <AnimatePresence mode="wait">
                 {board.phase === "CLUE_INPUT" ? (
                    <motion.div key="clue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                       <div className="w-48 h-48 rounded-[3rem] border-2 border-cyan-500/20 flex items-center justify-center relative mb-12">
                          <div className="absolute inset-0 rounded-[3rem] border border-cyan-500/10 animate-ping" />
                          <span className="text-7xl">📡</span>
                       </div>
                       <h2 className="text-3xl font-black text-cyan-400 tracking-[0.4em] uppercase italic">{t.justone_awaiting_clues}</h2>
                    </motion.div>
                 ) : board.phase === "VALIDATION" ? (
                    <motion.div key="val" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                       <span className="text-[8rem] mb-8">🛡️</span>
                       <h2 className="text-4xl font-black text-amber-500 tracking-tighter uppercase italic">{t.justone_ambiguity_detected}</h2>
                       <p className="text-cyan-200/60 mt-4 font-black uppercase tracking-[0.3em]">{t.justone_consensus_required}</p>
                    </motion.div>
                 ) : board.phase === "GUESSING" ? (
                    <motion.div key="guess" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
                       <span className="text-[10rem] mb-6 filter drop-shadow-[0_0_50px_rgba(34,211,238,0.4)]">🧩</span>
                       <h2 className="text-5xl font-black text-cyan-400 tracking-tighter uppercase italic">{t.justone_decryption_input}</h2>
                       <div className="mt-8 flex flex-wrap gap-3 justify-center">
                          {activeClues.map((c, i) => (
                             <span key={i} className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xl font-black text-white italic uppercase">{c}</span>
                          ))}
                       </div>
                    </motion.div>
                 ) : board.phase === "ROUND_RESULTS" ? (
                    <motion.div key="results" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-6 w-full flex flex-col items-center">
                       <span className="text-[6rem] filter drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] block mb-2">
                          {(history[0]?.data as any)?.card === "Correct" ? "✨" : "💀"}
                       </span>
                       <h2 className={`text-4xl font-black tracking-tighter uppercase italic mb-6 ${ (history[0]?.data as any)?.card === "Correct" ? "text-cyan-400" : "text-rose-500" }`}>
                          {(history[0]?.data as any)?.card === "Correct" ? t.justone_transmission_success : t.justone_security_override}
                       </h2>

                       <div className="flex flex-col gap-4 mb-8 bg-black/40 p-6 rounded-2xl border border-white/10 w-full max-w-sm">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Mystery Word</span>
                            <span className="text-3xl font-black text-white">{board.mysteryWord[board.language as keyof typeof board.mysteryWord]}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Guesser&apos;s Guess</span>
                            <span className={`text-3xl font-black ${ (history[0]?.data as any)?.card === "Correct" ? "text-cyan-400" : "text-rose-500" }`}>
                              {board.lastGuess || "—"}
                            </span>
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-4 justify-center mt-4 max-w-4xl">
                         {Object.entries(board.clues || {}).map(([pId, clue]) => {
                           const authorName = players.find(p => p._id === pId)?.name || "Unknown";
                           const isCanceled = board.canceledClues?.includes(pId as any);
                           return (
                             <div key={pId} className="w-48">
                               <DataPacket 
                                 clue={clue as string} 
                                 playerName={authorName} 
                                 isCanceled={isCanceled} 
                                 isInteractable={false}
                               />
                             </div>
                           );
                         })}
                       </div>
                       
                       {isFinished && (
                          <div className="mt-12">
                             <button onClick={() => (window.location.href = "/")} className="px-16 py-6 bg-cyan-500 text-cyan-950 font-black text-2xl uppercase italic rounded-3xl shadow-[0_10px_40px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all">
                               {t.exit}
                             </button>
                          </div>
                       )}
                    </motion.div>
                 ) : null}
              </AnimatePresence>

              {isFinished && (
                <ArcadeVictoryOverlay
                  winnerName={board.winner}
                  championLabel={t.justone_uplink_complete}
                  accentColor="cyan"
                  icon="🏆"
                />
              )}
           </div>

           {/* RIGHT: SYSTEM STATUS */}
           <div className="lg:col-span-3 flex flex-col h-full gap-6">
              <ArcadeStatusPanel
                protocolLabel={t.justone_guesser}
                protocolValue={players.find(p => p._id === board.activePlayerId)?.name || ""}
                accentColor="cyan"
                rows={[
                  { label: t.justone_round_count, value: `${board.round} / 13` },
                  { label: t.shared_score, value: String(board.score), valueColor: "text-blue-400" },
                ]}
                title=""
              />
           </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={players}
          currentTurnId={board.activePlayerId}
          winnerId={board.winnerId}
          isGameEnd={isFinished}
          accentColor="cyan"
          renderStats={(player) => {
            const isTarget = player._id === board.activePlayerId;
            const hasSubmitted = board.clues?.[player._id];
            
            return (
              <div className="flex flex-col gap-2 mt-2">
                <span className={`text-[8px] font-black uppercase tracking-widest ${isTarget ? 'text-cyan-400' : 'text-zinc-500'}`}>{isTarget ? t.justone_guesser : t.justone_helper}</span>
                {hasSubmitted && board.phase === "CLUE_INPUT" && (
                  <span className="text-[8px] text-teal-400 font-black animate-pulse uppercase tracking-tighter italic">{t.justone_clue_submitted}</span>
                )}
              </div>
            );
          }}
        />
      }
    />
  );
}
