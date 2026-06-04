"use client";

import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useCallback, useRef } from "react";

export type TimeAttackBoard = Extract<Doc<"rooms">["gameBoard"], { gameType: "timeattack" }>;

export function useTimeAttack(roomData: Doc<"rooms">, player: Doc<"players">) {
  const submitResult = useMutation(api.timeattack.submitResult);
  const nextPhase = useMutation(api.timeattack.nextPhase);
  
  // Local state to track timing without hitting Convex
  const startTimeRef = useRef<number | null>(null);
  const submittedRef = useRef<boolean>(false);

  const gameBoard = roomData.gameBoard as TimeAttackBoard;

  if (gameBoard.phase === "ROUND_INTRO") {
    submittedRef.current = false;
  }

  const handleAction = useCallback((type: "TAP" | "PRESS" | "RELEASE") => {
    if (gameBoard.phase !== "ACTIVE_PLAY" || submittedRef.current) return;

    const now = performance.now(); // Use performance.now() for high precision

    if (gameBoard.interaction === "TAP") {
      if (startTimeRef.current === null) {
        // First tap: Start timing
        startTimeRef.current = now;
      } else {
        // Second tap: End timing and submit
        const duration = now - startTimeRef.current;
        submittedRef.current = true;
        submitResult({
          roomId: roomData._id,
          playerId: player._id,
          durationMs: duration,
        });
        startTimeRef.current = null;
      }
    } else if (gameBoard.interaction === "PRESS_RELEASE") {
      if (type === "PRESS") {
        startTimeRef.current = now;
      } else if (type === "RELEASE" && startTimeRef.current !== null) {
        const duration = now - startTimeRef.current;
        submittedRef.current = true;
        submitResult({
          roomId: roomData._id,
          playerId: player._id,
          durationMs: duration,
        });
        startTimeRef.current = null;
      }
    }

    // Provide haptic feedback
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }, [gameBoard.phase, gameBoard.interaction, submitResult, roomData._id, player._id]);

  const advance = useCallback(() => {
      nextPhase({ roomId: roomData._id });
  }, [nextPhase, roomData._id]);

  return {
    gameBoard,
    handleAction,
    advance,
    latency: 0, // Latency sync disabled for local timing
    isMyTurn: true,
  };
}
