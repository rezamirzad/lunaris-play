import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { logHistoryEvent, updateLeaderboardAtGameEnd } from "./transitions";
import { justoneDictionary, NexusWord } from "./justone_words";
import { internal } from "./_generated/api";

/**
 * Helper to pick a fresh word from the dictionary.
 */
function pickFreshWord(usedWords: string[]): NexusWord {
  const available = justoneDictionary.filter((w) => !usedWords.includes(w.en));
  const source = available.length > 0 ? available : justoneDictionary;
  return source[Math.floor(Math.random() * source.length)];
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
    const mysteryWord = justoneDictionary[Math.floor(Math.random() * justoneDictionary.length)];
    const activePlayerId = players[Math.floor(Math.random() * players.length)]._id;

    await logHistoryEvent(ctx, roomId, { key: "LOG_GAME_STARTED", data: { time: Date.now() } });

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "justone",
        language: "en",
        round: 1,
        score: 0,
        activePlayerId,
        mysteryWord,
        usedWords: [mysteryWord.en],
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

export const startJustOneMatch = mutation({
  args: { 
    roomId: v.id("rooms"), 
    language: v.union(v.literal("en"), v.literal("fr"), v.literal("de"), v.literal("fa")),
    adminPin: v.string()
  },
  handler: async (ctx, args) => {
    const isAuthorized = args.adminPin === "0000";
    if (!isAuthorized) throw new Error("UNAUTHORIZED");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (players.length < 3) throw new Error("At least 3 players required.");

    const mysteryWord = justoneDictionary[Math.floor(Math.random() * justoneDictionary.length)];
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
        mysteryWord,
        usedWords: [mysteryWord.en],
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

        await ctx.db.patch(room._id, {
          gameBoard: { ...board, clues: newClues, canceledClues, confirmedPlayers: [], phase: "VALIDATION" },
        });
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
      const nonActivePlayers = players.filter((p) => p._id !== board.activePlayerId);
      const allConfirmed = nonActivePlayers.every((p) => newConfirmed.includes(p._id));

      await ctx.db.patch(room._id, {
        gameBoard: { ...board, confirmedPlayers: newConfirmed, phase: allConfirmed ? "GUESSING" : "VALIDATION" },
      });

      if (allConfirmed) {
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
        await ctx.db.patch(room._id, { gameBoard: { ...board, score: board.score + 1, phase: "ROUND_RESULTS" } as any });
      } else {
        await ctx.db.patch(room._id, { gameBoard: { ...board, lastGuess: args.guess, lenientVotes: {}, phase: "LENIENT_VALIDATION" } });
      }
    }

    if (args.actionType === "VOTE_LENIENT") {
      if (board.phase !== "LENIENT_VALIDATION") throw new Error("Not in lenient validation phase");
      const newVotes = { ...board.lenientVotes, [player._id]: !!args.isCorrect };
      const players = await ctx.db.query("players").withIndex("by_room", q => q.eq("roomId", room._id)).collect();
      const nonActivePlayers = players.filter((p) => p._id !== board.activePlayerId);
      const allVoted = nonActivePlayers.every((p) => newVotes[p._id] !== undefined);

      if (allVoted) {
        const allCorrect = nonActivePlayers.every((p) => newVotes[p._id] === true);
        const newScore = allCorrect ? board.score + 1 : board.score;
        await logHistoryEvent(ctx, room._id, { key: "LOG_DISCARD", data: { player: player.name, card: allCorrect ? "Correct" : "Wrong" } });
        await ctx.db.patch(room._id, { gameBoard: { ...board, score: newScore, phase: "ROUND_RESULTS", lenientVotes: newVotes } as any });
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
      const nextWord = pickFreshWord(board.usedWords || []);

      await ctx.db.patch(room._id, {
        gameBoard: { ...board, round: board.round + 1, activePlayerId: nextActiveId, mysteryWord: nextWord, usedWords: [...(board.usedWords || []), nextWord.en], clues: {}, canceledClues: [], confirmedPlayers: [], lenientVotes: {}, phase: "CLUE_INPUT" },
      });

      await ctx.scheduler.runAfter(0, internal.bots.manager.dispatchBotTurn, { roomId: room._id });
    }

    return { success: true };
}
