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
export const validateAdmin = (password: string) => {
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

    return {
      ...room,
      players,
      gameMetadata: game,
      history: history.map((h) => h.event),
      submissions,
    };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter(
        (u) => u.name && u.name.toUpperCase() !== "ADMIN_NODE" && !u.isAdmin,
      )
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
      description: "A tactical battle of feathers and foxes.",
      description_fr: "Une bataille tactique de plumes et de renards.",
      description_de: "Ein taktischer Kampf um Federn und Füchse.",
      description_fa: "نبردی استراتژیک بین پرها و روباه‌ها.",
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
      description: "A journey through imagination and abstract art.",
      description_fr: "Un voyage à travers l'imagination et l'art abstrait.",
      description_de: "Eine Reise durch Fantasie und abstrakte Kunst.",
      description_fa: "سفری در میان تخیل و هنر انتزاعی.",
      thumbnail: "/assets/games/dixit/box_scan.jpg",
      minPlayers: 3,
      suggestedMax: 6,
      absoluteMax: 12,
    });

    await ctx.db.insert("games", {
      slug: "themind",
      title: "The Mind",
      title_fr: "The Mind",
      title_de: "The Mind",
      title_fa: "ذهن",
      description: "A silent dance of intuition and shared rhythm.",
      description_fr: "Une danse silencieuse d'intuition et de rythme partagé.",
      description_de: "Ein stiller Tanz aus Intuition und shared Rhythmus.",
      description_fa: "رقصی خاموش از شهود و ریتم مشترک.",
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
      description: "A collaborative search for the unique echo.",
      description_fr: "Une recherche collaborative de l'écho unique.",
      description_de: "Eine gemeinsame Suche nach dem einzigartigen Echo.",
      description_fa: "جستجویی مشترک برای طنین منحصر به فرد.",
      thumbnail: "/assets/games/justone/box_scan.png",
      minPlayers: 3,
      suggestedMax: 7,
      absoluteMax: 10,
    });

    await ctx.db.insert("games", {
      slug: "timeattack",
      title: "Time Attack",
      title_fr: "Time Attack",
      title_de: "Time Attack",
      title_fa: "حمله زمانی",
      description: "A test of precision in the blink of an eye.",
      description_fr: "Un test de précision en un clin d'œil.",
      description_de: "Ein Präzisionstest im Handumdrehen.",
      description_fa: "آزمون دقت در یک چشم به هم زدن.",
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
      description: "A daring descent into the depths of fortune.",
      description_fr:
        "Une descente audacieuse dans les profondeurs de la fortune.",
      description_de: "Ein gewagter Abstieg in die Tiefen des Glücks.",
      description_fa: "هبوطی جسورانه به اعماق خوشبختی.",
      thumbnail: "/assets/games/incangold/box_scan.jpg.webp",
      minPlayers: 3,
      suggestedMax: 8,
      absoluteMax: 8,
    });

    await ctx.db.insert("games", {
      slug: "flip7",
      title: "Flip 7",
      title_fr: "Flip 7",
      title_de: "Flip 7",
      title_fa: "فلیپ ۷",
      description: "Push your luck in the ultimate number flipping challenge!",
      description_fr: "Tentez votre chance dans le défi ultime de cartes!",
      description_de: "Fordern Sie Ihr Glück im ultimativen Kartenduell heraus!",
      description_fa: "شانس خود را در چالش هیجان‌انگیز فلیپ ۷ امتحان کنید!",
      thumbnail: "/assets/games/flip7/box_scan.jpg.webp",
      minPlayers: 2,
      suggestedMax: 6,
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
    playerId: v.optional(v.id("players")), // For session persistence
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
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) =>
        q.eq("roomCode", args.roomCode.toUpperCase()),
      )
      .unique();
    if (!room) throw new Error("Room not found");
    if (room.status !== "LOBBY") throw new Error("NOT_IN_LOBBY");
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("slug"), room.currentGame))
      .unique();
    if (game && players.length >= game.absoluteMax)
      throw new Error("ROOM_FULL");
    const themedNames: Record<string, string[]> = {
      pioupiou: [
        "Chirpy", "Barnaby", "Feathers", "Pip", "Rusty", 
        "Pippin", "Clover", "Hazel", "Squeak", "Buttercup", 
        "Tango", "Sunny", "Peanut", "Twiggy"
      ],
      incangold: [
        "Indiana", "Lara", "Blaze", "Wilder", "Tracker", 
        "Ranger", "Venture", "Goldie", "Falcon", "Sienna", 
        "Hunter", "Maverick", "Outlaw", "Flint"
      ],
      dixit: [
        "Dreamer", "Aura", "Luna", "Echo", "Mirage", 
        "Orion", "Celeste", "Vesper", "Solstice", "Fable", 
        "Poet", "Vision", "Nova", "Zephyr"
      ],
      justone: [
        "Wordsworth", "Lexicon", "Prose", "Anagram", "Rhyme", 
        "Cipher", "Glyph", "Scribe", "Synonym", "Stanza", 
        "Vellum", "Riddle", "Quill", "Enigma"
      ],
      themind: [
        "Sage", "Zenith", "Pulse", "Kensho", "Synapse", 
        "Bodhi", "Mindmeld", "Nirvana", "Chakra", "Serenity", 
        "Vortex", "Telepath", "Om", "Intuition"
      ],
      timeattack: [
        "Nitro", "Turbo", "Velocity", "Blitz", "Flash", 
        "Sonic", "Apex", "Pace", "Chrono", "Vector", 
        "Overdrive", "Volt", "Dash", "Ignition"
      ],
      flip7: [
        "Lucky Seven", "High Roller", "Risk Taker", "Jackpot", "Ace", 
        "Gamble", "Vegas", "Fortune", "Chance", "Flipper", 
        "Card Shark", "Wildcard", "Double Down", "Streak"
      ],
    };

    const fallbackNames = [
      "Atlas", "Orion", "Cipher", "Nexus", "Quantum", 
      "Spectra", "Aria", "Zephyr", "Apex", "Vesper"
    ];

    const namePool = themedNames[room.currentGame.toLowerCase()] || fallbackNames;
    let botName = namePool.find((n) => !players.some((p) => p.name === n));

    if (!botName) {
      const unusedFallback = fallbackNames.find((f) => !players.some((p) => p.name.includes(f)));
      if (unusedFallback) {
        botName = `Agent ${unusedFallback}`;
      } else {
        botName = `Agent ${players.length + 1}`;
      }
    }
    const plugin = getGamePlugin(room.currentGame);
    const { initialHand, initialState } = plugin.getInitialPlayerState(
      "LOBBY",
      room,
    );
    await ctx.db.insert("players", {
      roomId: room._id,
      name: botName,
      isBot: true,
      persona: "balanced",
      maturity: "ADULT",
      gameHand: initialHand,
      state: initialState,
      isReady: true,
    });
  },
});

