"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog } from "@/lib/translations";
import { useAdmin } from "@/app/admin/AdminGateway";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import MissionBriefing from "../../arcade/MissionBriefing";
import RulesModal from "../../shared/RulesModal";
import BackgroundAudioPlayer from "../../shared/BackgroundAudioPlayer";
import Flip7Card from "./Flip7Card";
import { parseFlip7Card, calculateFlip7RoundScore } from "../../../../../../convex/flip7_deck";

const Flip7Board: React.FC<BoardProps> = ({ roomId, roomData }) => {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const { isAdmin, adminPassword } = useAdmin();
  const flip7Api = (api as any).flip7;

  const hitCard = useMutation(flip7Api.hitCard);
  const freeze = useMutation(flip7Api.freeze);
  const nextRound = useMutation(flip7Api.nextRound);
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);

  const [showRules, setShowRules] = useState(false);

  const board = roomData.gameBoard;
  if (!board || board.gameType !== "flip7") return null;

  const isLobby = roomData.status?.toUpperCase() === "LOBBY";
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.flip7_title || "Flip 7"}
        subtitle={t.lobbyInitiation}
        briefingTitle="FLIP 7: PRESS YOUR LUCK"
        briefingDesc="Flip unique numbers, avoid duplicate busts, and aim for 7 unique cards to trigger the Flip 7 bonus!"
        loadingText={t.incangold_waiting_sync || "Syncing deck..."}
        accentColor="amber"
        background={<div className="neuro-grid opacity-20" />}
        room={roomData}
        players={roomData.players}
      />
    );
  }

  const isFinished = roomData.status?.toUpperCase() === "FINISHED" || board.phase === "FINAL_LEADERBOARD";
  const currentTurnPlayer = roomData.players.find(
    (p) => String(p._id) === String(board.currentTurnPlayerId),
  );

  return (
    <div className="w-full h-full flex flex-col justify-between bg-zinc-950 text-white select-none relative overflow-hidden font-sans">
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} gameType="flip7" />

      {/* Header HUD */}
      <ArcadeHUD
        title="FLIP 7"
        statusLabel={`Round ${board.currentRound || 1}`}
        badgeContent={board.phase === "ACTIVE_PLAY" ? `${currentTurnPlayer?.name || "Player"}'s Turn` : "ROUND RESULTS"}
        accentColor="amber"
        audioSrc={[
          "/assets/games/incangold/audio/enter-cave.wav",
          "/assets/games/incangold/audio/ambience_cave_00.wav"
        ]}
        onHaltToggle={isAdmin && adminPassword ? () => toggleHaltMutation({ roomId: roomId as any, adminPassword }) : undefined}
        isHalted={roomData.botsHalted}
        onRulesClick={() => setShowRules(true)}
      />

      {/* Main Game Stage */}
      <div className="flex-1 p-4 md:p-8 flex flex-col justify-between max-w-7xl mx-auto w-full gap-6">
        {/* Banner Action Notification */}
        {board.lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center justify-between ${
              board.lastAction.type === "BUST"
                ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                : board.lastAction.type === "FLIP_7_BONUS"
                  ? "bg-amber-950/80 border-amber-400 text-amber-300"
                  : board.lastAction.type === "FREEZE"
                    ? "bg-cyan-950/80 border-cyan-500/40 text-cyan-300"
                    : "bg-zinc-900/80 border-white/10 text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {board.lastAction.type === "BUST"
                  ? "💥"
                  : board.lastAction.type === "FLIP_7_BONUS"
                    ? "🌟"
                    : board.lastAction.type === "FREEZE"
                      ? "❄️"
                      : "🃏"}
              </span>
              <span className="font-bold text-sm md:text-base">{board.lastAction.message}</span>
            </div>
            <div className="text-xs font-mono font-black opacity-70">
              Deck: {board.deck?.length || 0} cards left
            </div>
          </motion.div>
        )}

        {/* Players Grid / Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto">
          {roomData.players.map((p) => {
            const st = p.state as any;
            const isCurrentTurn = String(p._id) === String(board.currentTurnPlayerId);
            const faceUpCards = (st?.roundFaceUpCards as string[]) || [];
            const scoreInfo = calculateFlip7RoundScore(faceUpCards);

            return (
              <motion.div
                key={p._id}
                layout
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                  isCurrentTurn
                    ? "bg-amber-950/30 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                    : st?.status === "BUSTED"
                      ? "bg-rose-950/20 border-rose-500/20 opacity-60"
                      : st?.status === "FROZEN"
                        ? "bg-cyan-950/20 border-cyan-500/20"
                        : "bg-zinc-900/60 border-white/5"
                }`}
              >
                {/* Player Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-zinc-100">{p.name}</span>
                    {p.isBot && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-amber-300">BOT</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-amber-400">
                      {st?.bankedScore || 0} pts
                    </span>
                  </div>
                </div>

                {/* Special Active Status Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {st?.hasSecondChance && (
                    <span className="text-[9px] font-mono font-black bg-cyan-950/90 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse" title="Second Chance Shield Active">
                      <span>🛡️</span>
                      <span>SHIELD</span>
                    </span>
                  )}
                  {scoreInfo.hasMultiplier && (
                    <span className="text-[9px] font-mono font-black bg-amber-950/90 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]" title="x2 Multiplier Active">
                      <span>✖️2</span>
                      <span>MULT</span>
                    </span>
                  )}
                  <span className="text-[9px] font-mono font-bold bg-white/5 text-zinc-300 px-2 py-0.5 rounded-full border border-white/5">
                    {scoreInfo.uniqueNumbersCount}/7 Unique
                  </span>
                </div>

                {/* Face-up Cards Grid */}
                <div className="py-4 flex flex-wrap gap-2 min-h-[100px] items-center">
                  <AnimatePresence>
                    {faceUpCards.map((cId, idx) => (
                      <Flip7Card key={cId + idx} cardId={cId} size="md" />
                    ))}
                  </AnimatePresence>
                  {faceUpCards.length === 0 && (
                    <span className="text-xs text-zinc-600 italic">No cards flipped yet</span>
                  )}
                </div>

                {/* Footer Stats & Status */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs font-mono">
                  <span className="text-zinc-400">
                    Round: <strong className="text-emerald-400 font-black">+{st?.roundScore || 0} pts</strong>
                  </span>
                  <span
                    className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                      st?.status === "FROZEN"
                        ? "bg-cyan-950 text-cyan-400 border border-cyan-500/40"
                        : st?.status === "BUSTED"
                          ? "bg-rose-950 text-rose-400 border border-rose-500/40"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                    }`}
                  >
                    {st?.status === "FROZEN" ? "STAYED ✋" : st?.status === "BUSTED" ? "BUSTED 💥" : "ACTIVE 🃏"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Round Results Modal Overlay */}
        {board.phase === "ROUND_RESULTS" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-zinc-900/90 border border-amber-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col items-center gap-6 max-w-2xl mx-auto text-center"
          >
            <h3 className="text-2xl font-black text-amber-400 tracking-wider italic uppercase">
              ROUND {board.currentRound} COMPLETE
            </h3>

            <div className="w-full space-y-2">
              {board.roundResults?.map((res: any) => (
                <div key={res.playerId} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5 text-sm font-mono">
                  <span className="font-bold text-white">{res.playerName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400">+{res.roundScore} round pts</span>
                    <span className="text-amber-400 font-black">{res.totalScore} total pts</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => nextRound({ roomId: roomId as any })}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase italic tracking-widest px-8 py-3 rounded-2xl shadow-xl transition-all"
            >
              Start Next Round ➔
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Flip7Board;
