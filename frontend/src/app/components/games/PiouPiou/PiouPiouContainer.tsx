"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { BoardProps } from "../registry";
import PlayerCard from "../../shared/PlayerCard";
import PiouPiouPlayerStats from "./PiouPiouPlayerStats";
import MatchActivity from "../../shared/MatchActivity";
import PiouPiouMatchActivity from "./MatchActivity";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import MissionBriefing from "../../arcade/MissionBriefing";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadeStatusPanel from "../../arcade/ArcadeStatusPanel";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";
import ArcadeVictoryOverlay from "../../arcade/ArcadeVictoryOverlay";

export default function PiouPiouContainer({ roomData }: BoardProps) {
  const { t } = useTranslation();
  const isGameEnd =
    roomData.status?.toUpperCase() === "FINISHED" ||
    roomData.status?.toUpperCase() === "ARCHIVED";

  const board =
    roomData.gameBoard.gameType === "pioupiou" ? roomData.gameBoard : null;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  // 1. LOBBY MISSION BRIEFING
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.pioupiou_title}
        subtitle={t.lobbyInitiation}
        briefingTitle={t.pioupiou_henhouse_defense}
        briefingDesc={t.pioupiou_briefing_desc}
        loadingText={t.pioupiou_securing_perimeters}
        accentColor="orange"
        background={
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
        }
      />
    );
  }

  const winnerPlayer = roomData.players.find((p) =>
    board?.winnerId ? String(p._id) === String(board.winnerId) : false,
  );
  const winnerName = board?.winner || winnerPlayer?.name;

  // 2. ACTIVE GAMEPLAY LAYOUT (Vesper Anchor Pattern)
  return (
    <SharedArcadeLayout
      containerClassName="bg-[#0a0602] text-orange-100 font-mono"
      background={
        <>
          <div className="neuro-grid opacity-20" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
        </>
      }
      header={
        <ArcadeHUD
          title={t.pioupiou_title}
          statusLabel={`${t.shared_status}: ${isGameEnd ? t.statusArchived : t.pioupiou_henhouse_integrity}`}
          badgeContent={board?.winnerId ? t.winner : t.statusLive}
          accentColor="orange"
        />
      }
      main={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
          {/* LEFT: MATCH ACTIVITY LOG */}
          <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
            <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-6 overflow-hidden flex flex-col shadow-2xl relative">
              <h3 className="text-[8px] font-black text-orange-500/60 uppercase tracking-[0.4em] mb-4 shrink-0">
                {t.pioupiou_tactical_feed}
              </h3>
              <div className="flex-1 min-h-0">
                <MatchActivity
                  history={board?.history || []}
                  renderLog={(log) => <PiouPiouMatchActivity log={log} />}
                />
              </div>
            </div>
          </div>

          {/* CENTER: PRIMARY INTERACTION AREA */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-orange-500/5 rounded-[3rem] border border-orange-500/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffedd5_0%,_transparent_70%)] opacity-[0.03]" />

            <AnimatePresence mode="wait">
              {board?.pendingAttack ? (
                <motion.div
                  key="attack"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="flex flex-col items-center text-center z-10"
                >
                  <span className="text-[10rem] mb-6 filter drop-shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                    🦊
                  </span>
                  <h2 className="text-5xl font-black text-rose-500 tracking-tighter uppercase italic [text-shadow:0_0_20px_rgba(225,29,72,0.5)]">
                    {t.pioupiou_fox_infiltration}
                  </h2>
                  <p className="text-xl text-orange-200/60 mt-4 font-black uppercase tracking-widest">
                    {t.targetPlayer}:{" "}
                    {
                      roomData.players.find(
                        (p) => p._id === board.pendingAttack?.victimId,
                      )?.name
                    }
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-center z-10"
                >
                  <div className="w-64 h-64 rounded-full border-2 border-orange-500/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border border-orange-500/10 animate-ping" />
                    <span className="text-9xl filter drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                      🐣
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-orange-400 tracking-[0.4em] uppercase italic mt-12">
                    {t.pioupiou_henhouse_integrity}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>

            {isGameEnd && (
              <ArcadeVictoryOverlay
                winnerName={winnerName}
                championLabel={t.champion}
                accentColor="orange"
              />
            )}
          </div>

          {/* RIGHT: SYSTEM STATUS */}
          <div className="lg:col-span-3 flex flex-col h-full gap-6">
            <ArcadeStatusPanel
              title={t.pioupiou_match_telemetry}
              protocolLabel={t.pioupiou_encryption}
              protocolValue={t.pioupiou_secure}
              accentColor="orange"
              rows={[
                { label: t.shared_status, value: roomData.status },
                {
                  label: t.pioupiou_resolution,
                  value: board?.winnerId ? t.winner : t.waiting,
                  valueColor: "text-blue-400",
                },
              ]}
            />
          </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={roomData.players}
          currentTurnId={roomData.turnOrder[roomData.currentTurnIndex]}
          winnerId={board?.winnerId}
          isGameEnd={isGameEnd}
          accentColor="orange"
          renderStats={(player) => (
            <PiouPiouPlayerStats
              state={player.state.gameType === "pioupiou" ? player.state : null}
            />
          )}
        />
      }
    />
  );
}
