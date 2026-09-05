"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { useAdmin } from "@/app/admin/AdminGateway";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import MissionBriefing from "../../arcade/MissionBriefing";
import RulesModal from "../../shared/RulesModal";
import Flip7Card from "./Flip7Card";
import { parseFlip7Card, calculateFlip7RoundScore } from "../../../../../../convex/flip7_deck";

const Flip7Board: React.FC<BoardProps> = ({ roomId, roomData }) => {
  const { t, lang } = useTranslation();
  const { isAdmin, adminPassword } = useAdmin();
  const flip7Api = (api as any).flip7;

  const nextRound = useMutation(flip7Api.nextRound);
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);

  const [showRules, setShowRules] = useState(false);
  const [showBustOdds, setShowBustOdds] = useState(false);

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

      {/* Header HUD - Audio removed */}
      <ArcadeHUD
        title="FLIP 7"
        statusLabel={`Round ${board.currentRound || 1}`}
        badgeContent={board.phase === "ACTIVE_PLAY" ? `${currentTurnPlayer?.name || "Player"}'s Turn` : "ROUND RESULTS"}
        accentColor="amber"
        onHaltToggle={isAdmin && adminPassword ? () => toggleHaltMutation({ roomId: roomId as any, adminPassword }) : undefined}
        isHalted={roomData.botsHalted}
        onRulesClick={() => setShowRules(true)}
      />

      {/* Main Game Stage */}
      <div className="flex-1 p-3 md:p-6 flex flex-col justify-between max-w-7xl mx-auto w-full gap-4 overflow-hidden">
        {/* Banner Action Notification */}
        {board.lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center justify-between ${
              board.lastAction.type === "BUST"
                ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                : board.lastAction.type === "SECOND_CHANCE_USED"
                  ? "bg-gradient-to-r from-cyan-950 via-rose-950 to-zinc-900 border-cyan-400/60 text-cyan-200"
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
                  : board.lastAction.type === "SECOND_CHANCE_USED"
                    ? "🛡️"
                    : board.lastAction.type === "FLIP_7_BONUS"
                      ? "🌟"
                      : board.lastAction.type === "FREEZE"
                        ? "❄️"
                        : "🃏"}
              </span>
              <span className="font-bold text-sm md:text-base">{board.lastAction.message}</span>
            </div>
            <div className="flex items-center gap-3">
              {board.lastAction.type === "SECOND_CHANCE_USED" && board.lastAction.cardId && (
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase font-black">DISCARDED:</span>
                  <Flip7Card cardId="ACT_SECOND_CHANCE_1" size="sm" isCrossedOut={true} />
                  <Flip7Card cardId={board.lastAction.cardId} size="sm" isCrossedOut={true} />
                </div>
              )}
              <div className="text-xs font-mono font-black opacity-70">
                Deck: {board.deck?.length || 0} cards left
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Stage Layout: Left Players Grid + Right Vertical Standings Sidebar */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Players Grid / Table */}
          {(() => {
            const playerCount = roomData.players.length;
            const gridColsClass =
              playerCount > 6
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : playerCount > 3
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2";

            const cardSize: "sm" | "md" = playerCount > 4 ? "sm" : "md";

            return (
              <div className={`grid ${gridColsClass} gap-4 flex-1 overflow-y-auto pr-1`}>
                {roomData.players.map((p) => {
                  const st = p.state as any;
                  const isCurrentTurn = String(p._id) === String(board.currentTurnPlayerId);
                  const faceUpCards = (st?.roundFaceUpCards as string[]) || [];
                  const scoreInfo = calculateFlip7RoundScore(faceUpCards);
                  const isStayed = st?.status === "FROZEN";
                  const isBusted = st?.status === "BUSTED";
                  const isFlipThreeSequence = isCurrentTurn && (board.mustFlipCount || 0) > 0;
                  const isInitialDealing = board.phase === "INITIAL_DEAL";

                  return (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className={`p-4 md:p-5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden min-h-[220px] ${
                        isStayed
                          ? "bg-gradient-to-br from-cyan-950 via-cyan-900/40 to-slate-950 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                          : isBusted
                            ? "bg-gradient-to-br from-rose-950/60 via-red-950/40 to-slate-950 border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
                            : isCurrentTurn && !isInitialDealing
                              ? isFlipThreeSequence
                                ? "bg-gradient-to-br from-yellow-950/60 via-amber-900/40 to-black border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-pulse"
                                : "bg-amber-950/30 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                              : "bg-zinc-900/80 border-white/10"
                      }`}
                    >
                      {/* Stayed Upper Blue Badge */}
                      {isStayed && (
                        <div className="bg-cyan-500 text-black font-mono font-black text-[10px] uppercase tracking-widest text-center py-1 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-3 shadow-md flex items-center justify-center gap-1.5">
                          <span>✋</span>
                          <span>STAYED & BANKED +{st?.roundScore || 0} PTS</span>
                        </div>
                      )}

                      {/* Busted Upper Red Badge */}
                      {isBusted && (
                        <div className="bg-rose-600 text-white font-mono font-black text-[10px] uppercase tracking-widest text-center py-1 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-3 shadow-md flex items-center justify-center gap-1.5">
                          <span>💥</span>
                          <span>BUSTED (0 PTS BANKED)</span>
                        </div>
                      )}

                      {/* Flip Three Active Banner */}
                      {isFlipThreeSequence && !isStayed && !isBusted && (
                        <div className="bg-yellow-400 text-black font-mono font-black text-[10px] uppercase tracking-widest text-center py-1 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-3 shadow-md flex items-center justify-center gap-1.5 animate-bounce">
                          <span>⚡</span>
                          <span>FLIP THREE: {board.mustFlipCount} LEFT</span>
                        </div>
                      )}

                      {/* Player Header with Personality on Separate Line */}
                      <div className="flex flex-col border-b border-white/10 pb-3 gap-1">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-black text-base md:text-lg text-zinc-100 truncate">{p.name}</span>
                          <span className="text-sm font-mono font-black text-amber-400 shrink-0">
                            {st?.bankedScore || 0} pts
                          </span>
                        </div>
                        {/* Personality Badge on a Separate Line */}
                        {p.isBot && (
                          <div>
                            <span className="inline-block text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              🤖 {p.persona ? p.persona.toUpperCase() : "BOT"} PERSONA
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Special Active Status Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
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

                        {/* Optional Live Bust Risk Badge */}
                        {showBustOdds && !isBusted && !isStayed && (() => {
                          const deck = board.deck || [];
                          const existingNumbers = new Set(
                            faceUpCards.map((cId) => parseFlip7Card(cId).numberValue).filter((n) => n !== undefined),
                          );
                          let matchingDuplicates = 0;
                          deck.forEach((cardId: string) => {
                            const parsed = parseFlip7Card(cardId);
                            if (parsed.type === "NUMBER" && parsed.numberValue !== undefined && existingNumbers.has(parsed.numberValue)) {
                              matchingDuplicates++;
                            }
                          });
                          const rawBustPct = deck.length > 0 ? (matchingDuplicates / deck.length) * 100 : 0;
                          const isShielded = st?.hasSecondChance;
                          const badgeStyle = isShielded
                            ? "bg-cyan-950/90 text-cyan-300 border-cyan-400/50"
                            : rawBustPct > 40
                              ? "bg-rose-950/90 text-rose-300 border-rose-500/50"
                              : rawBustPct > 22
                                ? "bg-amber-950/90 text-amber-300 border-amber-500/50"
                                : "bg-emerald-950/90 text-emerald-300 border-emerald-500/40";

                          return (
                            <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${badgeStyle}`} title="Exact Live Bust Odds">
                              <span>📊</span>
                              <span>{isShielded ? "0.0% (Shield 🛡️)" : `${rawBustPct.toFixed(1)}% BUST`}</span>
                            </span>
                          );
                        })()}
                      </div>

                      {/* Face-up Cards Grid */}
                      <div className={`py-4 flex flex-wrap gap-2 min-h-[95px] items-center rounded-xl p-2 transition-all ${
                        isFlipThreeSequence ? "border border-yellow-400/50 bg-yellow-950/20" : ""
                      }`}>
                        <AnimatePresence mode="popLayout">
                          {faceUpCards.map((cId, idx) => {
                            const isAssignedAction = cId.startsWith("ACT_FLIP3") || cId.startsWith("ACT_FREEZE");
                            const isUsedSecondChance = cId.startsWith("ACT_SECOND_CHANCE") && !st?.hasSecondChance;
                            return (
                              <Flip7Card
                                key={cId + idx}
                                cardId={cId}
                                size={cardSize}
                                isGrayedOut={isAssignedAction}
                                isCrossedOut={isUsedSecondChance}
                              />
                            );
                          })}
                        </AnimatePresence>
                        {faceUpCards.length === 0 && (
                          <span className="text-xs text-zinc-500 italic">Flipping initial card 1 by 1...</span>
                        )}
                      </div>

                      {/* Footer Stats & Status */}
                      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs font-mono">
                        <span className="text-zinc-400">
                          Round: <strong className="text-emerald-400 font-black">+{st?.roundScore || 0} pts</strong>
                        </span>
                        <span
                          className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full ${
                            isStayed
                              ? "bg-cyan-400 text-black border border-cyan-300 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                              : isBusted
                                ? "bg-rose-950 text-rose-400 border border-rose-500/40"
                                : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          }`}
                        >
                          {isStayed ? "STAYED ✋" : isBusted ? "BUSTED 💥" : "ACTIVE 🃏"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}

          {/* Vertical Right Standings Sidebar Panel */}
          <div className="w-full lg:w-72 bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-4 font-mono text-xs shrink-0 max-h-full overflow-y-auto">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span>🏆</span>
                  <span>LIVE STANDINGS</span>
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">R{board.currentRound || 1}</span>
              </div>

              {/* Standings List */}
              <div className="flex flex-col gap-2">
                {[...roomData.players]
                  .sort((a, b) => ((b.state as any)?.bankedScore || 0) - ((a.state as any)?.bankedScore || 0))
                  .map((p, idx) => {
                    const st = p.state as any;
                    const isWinnerLeading = idx === 0;
                    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                    return (
                      <div
                        key={p._id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          isWinnerLeading
                            ? "bg-amber-950/40 border-amber-400/50 text-amber-200"
                            : "bg-white/5 border-white/5 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold shrink-0">{medal}</span>
                          <span className="font-bold text-white truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-amber-400 font-black">{st?.bankedScore || 0}</span>
                          <span className="text-emerald-400 text-[10px] font-bold">(+{st?.roundScore || 0})</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bust Odds Toggle Button in Standings Sidebar */}
            <div className="border-t border-white/10 pt-3">
              <button
                onClick={() => setShowBustOdds(!showBustOdds)}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-black border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  showBustOdds
                    ? "bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>📊</span>
                <span>BUST ODDS {showBustOdds ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* End-of-Round Pop-up Scoreboard Modal */}
        {board.phase === "ROUND_RESULTS" && !isFinished && (
          <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-zinc-900 border-2 border-amber-400/50 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-6 max-w-xl text-center"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl">🏆</span>
                <h3 className="text-2xl font-black text-amber-300 tracking-wider italic uppercase">
                  ROUND {board.currentRound} SCOREBOARD
                </h3>
                <p className="text-xs text-zinc-400">Ranked by Total Banked Points</p>
              </div>

              <div className="w-full space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {roomData.players
                  .map((p) => {
                    const st = p.state as any;
                    return {
                      playerId: p._id,
                      playerName: p.name,
                      roundScore: st?.roundScore || 0,
                      totalScore: st?.bankedScore || 0,
                      status: st?.status,
                    };
                  })
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((res: any, idx: number) => {
                    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
                    return (
                      <div
                        key={res.playerId}
                        className={`flex justify-between items-center p-3.5 rounded-2xl border text-sm font-mono transition-all ${
                          idx === 0
                            ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : "bg-black/60 border-white/10 text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold min-w-[28px]">{medal}</span>
                          <span className="font-bold text-white text-base">{res.playerName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold text-xs">+{res.roundScore} round</span>
                          <span className="bg-white/10 px-3 py-1 rounded-full text-amber-400 font-black text-sm border border-amber-400/30">
                            {res.totalScore} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => nextRound({ roomId: roomId as any })}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase italic tracking-widest py-4 rounded-2xl shadow-xl transition-all text-base active:scale-95"
              >
                Start Next Round ➔
              </button>
            </motion.div>
          </div>
        )}

        {/* Final Game Victory Leaderboard Modal Overlay */}
        {isFinished && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 select-none font-mono">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-zinc-900 border-2 border-amber-400/70 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center gap-6 text-center relative overflow-hidden"
            >
              {/* Gold Ambient Glow Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15)_0%,_transparent_75%)] pointer-events-none" />

              <div className="flex flex-col items-center gap-2 z-10">
                <span className="text-6xl animate-bounce">👑</span>
                <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest bg-amber-950/80 px-4 py-1 rounded-full border border-amber-400/40">
                  VICTORY ACHIEVED (200+ PTS)
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-amber-300 italic uppercase tracking-wider">
                  {board.winner || roomData.players.sort((a, b) => ((b.state as any)?.bankedScore || 0) - ((a.state as any)?.bankedScore || 0))[0]?.name} WINS!
                </h2>
              </div>

              {/* Final Scores Ranking List */}
              <div className="w-full space-y-2.5 z-10 max-h-[50vh] overflow-y-auto pr-1">
                {[...roomData.players]
                  .sort((a, b) => ((b.state as any)?.bankedScore || 0) - ((a.state as any)?.bankedScore || 0))
                  .map((p, idx) => {
                    const st = p.state as any;
                    const isWinner = idx === 0;
                    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
                    return (
                      <div
                        key={p._id}
                        className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                          isWinner
                            ? "bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                            : "bg-black/60 border-white/10 text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold min-w-[32px]">{medal}</span>
                          <span className="font-bold text-white text-base md:text-lg">{p.name}</span>
                          {p.isBot && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-amber-300">BOT</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-400">Total Score:</span>
                          <span className={`px-4 py-1.5 rounded-full font-black font-mono text-base ${
                            isWinner ? "bg-amber-400 text-black shadow-md" : "bg-white/10 text-amber-400 border border-amber-400/30"
                          }`}>
                            {st?.bankedScore || 0} PTS
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flip7Board;
