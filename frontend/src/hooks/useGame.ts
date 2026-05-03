// frontend/src/hooks/useGame.ts
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function useGame(roomCode: string) {
  const gameState = useQuery(api.game.getRoomState, { roomCode });

  const playerName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : null;
  const me = gameState?.players?.find((p: any) => p.name === playerName);

  const isMyTurn =
    gameState?.turnOrder[gameState?.currentTurnIndex] === me?._id;

  return {
    room: gameState,
    players: gameState?.players || [],
    me,
    isMyTurn,
    isLoading: gameState === undefined,
  };
}
