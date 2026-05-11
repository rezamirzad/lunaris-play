import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { finishTurn } from "./transitions";
import { DIXIT_DECK } from "./dixit_deck";

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

export const dixitPlugin: GamePlugin = {
  gameType: "dixit",

  getInitialBoard() {
    return {
      gameType: "none",
    };
  },

  getInitialPlayerState(status: string, room: Doc<"rooms">) {
    let initialHand: string[] = [];
    let initialState: any = { gameType: "none" };

    if (status === "LOBBY") {
      initialHand = ["BACK", "BACK", "BACK", "BACK", "BACK", "BACK"];
    } else if (status === "PLAYING") {
      if (room.gameBoard.gameType === "dixit") {
        const pool = room.gameBoard.availableCards || [];
        if (pool.length >= 6) {
          initialHand = pool.slice(0, 6);
        }
        initialState = { gameType: "dixit", score: 0 };
      }
    }

    return { initialHand, initialState };
  },

  async onStart(ctx: GameMutationCtx, roomId: Doc<"rooms">["_id"], players: Doc<"players">[]) {
    // Dynamically retrieve deck from manifest
    const dixitPool = shuffle([...DIXIT_DECK]);

    for (const player of players) {
      const initialHand = dixitPool.splice(0, 6);
      await ctx.db.patch(player._id, {
        gameHand: initialHand,
        state: { gameType: "dixit", score: 0 },
      });
    }

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "dixit",
        phase: "CLUE",
        availableCards: dixitPool,
        usedCards: [], // Explicit initialization for fresh game state
        submittedCards: [],
        votes: [],
        history: [{ key: "LOG_GAME_STARTED", data: { time: Date.now() } }],
      },
    });
  },
};

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    actionType: v.string(),
    cardId: v.optional(v.string()),
    clue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room) throw new Error("Room not found");

    if (room.gameBoard.gameType !== "dixit" || player.state.gameType !== "dixit") {
      throw new Error("Invalid state");
    }

    const board = room.gameBoard;
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (args.actionType === "SUBMIT_CLUE") {
      const storytellerId = room.turnOrder[room.currentTurnIndex];
      if (args.playerId !== storytellerId) throw new Error("NOT_YOUR_TURN");

      await ctx.db.patch(player._id, {
        gameHand: player.gameHand.filter((c) => c !== args.cardId),
      });

      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          gameType: "dixit",
          phase: "SUBMITTING",
          currentClue: args.clue,
          submittedCards: [{ playerId: player._id, cardId: args.cardId! }],
        },
      });
    }

    if (args.actionType === "SUBMIT_CARD") {
      const newSubmitted = [
        ...(board.submittedCards || []),
        { playerId: player._id, cardId: args.cardId! },
      ];

      await ctx.db.patch(player._id, {
        gameHand: player.gameHand.filter((c) => c !== args.cardId),
      });

      const allDone = newSubmitted.length === players.length;
      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          gameType: "dixit",
          submittedCards: newSubmitted,
          shuffledBoardCards: allDone ? shuffle([...newSubmitted]) : undefined,
          phase: allDone ? "VOTING" : "SUBMITTING",
        },
      });
    }

    if (args.actionType === "SUBMIT_VOTE") {
      const newVotes = [
        ...(board.votes || []),
        { voterId: player._id, cardId: args.cardId! },
      ];

      if (newVotes.length === players.length - 1) {
        await calculateScores(ctx, room, players, newVotes);
      } else {
        await ctx.db.patch(room._id, {
          gameBoard: { ...board, gameType: "dixit", votes: newVotes },
        });
      }
    }

    if (args.actionType === "NEXT_ROUND") {
      const winner = players.find((p) => (p.state.gameType === "dixit" ? p.state.score : 0) >= 30);
      
      const nextUsedCards = [
        ...(board.usedCards || []),
        ...board.submittedCards.map(s => s.cardId)
      ];

      return await finishTurn({
        ctx,
        room,
        advanceTurn: true,
        winnerName: winner?.name,
        winnerId: winner?._id,
        gameBoardPatch: {
          gameType: "dixit",
          phase: "CLUE",
          submittedCards: [],
          usedCards: nextUsedCards,
          votes: [],
          currentClue: "",
        },
      });
    }

    return { success: true };
  },
});

async function calculateScores(
  ctx: GameMutationCtx,
  room: Doc<"rooms">,
  players: Doc<"players">[],
  votes: { voterId: Doc<"players">["_id"]; cardId: string }[],
) {
  if (room.gameBoard.gameType !== "dixit") throw new Error("Invalid board");
  const board = room.gameBoard;
  const storytellerId = room.turnOrder[room.currentTurnIndex];
  const storytellerCard = board.submittedCards!.find(
    (c) => c.playerId === storytellerId,
  )!.cardId;

  let deck = [...(board.availableCards || [])];
  let used = [...(board.usedCards || [])];
  const correctVotes = votes.filter((v) => v.cardId === storytellerCard);
  const everyoneCorrect = correctVotes.length === players.length - 1;
  const noOneCorrect = correctVotes.length === 0;
  const roundPoints: Record<string, number> = {};

  for (const p of players) {
    if (p.state.gameType !== "dixit") throw new Error("Invalid player state");
    
    let scoreGain = 0;
    const isST = p._id === storytellerId;

    if (everyoneCorrect || noOneCorrect) {
      if (!isST) scoreGain = 2;
    } else {
      if (isST) scoreGain = 3;
      if (votes.find((v) => v.voterId === p._id && v.cardId === storytellerCard)) {
        scoreGain = 3;
      }
    }

    if (!isST) {
      const submission = board.submittedCards!.find((c) => c.playerId === p._id);
      if (submission) {
        scoreGain += votes.filter((v) => v.cardId === submission.cardId).length;
      }
    }

    roundPoints[p._id] = scoreGain;

    let newHand = [...p.gameHand];
    // Refill logic: if deck is empty, shuffle used cards back in
    if (deck.length === 0 && used.length > 0) {
      deck = shuffle(used);
      used = [];
    }

    if (deck.length > 0) {
      newHand.push(deck.shift()!);
    }

    await ctx.db.patch(p._id, {
      state: { ...p.state, gameType: "dixit", score: (p.state.score || 0) + scoreGain },
      gameHand: newHand,
    });
  }

  await ctx.db.patch(room._id, {
    gameBoard: {
      ...board,
      gameType: "dixit",
      votes: votes,
      phase: "RESULTS",
      availableCards: deck,
      usedCards: used,
      roundResults: {
        storytellerCard: storytellerCard,
        pointsEarned: roundPoints,
      },
    },
  });
}
