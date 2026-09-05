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

    let pendingInitialTarget: any = undefined;

    // Initialize all players with empty hands for 1-by-1 initial deal
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
        phase: "INITIAL_DEAL",
        currentRound: 1,
        targetScore: 200,
        currentTurnPlayerId: firstPlayerId,
        mustFlipCount: 0,
        pendingTargetAction: undefined,
        deck,
        discardPile: [],
        lastAction: {
          type: "HIT",
          playerId: firstPlayerId,
          playerName: players[0]?.name || "Player",
          message: "🎴 Dealing initial cards 1 by 1...",
        },
      } as any,
    });

    // Start 1-by-1 initial card deal
    await ctx.scheduler.runAfter(400, (internal as any).flip7.dealNextInitialCard, {
      roomId,
      playerIndex: 0,
    });
  },
};

export const dealNextInitialCard = internalMutation({
  args: {
    roomId: v.id("rooms"),
    playerIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "flip7") return;
    const board = room.gameBoard;
    if (board.phase !== "INITIAL_DEAL") return;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (args.playerIndex >= players.length) {
      // Initial deal finished! Move to ACTIVE_PLAY
      const firstPlayerId = room.turnOrder[0] || players[0]?._id;
      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          phase: "ACTIVE_PLAY",
          currentTurnPlayerId: firstPlayerId,
          lastAction: {
            type: "HIT",
            playerId: firstPlayerId,
            playerName: players[0]?.name || "Player",
            message: "🎮 All initial cards dealt! Play begins!",
          },
        } as any,
      });

      if (firstPlayerId) {
        await ctx.scheduler.runAfter(200, (internal as any).bots.manager.dispatchBotTurn, {
          roomId: room._id,
        });
      }
      return;
    }

    const player = players[args.playerIndex];
    let deck = [...board.deck];
    let discardPile = [...board.discardPile];
    let pendingTarget = board.pendingTargetAction;

    if (deck.length > 0) {
      const drawn = deck.pop()!;
      const parsed = parseFlip7Card(drawn);
      let faceUpCards = [...((player.state as any).roundFaceUpCards || [])];
      faceUpCards.push(drawn);

      let hasSecondChance = (player.state as any).hasSecondChance || false;
      let status: "ACTIVE" | "FROZEN" | "BUSTED" = "ACTIVE";

      if (parsed.type === "ACTION") {
        if (parsed.actionType === "SECOND_CHANCE") {
          hasSecondChance = true;
        } else if (parsed.actionType === "FREEZE" || parsed.actionType === "FLIP_THREE") {
          if (players.length > 1) {
            if (!pendingTarget) {
              pendingTarget = {
                cardId: drawn,
                actionType: parsed.actionType,
                sourcePlayerId: player._id,
                sourcePlayerName: player.name,
              };
            }
          } else {
            if (parsed.actionType === "FREEZE") status = "FROZEN";
          }
        }
      }

      const scoreInfo = calculateFlip7RoundScore(faceUpCards);
      await ctx.db.patch(player._id, {
        state: {
          ...(player.state as any),
          roundScore: scoreInfo.score,
          roundFaceUpCards: faceUpCards,
          hasSecondChance,
          status,
        },
      });

      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          deck,
          discardPile,
          pendingTargetAction: pendingTarget,
          lastAction: {
            type: "HIT",
            playerId: player._id,
            playerName: player.name,
            cardId: drawn,
            message: `🎴 ${player.name} received initial card: ${parsed.label}`,
          },
        } as any,
      });
    }

    // Schedule next player's initial card after 600ms delay for smooth 1-by-1 reveal
    if (args.playerIndex + 1 < players.length) {
      await ctx.scheduler.runAfter(600, (internal as any).flip7.dealNextInitialCard, {
        roomId: room._id,
        playerIndex: args.playerIndex + 1,
      });
    } else {
      // Completed last player! Transition to ACTIVE_PLAY
      const firstPlayerId = room.turnOrder[0] || players[0]?._id;
      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          deck,
          discardPile,
          pendingTargetAction: pendingTarget,
          phase: "ACTIVE_PLAY",
          currentTurnPlayerId: firstPlayerId,
          lastAction: {
            type: "HIT",
            playerId: firstPlayerId,
            playerName: players[0]?.name || "Player",
            message: "🎮 All initial cards dealt! Active round started!",
          },
        } as any,
      });

      if (firstPlayerId) {
        await ctx.scheduler.runAfter(300, (internal as any).bots.manager.dispatchBotTurn, {
          roomId: room._id,
        });
      }
    }
  },
});

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

