"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import PlayerController from "../../shared/PlayerController";
import Flip7Card from "./Flip7Card";
import { parseFlip7Card, calculateFlip7RoundScore } from "../../../../../../convex/flip7_deck";

const PlayerViewContainer: React.FC<PlayerProps> = ({ player, roomData, isMyTurn }) => {
  const { t } = useTranslation();
  const flip7Api = (api as any).flip7;

  const hitCard = useMutation(flip7Api.hitCard);
  const freeze = useMutation(flip7Api.freeze);
  const resolveTargetAction = useMutation(flip7Api.resolveTargetAction);
  const doubleDownMutation = useMutation(flip7Api.doubleDown);

  const [pendingAction, setPendingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const board = roomData.gameBoard;
  const myState = player.state as any;

  if (!board || board.gameType !== "flip7") return null;
  if (!myState || myState.gameType !== "flip7") return null;

  const rules = (board as any).flip7Rules || {};
  const isMyTurnNow =
    board.phase === "ACTIVE_PLAY" &&
    (isMyTurn || String(board.currentTurnPlayerId) === String(player._id)) &&
    myState.status === "ACTIVE";
  const faceUpCards = (myState.roundFaceUpCards as string[]) || [];
  const scoreInfo = calculateFlip7RoundScore(faceUpCards);

  const isMinStayLocked = rules.minHitThreshold && scoreInfo.score < 10;
  const canDoubleDown = rules.allowDoubleDown && isMyTurnNow && scoreInfo.uniqueNumbersCount >= 5 && !myState.isDoubledDown;

  const triggerVibration = () => {
    try {
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(50);
      }
    } catch (_) {
      // Ignore haptic feedback errors on unsupported or restricted mobile webviews
    }
  };

  const handleHit = async () => {
    if (pendingAction) return;
    if (!isMyTurnNow) {
      setErrorMessage("Not your turn!");
      setTimeout(() => setErrorMessage(null), 2500);
      return;
    }
    triggerVibration();
    setPendingAction(true);
    try {
      await hitCard({ playerId: player._id });
    } catch (err: any) {
      console.error("Failed to hit card:", err);
      setErrorMessage(err?.message || "Failed to hit card");
      setTimeout(() => setErrorMessage(null), 2500);
    } finally {
      setPendingAction(false);
    }
  };

  const handleFreeze = async () => {
    if (pendingAction) return;
    if (!isMyTurnNow) {
      setErrorMessage("Not your turn!");
      setTimeout(() => setErrorMessage(null), 2500);
      return;
    }
    if ((board.mustFlipCount || 0) > 0) {
      setErrorMessage("Cannot stay during Flip Three!");
      setTimeout(() => setErrorMessage(null), 2500);
      return;
    }
    if (isMinStayLocked) {
      setErrorMessage("Minimum 10 round points required to stay!");
      setTimeout(() => setErrorMessage(null), 2500);
      return;
    }
    triggerVibration();
    setPendingAction(true);
    try {
      await freeze({ playerId: player._id });
    } catch (err: any) {
      console.error("Failed to freeze:", err);
      setErrorMessage(err?.message || "Failed to stay");
      setTimeout(() => setErrorMessage(null), 2500);
    } finally {
      setPendingAction(false);
    }
  };

  const handleDoubleDown = async () => {
    if (pendingAction || !canDoubleDown) return;
    triggerVibration();
    setPendingAction(true);
    try {
      await doubleDownMutation({ playerId: player._id });
    } catch (err: any) {
      console.error("Failed to double down:", err);
      setErrorMessage(err?.message || "Failed to double down");
      setTimeout(() => setErrorMessage(null), 2500);
    } finally {
      setPendingAction(false);
    }
  };

  const isPendingTargetForMe = board.pendingTargetAction && String(board.pendingTargetAction.sourcePlayerId) === String(player._id);

  const handleSelectTarget = async (targetId: string) => {
    if (pendingAction) return;
    setPendingAction(true);
    try {
      await resolveTargetAction({ playerId: player._id, targetPlayerId: targetId as any });
    } catch (err) {
      console.error("Failed to resolve target action:", err);
    } finally {
      setPendingAction(false);
    }
  };

  return (
    <>
      {/* Target Selector Modal Overlay */}
      {isPendingTargetForMe && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none font-mono overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[85vh] flex flex-col gap-4 text-center shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-3xl">
                {board.pendingTargetAction?.actionType === "FREEZE"
                  ? "❄️"
                  : board.pendingTargetAction?.actionType === "SECOND_CHANCE"
                    ? "🛡️"
                    : "⚡"}
              </span>
              <h3 className="text-lg font-black text-amber-300 italic uppercase tracking-wider">
                {board.pendingTargetAction?.actionType === "FREEZE"
                  ? "TARGET FREEZE"
                  : board.pendingTargetAction?.actionType === "SECOND_CHANCE"
                    ? "PASS SECOND CHANCE"
                    : "TARGET FLIP THREE"}
              </h3>
              <p className="text-xs text-zinc-400 leading-snug">
                {board.pendingTargetAction?.actionType === "SECOND_CHANCE"
                  ? "You already have a shield! Choose an active player without a shield to receive this extra shield."
                  : "Choose yourself or an opponent to receive this action card!"}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1 overflow-y-auto max-h-[55vh] pr-1 font-mono">
              {roomData.players
                .filter(
                  (p) =>
                    (((p.state as any)?.status === "ACTIVE") || (rules.targetStayed && (p.state as any)?.status === "STAYED")) &&
                    (board.pendingTargetAction?.actionType !== "SECOND_CHANCE" ||
                      (!(p.state as any)?.hasSecondChance && String(p._id) !== String(player._id))),
                )
                .map((p) => {
                  const isMe = String(p._id) === String(player._id);
                  const isStayedCandidate = (p.state as any)?.status === "STAYED";
                  return (
                    <button
                      key={p._id}
                      disabled={pendingAction}
                      onClick={() => handleSelectTarget(p._id)}
                      className={`p-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border flex items-center justify-between transition-all shrink-0 active:scale-98 ${
                        isMe
                          ? "bg-amber-950/60 border-amber-400 text-amber-300 hover:bg-amber-900/80"
                          : "bg-zinc-800 border-white/10 text-white hover:bg-zinc-700"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="truncate">{isMe ? "👤 Yourself" : `🎯 ${p.name}`}</span>
                        {p.isBot && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-amber-300 shrink-0">BOT</span>}
                        {isStayedCandidate && <span className="text-[9px] bg-cyan-950 border border-cyan-400/40 text-cyan-300 px-1.5 py-0.5 rounded shrink-0">STAYED ✋</span>}
                      </span>
                      <span className="text-xs text-zinc-400 shrink-0">
                        {((p.state as any)?.roundScore || 0)} round pts
                      </span>
                    </button>
                  );
                })}
            </div>
          </motion.div>
        </div>
      )}

      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isMyTurnNow}
        gameType="flip7"
        statsSlot={
          <div className="flex flex-col gap-4 w-full">
            {/* Header Row */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">
                  FLIP 7
                </span>
                <span className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">
                  Round {board.currentRound || 1}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Live Bust Risk Calculation Badge */}
                {board.showBustOdds && (() => {
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
                  const isShielded = myState.hasSecondChance;
                  const badgeStyle = isShielded
                    ? "bg-cyan-950/90 text-cyan-300 border-cyan-400/50"
                    : rawBustPct > 40
                      ? "bg-rose-950/90 text-rose-300 border-rose-500/50"
                      : rawBustPct > 22
                        ? "bg-amber-950/90 text-amber-300 border-amber-500/50"
                        : "bg-emerald-950/90 text-emerald-300 border-emerald-500/40";

                  return (
                    <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full border flex items-center gap-1 shadow-sm ${badgeStyle}`} title="Live Bust Odds">
                      <span>📊</span>
                      <span>{isShielded ? "0.0% (Shield 🛡️)" : `${rawBustPct.toFixed(1)}% BUST`}</span>
                    </span>
                  );
                })()}
                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono font-black text-amber-400">
                  {myState.bankedScore || 0} PTS
                </div>
              </div>
            </div>

            {/* Second Chance Neutralization Notification Banner */}
            {board.lastAction?.type === "SECOND_CHANCE_USED" && String(board.lastAction?.playerId) === String(player._id) && (
              <div className="bg-gradient-to-r from-cyan-950 via-rose-950 to-zinc-900 border border-cyan-400/60 p-3 rounded-2xl flex flex-col gap-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-mono font-black text-cyan-300">
                  <span>🛡️</span>
                  <span>SECOND CHANCE SAVED YOU FROM BUSTING!</span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-mono text-zinc-400">DISCARDED TO PILE:</span>
                  <Flip7Card cardId="ACT_SECOND_CHANCE_1" size="sm" isCrossedOut={true} />
                  {board.lastAction.cardId && <Flip7Card cardId={board.lastAction.cardId} size="sm" isCrossedOut={true} />}
                </div>
              </div>
            )}

            {/* Special Cards & Modifiers Indicators */}
            {(myState.hasSecondChance || scoreInfo.hasMultiplier) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {myState.hasSecondChance && (
                  <div className="bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 px-3 py-1 rounded-full text-[10px] font-mono font-black flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse">
                    <span>🛡️</span>
                    <span>SECOND CHANCE SHIELD ACTIVE</span>
                  </div>
                )}
                {scoreInfo.hasMultiplier && (
                  <div className="bg-amber-950/80 border border-amber-400/50 text-amber-300 px-3 py-1 rounded-full text-[10px] font-mono font-black flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <span>✖️2</span>
                    <span>MULTIPLIER APPLIED</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Round Hand Status */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Unique Numbers:</span>
                <span className="text-amber-400 font-bold">{scoreInfo.uniqueNumbersCount} / 7</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Current Round Points:</span>
                <span className="text-emerald-400 font-black text-sm">+{scoreInfo.score} pts</span>
              </div>

              {/* Face-up Cards Grid */}
              <div className="flex flex-wrap gap-2 pt-2 min-h-[70px] items-center">
                <AnimatePresence>
                  {faceUpCards.map((cId, idx) => {
                    const isAssignedAction = cId.startsWith("ACT_FLIP3") || cId.startsWith("ACT_FREEZE");
                    const isUsedSecondChance = cId.startsWith("ACT_SECOND_CHANCE") && !myState.hasSecondChance;
                    return (
                      <Flip7Card
                        key={cId + idx}
                        cardId={cId}
                        size="sm"
                        isGrayedOut={isAssignedAction}
                        isCrossedOut={isUsedSecondChance}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        }
        actionsSlot={
          <div className="w-full flex flex-col gap-2 pt-2">
            {errorMessage && (
              <div className="bg-rose-950 border border-rose-500 text-rose-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-center shadow-lg animate-bounce">
                ⚠️ {errorMessage}
              </div>
            )}
            {(board.mustFlipCount || 0) > 0 && isMyTurnNow && (
              <div className="bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
                <span>⚡</span>
                <span>FLIP THREE MANDATORY: STAY IS LOCKED ({board.mustFlipCount} FLIPS REMAINING)</span>
              </div>
            )}
            {isMinStayLocked && isMyTurnNow && (board.mustFlipCount || 0) === 0 && (
              <div className="bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-center flex items-center justify-center gap-1.5">
                <span>🔒</span>
                <span>HOUSE RULE: MINIMUM 10 PTS REQUIRED TO STAY ({scoreInfo.score}/10)</span>
              </div>
            )}

            {rules.allowDoubleDown && (
              <button
                type="button"
                disabled={!canDoubleDown || pendingAction}
                onClick={handleDoubleDown}
                className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all border flex items-center justify-center gap-2 select-none touch-manipulation ${
                  canDoubleDown && !pendingAction
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 border-purple-300 text-white shadow-lg shadow-purple-500/30 animate-pulse active:scale-95 cursor-pointer"
                    : "bg-zinc-800 border-white/5 text-zinc-600 cursor-not-allowed opacity-40"
                }`}
              >
                <span>🎲</span>
                <span>{myState.isDoubledDown ? "DOUBLED DOWN ✖️2" : "DOUBLE DOWN (5+ UNIQUE)"}</span>
              </button>
            )}

            <div className="w-full grid grid-cols-2 gap-4">
              {/* HIT Button */}
              <button
                type="button"
                disabled={!isMyTurnNow || pendingAction}
                onClick={handleHit}
                className={`py-5 rounded-2xl font-black text-base uppercase tracking-wider transition-all border flex items-center justify-center gap-2 select-none touch-manipulation ${
                  isMyTurnNow && !pendingAction
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-300 text-black shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                    : "bg-zinc-800 border-white/5 text-zinc-500 cursor-not-allowed opacity-50"
                }`}
              >
                <span>🃏</span>
                <span>HIT</span>
              </button>

              {/* STAY Button */}
              <button
                type="button"
                disabled={!isMyTurnNow || pendingAction || (board.mustFlipCount || 0) > 0 || isMinStayLocked}
                onClick={handleFreeze}
                className={`py-5 rounded-2xl font-black text-base uppercase tracking-wider transition-all border flex items-center justify-center gap-2 select-none touch-manipulation ${
                  isMyTurnNow && !pendingAction && (board.mustFlipCount || 0) === 0 && !isMinStayLocked
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    : "bg-zinc-800 border-white/5 text-zinc-500 cursor-not-allowed opacity-40"
                }`}
              >
                <span>✋</span>
                <span>{(board.mustFlipCount || 0) > 0 ? "LOCKED" : isMinStayLocked ? "<10 PTS" : "STAY"}</span>
              </button>
            </div>
          </div>
        }
      />
    </>
  );
};

export default PlayerViewContainer;
