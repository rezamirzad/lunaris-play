import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { finishTurn } from "./transitions";
import { internal } from "./_generated/api";

export const getRandomCard = () => {
  const cards = ["CHICKEN", "ROOSTER", "NEST", "FOX"];
  return cards[Math.floor(Math.random() * cards.length)];
};

const INITIAL_DECK = [
  ...Array(15).fill("CHICKEN"),
  ...Array(15).fill("ROOSTER"),
  ...Array(10).fill("NEST"),
  ...Array(7).fill("FOX"),
];

export const pioupiouPlugin: GamePlugin = {
  gameType: "pioupiou",

  getInitialBoard() {
    return {
      gameType: "none",
    };
  },

  getInitialPlayerState(status: string) {
    return { initialHand: [], initialState: { gameType: "none" } };
  },

  async onStart(
    ctx: GameMutationCtx,
    roomId: Doc<"rooms">["_id"],
    players: Doc<"players">[],
  ) {
    let deck = shuffle([...INITIAL_DECK]);

    for (const player of players) {
      const initialHand = deck.splice(0, 4);

      await ctx.db.patch(player._id, {
        gameHand: initialHand,
        state: { gameType: "pioupiou", eggs: 0, chicks: 0 },
        persona: player.isBot ? "balanced" : undefined,
      });
    }

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "pioupiou",
        history: [{ key: "LOG_GAME_STARTED", data: { time: Date.now() } }],
        pendingAttack: null,
        deck: deck,
        discardPile: [],
      },
    });

    // Trigger initial bot turn if starting player is a bot
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId,
    });
  },
};

/**
 * Core turn refilling logic with discard-pile recycling.
 */