export const resolveTargetAction = mutation({
  args: {
    playerId: v.id("players"),
    targetPlayerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    return await handleResolveTargetActionInternal(ctx, args.playerId, args.targetPlayerId);
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

    // Check Case 9 Tie Breaker for target score (200 pts)
    const sorted = [...players].sort((a, b) => ((b.state as any).bankedScore || 0) - ((a.state as any).bankedScore || 0));
    const topScore = (sorted[0].state as any).bankedScore || 0;

    if (topScore >= board.targetScore) {
      const tiedForTop = sorted.filter((p) => ((p.state as any).bankedScore || 0) === topScore);
      if (tiedForTop.length === 1) {
        // Unique high score >= 200: Game Winner!
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
      // Tied for top score >= 200: Play another tie-breaker round for ALL players (Case 9)!
    }

    // Reset for next round
    const deck = getFlip7Deck();
    const currentRound = board.currentRound + 1;

    // Reset player round state for 1-by-1 deal
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
        phase: "INITIAL_DEAL",
        currentRound,
        deck,
        discardPile: [],
        currentTurnPlayerId: firstPlayerId,
        mustFlipCount: 0,
        pendingTargetAction: undefined,
        queuedTargetActions: [],
        lastAction: {
          type: "HIT",
          playerId: firstPlayerId,
          playerName: room.turnOrder[0] ? (players.find((p) => String(p._id) === String(room.turnOrder[0]))?.name || "Player") : players[0].name,
          message: `🎴 Round ${currentRound} starting! Dealing initial cards 1 by 1...`,
        },
        roundResults: undefined,
      } as any,
    });

    // Start 1-by-1 initial deal for next round
    await ctx.scheduler.runAfter(400, (internal as any).flip7.dealNextInitialCard, {
      roomId: room._id,
      playerIndex: 0,
    });

    return { success: true };
  },
});

