import { v } from "convex/values";
import { mutation, internalMutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { logHistoryEvent, updateLeaderboardAtGameEnd } from "./transitions";
import { justoneDictionary, NexusWord } from "./justone_words";
import { internal } from "./_generated/api";

// ... (helper functions for picking words updated below)

export const getClueDataForWord = query({
  args: { word: v.string(), language: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("justone_clues")
      .filter((q) => q.eq(q.field("word.en"), args.word))
      .first();
  },
});

export const getAllClues = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("justone_clues").collect();
  },
});

/**
 * Helper to pick a fresh word from the database.
 */
async function pickFreshWord(ctx: GameMutationCtx): Promise<Doc<"justone_clues">> {
  const allClues = await ctx.db.query("justone_clues").collect();
  const usedWords = await ctx.db.query("used_words").collect();
  const usedWordStrings = usedWords.map((uw: Doc<"used_words">) => uw.word);

  const available = allClues.filter((w: Doc<"justone_clues">) => !usedWordStrings.includes(w.word.en));
  const selected = available.length > 0 
    ? available[Math.floor(Math.random() * available.length)]
    : allClues[Math.floor(Math.random() * allClues.length)];

  await ctx.db.insert("used_words", { word: selected.word.en, lastUsed: Date.now() });
  return selected;
}

export const justonePlugin: GamePlugin = {
  gameType: "justone",

  getInitialBoard() {
    return {
      gameType: "none",
    };
  },

  getInitialPlayerState(status: string) {
    return {
      initialHand: [],
      initialState: { gameType: "justone", score: 0 },
    };
  },

  async onStart(ctx: GameMutationCtx, roomId: Id<"rooms">, players: Doc<"players">[]) {
    const mysteryWord = await pickFreshWord(ctx);
    const activePlayerId = players[Math.floor(Math.random() * players.length)]._id;

    await logHistoryEvent(ctx, roomId, { key: "LOG_GAME_STARTED", data: { time: Date.now() } });

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "justone",
        language: "en",
        round: 1,
        score: 0,
        activePlayerId,
        mysteryWord: mysteryWord.word,
        usedWords: [mysteryWord.word.en],
        clues: {},
        canceledClues: [],
        confirmedPlayers: [],
        lenientVotes: {},
        phase: "CLUE_INPUT",
      } as any,
    });

    await ctx.scheduler.runAfter(0, internal.bots.manager.dispatchBotTurn, {
        roomId,
    });
  },
};
// ... rest of the file unchanged

export const startJustOneMatch = mutation({
  args: {
    roomId: v.id("rooms"),
    language: v.union(v.literal("en"), v.literal("fr"), v.literal("de"), v.literal("fa")),
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify Admin Access
    if (args.adminPassword !== process.env.ADMIN_PASSWORD) {
      throw new Error("UNAUTHORIZED");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (players.length < 3) throw new Error("At least 3 players required.");

    const mysteryWord = await pickFreshWord(ctx);
    const activePlayerId = players[Math.floor(Math.random() * players.length)]._id;
    const turnOrder = players.map((p) => p._id);

    await logHistoryEvent(ctx, args.roomId, { key: "LOG_GAME_STARTED", data: { time: Date.now() } });

    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      turnOrder,
      currentTurnIndex: 0,
      gameBoard: {
        gameType: "justone",
        language: args.language,
        round: 1,
        score: 0,
        activePlayerId,
        mysteryWord: mysteryWord.word,
        usedWords: [mysteryWord.word.en],
        clues: {},
        canceledClues: [],
        confirmedPlayers: [],
        lenientVotes: {},
        phase: "CLUE_INPUT",
      } as any,
    });

    await ctx.scheduler.runAfter(0, internal.bots.manager.dispatchBotTurn, {
        roomId: args.roomId,
    });
  },
});

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    actionType: v.string(),
    clue: v.optional(v.string()),
    clues: v.optional(v.object({
      en: v.string(),
      fr: v.string(),
      de: v.string(),
      fa: v.string(),
    })),
    targetPlayerId: v.optional(v.id("players")),
    guess: v.optional(v.string()),
    isPass: v.optional(v.boolean()),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await handleActionInternal(ctx, args);
  },
});

