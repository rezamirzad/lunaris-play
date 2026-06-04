import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { finishTurn, logHistoryEvent } from "./transitions";
import { DIXIT_DECK } from "./dixit_deck";
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

const DIXIT_HAND_SIZE = 6;
const DIXIT_HAND_SIZE_3P = 7;

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
      const playerCount = (room.turnOrder?.length || 0) + 1;
      const handSize = playerCount === 3 ? DIXIT_HAND_SIZE_3P : DIXIT_HAND_SIZE;
      initialHand = Array(handSize).fill("BACK");
    } else if (status === "PLAYING") {
      // IMPORTANT: Do not draw from the pool here, as it doesn't remove the cards from the database.
      // Late joiners get an empty hand and must be handled by game-specific logic or wait for next round.
      initialHand = []; 
      initialState = { gameType: "dixit", score: 0 };
    }

    return { initialHand, initialState };
  },

  async onStart(ctx: GameMutationCtx, roomId: Doc<"rooms">["_id"], players: Doc<"players">[]) {
    // 1. Initialize the deck: Use a clean copy of the manifest
    const dixitPool = shuffle([...DIXIT_DECK]);
    const personas: ("balanced" | "aggressive" | "cautious")[] = ["balanced", "aggressive", "cautious"];

    const startingHandSize = players.length === 3 ? DIXIT_HAND_SIZE_3P : DIXIT_HAND_SIZE;

    // 2. Distribute initial hands and remove from pool
    for (const player of players) {
      const initialHand = dixitPool.splice(0, startingHandSize);
      await ctx.db.patch(player._id, {
        gameHand: initialHand,
        state: { gameType: "dixit", score: 0 },
        persona: player.isBot ? personas[Math.floor(Math.random() * personas.length)] : undefined,
      });
    }

    const room = await ctx.db.get(roomId);
    const lobbyRuleset = (room?.gameBoard as any).ruleset;
    const defaultRuleset = lobbyRuleset || (players.length > 6 ? "ODYSSEY" : "CLASSIC");

    await logHistoryEvent(ctx, roomId, { key: "LOG_GAME_STARTED", data: { time: Date.now() } });

    // 3. Initialize board with the REMAINING cards in the pool
    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "dixit",
        phase: "CLUE",
        ruleset: defaultRuleset,
        availableCards: dixitPool, // Remaining cards after distribution
        usedCards: [],
        submittedCards: [],
        votes: [],
      } as any,
    });

    // Trigger initial bot turn if starting player is a bot
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId,
    });
  },
};

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    actionType: v.string(),
    cardId: v.optional(v.string()),
    clue: v.optional(v.string()),
    clues: v.optional(v.object({
      en: v.string(),
      fr: v.string(),
      de: v.string(),
      fa: v.string(),
    })),
    ruleset: v.optional(v.union(v.literal("CLASSIC"), v.literal("ODYSSEY"))),
    adminPin: v.optional(v.string()),
    voteIds: v.optional(v.array(v.string())), // For Odyssey multi-vote
    cardIds: v.optional(v.array(v.string())), // Backward compatibility
  },
  handler: async (ctx, args) => {
    return await handleActionInternal(ctx, args);
  },
});

export const handleActionAI = internalMutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.id("players"),
    phase: v.string(),
    cardId: v.optional(v.string()),
    clue: v.optional(v.string()),
    clues: v.optional(v.object({
      en: v.string(),
      fr: v.string(),
      de: v.string(),
      fa: v.string(),
    })),
    voteIds: v.optional(v.array(v.string())),
    cardIds: v.optional(v.array(v.string())), // Backward compatibility
  },
  handler: async (ctx, args) => {
    if (args.phase === "CLUE") {
      await handleActionInternal(ctx, {
        playerId: args.playerId,
        actionType: "SUBMIT_CLUE",
        cardId: args.cardId,
        clue: args.clue,
        clues: args.clues
      });
    } else if (args.phase === "SUBMITTING") {
      await handleActionInternal(ctx, {
        playerId: args.playerId,
        actionType: "SUBMIT_CARD",
        cardId: args.cardId
      });
    } else if (args.phase === "VOTING") {
      await handleActionInternal(ctx, {
        playerId: args.playerId,
        actionType: "SUBMIT_VOTE",
        voteIds: args.voteIds || (args.cardId ? [args.cardId] : [])
      });
    }
  },
});