function appendActionLog(existingLog: any[] | undefined, text: string, type: string) {
  const current = existingLog ? [...existingLog] : [];
  if (!text) return current;
  current.push({ text, type, timestamp: Date.now() });
  return current.slice(-10);
}

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

  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", room._id))
    .collect();

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
  let pendingTarget: any = undefined;
  let queuedActions = [...(board.queuedTargetActions || [])];
  let targetPlayerIdForAction: Id<"players"> | undefined = undefined;
  let targetPlayerNameForAction: string | undefined = undefined;

  let mustFlipCount = board.mustFlipCount || 0;

  if (parsedCard.type === "ACTION") {
    faceUpCards.push(drawnCardId);
    if (parsedCard.actionType === "SECOND_CHANCE") {
      if (hasSecondChance) {
        // Player already has Second Chance shield! Must pass extra shield to an unshielded active opponent.
        const unshieldedCandidates = players.filter(
          (p) => String(p._id) !== String(player._id) && (p.state as any).status === "ACTIVE" && !(p.state as any).hasSecondChance,
        );

        if (unshieldedCandidates.length === 0) {
          lastActionType = "ACTION_CARD";
          message = `🛡️ ${player.name} drew an extra Second Chance shield, but all active players already have shields!`;
        } else if (player.isBot) {
          // Bot strategic logic: Pass shield to active opponent with the LOWEST total score to avoid helping the leader!
          const sortedCandidates = [...unshieldedCandidates].sort((a, b) => {
            const scoreA = ((a.state as any).bankedScore || 0) + calculateFlip7RoundScore((a.state as any).roundFaceUpCards || []).score;
            const scoreB = ((b.state as any).bankedScore || 0) + calculateFlip7RoundScore((b.state as any).roundFaceUpCards || []).score;
            return scoreA - scoreB;
          });
          const candidate = sortedCandidates[0];
          await ctx.db.patch(candidate._id, {
            state: {
              ...(candidate.state as any),
              hasSecondChance: true,
            },
          });
          lastActionType = "ACTION_CARD";
          targetPlayerIdForAction = candidate._id;
          targetPlayerNameForAction = candidate.name;
          message = `🛡️ ${player.name} drew an extra Second Chance shield and passed it to ${candidate.name}!`;
        } else {
          // Human player: Prompt target selection to pass extra shield
          pendingTarget = {
            cardId: drawnCardId,
            actionType: "SECOND_CHANCE",
            sourcePlayerId: player._id,
            sourcePlayerName: player.name,
          };
          lastActionType = "ACTION_CARD";
          message = `🛡️ ${player.name} drew an extra Second Chance shield! Select a player without a shield...`;
        }
      } else {
        hasSecondChance = true;
        lastActionType = "ACTION_CARD";
        targetPlayerIdForAction = player._id;
        targetPlayerNameForAction = player.name;
        message = `🛡️ ${player.name} obtained a Second Chance shield!`;
      }
    } else if (parsedCard.actionType === "FREEZE" || parsedCard.actionType === "FLIP_THREE") {
      let isChainedInFlipThree = mustFlipCount > 0;
      if (mustFlipCount > 0) mustFlipCount--;

      if (isChainedInFlipThree && mustFlipCount > 0) {
        // Queue nested action card to resolve after current sequence completes!
        const queuedItem = {
          cardId: drawnCardId,
          actionType: parsedCard.actionType as "FREEZE" | "FLIP_THREE",
          sourcePlayerId: player._id,
          sourcePlayerName: player.name,
        };
        queuedActions.push(queuedItem);
        lastActionType = "ACTION_CARD";
        message = `⚡ ${player.name} flipped a ${parsedCard.actionType === "FREEZE" ? "❄️ FREEZE" : "⚡ FLIP THREE"} card during FLIP THREE! Queued for after the sequence!`;
      } else {
        const otherActive = players.filter((p) => String(p._id) !== String(player._id) && (p.state as any).status === "ACTIVE");
        if (otherActive.length > 0) {
          pendingTarget = {
            cardId: drawnCardId,
            actionType: parsedCard.actionType,
            sourcePlayerId: player._id,
            sourcePlayerName: player.name,
          };
          lastActionType = "ACTION_CARD";
          message = `${player.name} drew a ${parsedCard.actionType === "FREEZE" ? "❄️ FREEZE" : "⚡ FLIP THREE"} card! Choose a target...`;
        } else {
          if (parsedCard.actionType === "FREEZE") {
            status = "FROZEN";
            lastActionType = "FREEZE";
            message = `❄️ ${player.name} drew a FREEZE card! Points locked & banked!`;
          } else {
            mustFlipCount = 3;
            lastActionType = "ACTION_CARD";
            message = `⚡ ${player.name} drew a FLIP THREE card! Must flip 3 cards sequentially!`;
          }
        }
      }
    }
  } else if (parsedCard.type === "NUMBER" && parsedCard.numberValue !== undefined) {
    if (mustFlipCount > 0) mustFlipCount--;
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
        mustFlipCount = 0;
        queuedActions = [];
        faceUpCards.push(drawnCardId);
        lastActionType = "BUST";
        message = `${player.name} flipped duplicate ${parsedCard.numberValue} and 💥 BUSTED!`;
      }
    } else {
      faceUpCards.push(drawnCardId);
    }
  } else {
    if (mustFlipCount > 0) mustFlipCount--;
    // Modifier card
    faceUpCards.push(drawnCardId);
  }

  if (status === "FROZEN" || status === "BUSTED") {
    mustFlipCount = 0;
    if (status === "BUSTED") queuedActions = [];
  } else if (mustFlipCount === 0 && queuedActions.length > 0 && !pendingTarget && status === "ACTIVE") {
    // Sequence completed! Process next queued action card!
    const nextAction = queuedActions.shift()!;
    const otherActive = players.filter((p) => String(p._id) !== String(nextAction.sourcePlayerId) && (p.state as any).status === "ACTIVE");
    if (otherActive.length > 0) {
      pendingTarget = nextAction;
      message = `⚡ Sequence complete! Resolving queued ${nextAction.actionType} card from ${nextAction.sourcePlayerName}...`;
    } else {
      if (nextAction.actionType === "FREEZE") {
        status = "FROZEN";
        message = `❄️ Resolving queued FREEZE card! ${player.name} is FROZEN!`;
      } else {
        mustFlipCount = 3;
        message = `⚡ Resolving queued FLIP THREE card! ${player.name} must flip 3 cards!`;
      }
    }
  }

  // Calculate new round score
  const scoreInfo = calculateFlip7RoundScore(faceUpCards);
  let roundScore = status === "BUSTED" ? 0 : scoreInfo.score;

  // Check for Flip 7 Bonus
  if (status === "ACTIVE" && scoreInfo.hasFlip7Bonus) {
    status = "FROZEN";
    mustFlipCount = 0;
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
  let phase: "INITIAL_DEAL" | "ACTIVE_PLAY" | "ROUND_RESULTS" | "FINAL_LEADERBOARD" = "ACTIVE_PLAY";

  if (activeRemaining.length === 0) {
    // All players frozen or busted! Round ends!
    phase = "ROUND_RESULTS";
    nextTurnPlayerId = undefined;
  } else if (mustFlipCount > 0 && status === "ACTIVE") {
    // Player is in the middle of a FLIP THREE sequence! Turn stays with current player.
    nextTurnPlayerId = player._id;
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
      mustFlipCount,
      pendingTargetAction: pendingTarget,
      queuedTargetActions: queuedActions,
      lastAction: {
        type: lastActionType,
        playerId: player._id,
        playerName: player.name,
        targetPlayerId: targetPlayerIdForAction,
        targetPlayerName: targetPlayerNameForAction,
        cardId: drawnCardId,
        scoreGained: roundScore,
        message,
      },
      actionLog: appendActionLog(board.actionLog, message, lastActionType),
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
  if ((board.mustFlipCount || 0) > 0) throw new Error("Cannot stay during a mandatory Flip Three sequence!");

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
  let phase: "INITIAL_DEAL" | "ACTIVE_PLAY" | "ROUND_RESULTS" | "FINAL_LEADERBOARD" = "ACTIVE_PLAY";

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
      actionLog: appendActionLog(board.actionLog, `❄️ ${player.name} froze their hand and banked ${roundScore} pts!`, "FREEZE"),
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

async function handleResolveTargetActionInternal(
  ctx: GameMutationCtx,
  sourcePlayerId: Id<"players">,
  targetPlayerId: Id<"players">,
) {
  const sourcePlayer = await ctx.db.get(sourcePlayerId);
  if (!sourcePlayer || sourcePlayer.state.gameType !== "flip7") throw new Error("Invalid player");
  const room = await ctx.db.get(sourcePlayer.roomId);
  if (!room || room.gameBoard.gameType !== "flip7") throw new Error("Invalid room");

  const board = room.gameBoard;
  const pending = board.pendingTargetAction;
  if (!pending) throw new Error("No pending target action");
  if (String(pending.sourcePlayerId) !== String(sourcePlayerId)) throw new Error("Not authorized to resolve target");

  const targetPlayer = await ctx.db.get(targetPlayerId);
  if (!targetPlayer || targetPlayer.state.gameType !== "flip7") throw new Error("Invalid target player");

  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", room._id))
    .collect();

  let message = "";
  let nextTurnPlayerId = board.currentTurnPlayerId;
  let mustFlipCount = board.mustFlipCount || 0;

  if (pending.actionType === "FREEZE") {
    const targetState = targetPlayer.state as any;
    const scoreInfo = calculateFlip7RoundScore(targetState.roundFaceUpCards || []);
    const bankedScore = targetState.bankedScore + scoreInfo.score;

    await ctx.db.patch(targetPlayer._id, {
      state: {
        ...targetState,
        bankedScore,
        roundScore: scoreInfo.score,
        status: "FROZEN",
      },
    });

    message = `❄️ ${sourcePlayer.name} played FREEZE on ${targetPlayer.name}! ${targetPlayer.name} banked ${scoreInfo.score} pts!`;

    if (String(board.currentTurnPlayerId) === String(targetPlayer._id)) {
      const order = room.turnOrder;
      const currIndex = order.findIndex((id) => String(id) === String(targetPlayer._id));
      let nextIndex = (currIndex + 1) % order.length;
      for (let i = 0; i < order.length; i++) {
        const candidateId = order[nextIndex];
        const cand = players.find((p) => String(p._id) === String(candidateId));
        if (cand && String(cand._id) !== String(targetPlayer._id) && (cand.state as any).status === "ACTIVE") {
          nextTurnPlayerId = candidateId;
          break;
        }
        nextIndex = (nextIndex + 1) % order.length;
      }
    }
  } else if (pending.actionType === "FLIP_THREE") {
    mustFlipCount = 3;
    nextTurnPlayerId = targetPlayer._id;
    message = `⚡ ${sourcePlayer.name} played FLIP THREE on ${targetPlayer.name}! ${targetPlayer.name} must flip 3 cards!`;
  } else if (pending.actionType === "SECOND_CHANCE") {
    const targetState = targetPlayer.state as any;
    await ctx.db.patch(targetPlayer._id, {
      state: {
        ...targetState,
        hasSecondChance: true,
      },
    });
    message = `🛡️ ${sourcePlayer.name} passed an extra Second Chance shield to ${targetPlayer.name}!`;
  }

  const updatedPlayers = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", room._id))
    .collect();

  const activeRemaining = updatedPlayers.filter((p) => (p.state as any).status === "ACTIVE");
  let phase: "INITIAL_DEAL" | "ACTIVE_PLAY" | "ROUND_RESULTS" | "FINAL_LEADERBOARD" = "ACTIVE_PLAY";

  if (activeRemaining.length === 0) {
    phase = "ROUND_RESULTS";
    nextTurnPlayerId = undefined;
  }

  let queuedActions = [...(board.queuedTargetActions || [])];
  let nextPendingTarget: any = undefined;

  // Case 16a: If target player was frozen by this FREEZE card, any pending FLIP THREE for them is discarded!
  if (pending.actionType === "FREEZE" && (targetPlayer.state as any).status === "FROZEN") {
    queuedActions = queuedActions.filter(q => String(q.sourcePlayerId) !== String(targetPlayer._id));
  }

  if (queuedActions.length > 0 && phase === "ACTIVE_PLAY") {
    const nextQueued = queuedActions.shift()!;
    const otherActive = updatedPlayers.filter((p) => (p.state as any).status === "ACTIVE");
    if (otherActive.length > 1) {
      // Multiple active players: prompt source player for target assignment!
      nextPendingTarget = nextQueued;
    } else if (otherActive.length === 1) {
      // Single active player: auto-target self!
      const solePlayer = otherActive[0];
      if (nextQueued.actionType === "FREEZE") {
        const soleState = solePlayer.state as any;
        const sInfo = calculateFlip7RoundScore(soleState.roundFaceUpCards || []);
        await ctx.db.patch(solePlayer._id, {
          state: {
            ...soleState,
            bankedScore: soleState.bankedScore + sInfo.score,
            roundScore: sInfo.score,
            status: "FROZEN",
          },
        });
        message += ` | ❄️ Queued FREEZE card auto-applied to ${solePlayer.name}!`;
      } else {
        mustFlipCount = 3;
        nextTurnPlayerId = solePlayer._id;
        message += ` | ⚡ Queued FLIP THREE card auto-applied to ${solePlayer.name}!`;
      }
    }
  }

  await ctx.db.patch(room._id, {
    gameBoard: {
      ...board,
      phase,
      currentTurnPlayerId: nextTurnPlayerId,
      mustFlipCount,
      pendingTargetAction: nextPendingTarget,
      queuedTargetActions: queuedActions,
      lastAction: {
        type: "ACTION_CARD",
        playerId: sourcePlayer._id,
        playerName: sourcePlayer.name,
        targetPlayerId: targetPlayer._id,
        targetPlayerName: targetPlayer.name,
        cardId: pending.cardId,
        message,
      },
      actionLog: appendActionLog(board.actionLog, message, "ACTION_CARD"),
    } as any,
  });

  if (phase === "ACTIVE_PLAY" && nextTurnPlayerId) {
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId: room._id,
    });
  }

  return { success: true };
}

export const toggleBustOdds = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "flip7") {
      throw new Error("Invalid room");
    }
    const board = room.gameBoard;
    await ctx.db.patch(room._id, {
      gameBoard: {
        ...board,
        showBustOdds: !board.showBustOdds,
      } as any,
    });
    return { success: true };
  },
});
