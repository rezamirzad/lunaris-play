import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

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
          submittedCards: newSubmitted,
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
          gameBoard: { ...board, votes: newVotes },
        });
      }
    }

    if (args.actionType === "NEXT_ROUND") {
      const winner = players.find((p) => (p.state.score || 0) >= 30);
      const nextBoard: any = {
        ...board,
        phase: "CLUE",
        submittedCards: [],
        votes: [],
        currentClue: "",
        winner: winner?.name,
      };
      delete nextBoard.roundResults;

      await ctx.db.patch(room._id, {
        status: winner ? "FINISHED" : "PLAYING",
        currentTurnIndex: (room.currentTurnIndex + 1) % room.turnOrder.length,
        gameBoard: nextBoard,
      });
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

  let deck = [...(board.availableCards || [])];
  const correctVotes = votes.filter((v) => v.cardId === storytellerCard);
  const everyoneCorrect = correctVotes.length === players.length - 1;
  const noOneCorrect = correctVotes.length === 0;
  const roundPoints: Record<string, number> = {};

  for (const p of players) {
    let scoreGain = 0;
    const isST = p._id === storytellerId;

    if (everyoneCorrect || noOneCorrect) {
      if (!isST) scoreGain = 2;
    } else {
      if (isST) scoreGain = 3;
      if (
        votes.find(
          (v: any) => v.voterId === p._id && v.cardId === storytellerCard,
        )
      ) {
        scoreGain = 3;
      }
    }

    if (!isST) {
      const myCard = board.submittedCards!.find(
        (c: any) => c.playerId === p._id,
      )!.cardId;
      scoreGain += votes.filter((v: any) => v.cardId === myCard).length;
    }

    roundPoints[p._id] = scoreGain;

    let newHand = [...p.gameHand];
    if (deck.length > 0) {
      newHand.push(deck.shift()!);
    }

    await ctx.db.patch(p._id, {
      state: { ...p.state, score: (p.state.score || 0) + scoreGain },
      gameHand: newHand,
    });
  }

  await ctx.db.patch(room._id, {
    gameBoard: {
      ...board,
      votes: votes,
      phase: "RESULTS",
      availableCards: deck,
      roundResults: {
        storytellerCard: storytellerCard,
        pointsEarned: roundPoints,
      },
    },
  });
}
