import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";
import { getFlip7Deck, parseFlip7Card, calculateFlip7RoundScore } from "./flip7_deck";
import { GamePlugin, GameMutationCtx } from "./types";

export const flip7Plugin: GamePlugin = {
  gameType: "flip7",

  getInitialBoard() {
    return {
      gameType: "none",
    };
  },

  getInitialPlayerState() {
    return {
      initialHand: [],
      initialState: {
        gameType: "flip7",
        bankedScore: 0,
        roundScore: 0,
        roundFaceUpCards: [],
        hasSecondChance: false,
        status: "ACTIVE",
      },
    };
  },

  async onStart(
    ctx: GameMutationCtx,
    roomId: Doc<"rooms">["_id"],
    players: Doc<"players">[],
  ) {
    const deck = getFlip7Deck();
    const personas: ("balanced" | "aggressive" | "cautious")[] = [
      "balanced",
      "aggressive",
      "cautious",
    ];

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      await ctx.db.patch(player._id, {
        gameHand: [],
        persona: personas[i % personas.length],
        state: {
          gameType: "flip7",
          bankedScore: 0,
          roundScore: 0,
          roundFaceUpCards: [],
          hasSecondChance: false,
          status: "ACTIVE",
        },
      });
    }

    const firstPlayerId = players[0]?._id;

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "flip7",
        phase: "ACTIVE_PLAY",
        currentRound: 1,
        targetScore: 200,
        currentTurnPlayerId: firstPlayerId,
        mustFlipCount: 0,
        deck,
        discardPile: [],
      } as any,
    });

    if (firstPlayerId) {
      await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
        roomId,
      });
    }
  },
};

export const hitCard = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    return await handleHitCardInternal(ctx, args.playerId);
  },
});

export const freeze = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    return await handleFreezeInternal(ctx, args.playerId);
  },
});

export const performBotTurn = internalMutation({
  args: {
    playerId: v.id("players"),
    action: v.union(v.literal("HIT"), v.literal("FREEZE")),
  },
  handler: async (ctx, args) => {
    if (args.action === "HIT") {
      return await handleHitCardInternal(ctx, args.playerId);
    } else {
      return await handleFreezeInternal(ctx, args.playerId);
    }
  },
});

export const nextRound = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "flip7") {
      throw new Error("Invalid room");
    }

    const board = room.gameBoard;
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    // Check if game is over
    const winnerPlayer = players.find((p) => {
      const state = p.state as any;
      return state.bankedScore >= board.targetScore;
    });

    if (winnerPlayer) {
      // Sort players by total score
      const sorted = [...players].sort((a, b) => ((b.state as any).bankedScore || 0) - ((a.state as any).bankedScore || 0));
      await ctx.db.patch(room._id, {
        status: "FINISHED",
        gameBoard: {
          ...board,
          phase: "FINAL_LEADERBOARD",
          winner: sorted[0].name,
          winnerId: sorted[0]._id,
        } as any,
      });
      return { success: true };
    }

    // Reset for next round
    const deck = getFlip7Deck();
    const currentRound = board.currentRound + 1;

    // Reset player round state
    for (const p of players) {
      await ctx.db.patch(p._id, {
        state: {
          gameType: "flip7",
          bankedScore: (p.state as any).bankedScore || 0,
          roundScore: 0,
          roundFaceUpCards: [],
          hasSecondChance: false,
          status: "ACTIVE",
        },
      });
    }

    const firstPlayerId = room.turnOrder[0] || players[0]._id;

    await ctx.db.patch(room._id, {
      gameBoard: {
        ...board,
        phase: "ACTIVE_PLAY",
        currentRound,
        deck,
        discardPile: [],
        currentTurnPlayerId: firstPlayerId,
        mustFlipCount: 0,
        lastAction: undefined,
        roundResults: undefined,
      } as any,
    });

    // Dispatch bot turn if first player is bot
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId: room._id,
    });

    return { success: true };
  },
});

