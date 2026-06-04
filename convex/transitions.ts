import { Doc, Id } from "./_generated/dataModel";
import { GameMutationCtx } from "./types";
import { internal } from "./_generated/api";

export interface TransitionParams {
  ctx: GameMutationCtx;
  room: Doc<"rooms">;
  logPayload?: any; 
  winnerName?: string;
  winnerId?: Id<"players">;
  winnerIds?: Id<"players">[];
  advanceTurn: boolean;
  gameBoardPatch: any; // Game specific updates
}

export async function logHistoryEvent(ctx: GameMutationCtx, roomId: Id<"rooms">, event: any) {
  await ctx.db.insert("game_history", {
    roomId,
    event,
    timestamp: Date.now(),
  });
}

export async function updateLeaderboardAtGameEnd(ctx: GameMutationCtx, room: Doc<"rooms">, players: Doc<"players">[]) {
  const board = room.gameBoard as any;
  for (const p of players) {
    const profile = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", p.name))
      .unique();

    if (profile) {
      let isThisPlayerWinner = false;
      let currentScore = 0;

      if (p.state.gameType === "dixit") {
        isThisPlayerWinner = board.winnerIds?.includes(p._id) || p._id === board.winnerId;
        currentScore = p.state.score || 0;
      } else if (p.state.gameType === "pioupiou") {
        isThisPlayerWinner = p._id === board.winnerId;
        currentScore = p.state.chicks || 0;
      } else if (p.state.gameType === "themind") {
        isThisPlayerWinner = board.winner === "TEAM";
        currentScore = board.level || 0;
      } else if (p.state.gameType === "justone") {
        isThisPlayerWinner = board.winner === "TEAM";
        currentScore = board.score || 0;
      } else if (p.state.gameType === "incangold") {
        isThisPlayerWinner = p._id === board.winnerId;
        currentScore = p.state.bankedScore || 0;
      } else if (p.state.gameType === "timeattack") {
        isThisPlayerWinner = p._id === board.winnerId;
        currentScore = p.state.score || 0;
      }

      await ctx.db.patch(profile._id, {
        wins: (profile.wins || 0) + (isThisPlayerWinner ? 1 : 0),
        gamesPlayed: (profile.gamesPlayed || 0) + 1,
        totalScore: (profile.totalScore || 0) + currentScore,
      });
    }
  }
}

/**
 * Standardizes turn advancement, history logging, and win condition checking.
 * Ensures the 'gameBoard' maintains its discriminated union integrity.
 */
export async function finishTurn(params: TransitionParams) {
  const { ctx, room, logPayload, winnerName, winnerId, winnerIds, advanceTurn, gameBoardPatch } = params;

  const isWinner = !!winnerName;
  const newStatus = isWinner ? "FINISHED" : room.status;
  
  // 1. Log History (to cold table)
  if (logPayload) {
    await logHistoryEvent(ctx, room._id, logPayload);
  }

  // 2. Calculate Next Turn
  const nextTurnIndex = isWinner || !advanceTurn
    ? room.currentTurnIndex
    : (room.currentTurnIndex + 1) % room.turnOrder.length;

  const patchedGameBoard = {
    ...room.gameBoard,
    ...gameBoardPatch,
    winner: isWinner ? winnerName : (room.gameBoard as any).winner,
    winnerId: isWinner ? winnerId : (room.gameBoard as any).winnerId,
    ...(winnerIds ? { winnerIds } : {}),
  };

  // 3. Patch Room State
  await ctx.db.patch(room._id, {
    status: newStatus,
    currentTurnIndex: nextTurnIndex,
    gameBoard: patchedGameBoard as any,
  });

  // 4. Bot Dispatcher Hook
  if (newStatus === "PLAYING") {
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId: room._id,
    });
  }

  // 5. Update Global Leaderboard if the game is finished
  if (isWinner || newStatus === "FINISHED") {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const updatedRoom = { ...room, gameBoard: patchedGameBoard };
    await updateLeaderboardAtGameEnd(ctx, updatedRoom as any, players);
  }

  return { success: true, won: isWinner };
}
