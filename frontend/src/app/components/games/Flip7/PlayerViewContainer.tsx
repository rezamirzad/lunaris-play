"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import PlayerController from "../../shared/PlayerController";
import BackgroundAudioPlayer from "../../shared/BackgroundAudioPlayer";
import Flip7Card from "./Flip7Card";
import { parseFlip7Card, calculateFlip7RoundScore } from "../../../../../../convex/flip7_deck";

const PlayerViewContainer: React.FC<PlayerProps> = ({ player, roomData, isMyTurn }) => {
  const { t } = useTranslation();
  const flip7Api = (api as any).flip7;

  const hitCard = useMutation(flip7Api.hitCard);
  const freeze = useMutation(flip7Api.freeze);
  const resolveTargetAction = useMutation(flip7Api.resolveTargetAction);

  const [pendingAction, setPendingAction] = useState(false);

  const board = roomData.gameBoard;
  const myState = player.state as any;

  if (!board || board.gameType !== "flip7") return null;
  if (!myState || myState.gameType !== "flip7") return null;

  const isMyTurnNow = board.phase === "ACTIVE_PLAY" && String(board.currentTurnPlayerId) === String(player._id) && myState.status === "ACTIVE";
  const faceUpCards = (myState.roundFaceUpCards as string[]) || [];
  const scoreInfo = calculateFlip7RoundScore(faceUpCards);

  const handleHit = async () => {
    if (pendingAction || !isMyTurnNow) return;
    if (navigator.vibrate) navigator.vibrate(50);
    setPendingAction(true);
    try {
      await hitCard({ playerId: player._id });
    } catch (err) {
      console.error("Failed to hit card:", err);
    } finally {
      setPendingAction(false);
    }
  };

  const handleFreeze = async () => {
    if (pendingAction || !isMyTurnNow) return;
    if (navigator.vibrate) navigator.vibrate(50);
    setPendingAction(true);
    try {
      await freeze({ playerId: player._id });
    } catch (err) {
      console.error("Failed to freeze:", err);
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
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none font-mono">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border-2 border-amber-400/50 rounded-3xl p-6 max-w-md w-full flex flex-col gap-4 text-center shadow-2xl"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl">
                {board.pendingTargetAction?.actionType === "FREEZE" ? "❄️" : "⚡"}
              </span>
              <h3 className="text-lg font-black text-amber-300 italic uppercase">
                {board.pendingTargetAction?.actionType === "FREEZE" ? "TARGET FREEZE" : "TARGET FLIP THREE"}
              </h3>
              <p className="text-xs text-zinc-400">
                Choose yourself or an opponent to receive this action card!
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {roomData.players
                .filter((p) => (p.state as any)?.status === "ACTIVE")
                .map((p) => {
                  const isMe = String(p._id) === String(player._id);
                  return (
                    <button
                      key={p._id}
                      disabled={pendingAction}
                      onClick={() => handleSelectTarget(p._id)}
                      className={`p-3 rounded-xl font-black text-sm uppercase tracking-wider border flex items-center justify-between transition-all ${
                        isMe
                          ? "bg-amber-950/60 border-amber-400 text-amber-300 hover:bg-amber-900/80"
                          : "bg-zinc-800 border-white/10 text-white hover:bg-zinc-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{isMe ? "👤 Yourself" : `🎯 ${p.name}`}</span>
                        {p.isBot && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-amber-300">BOT</span>}
                      </span>
                      <span className="text-xs text-zinc-400">
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
                <BackgroundAudioPlayer src="/assets/games/incangold/audio/ambience_cave_00.wav" />
                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[9px] font-mono font-black text-amber-400">
                  {myState.bankedScore || 0} PTS
                </div>
              </div>
            </div>

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
                  {faceUpCards.map((cId, idx) => (
                    <Flip7Card key={cId + idx} cardId={cId} size="sm" />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        }
        actionsSlot={
          <div className="w-full flex flex-col gap-2 pt-2">
            {(board.mustFlipCount || 0) > 0 && isMyTurnNow && (
              <div className="bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
                <span>⚡</span>
                <span>FLIP THREE MANDATORY: STAY IS LOCKED ({board.mustFlipCount} FLIPS REMAINING)</span>
              </div>
            )}
            <div className="w-full grid grid-cols-2 gap-4">
              {/* HIT Button */}
              <button
                disabled={!isMyTurnNow || pendingAction}
                onClick={handleHit}
                className={`py-5 rounded-2xl font-black text-base uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                  isMyTurnNow && !pendingAction
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-300 text-black shadow-lg shadow-amber-500/20 active:scale-95"
                    : "bg-zinc-800 border-white/5 text-zinc-500 cursor-not-allowed opacity-50"
                }`}
              >
                <span>🃏</span>
                <span>HIT</span>
              </button>

              {/* STAY Button */}
              <button
                disabled={!isMyTurnNow || pendingAction || (board.mustFlipCount || 0) > 0}
                onClick={handleFreeze}
                className={`py-5 rounded-2xl font-black text-base uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                  isMyTurnNow && !pendingAction && (board.mustFlipCount || 0) === 0
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 active:scale-95"
                    : "bg-zinc-800 border-white/5 text-zinc-500 cursor-not-allowed opacity-40"
                }`}
              >
                <span>✋</span>
                <span>{(board.mustFlipCount || 0) > 0 ? "LOCKED" : "STAY"}</span>
              </button>
            </div>
          </div>
        }
      />
    </>
  );
};

export default PlayerViewContainer;
