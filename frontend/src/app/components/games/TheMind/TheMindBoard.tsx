"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { BoardProps } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import MatchActivity from "../../shared/MatchActivity";
import TheMindLogMessage from "./MatchActivity";
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

export default function NeuralSyncBoard({ roomId, roomData, history = [] }: BoardProps) {
  const { t } = useTranslation();
  const { isAdmin, } = useAdmin();
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);
  const [showRules, setShowRules] = useState(false);

  const board = roomData.gameBoard.gameType === "themind" ? roomData.gameBoard : null;
  const players = roomData.players;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  // 1. LOBBY MISSION BRIEFING
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.themind_title}
        subtitle={(t as any).themind_awaiting_sync}
        briefingTitle={(t as any).themind_neural_calibration}
        briefingDesc={(t as any).themind_briefing_desc}
        loadingText={(t as any).themind_syncing_waves}
        accentColor="teal"
        background={<div className="neuro-grid opacity-20" />}
        room={roomData}
        players={players}
      />
    );
  }

  if (!board) return null;

  const isFinished = roomData.status?.toUpperCase() === "FINISHED" || roomData.status?.toUpperCase() === "ARCHIVED";

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#020a0a] text-teal-100 font-mono"
      background={<div className="neuro-grid opacity-20" />}
      extra={
        <>
          <AITelemetryLog players={roomData.players} />
          <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameType="themind" />
        </>
      }
      header={
        <ArcadeHUD
          title={t.themind_title}
          statusLabel={(t as any).themind_level_status ? (t as any).themind_level_status.replace("{level}", String(board.level)) : `LEVEL ${board.level}`}
          badgeContent={isFinished ? "SESSION_TERMINATED" : "SYNC_ACTIVE"}
          accentColor="teal"
          onHaltToggle={isAdmin ? () => toggleHaltMutation({ roomId: roomId as any }) : undefined}
          isHalted={roomData.botsHalted}
          onRulesClick={() => setShowRules(true)}
        />
      }
      main={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
           {/* LEFT: TACTICAL FEED */}
           <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
             <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-6 overflow-hidden flex flex-col shadow-2xl relative">
                <h3 className="text-[8px] font-black text-teal-500/60 uppercase tracking-[0.4em] mb-4 shrink-0">
                   {t.matchActivity}
                </h3>
                <div className="flex-1 min-h-0">
                   <MatchActivity 
                     history={history}
                     renderLog={(log) => <TheMindLogMessage log={log} />}
                   />
                </div>
             </div>
           </div>

           {/* CENTER: PRIMARY INTERACTION AREA */}
           <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-teal-500/5 rounded-[3rem] border border-teal-500/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2dd4bf_0%,_transparent_70%)] opacity-[0.03]" />

              <AnimatePresence mode="wait">
                 {board.topCard ? (
                    <motion.div
                       key={board.topCard}
                       initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
                       animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                       className="w-64 aspect-[2/3] bg-gradient-to-br from-teal-500/20 to-black border-4 border-teal-400/50 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(45,212,191,0.3)] relative"
                    >
                       <div className="absolute top-4 left-4 text-[10px] font-black opacity-30">NEURAL_SYNC_VAL</div>
                       <span className="text-8xl font-black text-white italic tracking-tighter">{board.topCard}</span>
                       <div className="absolute bottom-4 right-4 text-[10px] font-black opacity-30">LVL_{board.level}</div>
                    </motion.div>
                 ) : (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                       <div className="w-48 h-48 rounded-full border-2 border-teal-500/20 flex items-center justify-center relative mb-12">
                          <div className="absolute inset-0 rounded-full border border-teal-500/10 animate-ping" />
                          <span className="text-7xl filter drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]">🧠</span>
                       </div>
                       <h2 className="text-3xl font-black text-teal-400 tracking-[0.4em] uppercase italic">{(t as any).themind_awaiting_neural_pulse || "AWAITING SYNCHRONIZATION"}</h2>
                    </motion.div>
                 )}
              </AnimatePresence>

              {isFinished && (
                <ArcadeVictoryOverlay
                  winnerName={board.lives > 0 ? "TEAM_SUCCESS" : "TEAM_FAILURE"}
                  championLabel={board.lives > 0 ? "ULTIMATE_SYNC" : "NEURAL_CRASH"}
                  accentColor="teal"
                  icon={board.lives > 0 ? "✨" : "💀"}
                />
              )}
           </div>

           {/* RIGHT: SYSTEM STATUS */}
           <div className="lg:col-span-3 flex flex-col h-full gap-6">
              <ArcadeStatusPanel
                protocolLabel="NEURAL_INTEGRITY"
                protocolValue={`${board.lives} / 5`}
                accentColor="teal"
                rows={[
                  { label: "SYNC_LEVEL", value: `LEVEL ${board.level}` },
                  { label: "BURST_CHARGES", value: String(board.emps), valueColor: "text-blue-400" },
                ]}
                title="Neural Metadata"
              />
           </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={players}
          currentTurnId={board.lastPlayedBy}
          winnerId={board.winnerId}
          isGameEnd={isFinished}
          accentColor="teal"
          renderStats={(player) => (
            <div className="flex flex-col gap-1 mt-2">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Neural Load</span>
                <div className="flex gap-1">
                    {Array.from({ length: player.gameHand.length }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-teal-500/50 rounded-full" />
                    ))}
                </div>
            </div>
          )}
        />
      }
    />
  );
}
