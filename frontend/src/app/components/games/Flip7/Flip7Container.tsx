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
import {
  parseFlip7Card,
  calculateFlip7RoundScore,
} from "../../../../../../convex/flip7_deck";

const Flip7Board: React.FC<BoardProps> = ({ roomId, roomData }) => {
  const { t, lang } = useTranslation();
  const { isAdmin, adminPassword } = useAdmin();
  const flip7Api = (api as any).flip7;

  const nextRound = useMutation(flip7Api.nextRound);
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);
  const toggleBustOddsMutation = useMutation(flip7Api.toggleBustOdds);

  const [showRules, setShowRules] = useState(false);
  const [dismissedActionKey, setDismissedActionKey] = useState<string | null>(
    null,
  );
  const [showRoundResultsModal, setShowRoundResultsModal] = useState(false);

  const board = roomData.gameBoard;

  const actionKey =
    board &&
    board.gameType === "flip7" &&
    board.lastAction?.type === "ACTION_CARD" &&
    board.lastAction.cardId
      ? board.lastAction.cardId +
        board.lastAction.playerName +
        (board.lastAction.targetPlayerName || "")
      : null;

  React.useEffect(() => {
    if (actionKey) {
      const timer = setTimeout(() => {
        setDismissedActionKey(actionKey);
      }, 2300);
      return () => clearTimeout(timer);
    }
  }, [actionKey]);

  React.useEffect(() => {
    if (
      board &&
      board.gameType === "flip7" &&
      board.phase === "ROUND_RESULTS"
    ) {
      const timer = setTimeout(() => {
        setShowRoundResultsModal(true);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setShowRoundResultsModal(false);
    }
  }, [(board as any)?.phase, (board as any)?.currentRound]);

  if (!board || board.gameType !== "flip7") return null;

  const showBustOdds = !!board.showBustOdds;
  const showActionOverlay = !!(actionKey && dismissedActionKey !== actionKey);

  const getBotDialogue = (
    persona?: string,
    isMyLastAction?: boolean,
    lastActionType?: string,
    status?: string,
  ) => {
    if (status === "FROZEN") return "Banking my points! ✋";
    if (status === "BUSTED") return "Ouch! Busted! 💥";
    if (isMyLastAction && lastActionType === "SECOND_CHANCE_USED")
      return "Shield saved me! 🛡️";
    if (isMyLastAction && lastActionType === "ACTION_CARD")
      return "Action card deployed! ⚡";

    switch (persona) {
      case "cautious":
        return "Playing it safe!";
      case "risktaker":
        return "Never tell me the odds!";
      case "mathematical":
      case "probability":
        return "EV is favorable! 📊";
      case "intuitive":
        return "Feeling a good card!";
      case "wild":
        return "Full speed ahead! 🎲";
      default:
        return "Thinking next move...";
    }
  };

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

  const isFinished =
    roomData.status?.toUpperCase() === "FINISHED" ||
    board.phase === "FINAL_LEADERBOARD";
  const currentTurnPlayer = roomData.players.find(
    (p) => String(p._id) === String(board.currentTurnPlayerId),
  );

  return (
    <div className="w-full h-full flex flex-col justify-between bg-zinc-950 text-white select-none relative overflow-hidden font-sans">
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        gameType="flip7"
      />

      {/* Header HUD - Audio removed */}
      <ArcadeHUD
        title="FLIP 7"
        statusLabel={`Round ${board.currentRound || 1}`}
        badgeContent={
          board.phase === "ACTIVE_PLAY"
            ? `${currentTurnPlayer?.name || "Player"}'s Turn`
            : "ROUND RESULTS"
        }
        accentColor="amber"
        onHaltToggle={
          isAdmin && adminPassword
            ? () => toggleHaltMutation({ roomId: roomId as any, adminPassword })
            : undefined
        }
        isHalted={roomData.botsHalted}
        onRulesClick={() => setShowRules(true)}
      />

      {/* Main Game Stage */}
      <div className="flex-1 p-3 md:p-6 flex flex-col justify-between max-w-7xl mx-auto w-full gap-4 overflow-hidden">
        {/* Banner Action Notification & Flying Action Card Trajectory */}
        {board.lastAction && (
          <div className="relative w-full flex flex-col gap-2">
            <motion.div
              key={board.lastAction.cardId + (board.lastAction.message || "")}
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
                <span className="font-bold text-sm md:text-base">
                  {board.lastAction.message}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {board.lastAction.type === "SECOND_CHANCE_USED" &&
                  board.lastAction.cardId && (
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-mono text-cyan-300 uppercase font-black">
                        DISCARDED:
                      </span>
                      <Flip7Card
                        cardId="ACT_SECOND_CHANCE_1"
                        size="sm"
                        isCrossedOut={true}
                      />
                      <Flip7Card
                        cardId={board.lastAction.cardId}
                        size="sm"
                        isCrossedOut={true}
                      />
                    </div>
                  )}
                <div className="text-xs font-mono font-black opacity-70">
                  Deck: {board.deck?.length || 0} cards left
                </div>
              </div>
            </motion.div>

            {/* Active House Rules Badges Bar */}
            {(() => {
              const f7Rules = (board as any).flip7Rules || {};
              const activeRuleBadges: { icon: string; label: string }[] = [];
              if (f7Rules.bustPenalty === "FLAT_10") activeRuleBadges.push({ icon: "💥", label: "Bust -10 Pts" });
              if (f7Rules.bustPenalty === "HALF_HAND") activeRuleBadges.push({ icon: "💥", label: "Bust -50% Hand" });
              if (f7Rules.minHitThreshold) activeRuleBadges.push({ icon: "🛑", label: "Min 10 Pts Stay" });
              if (f7Rules.allowDoubleDown) activeRuleBadges.push({ icon: "🎲", label: "Double Down" });
              if (f7Rules.targetStayed) activeRuleBadges.push({ icon: "🎯", label: "Target Stayed" });
              if (f7Rules.shieldReflect) activeRuleBadges.push({ icon: "🛡️", label: "Shield Reflect" });
              if (f7Rules.zeroHero) activeRuleBadges.push({ icon: "🦸", label: "Zero Hero" });
              if (f7Rules.megaFlipBonus) activeRuleBadges.push({ icon: "🌟", label: "Mega Flip Bonus" });

              if (activeRuleBadges.length === 0) return null;

              return (
                <div className="flex flex-wrap items-center gap-1.5 px-1 font-mono text-[9px]">
                  <span className="text-amber-400 font-black uppercase tracking-wider">Active House Rules:</span>
                  {activeRuleBadges.map((b, idx) => (
                    <span key={idx} className="bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-bold">
                      <span>{b.icon}</span>
                      <span>{b.label}</span>
                    </span>
                  ))}
                </div>
              );
            })()}

            {/* Targeted Action Flying Trajectory Overlay */}
            {showActionOverlay &&
              board.lastAction.type === "ACTION_CARD" &&
              board.lastAction.cardId && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      board.lastAction.cardId +
                      board.lastAction.playerName +
                      (board.lastAction.targetPlayerName || "")
                    }
                    initial={{ scale: 0.2, opacity: 0, y: 30, rotate: -15 }}
                    animate={{
                      scale: [0.3, 1.3, 1, 1, 0.8],
                      opacity: [0, 1, 1, 1, 0],
                      y: [30, 0, -10, 0, -20],
                      rotate: [-15, 10, -5, 0, 15],
                    }}
                    transition={{
                      duration: 2.2,
                      times: [0, 0.2, 0.5, 0.8, 1],
                      ease: "easeInOut",
                    }}
                    className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center"
                  >
                    <div className="relative flex flex-col items-center gap-3 bg-black/85 backdrop-blur-xl border-2 border-amber-400 p-6 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.6)]">
                      <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-300 uppercase tracking-widest bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400/40">
                        <span>⚡ ACTION CARD PLAYED</span>
                      </div>
                      <div className="flex items-center gap-4 py-2">
                        <span className="text-base font-bold text-white">
                          {board.lastAction.playerName}
                        </span>
                        <span className="text-xl">➔</span>
                        <Flip7Card cardId={board.lastAction.cardId} size="lg" />
                        <span className="text-xl">➔</span>
                        <span className="text-base font-bold text-amber-300">
                          {board.lastAction.targetPlayerName || "Target"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
          </div>
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
              <div
                className={`grid ${gridColsClass} gap-4 flex-1 overflow-y-auto pr-1`}
              >
                {roomData.players.map((p) => {
                  const st = p.state as any;
                  const isCurrentTurn =
                    String(p._id) === String(board.currentTurnPlayerId);
                  const faceUpCards = (st?.roundFaceUpCards as string[]) || [];
                  const scoreInfo = calculateFlip7RoundScore(faceUpCards);
                  const isStayed = st?.status === "STAYED";
                  const isFrozen = st?.status === "FROZEN";
                  const isBusted = st?.status === "BUSTED";
                  const frozenByName =
                    st?.frozenByName ||
                    (board.lastAction &&
                    String(board.lastAction.targetPlayerId) === String(p._id) &&
                    board.lastAction.playerName
                      ? board.lastAction.playerName
                      : p.name);
                  const isFlipThreeSequence =
                    isCurrentTurn && (board.mustFlipCount || 0) > 0;
                  const isInitialDealing = board.phase === "INITIAL_DEAL";

                  const isJustSavedByShield =
                    board.lastAction?.type === "SECOND_CHANCE_USED" &&
                    String(board.lastAction?.playerId) === String(p._id);

                  return (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className={`p-4 md:p-5 rounded-2xl border flex flex-col justify-between transition-all relative min-h-[220px] ${
                        isJustSavedByShield
                          ? "bg-gradient-to-br from-cyan-950 via-cyan-900/50 to-slate-950 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.8)] animate-pulse"
                          : isStayed
                            ? "bg-gradient-to-br from-cyan-950 via-cyan-900/40 to-slate-950 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                            : isFrozen
                              ? "bg-gradient-to-br from-indigo-950 via-purple-950/40 to-slate-950 border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                              : isBusted
                                ? "bg-gradient-to-br from-rose-950/60 via-red-950/40 to-slate-950 border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
                                : isCurrentTurn && !isInitialDealing
                                  ? isFlipThreeSequence
                                    ? "bg-gradient-to-br from-yellow-950/60 via-amber-900/40 to-black border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-pulse"
                                    : "bg-amber-950/30 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                                  : "bg-zinc-900/80 border-white/10"
                      }`}
                    >
                      {/* Bot Reaction Dialogue Bubble */}
                      {p.isBot &&
                        (isCurrentTurn ||
                          String(board.lastAction?.playerId) ===
                            String(p._id)) && (
                          <div className="absolute -top-3.5 right-4 z-50 bg-amber-400 text-black text-[10px] font-mono font-black px-2.5 py-1 rounded-full border border-amber-300 shadow-xl flex items-center gap-1.5 animate-bounce">
                            <span>💬</span>
                            <span>
                              {getBotDialogue(
                                p.persona,
                                String(board.lastAction?.playerId) ===
                                  String(p._id),
                                board.lastAction?.type,
                                st?.status,
                              )}
                            </span>
                          </div>
                        )}

                      {/* Top Fixed-Height Header Section */}
                      <div className="shrink-0 min-h-[115px] flex flex-col justify-between">
                        <div>
                          {/* Second Chance Saved Shield Banner */}
                          {isJustSavedByShield && (
                            <div className="bg-cyan-400 text-black font-mono font-black text-[9px] uppercase tracking-wider text-center py-0.5 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-2 rounded-t-[0.9rem] shadow-[0_0_20px_rgba(6,182,212,0.8)] flex items-center justify-center gap-1 animate-pulse">
                              <span>🛡️</span>
                              <span>SECOND CHANCE SAVED YOU FROM BUST!</span>
                            </div>
                          )}

                          {/* Stayed Upper Blue Badge */}
                          {isStayed && !isJustSavedByShield && (
                            <div className="bg-cyan-500 text-black font-mono font-black text-[9px] uppercase tracking-wider text-center py-0.5 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-2 rounded-t-[0.9rem] shadow-md flex items-center justify-center gap-1">
                              <span>✋</span>
                              <span>
                                STAYED & BANKED +{st?.roundScore || 0} PTS
                              </span>
                            </div>
                          )}

                          {/* Frozen Upper Action Card Banner */}
                          {isFrozen && !isJustSavedByShield && (
                            <div className="bg-indigo-600 text-white font-mono font-black text-[9px] uppercase tracking-wider text-center py-0.5 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-2 rounded-t-[0.9rem] shadow-md flex items-center justify-center gap-1">
                              <span>❄️</span>
                              <span>
                                FROZEN BY {frozenByName.toUpperCase()} (+{st?.roundScore || 0} PTS)
                              </span>
                            </div>
                          )}

                          {/* Busted Upper Red Badge */}
                          {isBusted && (
                            <div className="bg-rose-600 text-white font-mono font-black text-[9px] uppercase tracking-wider text-center py-0.5 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-2 rounded-t-[0.9rem] shadow-md flex items-center justify-center gap-1">
                              <span>💥</span>
                              <span>BUSTED (0 PTS BANKED)</span>
                            </div>
                          )}

                          {/* Flip Three Active Banner */}
                          {isFlipThreeSequence &&
                            !isStayed &&
                            !isFrozen &&
                            !isBusted && (
                              <div className="bg-yellow-400 text-black font-mono font-black text-[9px] uppercase tracking-wider text-center py-0.5 -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-2 rounded-t-[0.9rem] shadow-md flex items-center justify-center gap-1 animate-bounce">
                                <span>⚡</span>
                                <span>
                                  FLIP THREE: {board.mustFlipCount} LEFT
                                </span>
                              </div>
                            )}

                          {/* Player Header with Personality on Separate Line */}
                          <div className="flex flex-col border-b border-white/10 pb-2 gap-1">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-black text-base md:text-lg text-zinc-100 truncate">
                                {p.name}
                              </span>
                              <span className="text-sm font-mono font-black text-amber-400 shrink-0">
                                {st?.bankedScore || 0} pts
                              </span>
                            </div>
                            {/* Personality Badge on a Separate Line */}
                            {p.isBot && (
                              <div>
                                <span className="inline-block text-[9px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  🤖{" "}
                                  {p.persona ? p.persona.toUpperCase() : "BOT"}{" "}
                                  PERSONA
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Special Active Status Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 pb-1">
                          {st?.hasSecondChance && (
                            <span
                              className="text-[9px] font-mono font-black bg-cyan-950/90 text-cyan-300 border border-cyan-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse"
                              title="Second Chance Shield Active"
                            >
                              <span>🛡️</span>
                              <span>SHIELD</span>
                            </span>
                          )}
                          {st?.isDoubledDown && (
                            <span
                              className="text-[9px] font-mono font-black bg-purple-950/90 text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse"
                              title="Doubled Down"
                            >
                              <span>🎲</span>
                              <span>DOUBLE DOWN</span>
                            </span>
                          )}
                          {scoreInfo.hasMultiplier && (
                            <span
                              className="text-[9px] font-mono font-black bg-amber-950/90 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                              title="x2 Multiplier Active"
                            >
                              <span>✖️2</span>
                              <span>MULT</span>
                            </span>
                          )}
                          <span className="text-[9px] font-mono font-bold bg-white/5 text-zinc-300 px-2 py-0.5 rounded-full border border-white/5">
                            {scoreInfo.uniqueNumbersCount}/7 Unique
                          </span>

                          {/* Optional Live Bust Risk Badge */}
                          {showBustOdds &&
                            !isBusted &&
                            !isStayed &&
                            (() => {
                              const deck = board.deck || [];
                              const existingNumbers = new Set(
                                faceUpCards
                                  .map((cId) => parseFlip7Card(cId).numberValue)
                                  .filter((n) => n !== undefined),
                              );
                              let matchingDuplicates = 0;
                              deck.forEach((cardId: string) => {
                                const parsed = parseFlip7Card(cardId);
                                if (
                                  parsed.type === "NUMBER" &&
                                  parsed.numberValue !== undefined &&
                                  existingNumbers.has(parsed.numberValue)
                                ) {
                                  matchingDuplicates++;
                                }
                              });
                              const rawBustPct =
                                deck.length > 0
                                  ? (matchingDuplicates / deck.length) * 100
                                  : 0;
                              const isShielded = st?.hasSecondChance;
                              const badgeStyle = isShielded
                                ? "bg-cyan-950/90 text-cyan-300 border-cyan-400/50"
                                : rawBustPct > 40
                                  ? "bg-rose-950/90 text-rose-300 border-rose-500/50"
                                  : rawBustPct > 22
                                    ? "bg-amber-950/90 text-amber-300 border-amber-500/50"
                                    : "bg-emerald-950/90 text-emerald-300 border-emerald-500/40";

                              return (
                                <span
                                  className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${badgeStyle}`}
                                  title="Exact Live Bust Odds"
                                >
                                  <span>📊</span>
                                  <span>
                                    {isShielded
                                      ? "0.0% (Shield 🛡️)"
                                      : `${rawBustPct.toFixed(1)}% BUST`}
                                  </span>
                                </span>
                              );
                            })()}
                        </div>
                      </div>

                      {/* Face-up Cards Grid */}
                      <div
                        className={`py-3 flex flex-wrap gap-2 min-h-[95px] flex-1 items-center rounded-xl p-2 transition-all ${
                          isFlipThreeSequence
                            ? "border border-yellow-400/50 bg-yellow-950/20"
                            : ""
                        }`}
                      >
                        <AnimatePresence mode="popLayout">
                          {faceUpCards.map((cId, idx) => {
                            const isAssignedAction =
                              cId.startsWith("ACT_FLIP3") ||
                              cId.startsWith("ACT_FREEZE");
                            const isUsedSecondChance =
                              cId.startsWith("ACT_SECOND_CHANCE") &&
                              !st?.hasSecondChance;
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
                          <span className="text-xs text-zinc-500 italic">
                            Flipping initial card 1 by 1...
                          </span>
                        )}
                      </div>

                      {/* Fixed Size Footer Stats & Status */}
                      <div className="shrink-0 h-[34px] flex items-center justify-between border-t border-white/10 pt-2 text-[10px] sm:text-xs font-mono gap-1 w-full">
                        <span className="text-zinc-400 whitespace-nowrap shrink-0">
                          Round:{" "}
                          <strong className="text-emerald-400 font-black">
                            +{st?.roundScore || 0} pts
                          </strong>
                        </span>
                        <span
                          className={`font-black uppercase text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full shrink-0 tracking-tighter ${
                            isStayed
                              ? "bg-cyan-400 text-black border border-cyan-300 font-black shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                              : isFrozen
                                ? "bg-indigo-950 text-indigo-300 border border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                : isBusted
                                  ? "bg-rose-950 text-rose-400 border border-rose-500/40"
                                  : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          }`}
                        >
                          {isStayed
                            ? "STAYED ✋"
                            : isFrozen
                              ? "FROZEN ❄️"
                              : isBusted
                                ? "BUSTED 💥"
                                : "ACTIVE 🃏"}
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
                <span className="text-[10px] text-zinc-500 uppercase font-bold">
                  R{board.currentRound || 1}
                </span>
              </div>

              {/* Standings List */}
              <div className="flex flex-col gap-2">
                {[...roomData.players]
                  .sort(
                    (a, b) =>
                      ((b.state as any)?.bankedScore || 0) -
                      ((a.state as any)?.bankedScore || 0),
                  )
                  .map((p, idx) => {
                    const st = p.state as any;
                    const isWinnerLeading = idx === 0;
                    const medal =
                      idx === 0
                        ? "🥇"
                        : idx === 1
                          ? "🥈"
                          : idx === 2
                            ? "🥉"
                            : `#${idx + 1}`;
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
                          <span className="font-bold text-white truncate">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border uppercase ${
                              st?.status === "BUSTED"
                                ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                                : st?.status === "FROZEN"
                                  ? "bg-indigo-950/80 text-indigo-300 border-indigo-500/40"
                                  : st?.status === "STAYED"
                                    ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                                    : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                            }`}
                            title={st?.status || "ACTIVE"}
                          >
                            {st?.status === "BUSTED"
                              ? "🔴"
                              : st?.status === "FROZEN"
                                ? "❄️"
                                : st?.status === "STAYED"
                                  ? "✋"
                                  : "🟢"}
                          </span>
                          <div className="flex items-center gap-1 shrink-0 font-mono">
                            <span className="text-amber-400 font-black whitespace-pre">
                              {String(st?.bankedScore || 0).padStart(
                                3,
                                "\u00A0",
                              )}
                            </span>
                            <span className="text-emerald-400 text-[10px] font-bold whitespace-pre">
                              {`(+${String(st?.roundScore || 0).padStart(3, "\u00A0")})`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bust Odds Toggle Button in Standings Sidebar */}
            <div className="border-t border-white/10 pt-3">
              <button
                onClick={() =>
                  toggleBustOddsMutation({ roomId: roomId as any })
                }
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

        {/* Last 5 Moves Activity Ticker */}
        <div className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md flex items-center gap-3 overflow-hidden font-mono text-xs shadow-lg">
          <div className="flex items-center gap-1.5 text-amber-400 font-black shrink-0 px-2.5 py-1 bg-amber-950/60 rounded-xl border border-amber-400/30">
            <span>📜</span>
            <span>LAST 5 MOVES:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 w-full">
            {(board.actionLog && board.actionLog.length > 0
              ? board.actionLog.slice(-5)
              : board.lastAction
                ? [
                    {
                      text: board.lastAction.message,
                      type: board.lastAction.type,
                      timestamp: Date.now(),
                    },
                  ]
                : []
            ).map((log: any, idx: number) => (
              <span
                key={(log.timestamp || idx) + log.text}
                className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl text-zinc-300 whitespace-nowrap flex items-center gap-1.5 shrink-0 text-[11px]"
              >
                <span>
                  {log.type === "BUST"
                    ? "💥"
                    : log.type === "FREEZE"
                      ? "❄️"
                      : log.type === "SECOND_CHANCE_USED"
                        ? "🛡️"
                        : "🃏"}
                </span>
                <span>{log.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Round End Review Banner (when modal is not open yet or minimized) */}
        {board.phase === "ROUND_RESULTS" && !isFinished && (
          <div className="w-full bg-amber-950/80 border border-amber-400/50 p-3 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-300">
              <span>🏁</span>
              <span>ROUND COMPLETE! Reviewing final board state...</span>
            </div>
            <button
              onClick={() => setShowRoundResultsModal(!showRoundResultsModal)}
              className="bg-amber-400 text-black px-3.5 py-1.5 rounded-xl text-xs font-mono font-black border border-amber-300 hover:bg-amber-300 active:scale-95 transition-all shadow-md"
            >
              {showRoundResultsModal ? "👁️ VIEW BOARD" : "🏆 OPEN SCOREBOARD"}
            </button>
          </div>
        )}

        {/* End-of-Round Pop-up Scoreboard Modal */}
        {board.phase === "ROUND_RESULTS" &&
          !isFinished &&
          showRoundResultsModal && (
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
                  <p className="text-xs text-zinc-400">
                    Ranked by Total Banked Points
                  </p>
                </div>

                <div className="w-full space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {(() => {
                    const mapped = roomData.players.map((p) => {
                      const st = p.state as any;
                      return {
                        playerId: p._id,
                        playerName: p.name,
                        roundScore: st?.roundScore || 0,
                        totalScore: st?.bankedScore || 0,
                        status: st?.status,
                      };
                    });
                    const maxRoundScore = Math.max(
                      ...mapped.map((m) => m.roundScore),
                    );

                    return mapped
                      .sort((a, b) => b.totalScore - a.totalScore)
                      .map((res: any, idx: number) => {
                        const medal =
                          idx === 0
                            ? "🥇"
                            : idx === 1
                              ? "🥈"
                              : idx === 2
                                ? "🥉"
                                : `${idx + 1}.`;
                        const isTopRoundScorer =
                          res.roundScore > 0 &&
                          res.roundScore === maxRoundScore;

                        return (
                          <div
                            key={res.playerId}
                            className={`flex justify-between items-center p-3.5 rounded-2xl border text-sm font-mono transition-all ${
                              isTopRoundScorer
                                ? "bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-amber-950/40 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                : idx === 0
                                  ? "bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                  : "bg-black/60 border-white/10 text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base font-bold min-w-[28px]">
                                {medal}
                              </span>
                              <span className="font-bold text-white text-base">
                                {res.playerName}
                              </span>
                              {isTopRoundScorer && (
                                <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-400/60 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse">
                                  <span>🔥</span>
                                  <span>ROUND MVP (+{res.roundScore})</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-bold text-xs ${isTopRoundScorer ? "text-emerald-300 font-black text-sm" : "text-emerald-400"}`}
                              >
                                +{res.roundScore} round
                              </span>
                              <span className="bg-white/10 px-3 py-1 rounded-full text-amber-400 font-black text-sm border border-amber-400/30">
                                {res.totalScore} pts
                              </span>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>

                <div className="flex items-center gap-3 w-full pt-2">
                  <button
                    onClick={() => setShowRoundResultsModal(false)}
                    className="flex-1 py-3.5 rounded-2xl bg-zinc-800 border border-white/10 text-white font-black text-xs uppercase hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>👁️</span>
                    <span>MINIMIZE & INSPECT BOARD</span>
                  </button>
                  <button
                    onClick={() => nextRound({ roomId: roomId as any })}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase italic tracking-widest py-3.5 rounded-2xl shadow-xl transition-all text-xs active:scale-95"
                  >
                    Start Next Round ➔
                  </button>
                </div>
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
                  {board.winner ||
                    roomData.players.sort(
                      (a, b) =>
                        ((b.state as any)?.bankedScore || 0) -
                        ((a.state as any)?.bankedScore || 0),
                    )[0]?.name}{" "}
                  WINS!
                </h2>
              </div>

              {/* Final Scores Ranking List */}
              <div className="w-full space-y-2.5 z-10 max-h-[50vh] overflow-y-auto pr-1">
                {[...roomData.players]
                  .sort(
                    (a, b) =>
                      ((b.state as any)?.bankedScore || 0) -
                      ((a.state as any)?.bankedScore || 0),
                  )
                  .map((p, idx) => {
                    const st = p.state as any;
                    const isWinner = idx === 0;
                    const medal =
                      idx === 0
                        ? "🥇"
                        : idx === 1
                          ? "🥈"
                          : idx === 2
                            ? "🥉"
                            : `${idx + 1}.`;
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
                          <span className="text-xl font-bold min-w-[32px]">
                            {medal}
                          </span>
                          <span className="font-bold text-white text-base md:text-lg">
                            {p.name}
                          </span>
                          {p.isBot && (
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-amber-300">
                              BOT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-400">
                            Total Score:
                          </span>
                          <span
                            className={`px-4 py-1.5 rounded-full font-black font-mono text-base ${
                              isWinner
                                ? "bg-amber-400 text-black shadow-md"
                                : "bg-white/10 text-amber-400 border border-amber-400/30"
                            }`}
                          >
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
