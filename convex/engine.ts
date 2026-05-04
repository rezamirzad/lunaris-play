import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import * as piouPiouGame from "./games/pioupiou";
import * as dixitGame from "./games/dixit";

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
    const rooms = await ctx.db.query("rooms").order("desc").collect();

    return rooms.map((room) => ({
      ...room,
      isJoinable: room.status !== "FINISHED" && room.status !== "CANCELLED",
    }));
  },
});

export const getRoomState = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    // Force search to be uppercase to match created rooms
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) =>
        q.eq("roomCode", args.roomCode.toUpperCase()),
      )
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

export const seedGames = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("games").collect();
    for (const game of existing) {
      await ctx.db.delete(game._id);
    }

    await ctx.db.insert("games", {
      slug: "pioupiou",
      title: "pioupiou_title",
      description: "pioupiou_desc",
      thumbnail: "/assets/games/pioupiou/box_scan.png",
      minPlayers: 2,
      suggestedMax: 5,
      absoluteMax: 8,
    });

    await ctx.db.insert("games", {
      slug: "dixit",
      title: "dixit_title",
      description: "dixit_desc",
      thumbnail: "/assets/games/dixit/box_scan.jpg",
      minPlayers: 3,
      suggestedMax: 6,
      absoluteMax: 12,
    });
  },
});

export const createRoom = mutation({
  args: { roomCode: v.string(), gameSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rooms", {
      // Force room code to uppercase upon creation
      roomCode: args.roomCode.toUpperCase(),
      status: "LOBBY",
      currentGame: args.gameSlug,
      currentTurnIndex: 0,
      turnOrder: [],
      gameBoard: {
        history: [],
        lastWarning: null,
        pendingAttack: null,
        submittedCards: [],
        votes: [],
        phase: args.gameSlug.toLowerCase() === "dixit" ? "CLUE" : undefined,
      },
    });
  },
});

export const joinRoom = mutation({
  args: { roomCode: v.string(), playerName: v.string() },
  handler: async (ctx, args) => {
    // Force room code to uppercase for the lookup
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) =>
        q.eq("roomCode", args.roomCode.toUpperCase()),
      )
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

    // FEATURE: Handle Join-In-Progress logic
    let initialHand: string[] = [];
    const gameSlug = room.currentGame?.toLowerCase();

    // Deal cards immediately if the game is already playing
    if (room.status === "PLAYING") {
      if (gameSlug === "pioupiou") {
        initialHand = Array.from({ length: 4 }, () =>
          piouPiouGame.getRandomCard(),
        );
      } else if (gameSlug === "dixit") {
        initialHand = Array.from({ length: 6 }, () =>
          dixitGame.getRandomDixitCard(),
        );
      }
    }

    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: args.playerName,
      gameHand: initialHand,
      state: { eggs: 0, chicks: 0, score: 0 },
      isReady: false,
    });

    // If game is active, update turn rotation and history to include new player
    if (room.status === "PLAYING") {
      const newTurnOrder = [...(room.turnOrder || []), playerId];
      const newHistory = [
        { key: "LOG_JOINED", data: { player: args.playerName } },
        ...(room.gameBoard?.history || []),
      ].slice(0, 8);

      await ctx.db.patch(room._id, {
        turnOrder: newTurnOrder,
        gameBoard: {
          ...room.gameBoard,
          history: newHistory,
        },
      });
    }

    return { roomId: room._id, playerId };
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

    const gameSlug = room.currentGame?.toLowerCase();

    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      turnOrder: randomizedOrder,
      currentTurnIndex: 0,
      gameBoard: {
        ...room.gameBoard,
        phase: gameSlug === "dixit" ? "CLUE" : undefined,
        submittedCards: [],
        votes: [],
        history: [],
      },
    });

    for (const player of players) {
      let initialHand: string[] = [];
      let initialState: any = {};

      if (gameSlug === "pioupiou") {
        initialHand = Array.from({ length: 4 }, () =>
          piouPiouGame.getRandomCard(),
        );
        initialState = { eggs: 0, chicks: 0, score: 0 };
      } else if (gameSlug === "dixit") {
        initialHand = Array.from({ length: 6 }, () =>
          dixitGame.getRandomDixitCard(),
        );
        initialState = { eggs: 0, chicks: 0, score: 0 };
      }

      await ctx.db.patch(player._id, {
        gameHand: initialHand,
        state: initialState,
      });
    }
  },
});