async function refillHand(
  ctx: any,
  room: Doc<"rooms">,
  player: Doc<"players">,
  indicesToRemove: number[],
  extraDiscards: string[] = [],
) {
  if (room.gameBoard.gameType !== "pioupiou") return;

  const board = room.gameBoard;
  let deck = [...board.deck];
  let discardPile = [...board.discardPile, ...extraDiscards];

  // 1. Identify removed cards and add them to discard pile
  const removedCards = player.gameHand.filter((_, i) =>
    indicesToRemove.includes(i),
  );
  discardPile.push(...removedCards);

  // 2. Remove cards from hand
  let newHand = player.gameHand.filter((_, i) => !indicesToRemove.includes(i));

  // 3. Draw until hand is full (4 cards)
  while (newHand.length < 4) {
    if (deck.length === 0) {
      if (discardPile.length === 0) break; // Should never happen
      deck = shuffle([...discardPile]);
      discardPile = [];
    }
    const card = deck.pop();
    if (card) newHand.push(card);
  }

  await ctx.db.patch(player._id, { gameHand: newHand });
  await ctx.db.patch(room._id, {
    gameBoard: { ...board, deck, discardPile },
  });
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

async function handleActionCore(ctx: any, args: any) {
  const player = await ctx.db.get(args.playerId);
  if (!player) throw new Error("Player not found");
  const room = await ctx.db.get(player.roomId);
  if (!room) throw new Error("Room not found");

  if (room.status === "FINISHED") {
    throw new Error("Game is already finished!");
  }

  if (
    player.state.gameType !== "pioupiou" ||
    room.gameBoard.gameType !== "pioupiou"
  ) {
    throw new Error("Invalid state");
  }

  const board = room.gameBoard;
  let { eggs = 0, chicks = 0 } = player.state;
  let logPayload: any = null;
  const cards = args.cards;

  const isFoxCard = cards.length === 1 && cards[0] === "FOX";
  const isFoxAttack = isFoxCard && args.actionType === "ATTACK";

  const isDiscard =
    args.actionType === "DISCARD" ||
    (cards.length === 1 && !isFoxAttack && args.actionType !== "DEFEND");

  const isLay =
    cards.length === 3 &&
    cards.includes("ROOSTER") &&
    cards.includes("CHICKEN") &&
    cards.includes("NEST");

  const isHatch =
    cards.length === 2 &&
    cards.filter((c: any) => c === "CHICKEN").length === 2 &&
    eggs > 0;

  // --- 1. DEFEND LOGIC ---
  if (args.actionType === "DEFEND") {
    const attack = board.pendingAttack;
    if (!attack) throw new Error("No pending attack");

    const attacker = await ctx.db.get(attack.attackerId);
    const hand = player.gameHand || [];
    const roosterIndices: number[] = [];

    hand.forEach((card: any, idx: any) => {
      if (card === "ROOSTER" && roosterIndices.length < 2) {
        roosterIndices.push(idx);
      }
    });

    if (roosterIndices.length < 2) throw new Error("Insufficient Roosters");

    logPayload = { key: "LOG_FOX_BLOCKED", data: { target: player.name } };

    // IMPORTANT: Defending player loses 2 roosters. Attacker loses fox.
    // Attacker refill (attacker already played Fox, it's stored in attack.indices)
    if (attacker) await refillHand(ctx, room, attacker, attack.indices);

    // Defender refill (the player who just called DEFEND)
    return await finalizePiouPiouTurn(
      ctx,
      room,
      player,
      roosterIndices,
      logPayload,
      eggs,
      chicks,
    );
  }

  // --- 2. ACCEPT LOGIC ---
  if (args.actionType === "ACCEPT") {
    const attack = board.pendingAttack;
    if (!attack) throw new Error("No pending attack");

    const attacker = await ctx.db.get(attack.attackerId);
    if (!attacker || attacker.state.gameType !== "pioupiou")
      throw new Error("Invalid attacker");

    await ctx.db.patch(attacker._id, {
      state: {
        gameType: "pioupiou",
        eggs: (attacker.state.eggs || 0) + 1,
        chicks: attacker.state.chicks || 0,
      },
    });

    eggs = Math.max(0, eggs - 1);
    logPayload = {
      key: "LOG_FOX_SUCCESS",
      data: { player: attacker.name, target: player.name },
    };

    // Attacker refill
    await refillHand(ctx, room, attacker, attack.indices);

    // Victim refill (no cards removed from hand)
    return await finalizePiouPiouTurn(
      ctx,
      room,
      player,
      [],
      logPayload,
      eggs,
      chicks,
    );
  }

  // --- 3. ATTACK ---
  if (isFoxAttack) {
    if (!args.targetPlayerId) throw new Error("Target required");
    if (String(args.playerId) === String(args.targetPlayerId))
      throw new Error("Cannot attack yourself!");

    const victim = await ctx.db.get(args.targetPlayerId);
    if (
      !victim ||
      victim.state.gameType !== "pioupiou" ||
      (victim.state.eggs || 0) <= 0
    ) {
      throw new Error("Invalid target");
    }

    await ctx.db.patch(room._id, {
      gameBoard: {
        ...board,
        gameType: "pioupiou",
        pendingAttack: {
          attackerId: args.playerId,
          victimId: args.targetPlayerId,
          card: "FOX",
          indices: args.indices,
        },
      },
    });

    // TRIGGER BOT DISPATCHER: The victim might be a bot!
    await ctx.scheduler.runAfter(0, (internal as any).bots.manager.dispatchBotTurn, {
      roomId: room._id,
    });

    return { success: true };
  }

  // --- 4. STANDARD ---
  if (isLay) {
    eggs++;
    logPayload = { key: "LOG_LAY_EGG", data: { player: player.name } };
  } else if (isHatch) {
    eggs--;
    chicks++;
    logPayload = { key: "LOG_HATCH", data: { player: player.name } };
  } else if (isDiscard) {
    logPayload = {
      key: "LOG_DISCARD",
      data: { player: player.name, card: cards[0].toLowerCase() },
    };
  } else {
    // FALLBACK: If move is invalid and it's a bot, force a discard to prevent deadlock
    if (player.isBot) {
      console.error(`Bot ${player.name} made invalid move, forcing discard.`);
      return await finalizePiouPiouTurn(
        ctx,
        room,
        player,
        [0],
        {
          key: "LOG_DISCARD",
          data: { player: player.name, card: player.gameHand[0].toLowerCase() },
        },
        eggs,
        chicks,
      );
    }
    return { error: "INVALID" };
  }

  return await finalizePiouPiouTurn(
    ctx,
    room,
    player,
    args.indices,
    logPayload,
    eggs,
    chicks,
  );
}

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    indices: v.array(v.number()),
    cards: v.array(v.string()),
    targetPlayerId: v.optional(v.id("players")),
    actionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await handleActionCore(ctx, args);
  },
});

async function finalizePiouPiouTurn(
  ctx: GameMutationCtx,
  room: Doc<"rooms">,
  player: Doc<"players">,
  indicesToRemove: number[],
  log: any,
  eggs: number,
  chicks: number,
) {
  // Update local player state
  await ctx.db.patch(player._id, {
    state: { gameType: "pioupiou", eggs, chicks },
  });

  // Refill hand using new logic
  await refillHand(ctx, room, player, indicesToRemove);

  // Re-fetch room to get updated deck/discard state from refillHand
  const updatedRoom = await ctx.db.get(room._id);

  return await finishTurn({
    ctx,
    room: updatedRoom!,
    logPayload: log,
    advanceTurn: true,
    winnerName: chicks >= 3 ? player.name : undefined,
    winnerId: chicks >= 3 ? player._id : undefined,
    gameBoardPatch: {
      gameType: "pioupiou",
      pendingAttack: null,
      deck:
        updatedRoom!.gameBoard.gameType === "pioupiou"
          ? updatedRoom!.gameBoard.deck
          : [],
      discardPile:
        updatedRoom!.gameBoard.gameType === "pioupiou"
          ? updatedRoom!.gameBoard.discardPile
          : [],
    },
  });
}

export const performBotAction = internalMutation({
  args: {
    playerId: v.id("players"),
    indices: v.array(v.number()),
    cards: v.array(v.string()),
    targetPlayerId: v.optional(v.id("players")),
    actionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await handleActionCore(ctx, args);
  },
});
