import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getGamePlugin } from "./registry";
import { internal } from "./_generated/api";

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

/**
 * Internal helper to validate admin access
 */
const validateAdmin = (password: string) => {
  const adminPass = process.env.ADMIN_PASSWORD || "LUNARIS2026";
  return password === adminPass;
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

    const history = await ctx.db
      .query("game_history")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .order("desc")
      .take(8);

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_room_player", (q) => q.eq("roomId", room._id))
      .collect();

    return { ...room, players, gameMetadata: game, history: history.map(h => h.event), submissions };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.name && u.name.toUpperCase() !== "ADMIN_NODE" && !u.isAdmin)
      .sort((a, b) => (b.wins || 0) - (a.wins || 0))
      .slice(0, 10);
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
    // Fallback to name-based lookup (legacy/guest)
    const existingByName = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

      if (existingByName) {
      await ctx.db.patch(existingByName._id, { lastLogin: Date.now() });
      return existingByName._id;
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

    await ctx.db.insert("games", {
      slug: "timeattack",
      title: "Time Attack",
      title_fr: "Contre la montre",
      title_de: "Zeitangriff",
      title_fa: "حمله زمانی",
      description: "A low-latency precision timing game.",
      description_fr: "Un jeu de précision et de timing.",
      description_de: "Ein Präzisions-Timing-Spiel.",
      description_fa: "بازی دقت و زمان‌بندی پایین‌تأخیر.",
      minPlayers: 2,
      suggestedMax: 4,
      absoluteMax: 8,
    });

    await ctx.db.insert("games", {
      slug: "incangold",
      title: "Incan Gold",
      title_fr: "Incan Gold",
      title_de: "Incan Gold",
      title_fa: "طلای اینکا",
      description: "A push-your-luck game of temple exploration.",
      description_fr: "Un jeu d'exploration de temple et de prise de risque.",
      description_de: "Ein Push-Your-Luck-Spiel zur Tempelexpedition.",
      description_fa: "یک بازی هیجان‌انگیز از اکتشاف معبد و شانس.",
      thumbnail: "/assets/games/incangold/box_scan.jpg.webp",
      minPlayers: 3,
      suggestedMax: 8,
      absoluteMax: 8,
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
  args: { 
    roomCode: v.string(), 
    playerName: v.string(),
    playerId: v.optional(v.id("players")) // For session persistence
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) =>
        q.eq("roomCode", args.roomCode.toUpperCase()),
      )
      .unique();

          if (!room) throw new Error("Room not found");

    // 1. Session Re-connection Check
      if (args.playerId) {
      const player = await ctx.db.get(args.playerId);
        if (player && player.roomId === room._id) {
        return { roomId: room._id, playerId: player._id };
      }
    }

    // 2. Name Availability Check (within room)
    const existingPlayerWithName = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .filter((q) => q.eq(q.field("name"), args.playerName))
      .unique();

      if (existingPlayerWithName) {
      // If we don't have the matching playerId but the name is taken, it's a conflict
 throw new Error("NAME_TAKEN");
    }

    // 3. Status Check
          if (room.status !== "LOBBY") {
 throw new Error("GAME_ALREADY_STARTED");
    }

    // 4. Player Limit Check
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();
    
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("slug"), room.currentGame))
      .unique();

      if (game && players.length >= game.absoluteMax) {
 throw new Error("ROOM_FULL");
    }

    // ENSURE PROFILE EXISTS for leaderboard tracking
    const profile = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.playerName))
      .unique();

      if (!profile) {
      await ctx.db.insert("users", {
        name: args.playerName,
        totalScore: 0,
        wins: 0,
        gamesPlayed: 0,
        lastLogin: Date.now(),
      });
    } else {
      await ctx.db.patch(profile._id, { lastLogin: Date.now() });
    }

    const plugin = getGamePlugin(room.currentGame);
    const { initialHand, initialState } = plugin.getInitialPlayerState(
      room.status,
      room,
    );

    const newPlayerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: args.playerName,
      gameHand: initialHand,
      state: initialState,
      isReady: false,
    });

    return { roomId: room._id, playerId: newPlayerId };
  },
});

