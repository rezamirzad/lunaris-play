"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";

export function useGame(roomCode: string) {
  const gameState = useQuery(api.engine.getRoomState, { roomCode });

  const playerName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : null;

  const players = (gameState?.players || []) as Doc<"players">[];
  const me = players.find((p) => p.name === playerName);

  // Derive turn information safely
  const turnOrder = gameState?.turnOrder || [];
  const currentTurnIndex = gameState?.currentTurnIndex ?? 0;
  const isMyTurn = turnOrder[currentTurnIndex] === me?._id;

  // Narrow the game board and state for easier consumption
  const gameBoard = gameState?.gameBoard;
  const myState = me?.state;

  return {
    room: gameState as (Doc<"rooms"> & { players: Doc<"players">[], gameMetadata: Doc<"games"> | null }) | null | undefined,
    players,
    me: me as Doc<"players"> | undefined,
    myState,
    gameBoard,
    isMyTurn,
    isLoading: gameState === undefined,
    gameMetadata: gameState?.gameMetadata,
  };
}
