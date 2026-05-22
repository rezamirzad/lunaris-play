import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { ROUNDS_CONFIG, getRandomTarget } from "./timeattackPlugin";

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

export const syncClock = mutation({
  args: { clientTime: v.number() },
  handler: async (ctx, args) => {
    return {
      serverTime: Date.now(),
      clientTime: args.clientTime,
    };
  },
});

export const submitInput = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.id("players"),
    clientTimestamp: v.optional(v.number()),
    type: v.union(v.literal("TAP"), v.literal("PRESS"), v.literal("RELEASE")),
  },
  handler: async (ctx, args) => {
    const serverReceivedTime = Date.now();
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "PLAYING")
      throw new Error("Invalid room state");

    const gameBoard = room.gameBoard;
    assertTimeAttack(gameBoard);

    if (gameBoard.phase !== "ACTIVE_PLAY") {
      throw new Error("Inputs only accepted during ACTIVE_PLAY");
    }

    const playerIdStr = args.playerId.toString();
    const playerSubmission = gameBoard.submissions[playerIdStr] || {
      inputs: [],
    };

    const timestamp = args.clientTimestamp ?? serverReceivedTime;

    // Logic: First input sets personalStartTime, second input (or release) is stored in inputs array
    if (!playerSubmission.personalStartTime) {
      playerSubmission.personalStartTime = timestamp;
    } else {
      playerSubmission.inputs.push({
        timestamp,
        type: args.type,
      });
    }

    gameBoard.submissions[playerIdStr] = playerSubmission;
    await ctx.db.patch(args.roomId, { gameBoard });
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

    if (gameBoard.phase === "ROUND_INTRO") {
      gameBoard.phase = "ACTIVE_PLAY";
      gameBoard.serverStartTime = Date.now();
      gameBoard.submissions = {};
    } else if (gameBoard.phase === "ACTIVE_PLAY") {
      gameBoard.phase = "ROUND_REVEAL";

      const config = ROUNDS_CONFIG[gameBoard.currentRound];
      const results: Record<string, number> = {};

      for (const [pidStr, sub] of Object.entries(gameBoard.submissions)) {
        if (sub.inputs.length > 0 && sub.personalStartTime) {
          let points = 0;

          // Use the correct input for timing
          const relevantInput =
            config.interaction === "PRESS_RELEASE"
              ? sub.inputs.find((i) => i.type === "RELEASE")
              : sub.inputs[sub.inputs.length - 1];

          if (!relevantInput) {
            // Failed to complete the action
            results[pidStr] = 0;
            continue;
          }

          const elapsed = relevantInput.timestamp - sub.personalStartTime;
          const delta = Math.abs(gameBoard.targetMs - elapsed);

          if (config.scoring === "PRECISION") {
            points = Math.max(0, 1000 - delta);
          } else if (config.scoring === "SURVIVAL") {
            const player = await ctx.db.get(pidStr as Id<"players">);
            const currentScore =
              player && player.state.gameType === "timeattack"
                ? player.state.score
                : 0;

            if (elapsed > gameBoard.targetMs) {
              points = -Math.floor(currentScore * 0.2);
            } else {
              points = Math.max(0, 1000 - delta);
            }
          }

          sub.actualMs = elapsed;
          sub.finalDeltaMs = delta;
          sub.pointsEarned = Math.floor(points);
          results[pidStr] = sub.pointsEarned;

          const player = await ctx.db.get(pidStr as Id<"players">);
          if (player && player.state.gameType === "timeattack") {
            await ctx.db.patch(player._id, {
              state: {
                ...player.state,
                score: Math.max(0, player.state.score + sub.pointsEarned),
              },
            });
          }
        }
      }
      gameBoard.roundResults = results;
    } else if (gameBoard.phase === "ROUND_REVEAL") {
      if (gameBoard.currentRound >= 10) {
        gameBoard.phase = "FINAL_LEADERBOARD";

        // Calculate Final Winner
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
          room.status = "FINISHED";
          gameBoard.winner = winner.name;
          gameBoard.winnerId = winner._id;
        }
      } else {
        gameBoard.currentRound += 1;
        const nextConfig = ROUNDS_CONFIG[gameBoard.currentRound];
        let target = nextConfig.targetMs;
        if (nextConfig.targetRange) {
          target = getRandomTarget(nextConfig.targetRange);
        }
        gameBoard.phase = "ROUND_INTRO";
        gameBoard.targetMs = target;
        gameBoard.visuals = nextConfig.visuals;
        gameBoard.interaction = nextConfig.interaction;
      }
    } else if (gameBoard.phase === "FINAL_LEADERBOARD") {
      room.status = "FINISHED";
    }

    await ctx.db.patch(args.roomId, { gameBoard, status: room.status });
  },
});