export const handleActionAI = internalMutation({
  args: {
    playerId: v.id("players"),
    phase: v.string(),
    clue: v.optional(v.string()),
    clues: v.optional(v.object({
      en: v.string(),
      fr: v.string(),
      de: v.string(),
      fa: v.string(),
    })),
    guess: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.phase === "CLUE_INPUT") {
      await handleActionInternal(ctx, {
        playerId: args.playerId,
        actionType: "SUBMIT_CLUE",
        clue: args.clue,
        clues: args.clues
      });
    } else if (args.phase === "GUESSING") {
      await handleActionInternal(ctx, {
        playerId: args.playerId,
        actionType: "SUBMIT_GUESS",
        guess: args.guess
      });
    }
  },
});

export async function handleActionInternal(ctx: GameMutationCtx, args: {
    playerId: Id<"players">,
    actionType: string,
    clue?: string,
    clues?: { en: string, fr: string, de: string, fa: string },
    guess?: string,
    targetPlayerId?: Id<"players">,
    isPass?: boolean,
    isCorrect?: boolean
}) {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room || room.gameBoard.gameType !== "justone") throw new Error("Room not found");

    const board = room.gameBoard;

    if (args.actionType === "SUBMIT_CLUE") {
      if (board.phase !== "CLUE_INPUT") throw new Error("Not in clue phase");
      if (player._id === board.activePlayerId) throw new Error("Active player cannot give clues");

      const finalClueValue = args.clues ? (args.clues[board.language as keyof typeof args.clues] || args.clues.en) : args.clue!;
      const newClues = { ...board.clues, [player._id]: finalClueValue.toUpperCase() };
      
      const players = await ctx.db.query("players").withIndex("by_room", q => q.eq("roomId", room._id)).collect();
      const nonActivePlayers = players.filter((p) => p._id !== board.activePlayerId);
      const allCluesSubmitted = nonActivePlayers.every((p) => newClues[p._id]);

      if (allCluesSubmitted) {
        const canceledClues: Id<"players">[] = [];
        const clueCounts: Record<string, number> = {};
        Object.values(newClues).forEach((c) => {
          const normalized = c.toLowerCase();
          clueCounts[normalized] = (clueCounts[normalized] || 0) + 1;
        });
        Object.entries(newClues).forEach(([pId, c]) => {
          if (clueCounts[c.toLowerCase()] > 1) canceledClues.push(pId as Id<"players">);
        });

        // SCENARIO LOGIC: 
        // If there is at least one HUMAN among the clue givers, go to VALIDATION phase.
        // If there are ONLY bots giving clues, auto-validate and skip to GUESSING.
        const anyHumanClueGiver = nonActivePlayers.some(p => !p.isBot);
        const nextPhase = anyHumanClueGiver ? "VALIDATION" : "GUESSING";

        await ctx.db.patch(room._id, {
          gameBoard: { ...board, clues: newClues, canceledClues, confirmedPlayers: [], phase: nextPhase },
        });

        if (nextPhase === "GUESSING") {
           await ctx.scheduler.runAfter(0, internal.bots.manager.dispatchBotTurn, { roomId: room._id });
        }
      } else {
        await ctx.db.patch(room._id, { gameBoard: { ...board, clues: newClues } });
      }
    }

    if (args.actionType === "TOGGLE_CANCEL_CLUE") {
      if (board.phase !== "VALIDATION") throw new Error("Not in validation phase");
      const targetId = args.targetPlayerId!;
      const isCanceled = board.canceledClues.includes(targetId);
      const newCanceled = isCanceled ? board.canceledClues.filter((id) => id !== targetId) : [...board.canceledClues, targetId];
      await ctx.db.patch(room._id, { gameBoard: { ...board, canceledClues: newCanceled, confirmedPlayers: [] } });
    }

    if (args.actionType === "FINISH_VALIDATION") {
      if (board.phase !== "VALIDATION") throw new Error("Not in validation phase");
      const currentConfirmed = board.confirmedPlayers || [];
      if (currentConfirmed.includes(player._id)) return { success: true };
      const newConfirmed = [...currentConfirmed, player._id];
      const players = await ctx.db.query("players").withIndex("by_room", q => q.eq("roomId", room._id)).collect();
      
      const humanClueGivers = players.filter((p) => p._id !== board.activePlayerId && !p.isBot);
      const allHumansConfirmed = humanClueGivers.every((p) => newConfirmed.includes(p._id));

      await ctx.db.patch(room._id, {
        gameBoard: { ...board, confirmedPlayers: newConfirmed, phase: allHumansConfirmed ? "GUESSING" : "VALIDATION" },
      });

      if (allHumansConfirmed) {
        await ctx.scheduler.runAfter(0, internal.bots.manager.dispatchBotTurn, { roomId: room._id });
      }
    }

    if (args.actionType === "SUBMIT_GUESS") {
      if (board.phase !== "GUESSING") throw new Error("Not in guessing phase");
      if (args.isPass) {
        await logHistoryEvent(ctx, room._id, { key: "LOG_DISCARD", data: { player: player.name, card: "Passed" } });
        await ctx.db.patch(room._id, { gameBoard: { ...board, phase: "ROUND_RESULTS" } as any });
        return { success: true };
      }
      const guess = args.guess?.toLowerCase().trim() || "";
      const isExactMatch = Object.values(board.mysteryWord).some((val) => val.toLowerCase().trim() === guess);

      if (isExactMatch) {
        await logHistoryEvent(ctx, room._id, { key: "LOG_DISCARD", data: { player: player.name, card: "Correct" } });
        await ctx.db.patch(room._id, { gameBoard: { ...board, score: board.score + 1, phase: "ROUND_RESULTS", lastGuess: guess, guessWasCorrect: true } as any });
      } else {
        const players = await ctx.db.query("players").withIndex("by_room", q => q.eq("roomId", room._id)).collect();
        const humanVoters = players.filter(p => !p.isBot && p._id !== board.activePlayerId);

        if (humanVoters.length === 0) {
          // If no humans exist to judge the typo, it's considered wrong automatically
          await logHistoryEvent(ctx, room._id, { key: "LOG_DISCARD", data: { player: player.name, card: "Wrong" } });
          await ctx.db.patch(room._id, { gameBoard: { ...board, lastGuess: guess, phase: "ROUND_RESULTS", guessWasCorrect: false } as any });
        } else {
          await ctx.db.patch(room._id, { gameBoard: { ...board, lastGuess: guess, lenientVotes: {}, phase: "LENIENT_VALIDATION" } });
        }
      }
    }

    if (args.actionType === "VOTE_LENIENT") {
      if (board.phase !== "LENIENT_VALIDATION") throw new Error("Not in lenient validation phase");
      const newVotes = { ...board.lenientVotes, [player._id]: !!args.isCorrect };
      const players = await ctx.db.query("players").withIndex("by_room", q => q.eq("roomId", room._id)).collect();
      const humanVoters = players.filter((p) => !p.isBot && p._id !== board.activePlayerId);
      const allVoted = humanVoters.every((p) => newVotes[p._id] !== undefined);

      if (allVoted) {
        // Require unanimous human consensus to accept a typo
        const allCorrect = humanVoters.every((p) => newVotes[p._id] === true);
        const newScore = allCorrect ? board.score + 1 : board.score;
        await logHistoryEvent(ctx, room._id, { key: "LOG_DISCARD", data: { player: "Team", card: allCorrect ? "Correct" : "Wrong" } });
        await ctx.db.patch(room._id, { gameBoard: { ...board, score: newScore, phase: "ROUND_RESULTS", lenientVotes: newVotes, guessWasCorrect: allCorrect } as any });
      } else {
        await ctx.db.patch(room._id, { gameBoard: { ...board, lenientVotes: newVotes } });
      }
    }

    if (args.actionType === "NEXT_ROUND") {
      if (board.phase !== "ROUND_RESULTS") throw new Error("Not in results phase");
      const players = await ctx.db.query("players").withIndex("by_room", q => q.eq("roomId", room._id)).collect();

      if (board.round >= 13) {
        const patchedGameBoard = { ...board, phase: "GAME_OVER", winner: "TEAM" };
        await ctx.db.patch(room._id, { status: "FINISHED", gameBoard: patchedGameBoard as any });
        await updateLeaderboardAtGameEnd(ctx, { ...room, gameBoard: patchedGameBoard } as any, players);
        return;
      }

      const currentIndex = players.findIndex((p) => p._id === board.activePlayerId);
      const nextActiveId = players[(currentIndex + 1) % players.length]._id;
      const nextWord = await pickFreshWord(ctx);

      await ctx.db.patch(room._id, {
        gameBoard: { ...board, round: board.round + 1, activePlayerId: nextActiveId, mysteryWord: nextWord.word, usedWords: [...(board.usedWords || []), nextWord.word.en], clues: {}, canceledClues: [], confirmedPlayers: [], lenientVotes: {}, phase: "CLUE_INPUT" },
      });

      await ctx.scheduler.runAfter(0, internal.bots.manager.dispatchBotTurn, { roomId: room._id });
    }

    return { success: true };
}
