import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listGames = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

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
        gameBoard: {}, // Fixed: changed from gameBoardState to gameBoard
        turnOrder: [],
        currentTurnIndex: 0,
      });
      room = await ctx.db.get(roomId);
    }

    const playerId = await ctx.db.insert("players", {
      roomId: room!._id,
      name: args.playerName,
      score: 0,
      gameHand: {}, // Fixed: changed from gameHandState to gameHand
      isReady: false,
    });

    return { roomId: room!._id, playerId };
  },
});

export const toggleReady = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;
    await ctx.db.patch(args.playerId, { isReady: !player.isReady });
  },
});

export const startGame = mutation({
  args: { roomId: v.id("rooms"), gameType: v.string() },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Basic validation: ensure everyone is ready
    const allReady = players.every((p) => p.isReady);
    if (!allReady) return { success: false, error: "Not everyone is ready!" };

    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      currentGame: args.gameType,
      // Initialize generic game board state
      gameBoard: { startTime: Date.now() },
    });

    // Initialize individual player hands for Piu Piu
    for (const player of players) {
      await ctx.db.patch(player._id, {
        gameHand: { eggs: 0, chicks: 0, cards: ["lay", "hatch", "fox"] },
      });
    }

    return { success: true };
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
