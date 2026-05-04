"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useGame(roomCode: string) {
  // Fix: Path changed from api.game to api.engine
  // Cast to any to prevent Vercel build blocks while types regenerate
  const gameState = useQuery((api as any).engine.getRoomState, { roomCode });

  const playerName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : null;

  const me = gameState?.players?.find((p: any) => p.name === playerName);

  // Added null-safety check for turnOrder and currentTurnIndex
  const isMyTurn =
    gameState?.turnOrder && gameState?.currentTurnIndex !== undefined
      ? gameState.turnOrder[gameState.currentTurnIndex] === me?._id
      : false;

  return {
    room: gameState,
    players: gameState?.players || [],
    me,
    isMyTurn,
    isLoading: gameState === undefined,
  };
}
