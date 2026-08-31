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

  return (
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
        <div className="w-full grid grid-cols-2 gap-4 pt-2">
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
            <span>🎰</span>
            <span>HIT CARD</span>
          </button>

          {/* FREEZE Button */}
          <button
            disabled={!isMyTurnNow || pendingAction}
            onClick={handleFreeze}
            className={`py-5 rounded-2xl font-black text-base uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
              isMyTurnNow && !pendingAction
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 active:scale-95"
                : "bg-zinc-800 border-white/5 text-zinc-500 cursor-not-allowed opacity-50"
            }`}
          >
            <span>❄️</span>
            <span>FREEZE</span>
          </button>
        </div>
      }
    />
  );
};

export default PlayerViewContainer;
