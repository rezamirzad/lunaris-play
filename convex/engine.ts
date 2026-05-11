import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGamePlugin } from "./registry";

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

    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("slug"), room.currentGame))
      .unique();

    return { ...room, players, gameMetadata: game };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_totalScore")
      .order("desc")
      .take(10);
  },
});

export const getUser = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});

export const getOrCreateUser = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastLogin: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      totalScore: 0,
      wins: 0,
      gamesPlayed: 0,
      lastLogin: Date.now(),
    });
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
      title: "Piou Piou",
      title_fr: "Piou Piou",
      title_de: "Piou Piou",
      title_fa: "پیو پیو",
      description: "Tactical henhouse card game.",
      description_fr: "Jeu de cartes tactique.",
      description_de: "Taktisches Kartenspiel.",
      description_fa: "بازی کارتی استراتژیک.",
      thumbnail: "/assets/games/pioupiou/box_scan.png",
      minPlayers: 2,
      suggestedMax: 5,
      absoluteMax: 8,
    });

    await ctx.db.insert("games", {
      slug: "dixit",
      title: "Dixit",
      title_fr: "Dixit",
      title_de: "Dixit",
      title_fa: "دیکسیت",
      description: "A game of imagination and abstract art.",
      description_fr: "Un jeu d'imagination et d'art.",
      description_de: "Ein Spiel der Fantasie.",
      description_fa: "بازی تخیل و هنر انتزاعی.",
      thumbnail: "/assets/games/dixit/box_scan.jpg",
      minPlayers: 3,
      suggestedMax: 6,
      absoluteMax: 12,
    });

    await ctx.db.insert("games", {
      slug: "themind",
      title: "Neural Sync",
      title_fr: "Neural Sync",
      title_de: "Neural Sync",
      title_fa: "همگام‌سازی عصبی",
      description: "A cooperative game of shared timing and intuition.",
      description_fr: "Un jeu coopératif de timing et d'intuition partagés.",
      description_de: "Ein kooperatives Spiel mit shared timing und Intuition.",
      description_fa: "یک بازی همکارانه از زمان‌بندی و شهود مشترک.",
      thumbnail: "/assets/games/themind/box_scan.png",
      minPlayers: 2,
      suggestedMax: 4,
      absoluteMax: 8,
    });

    await ctx.db.insert("games", {
      slug: "justone",
      title: "Just One",
      title_fr: "Just One",
      title_de: "Just One",
      title_fa: "فقط یکی",
      description: "A collaborative word association game.",
      description_fr: "Un jeu d'association de mots collaboratif.",
      description_de: "Ein kooperatives Wortassoziationsspiel.",
      description_fa: "یک بازی همکارانه تداعی کلمات.",
      thumbnail: "/assets/games/justone/box_scan.png",
      minPlayers: 3,
      suggestedMax: 7,
      absoluteMax: 10,
    });
  },
});

export const createRoom = mutation({
  args: { roomCode: v.string(), gameSlug: v.string() },
  handler: async (ctx, args) => {
    const plugin = getGamePlugin(args.gameSlug);
    return await ctx.db.insert("rooms", {
      roomCode: args.roomCode.toUpperCase(),
      status: "LOBBY",
      currentGame: args.gameSlug,
      currentTurnIndex: 0,
      turnOrder: [],
      gameBoard: plugin.getInitialBoard(),
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

    const plugin = getGamePlugin(room.currentGame);
    const { initialHand, initialState } = plugin.getInitialPlayerState(
      room.status,
      room,
    );

    // If we're playing Dixit, we might need to update the pool (side-effect from engine)
    if (
      room.status === "PLAYING" &&
      room.currentGame === "dixit" &&
      room.gameBoard.gameType === "dixit"
    ) {
      const pool = room.gameBoard.availableCards || [];
      if (pool.length >= initialHand.length) {
        await ctx.db.patch(room._id, {
          gameBoard: {
            ...room.gameBoard,
            gameType: "dixit",
            availableCards: pool.slice(initialHand.length),
          },
        });
      }
    }

    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: args.playerName,
      gameHand: initialHand,
      state: initialState,
      isReady: false,
    });

    if (room.status === "PLAYING") {
      const newTurnOrder = [...(room.turnOrder || []), playerId];
      const log = { key: "LOG_JOINED", data: { player: args.playerName } };

      if (room.gameBoard.gameType !== "none") {
        const history = [log as any, ...(room.gameBoard.history || [])].slice(
          0,
          8,
        );
        await ctx.db.patch(room._id, {
          turnOrder: newTurnOrder,
          gameBoard: {
            ...room.gameBoard,
            history,
          } as any,
        });
      } else {
        await ctx.db.patch(room._id, { turnOrder: newTurnOrder });
      }
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
    const plugin = getGamePlugin(room.currentGame);

    await plugin.onStart(ctx, room._id, players);

    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      turnOrder: randomizedOrder,
      currentTurnIndex: 0,
    });
  },
});

export const toggleReady = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;
    await ctx.db.patch(player._id, { isReady: !player.isReady });
  },
});

export const updatePlayerName = mutation({
  args: { playerId: v.id("players"), newName: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    await ctx.db.patch(player._id, { name: args.newName });
  },
});

export const getSecurityLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("security_logs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(50);
  },
});

export const verifyAdminPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    const ADMIN_PIN = "0000";
    const isAuthorized = args.pin === ADMIN_PIN;

    if (!isAuthorized) {
      await ctx.db.insert("security_logs", {
        event: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
        timestamp: Date.now(),
        details: { attemptedPin: args.pin },
      });
    } else {
      await ctx.db.insert("security_logs", {
        event: "ADMIN_ACCESS_GRANTED",
        timestamp: Date.now(),
        details: {},
      });
    }

    return isAuthorized;
  },
});
