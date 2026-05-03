import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Step 1: Standardized Join
export const joinRoom = mutation({
  args: { roomCode: v.string(), playerName: v.string() },
  handler: async (ctx, args) => {
    let room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .unique();

    if (!room) {
      const roomId = await ctx.db.insert("rooms", {
        roomCode: args.roomCode,
        status: "LOBBY",
        gameBoardState: {},
        turnOrder: [],
        currentTurnIndex: 0,
      });
      room = await ctx.db.get(roomId);
    }

    const playerId = await ctx.db.insert("players", {
      roomId: room!._id,
      name: args.playerName,
      score: 0,
      gameHandState: {},
      isReady: false,
    });

    return { roomId: room!._id, playerId };
  },
});

// Step 2: Standardized Turn Advancement
export const nextTurn = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return;

    const nextIndex = (room.currentTurnIndex + 1) % room.turnOrder.length;
    await ctx.db.patch(args.roomId, { currentTurnIndex: nextIndex });
  },
});