async function handleHitCardInternal(ctx: GameMutationCtx, playerId: Id<"players">) {
  const player = await ctx.db.get(playerId);
  if (!player || player.state.gameType !== "flip7") throw new Error("Invalid player");
  const room = await ctx.db.get(player.roomId);
  if (!room || room.gameBoard.gameType !== "flip7") throw new Error("Invalid room");

  const board = room.gameBoard;
  if (board.phase !== "ACTIVE_PLAY") throw new Error("Not in active play phase");
  if (String(board.currentTurnPlayerId) !== String(playerId)) throw new Error("Not your turn");

  const myState = player.state;
  if (myState.status !== "ACTIVE") throw new Error("Player is not active");

  let deck = [...board.deck];
  let discardPile = [...board.discardPile];

  if (deck.length === 0) {
    // Reshuffle discard pile if deck runs out
    deck = [...discardPile];
    discardPile = [];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  const drawnCardId = deck.pop()!;
  const parsedCard = parseFlip7Card(drawnCardId);

  let faceUpCards = [...myState.roundFaceUpCards];
  let hasSecondChance = myState.hasSecondChance;
  let status: "ACTIVE" | "FROZEN" | "BUSTED" = "ACTIVE";
  let lastActionType: "HIT" | "FREEZE" | "BUST" | "FLIP_7_BONUS" | "SECOND_CHANCE_USED" | "ACTION_CARD" = "HIT";
  let message = `${player.name} flipped ${parsedCard.label}`;

  if (parsedCard.type === "ACTION" && parsedCard.actionType === "SECOND_CHANCE") {
    hasSecondChance = true;
    lastActionType = "ACTION_CARD";
    message = `${player.name} drew a 🛡️ Second Chance shield!`;
  } else if (parsedCard.type === "NUMBER" && parsedCard.numberValue !== undefined) {
    // Check if player already has this number value face up
    const existingNumbers = faceUpCards.map((cId) => parseFlip7Card(cId).numberValue).filter((n) => n !== undefined);
    const isDuplicate = existingNumbers.includes(parsedCard.numberValue);

    if (isDuplicate) {
      if (hasSecondChance) {
        // Second Chance shield consumes and protects player!
        hasSecondChance = false;
        discardPile.push(drawnCardId);
        lastActionType = "SECOND_CHANCE_USED";
        message = `${player.name} flipped duplicate ${parsedCard.numberValue}, but 🛡️ Second Chance saved them!`;
      } else {
        // BUST!
        status = "BUSTED";
        faceUpCards.push(drawnCardId);
        lastActionType = "BUST";
        message = `${player.name} flipped duplicate ${parsedCard.numberValue} and 💥 BUSTED!`;
      }
    } else {
      faceUpCards.push(drawnCardId);
    }
  } else {
    // Modifier (+1, +2, +3) or other card
    faceUpCards.push(drawnCardId);
  }

  // Calculate new round score
  const scoreInfo = calculateFlip7RoundScore(faceUpCards);
  let roundScore = status === "BUSTED" ? 0 : scoreInfo.score;

  // Check for Flip 7 Bonus
  if (status === "ACTIVE" && scoreInfo.hasFlip7Bonus) {
    status = "FROZEN";
    lastActionType = "FLIP_7_BONUS";
    message = `🌟 FLIP 7 BONUS! ${player.name} flipped 7 unique numbers and banked ${roundScore} pts!`;
  }

  // Save updated player state
  const updatedBanked = status === "FROZEN" ? myState.bankedScore + roundScore : myState.bankedScore;

  await ctx.db.patch(player._id, {
    state: {
      ...myState,
      roundScore,
      bankedScore: updatedBanked,
      roundFaceUpCards: faceUpCards,
      hasSecondChance,
      status,
    },
  });

  // Determine next turn player
  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", room._id))
    .collect();

  // Refresh current player object in array
  const updatedPlayers = players.map((p) =>
    String(p._id) === String(player._id)
      ? {
          ...p,
          state: {
            ...myState,
            roundScore,
            bankedScore: updatedBanked,
            roundFaceUpCards: faceUpCards,
            hasSecondChance,
            status,
          },
        }
      : p,
  );

  const activeRemaining = updatedPlayers.filter((p) => (p.state as any).status === "ACTIVE");

  let nextTurnPlayerId = board.currentTurnPlayerId;
  let phase: "ACTIVE_PLAY" | "ROUND_RESULTS" | "FINAL_LEADERBOARD" = "ACTIVE_PLAY";

  if (activeRemaining.length === 0) {
    // All players frozen or busted! Round ends!
    phase = "ROUND_RESULTS";
    nextTurnPlayerId = undefined;
  } else {
    // Advance to next active player in turnOrder
    const order = room.turnOrder;
    const currIndex = order.findIndex((id) => String(id) === String(playerId));
    let nextIndex = (currIndex + 1) % order.length;
    let foundNext = false;

    for (let i = 0; i < order.length; i++) {
      const candidateId = order[nextIndex];
      const cand = updatedPlayers.find((p) => String(p._id) === String(candidateId));
      if (cand && (cand.state as any).status === "ACTIVE") {
        nextTurnPlayerId = candidateId;
        foundNext = true;
        break;
      }
      nextIndex = (nextIndex + 1) % order.length;
    }

    if (!foundNext) {
      phase = "ROUND_RESULTS";
      nextTurnPlayerId = undefined;
    }
  }

  // Create round results summary if round ended
  let roundResults = undefined;
  if (phase === "ROUND_RESULTS") {
    roundResults = updatedPlayers.map((p) => {
      const st = p.state as any;
      return {
        playerId: p._id,
        playerName: p.name,
        roundScore: st.roundScore || 0,
        totalScore: st.bankedScore || 0,
        status: st.status as "FROZEN" | "BUSTED" | "FLIP_7",
      };
    });
  }

  await ctx.db.patch(room._id, {
    gameBoard: {
      ...board,
      phase,
      deck,
      discardPile,
      currentTurnPlayerId: nextTurnPlayerId,
      lastAction: {
        type: lastActionType,
        playerId: player._id,
        playerName: player.name,
        cardId: drawnCardId,
        scoreGained: roundScore,
        message,
      },
      roundResults,
    } as any,
  });

  // Dispatch bot turn if next player is bot
  if (phase === "ACTIVE_PLAY" && nextTurnPlayerId) {
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId: room._id,
    });
  }

  return { success: true };
}

