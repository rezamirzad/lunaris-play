"use client";

import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useTimeSync } from "./useTimeSync";
import { useCallback } from "react";

export type TimeAttackBoard = Extract<Doc<"rooms">["gameBoard"], { gameType: "timeattack" }>;

export function useTimeAttack(roomData: Doc<"rooms">, player: Doc<"players">) {
  const submitInput = useMutation(api.timeattack.submitInput);
  const nextPhase = useMutation(api.timeattack.nextPhase);
  const { getSyncedTime, latency } = useTimeSync();

  const gameBoard = roomData.gameBoard as TimeAttackBoard;

  const handleAction = useCallback((type: "TAP" | "PRESS" | "RELEASE") => {
    if (gameBoard.phase !== "ACTIVE_PLAY") return;

    const syncedTimestamp = getSyncedTime();
    
    submitInput({
      roomId: roomData._id,
      playerId: player._id,
      clientTimestamp: syncedTimestamp,
      type
    });

    // Provide haptic feedback
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }, [gameBoard.phase, getSyncedTime, submitInput, roomData._id, player._id]);

  const advance = useCallback(() => {
      nextPhase({ roomId: roomData._id });
  }, [nextPhase, roomData._id]);

  return {
    gameBoard,
    handleAction,
    advance,
    latency,
    isMyTurn: true, // In Time Attack, everyone plays simultaneously
  };
}
