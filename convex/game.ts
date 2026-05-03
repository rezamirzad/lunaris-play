// convex/game.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const playAction = mutation({
  args: {
    playerId: v.id("players"),
    action: v.string(),
    targetPlayerId: v.optional(v.id("players")),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;

    // Initialize state if it's missing to avoid undefined errors
    const currentState = player.state || { eggs: 0, chicks: 0 };

    if (args.action === "LAY_EGG") {
      await ctx.db.patch(args.playerId, {
        state: { ...currentState, eggs: (currentState.eggs || 0) + 1 },
      });
    } else if (args.action === "HATCH_CHICK") {
      // FIX: Check state.eggs, NOT gameHand.eggs
      if (currentState.eggs > 0) {
        await ctx.db.patch(args.playerId, {
          state: {
            ...currentState,
            eggs: currentState.eggs - 1,
            chicks: (currentState.chicks || 0) + 1,
          },
        });
      }
    } else if (args.action === "FOX_ATTACK" && args.targetPlayerId) {
      const target = await ctx.db.get(args.targetPlayerId);
      const targetState = target?.state || { eggs: 0, chicks: 0 };

      // FIX: Check targetState.eggs
      if (target && targetState.eggs > 0) {
        await ctx.db.patch(args.targetPlayerId, {
          state: { ...targetState, eggs: targetState.eggs - 1 },
        });
        await ctx.db.patch(args.playerId, {
          state: { ...currentState, eggs: (currentState.eggs || 0) + 1 },
        });
      }
    }
  },
});

export const getRoomState = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .unique();

    if (!room) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    return { ...room, players };
  },
});