export async function handleActionInternal(ctx: GameMutationCtx, args: {
    playerId: Id<"players">,
    actionType: string,
    cardId?: string,
    clue?: string,
    clues?: { en: string, fr: string, de: string, fa: string },
    ruleset?: "CLASSIC" | "ODYSSEY",
    voteIds?: string[],
    cardIds?: string[], adminPin?: string
}) {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room) throw new Error("Room not found");

    // Allow SET_RULESET in lobby even if state is 'none'
    if (args.actionType === "SET_RULESET" && room.status === "LOBBY") {
        if (args.adminPin !== process.env.ADMIN_PASSWORD) {
            throw new Error("UNAUTHORIZED");
        }
        
        await ctx.db.patch(room._id, {
            gameBoard: {
                gameType: "none",
                ruleset: args.ruleset
            }
        });
        return { success: true };
    }

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
        gameHand: (player.gameHand || []).filter((c: any) => c !== args.cardId),
      });

      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          gameType: "dixit",
          phase: "SUBMITTING",
          currentClue: args.clue || "",
          currentClues: args.clues,
          submittedCards: [{ playerId: player._id, cardId: args.cardId! }],
        },
      });

      await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
        roomId: room._id,
      });
    }

    if (args.actionType === "SUBMIT_CARD") {
      // Guard: Prevent duplicate submissions from the same player
      const existingSubmissions = board.submittedCards || [];
      if (existingSubmissions.some((s: any) => s.playerId === player._id)) {
          return { success: true }; // Silently ignore duplicate calls
      }

      const newSubmitted = [
        ...existingSubmissions,
        { playerId: player._id, cardId: args.cardId! },
      ];

      await ctx.db.patch(player._id, {
        gameHand: (player.gameHand || []).filter((c: any) => c !== args.cardId),
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

      if (allDone) {
        await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
          roomId: room._id,
        });
      }
    }

    if (args.actionType === "SUBMIT_VOTE" || args.actionType === "VOTE") {
      const storytellerId = room.turnOrder[room.currentTurnIndex];
      if (player._id === storytellerId) throw new Error("STORYTELLER_CANNOT_VOTE");

      const votesToCast = args.voteIds || args.cardIds || (args.cardId ? [args.cardId] : []);
      if (votesToCast.length === 0) throw new Error("NO_VOTES_PROVIDED");

      // Validate vote counts based on ruleset
      const isOdyssey = board.ruleset === "ODYSSEY";
      const maxVotes = isOdyssey ? 2 : 1;
      
      if (votesToCast.length > maxVotes) throw new Error(`MAX_VOTES_EXCEEDED_${maxVotes}`);

      // Self-voting check
      const mySubmission = board.submittedCards.find(s => s.playerId === player._id);
      if (mySubmission && votesToCast.includes(mySubmission.cardId)) {
          throw new Error("CANNOT_VOTE_FOR_SELF");
      }

      // Unique cards check
      const uniqueVotes = new Set(votesToCast);
      if (uniqueVotes.size !== votesToCast.length) throw new Error("DUPLICATE_VOTES_DETECTED");

      const newVotes = [
        ...(board.votes || []).filter((v: any) => v.voterId !== player._id),
        ...votesToCast.map((id: string) => ({ voterId: player._id, cardId: id })),
      ];

      const guessers = players.filter(p => p._id !== storytellerId);
      if (newVotes.length >= guessers.length) { // Minimum check, calculateScores handles final count
        // Check if all guessers have voted (at least once in Odyssey, exactly once in Classic)
        const votingPlayerIds = new Set(newVotes.map(v => v.voterId));
        if (votingPlayerIds.size === guessers.length) {
            await calculateScores(ctx, room, players, newVotes);
            return { success: true };
        }
      }
      
      await ctx.db.patch(room._id, {
        gameBoard: { ...board, gameType: "dixit", votes: newVotes },
      });
    }

    if (args.actionType === "NEXT_ROUND") {
      const potentialWinners = players.filter((p) => (p.state.gameType === "dixit" ? p.state.score : 0) >= 30);
      let winnerName: string | undefined;
      let winnerId: Id<"players"> | undefined;
      let winnerIds: Id<"players">[] | undefined;

      if (potentialWinners.length > 0) {
        const maxScore = Math.max(...potentialWinners.map((p) => (p.state.gameType === "dixit" ? p.state.score : 0)));
        const winners = potentialWinners.filter((p) => (p.state.gameType === "dixit" ? p.state.score : 0) === maxScore);
        
        if (winners.length > 0) {
          winnerName = winners.map(w => w.name).join(" & ");
          winnerId = winners[0]._id; // Fallback for components that don't support winnerIds yet
          winnerIds = winners.map(w => w._id as Id<"players">);
        }
      }
      
      const nextUsedCards = [
        ...(board.usedCards || []),
        ...board.submittedCards.map((s: any) => s.cardId)
      ];

      return await finishTurn({
        ctx,
        room,
        advanceTurn: true,
        winnerName,
        winnerId,
        winnerIds,
        gameBoardPatch: {
          gameType: "dixit",
          phase: "CLUE",
          ruleset: board.ruleset, // Preserve ruleset
          submittedCards: [],
          usedCards: nextUsedCards,
          votes: [],
          currentClue: "",
          currentClues: undefined,
        },
      });
    }

    return { success: true };
}

