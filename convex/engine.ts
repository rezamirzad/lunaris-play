import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import * as piouPiouGame from "./games/pioupiou";

/**
 * Standard Fisher-Yates Shuffle
 */
const shuffle = <T>(array: T[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- QUERIES ---

export const listGames = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

export const getOngoingRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("rooms").order("desc").take(10);

    return rooms.filter((room) => room.status !== "FINISHED");
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

// --- MUTATIONS ---

export const createRoom = mutation({
  args: { roomCode: v.string(), gameSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rooms", {
      roomCode: args.roomCode,
      status: "LOBBY",
      currentGame: args.gameSlug,
      currentTurnIndex: 0,
      turnOrder: [],
      gameBoard: {
        history: [],
        lastWarning: null,
        pendingAttack: null,
      },
    });
  },
});

export const joinRoom = mutation({
  args: { roomCode: v.string(), playerName: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .unique();

    if (!room) throw new Error("Room not found");

    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .filter((q) => q.eq(q.field("name"), args.playerName))
      .unique();

    if (existingPlayer) {
      return { roomId: room._id, playerId: existingPlayer._id };
    }

    return await ctx.db.insert("players", {
      roomId: room._id,
      name: args.playerName,
      gameHand: [],
      state: { eggs: 0, chicks: 0 },
      isReady: false,
    });
  },
});

export const startGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (players.length === 0) return;

    const playerIds = players.map((p) => p._id);
    const randomizedOrder = shuffle(playerIds);

    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      turnOrder: randomizedOrder,
      currentTurnIndex: 0,
    });

    if (room.currentGame?.toLowerCase() === "pioupiou") {
      for (const player of players) {
        const initialHand = Array.from({ length: 4 }, () =>
          piouPiouGame.getRandomCard(),
        );

        await ctx.db.patch(player._id, {
          gameHand: initialHand,
          state: { eggs: 0, chicks: 0 },
        });
      }
    }
  },
});