async function handleFreezeInternal(ctx: GameMutationCtx, playerId: Id<"players">) {
  const player = await ctx.db.get(playerId);
  if (!player || player.state.gameType !== "flip7") throw new Error("Invalid player");
  const room = await ctx.db.get(player.roomId);
  if (!room || room.gameBoard.gameType !== "flip7") throw new Error("Invalid room");

  const board = room.gameBoard;
  if (board.phase !== "ACTIVE_PLAY") throw new Error("Not in active play phase");
  if (String(board.currentTurnPlayerId) !== String(playerId)) throw new Error("Not your turn");

  const myState = player.state;
  if (myState.status !== "ACTIVE") throw new Error("Player is not active");

  const scoreInfo = calculateFlip7RoundScore(myState.roundFaceUpCards);
  const roundScore = scoreInfo.score;
  const newBankedScore = myState.bankedScore + roundScore;

  await ctx.db.patch(player._id, {
    state: {
      ...myState,
      bankedScore: newBankedScore,
      roundScore,
      status: "FROZEN",
    },
  });

  // Determine next turn player
  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", room._id))
    .collect();

  const updatedPlayers = players.map((p) =>
    String(p._id) === String(player._id)
      ? {
          ...p,
          state: {
            ...myState,
            bankedScore: newBankedScore,
            roundScore,
            status: "FROZEN",
          },
        }
      : p,
  );

  const activeRemaining = updatedPlayers.filter((p) => (p.state as any).status === "ACTIVE");

  let nextTurnPlayerId = board.currentTurnPlayerId;
  let phase: "ACTIVE_PLAY" | "ROUND_RESULTS" | "FINAL_LEADERBOARD" = "ACTIVE_PLAY";

  if (activeRemaining.length === 0) {
    phase = "ROUND_RESULTS";
    nextTurnPlayerId = undefined;
  } else {
    const order = room.turnOrder;
    const currIndex = order.findIndex((id) => String(id) === String(playerId));
    let nextIndex = (currIndex + 1) % order.length;
    let foundNext = false;

    for (let i = 0; i < order.length; i++) {
      const candidateId = order[nextIndex];
      const cand = updatedPlayers.find((p) => String(p._id) === String(candidateId));
      if (cand && (cand.state as any).status === "ACTIVE") {
        nextTurnPlayerId = candidateId;
        foundNext = true;
        break;
      }
      nextIndex = (nextIndex + 1) % order.length;
    }

    if (!foundNext) {
      phase = "ROUND_RESULTS";
      nextTurnPlayerId = undefined;
    }
  }

  let roundResults = undefined;
  if (phase === "ROUND_RESULTS") {
    roundResults = updatedPlayers.map((p) => {
      const st = p.state as any;
      return {
        playerId: p._id,
        playerName: p.name,
        roundScore: st.roundScore || 0,
        totalScore: st.bankedScore || 0,
        status: st.status as "FROZEN" | "BUSTED" | "FLIP_7",
      };
    });
  }

  await ctx.db.patch(room._id, {
    gameBoard: {
      ...board,
      phase,
      currentTurnPlayerId: nextTurnPlayerId,
      lastAction: {
        type: "FREEZE",
        playerId: player._id,
        playerName: player.name,
        scoreGained: roundScore,
        message: `❄️ ${player.name} froze their hand and banked ${roundScore} pts!`,
      },
      roundResults,
    } as any,
  });

  if (phase === "ACTIVE_PLAY" && nextTurnPlayerId) {
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId: room._id,
    });
  }

  return { success: true };
}
