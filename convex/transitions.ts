import { Doc, Id } from "./_generated/dataModel";
import { GameMutationCtx } from "./types";

export interface TransitionParams {
  ctx: GameMutationCtx;
  room: Doc<"rooms">;
  logPayload?: any; 
  winnerName?: string;
  winnerId?: Id<"players">;
  advanceTurn: boolean;
  gameBoardPatch: any; // Game specific updates
}

/**
 * Standardizes turn advancement, history logging, and win condition checking.
 * Ensures the 'gameBoard' maintains its discriminated union integrity.
 */
export async function finishTurn(params: TransitionParams) {
  const { ctx, room, logPayload, winnerName, winnerId, advanceTurn, gameBoardPatch } = params;

  const isWinner = !!winnerName;
  const newStatus = isWinner ? "FINISHED" : room.status;
  
  // 1. Calculate History
  let history = (room.gameBoard as any).history || [];
  if (logPayload) {
    history = [logPayload, ...history].slice(0, 8);
  }

  // 2. Calculate Next Turn
  const nextTurnIndex = isWinner || !advanceTurn
    ? room.currentTurnIndex
    : (room.currentTurnIndex + 1) % room.turnOrder.length;

  // 3. Patch Room State
  await ctx.db.patch(room._id, {
    status: newStatus,
    currentTurnIndex: nextTurnIndex,
    gameBoard: {
      ...room.gameBoard,
      ...gameBoardPatch,
      history,
      winner: isWinner ? winnerName : (room.gameBoard as any).winner,
      winnerId: isWinner ? winnerId : (room.gameBoard as any).winnerId,
    } as any,
  });

  // 4. Update Global Leaderboard if the game is finished
  if (isWinner) {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    for (const p of players) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_name", (q) => q.eq("name", p.name))
        .unique();

      if (user) {
        const isThisPlayerWinner = p._id === winnerId;
        const currentScore = p.state.gameType === "dixit" ? p.state.score : p.state.gameType === "pioupiou" ? p.state.chicks : 0;
        
        await ctx.db.patch(user._id, {
          wins: user.wins + (isThisPlayerWinner ? 1 : 0),
          gamesPlayed: user.gamesPlayed + 1,
          totalScore: user.totalScore + (currentScore || 0),
        });
      }
    }
  }

  return { success: true, won: isWinner };
}