async function calculateScores(
  ctx: GameMutationCtx,
  room: Doc<"rooms">,
  players: Doc<"players">[],
  votes: { voterId: Doc<"players">["_id"]; cardId: string }[],
) {
  if (room.gameBoard.gameType !== "dixit") throw new Error("Invalid board");
  const board = room.gameBoard;
  const isOdyssey = board.ruleset === "ODYSSEY";
  const storytellerId = room.turnOrder[room.currentTurnIndex];
  const storytellerCard = board.submittedCards!.find(
    (c) => c.playerId === storytellerId,
  )!.cardId;

  let deck = [...(board.availableCards || [])];
  let used = [...(board.usedCards || [])];
  
  // Who correctly voted for the storyteller? (Unique players)
  const correctVoters = new Set(votes.filter((v) => v.cardId === storytellerCard).map(v => v.voterId));
  const totalGuessers = players.length - 1;
  const everyoneCorrect = correctVoters.size === totalGuessers;
  const noOneCorrect = correctVoters.size === 0;
  
  const roundPoints: Record<string, number> = {};

  for (const p of players) {
    if (p.state.gameType !== "dixit") throw new Error("Invalid player state");
    
    let scoreGain = 0;
    const isST = p._id === storytellerId;

    // STEP 1: Storyteller Condition (All or None)
    if (everyoneCorrect || noOneCorrect) {
      if (!isST) {
        scoreGain = 2; // Every other player gets 2 points
      }
      // ST gets 0 points in this case
    } else {
      // STEP 2: Successful Round
      if (isST) {
        scoreGain = 3; // Successful Storyteller gets 3 points
      } else if (correctVoters.has(p._id)) {
        // Correct Guess
        if (isOdyssey) {
          const myVotesCount = votes.filter(v => v.voterId === p._id).length;
          scoreGain = myVotesCount === 1 ? 4 : 3; // Risk Bonus (+1 if only 1 vote cast)
        } else {
          scoreGain = 3;
        }
      }
    }

    // STEP 3: Trap Votes (Applies to everyone except Storyteller)
    if (!isST) {
      const myCard = board.submittedCards!.find((c) => c.playerId === p._id)?.cardId;
      if (myCard) {
        const decoyVotes = votes.filter((v) => v.cardId === myCard && v.voterId !== storytellerId).length;
        if (isOdyssey) {
            scoreGain += Math.min(3, decoyVotes); // Capped at +3 in Odyssey
        } else {
            scoreGain += decoyVotes; // Classic: No cap
        }
      }
    }

    roundPoints[p._id] = scoreGain;

    // STEP 4: Draw back to full hand size
    const targetHandSize = (players.length === 3) ? DIXIT_HAND_SIZE_3P : DIXIT_HAND_SIZE;
    let newHand = [...p.gameHand];
    
    // Calculate how many cards this player needs to draw
    const cardsNeeded = targetHandSize - newHand.length;
    
    for (let i = 0; i < cardsNeeded; i++) {
      if (deck.length === 0 && used.length > 0) {
        deck = shuffle(used);
        used = [];
        console.log(`[DIXIT] 🔄 Reshuffled ${deck.length} cards back into the deck.`);
      }
      
      if (deck.length > 0) {
        const drawnCard = deck.shift()!;
        // Final safety check: ensure we aren't adding a duplicate that somehow got in
        if (!newHand.includes(drawnCard)) {
            newHand.push(drawnCard);
        } else {
            console.warn(`[DIXIT] ⚠️ Attempted to draw duplicate card ${drawnCard}. Skipping.`);
            i--; // Try to draw another one instead
        }
      }
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
      currentClue: board.currentClue,
      currentClues: board.currentClues,
      roundResults: {
        storytellerCard: storytellerCard,
        pointsEarned: roundPoints,
      },
    },
  });
}