export const addBot = mutation({
  args: { roomCode: v.string(), adminPassword: v.string() },
  handler: async (ctx, args) => {
    if (!validateAdmin(args.adminPassword)) throw new Error("UNAUTHORIZED");
    const room = await ctx.db.query("rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode.toUpperCase())).unique();
    if (!room) throw new Error("Room not found");
    if (room.status !== "LOBBY") throw new Error("NOT_IN_LOBBY");
    const players = await ctx.db.query("players").withIndex("by_room", (q) => q.eq("roomId", room._id)).collect();
    const game = await ctx.db.query("games").filter((q) => q.eq(q.field("slug"), room.currentGame)).unique();
    if (game && players.length >= game.absoluteMax) throw new Error("ROOM_FULL");
    const themedNames: Record<string, string[]> = { pioupiou: ["Pip", "Chirpy"], incangold: ["Lucky", "Rocky"], dixit: ["Dreamer", "Ink"], justone: ["Wordy", "Link"], themind: ["Zenny", "Sage"], timeattack: ["Turbo", "Dash"] };
    const namePool = themedNames[room.currentGame.toLowerCase()] || ["Alpha", "Beta"];
    const botName = namePool.find(n => !players.some(p => p.name === n)) || `Bot ${players.length + 1}`;
    const plugin = getGamePlugin(room.currentGame);
    const { initialHand, initialState } = plugin.getInitialPlayerState("LOBBY", room);
    await ctx.db.insert("players", { roomId: room._id, name: botName, isBot: true, persona: "balanced", gameHand: initialHand, state: initialState, isReady: true });
  },
});

export const removePlayer = mutation({
  args: { playerId: v.id("players"), adminPassword: v.string() },
  handler: async (ctx, args) => {
    if (!validateAdmin(args.adminPassword)) throw new Error("UNAUTHORIZED");
    const player = await ctx.db.get(args.playerId);
    if (!player) return;
    const room = await ctx.db.get(player.roomId);
    if (!room || room.status !== "LOBBY") throw new Error("NOT_IN_LOBBY");
    await ctx.db.delete(args.playerId);
  },
});

export const startGame = mutation({
  args: { roomId: v.id("rooms"), adminPassword: v.string() },
  handler: async (ctx, args) => {
    if (!validateAdmin(args.adminPassword)) throw new Error("UNAUTHORIZED");
    const room = await ctx.db.get(args.roomId);
    if (!room) return;
    const players = await ctx.db.query("players").withIndex("by_room", (q) => q.eq("roomId", args.roomId)).collect();
    if (players.length === 0) return;
    const plugin = getGamePlugin(room.currentGame);
    await plugin.onStart(ctx, room._id, players);
    await ctx.db.patch(args.roomId, { status: "PLAYING", turnOrder: shuffle(players.map((p) => p._id)), currentTurnIndex: 0 });
  },
});

export const toggleBotsHalt = mutation({
  args: { roomId: v.id("rooms"), adminPassword: v.string() },
  handler: async (ctx, args) => {
    if (!validateAdmin(args.adminPassword)) throw new Error("UNAUTHORIZED");
    const room = await ctx.db.get(args.roomId);
    if (!room) return;
    const nextHaltState = !room.botsHalted;
    await ctx.db.patch(args.roomId, { botsHalted: nextHaltState });
    if (!nextHaltState && room.status === "PLAYING") {
      await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, { roomId: args.roomId });
    }
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

export const resetRoom = mutation({
  args: { roomId: v.id("rooms"), adminPassword: v.string() },
  handler: async (ctx, args) => {
    if (!validateAdmin(args.adminPassword)) throw new Error("UNAUTHORIZED");
    const room = await ctx.db.get(args.roomId);
    if (!room) return;
    const plugin = getGamePlugin(room.currentGame);
    const players = await ctx.db.query("players").withIndex("by_room", (q) => q.eq("roomId", args.roomId)).collect();
    for (const player of players) {
      const { initialHand, initialState } = plugin.getInitialPlayerState("LOBBY", room);
      await ctx.db.patch(player._id, { isReady: false, gameHand: initialHand, state: initialState });
    }
    await ctx.db.patch(args.roomId, { status: "LOBBY", currentTurnIndex: 0, turnOrder: [], gameBoard: plugin.getInitialBoard() });
  },
});

export const verifyAdminPassword = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    return validateAdmin(args.password);
  },
});
