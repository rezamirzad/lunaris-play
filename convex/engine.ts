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

    let initialHand: string[] = [];
    const gameSlug = room.currentGame?.toLowerCase();

    if (room.status === "LOBBY" && gameSlug === "dixit") {
      initialHand = ["BACK", "BACK", "BACK", "BACK", "BACK", "BACK"];
    } else if (room.status === "PLAYING") {
      if (gameSlug === "pioupiou") {
        initialHand = Array.from({ length: 4 }, () =>
          piouPiouGame.getRandomCard(),
        );
      } else if (gameSlug === "dixit") {
        // FIX: Pull from the unique pool stored in the room
        const pool = room.gameBoard.availableCards || [];
        if (pool.length >= 6) {
          initialHand = pool.slice(0, 6);
          // Update the room to remove the cards we just gave to the new player
          await ctx.db.patch(room._id, {
            gameBoard: {
              ...room.gameBoard,
              availableCards: pool.slice(6),
            },
          });
        } else {
          // Fallback: If pool is empty, just give empty hand or handle reshuffle
          initialHand = [];
        }
      }
    }

    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: args.playerName,
      gameHand: initialHand,
      state: { eggs: 0, chicks: 0, score: 0 },
      isReady: false,
    });

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

    const randomizedOrder = shuffle(players.map((p) => p._id));
    const gameSlug = room.currentGame?.toLowerCase();

    // DIXIT UNIQUE DEAL LOGIC
    let dixitPool: string[] = [];
    if (gameSlug === "dixit") {
      // Create and shuffle deck of 45 cards
      dixitPool = shuffle(
        Array.from({ length: 45 }, (_, i) => `dixit_${i + 1}`),
      );
    }

    // Deal unique cards to each player and update their state
    for (const player of players) {
      let initialHand: string[] = [];
      let initialState: any = {};

      if (gameSlug === "pioupiou") {
        initialHand = Array.from({ length: 4 }, () =>
          piouPiouGame.getRandomCard(),
        );
        initialState = { eggs: 0, chicks: 0, score: 0 };
      } else if (gameSlug === "dixit") {
        // Take 6 cards from the pool and remove them
        initialHand = dixitPool.splice(0, 6);
        initialState = { score: 0 };
      }

      await ctx.db.patch(player._id, {
        gameHand: initialHand,
        state: initialState,
      });
    }

    // Update the room state with the REMAINING deck
    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      turnOrder: randomizedOrder,
      currentTurnIndex: 0,
      gameBoard: {
        ...room.gameBoard,
        phase: gameSlug === "dixit" ? "CLUE" : undefined,
        availableCards: dixitPool, // Store the remaining cards here
        submittedCards: [],
        votes: [],
        history: [],
      },
    });
  },
});