export const setBotConfig = mutation({
  args: {
    playerId: v.id("players"),
    persona: v.optional(v.string()),
    maturity: v.optional(v.union(v.literal("CHILD"), v.literal("ADULT"))),
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (!validateAdmin(args.adminPassword)) throw new Error("UNAUTHORIZED");
    const player = await ctx.db.get(args.playerId);
    if (!player || !player.isBot) throw new Error("Bot not found");

    const patchData: any = {};
    if (args.persona !== undefined) patchData.persona = args.persona;
    if (args.maturity !== undefined) patchData.maturity = args.maturity;

    await ctx.db.patch(args.playerId, patchData);
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
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    if (players.length === 0) return;
    const plugin = getGamePlugin(room.currentGame);
    await plugin.onStart(ctx, room._id, players);
    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      turnOrder: shuffle(players.map((p) => p._id)),
      currentTurnIndex: 0,
    });
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
      await ctx.scheduler.runAfter(
        0,
        (internal as any).bots.manager.dispatchBotTurn,
        { roomId: args.roomId },
      );
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
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const player of players) {
      const { initialHand, initialState } = plugin.getInitialPlayerState(
        "LOBBY",
        room,
      );
      await ctx.db.patch(player._id, {
        isReady: false,
        gameHand: initialHand,
        state: initialState,
      });
    }
    await ctx.db.patch(args.roomId, {
      status: "LOBBY",
      currentTurnIndex: 0,
      turnOrder: [],
      gameBoard: plugin.getInitialBoard(),
    });
  },
});

export const verifyAdminPassword = query({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    return validateAdmin(args.password);
  },
});
