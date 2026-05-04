import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

/**
 * Generates a random Dixit card ID (placeholder until art is ready).
 */
export const getRandomDixitCard = () => {
  return `dixit_${Math.floor(Math.random() * 100)}`;
};

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    actionType: v.string(), // "SUBMIT_CLUE", "SUBMIT_CARD", "SUBMIT_VOTE"
    cardId: v.optional(v.string()),
    clue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room) throw new Error("Room not found");

    const board = room.gameBoard;
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    // PHASE: CLUE (Storyteller submits card and text)
    if (args.actionType === "SUBMIT_CLUE") {
      if (board.phase !== "CLUE") throw new Error("INVALID_PHASE");

      const newHand = player.gameHand.filter((c) => c !== args.cardId);
      await ctx.db.patch(player._id, { gameHand: newHand });

      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          phase: "SUBMITTING",
          currentClue: args.clue,
          submittedCards: [{ playerId: player._id, cardId: args.cardId! }],
        },
      });
    }

    // PHASE: SUBMITTING (Mimics submit cards that match clue)
    if (args.actionType === "SUBMIT_CARD") {
      if (board.phase !== "SUBMITTING") throw new Error("INVALID_PHASE");

      const newSubmitted = [
        ...(board.submittedCards || []),
        { playerId: player._id, cardId: args.cardId! },
      ];
      const newHand = player.gameHand.filter((c) => c !== args.cardId);
      await ctx.db.patch(player._id, { gameHand: newHand });

      const allPlayersSubmitted = newSubmitted.length === players.length;

      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          submittedCards: newSubmitted,
          phase: allPlayersSubmitted ? "VOTING" : "SUBMITTING",
        },
      });
    }

    // PHASE: VOTING (Players pick which card belongs to Storyteller)
    if (args.actionType === "SUBMIT_VOTE") {
      if (board.phase !== "VOTING") throw new Error("INVALID_PHASE");

      const newVotes = [
        ...(board.votes || []),
        { voterId: player._id, cardId: args.cardId! },
      ];
      const allPlayersVoted = newVotes.length === players.length - 1;

      if (allPlayersVoted) {
        return await calculateScores(ctx, room, players, newVotes);
      } else {
        await ctx.db.patch(room._id, {
          gameBoard: { ...board, votes: newVotes },
        });
      }
    }

    return { success: true };
  },
});

async function calculateScores(
  ctx: any,
  room: Doc<"rooms">,
  players: Doc<"players">[],
  votes: any[],
) {
  const board = room.gameBoard;
  const storytellerId = room.turnOrder[room.currentTurnIndex];
  const storytellerCard = board.submittedCards!.find(
    (c) => c.playerId === storytellerId,
  )!.cardId;

  const correctVotes = votes.filter((v) => v.cardId === storytellerCard);
  const everyoneCorrect = correctVotes.length === players.length - 1;
  const noOneCorrect = correctVotes.length === 0;

  for (const p of players) {
    let scoreGain = 0;
    const isStoryteller = p._id === storytellerId;

    if (everyoneCorrect || noOneCorrect) {
      if (!isStoryteller) scoreGain = 2;
    } else {
      if (isStoryteller) scoreGain = 3;
      if (
        votes.find((v) => v.voterId === p._id && v.cardId === storytellerCard)
      )
        scoreGain = 3;
    }

    if (!isStoryteller) {
      const myCard = board.submittedCards!.find(
        (c) => c.playerId === p._id,
      )!.cardId;
      const votesForMe = votes.filter((v) => v.cardId === myCard).length;
      scoreGain += votesForMe;
    }

    await ctx.db.patch(p._id, {
      state: { ...p.state, score: (p.state.score || 0) + scoreGain },
      gameHand: [...p.gameHand, getRandomDixitCard()],
    });
  }

  // Win condition: 30 points
  const winner = players.find((p) => (p.state.score || 0) >= 30);

  await ctx.db.patch(room._id, {
    status: winner ? "FINISHED" : "PLAYING",
    currentTurnIndex: (room.currentTurnIndex + 1) % room.turnOrder.length,
    gameBoard: {
      ...board,
      phase: "CLUE",
      submittedCards: [],
      votes: [],
      currentClue: "",
      winner: winner?.name,
    },
  });
}
