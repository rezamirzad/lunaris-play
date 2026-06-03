import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";
import { ROUNDS_CONFIG, getRandomTarget } from "./timeattackPlugin";
import { updateLeaderboardAtGameEnd } from "./transitions";

type TimeAttackBoard = Extract<
  Doc<"rooms">["gameBoard"],
  { gameType: "timeattack" }
>;

function assertTimeAttack(
  gameBoard: Doc<"rooms">["gameBoard"],
): asserts gameBoard is TimeAttackBoard {
  if (gameBoard.gameType !== "timeattack") {
    throw new Error("Room is not playing Time Attack");
  }
}

/**
 * submitResult: The device sends the total elapsed time measured locally.
 * Minimal Convex usage - only one call at the end of the action.
 */
export const submitResult = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.id("players"),
    durationMs: v.number(), // Precise to 0.001 of seconds
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "PLAYING")
      throw new Error("Invalid room state");

    const gameBoard = room.gameBoard;
    assertTimeAttack(gameBoard);

    if (gameBoard.phase !== "ACTIVE_PLAY") {
      throw new Error("Inputs only accepted during ACTIVE_PLAY");
    }

    const playerIdStr = args.playerId.toString();
    
    // Simply record the duration provided by the device
    gameBoard.submissions[playerIdStr] = {
      ...gameBoard.submissions[playerIdStr],
      actualMs: args.durationMs,
      inputs: [], // Kept for schema compatibility
    };

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    
    const submissionCount = Object.keys(gameBoard.submissions).length;
    const allPlayersDone = submissionCount >= players.length;

    await ctx.db.patch(args.roomId, { gameBoard });

    if (allPlayersDone) {
        // Auto-advance to reveal
        await ctx.scheduler.runAfter(0, (internal as any).timeattack.nextPhase, {
            roomId: args.roomId
        });
    }
  },
});

export const nextPhase = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const gameBoard = room.gameBoard;
    assertTimeAttack(gameBoard);

    let nextBoard = { ...gameBoard };

    if (nextBoard.phase === "ROUND_INTRO") {
      nextBoard.phase = "ACTIVE_PLAY";
      nextBoard.serverStartTime = Date.now();
      nextBoard.submissions = {};
    } else if (nextBoard.phase === "ACTIVE_PLAY") {
      nextBoard.phase = "ROUND_REVEAL";

      const config = ROUNDS_CONFIG[nextBoard.currentRound];
      const results: Record<string, number> = {};
      const updatedSubmissions = { ...nextBoard.submissions };

      for (const [pidStr, sub] of Object.entries(updatedSubmissions)) {
        if (sub.actualMs !== undefined) {
          let points = 0;
          const elapsed = sub.actualMs;
          const delta = Math.abs(nextBoard.targetMs - elapsed);

          if (config.scoring === "PRECISION") {
            points = Math.max(0, 1000 - delta);
          } else if (config.scoring === "SURVIVAL") {
            const player = await ctx.db.get(pidStr as Id<"players">);
            const currentScore =
              player && player.state.gameType === "timeattack"
                ? player.state.score
                : 0;

            if (elapsed > nextBoard.targetMs) {
              points = -Math.floor(currentScore * 0.2);
            } else {
              points = Math.max(0, 1000 - delta);
            }
          }

          updatedSubmissions[pidStr] = {
            ...sub,
            finalDeltaMs: delta,
            pointsEarned: Math.floor(points),
          };
          results[pidStr] = updatedSubmissions[pidStr].pointsEarned!;

          const player = await ctx.db.get(pidStr as Id<"players">);
          if (player && player.state.gameType === "timeattack") {
            await ctx.db.patch(player._id, {
              state: {
                ...player.state,
                score: Math.max(0, player.state.score + updatedSubmissions[pidStr].pointsEarned!),
              },
            });
          }
        }
      }
      nextBoard.submissions = updatedSubmissions;
      nextBoard.roundResults = results;
    } else if (nextBoard.phase === "ROUND_REVEAL") {
      if (nextBoard.currentRound >= 10) {
        nextBoard.phase = "FINAL_LEADERBOARD";

        const players = await ctx.db
          .query("players")
          .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
          .collect();

        if (players.length > 0) {
          const sortedPlayers = [...players].sort(
            (a, b) =>
              ((b.state as any).score || 0) - ((a.state as any).score || 0),
          );
          const winner = sortedPlayers[0];
          
          await ctx.db.patch(args.roomId, { status: "FINISHED" });
          nextBoard.winner = winner.name;
          nextBoard.winnerId = winner._id;

          const updatedRoom = { ...room, gameBoard: nextBoard, status: "FINISHED" };
          await updateLeaderboardAtGameEnd(ctx, updatedRoom as any, players);
        }
      } else {
        nextBoard.currentRound += 1;
        const nextConfig = ROUNDS_CONFIG[nextBoard.currentRound];
        let target = nextConfig.targetMs;
        if (nextConfig.targetRange) {
          target = getRandomTarget(nextConfig.targetRange);
        }
        nextBoard.phase = "ROUND_INTRO";
        nextBoard.targetMs = target;
        nextBoard.visuals = nextConfig.visuals;
        nextBoard.interaction = nextConfig.interaction;
        nextBoard.submissions = {};
      }
    } else if (nextBoard.phase === "FINAL_LEADERBOARD") {
      await ctx.db.patch(args.roomId, { status: "FINISHED" });
    }

    await ctx.db.patch(args.roomId, { gameBoard: nextBoard });
  },
});
