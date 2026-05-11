import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { finishTurn } from "./transitions";

export const getRandomCard = () => {
  const cards = ["CHICKEN", "ROOSTER", "NEST", "FOX"];
  return cards[Math.floor(Math.random() * cards.length)];
};

export const pioupiouPlugin: GamePlugin = {
  gameType: "pioupiou",

  getInitialBoard() {
    return {
      gameType: "none",
    };
  },

  getInitialPlayerState(status: string) {
    let initialHand: string[] = [];
    let initialState: any = { gameType: "none" };

    if (status === "PLAYING") {
      initialHand = Array.from({ length: 4 }, () => getRandomCard());
      initialState = { gameType: "pioupiou", eggs: 0, chicks: 0 };
    }

    return { initialHand, initialState };
  },

  async onStart(ctx: GameMutationCtx, roomId: Doc<"rooms">["_id"], players: Doc<"players">[]) {
    for (const player of players) {
      const initialHand = [
        getRandomCard(),
        getRandomCard(),
        getRandomCard(),
        getRandomCard(),
      ];

      await ctx.db.patch(player._id, {
        gameHand: initialHand,
        state: { gameType: "pioupiou", eggs: 0, chicks: 0 },
      });
    }

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "pioupiou",
        history: [{ key: "LOG_GAME_STARTED", data: { time: Date.now() } }],
        pendingAttack: null,
      },
    });
  },
};

export const startMatch = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (players.length < 2) throw new Error("At least 2 players required.");

    const turnOrder = players.map((p) => p._id);

    // Delegate to the plugin logic for consistency
    await pioupiouPlugin.onStart(ctx, args.roomId, players);

    await ctx.db.patch(args.roomId, {
      status: "PLAYING",
      turnOrder: turnOrder,
      currentTurnIndex: 0,
    });

    return { success: true };
  },
});

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    indices: v.array(v.number()),
    cards: v.array(v.string()),
    targetPlayerId: v.optional(v.id("players")),
    actionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room) throw new Error("Room not found");

    if (room.status === "FINISHED") {
      throw new Error("Game is already finished!");
    }

    if (player.state.gameType !== "pioupiou" || room.gameBoard.gameType !== "pioupiou") {
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
      cards.filter((c) => c === "CHICKEN").length === 2 &&
      eggs > 0;

    // --- 1. DEFEND LOGIC ---
    if (args.actionType === "DEFEND") {
      const attack = board.pendingAttack;
      if (!attack) throw new Error("No pending attack");

      const attacker = await ctx.db.get(attack.attackerId);
      const hand = player.gameHand || [];
      const roosterIndices: number[] = [];

      hand.forEach((card, idx) => {
        if (card === "ROOSTER" && roosterIndices.length < 2) {
          roosterIndices.push(idx);
        }
      });

      if (roosterIndices.length < 2) throw new Error("Insufficient Roosters");

      logPayload = { key: "LOG_FOX_BLOCKED", data: { target: player.name } };
      await refillPlayer(ctx, attack.attackerId, attacker!, attack.indices);

      return await finalizePiouPiouTurn(ctx, room, player, roosterIndices, logPayload, eggs, chicks);
    }

    // --- 2. ACCEPT LOGIC ---
    if (args.actionType === "ACCEPT") {
      const attack = board.pendingAttack;
      if (!attack) throw new Error("No pending attack");

      const attacker = await ctx.db.get(attack.attackerId);
      if (!attacker || attacker.state.gameType !== "pioupiou") throw new Error("Invalid attacker");

      await ctx.db.patch(attacker._id, {
        state: { 
          gameType: "pioupiou", 
          eggs: (attacker.state.eggs || 0) + 1, 
          chicks: attacker.state.chicks || 0 
        },
      });

      eggs = Math.max(0, eggs - 1);
      logPayload = { key: "LOG_FOX_SUCCESS", data: { player: attacker.name, target: player.name } };

      await refillPlayer(ctx, attack.attackerId, attacker, attack.indices);
      return await finalizePiouPiouTurn(ctx, room, player, [], logPayload, eggs, chicks);
    }

    // --- 3. ATTACK ---
    if (isFoxAttack) {
      if (!args.targetPlayerId) throw new Error("Target required");
      const victim = await ctx.db.get(args.targetPlayerId);
      if (!victim || victim.state.gameType !== "pioupiou" || (victim.state.eggs || 0) <= 0) {
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
      logPayload = { key: "LOG_DISCARD", data: { player: player.name, card: cards[0].toLowerCase() } };
    } else {
      return { error: "INVALID" };
    }

    return await finalizePiouPiouTurn(ctx, room, player, args.indices, logPayload, eggs, chicks);
  },
});

async function refillPlayer(ctx: any, pId: any, pDoc: Doc<"players">, indicesToRemove: number[]) {
  const newHand = pDoc.gameHand.filter((_, i) => !indicesToRemove.includes(i));
  while (newHand.length < 4) newHand.push(getRandomCard());
  await ctx.db.patch(pId, { gameHand: newHand });
}

async function finalizePiouPiouTurn(
  ctx: GameMutationCtx,
  room: Doc<"rooms">,
  player: Doc<"players">,
  indicesToRemove: number[],
  log: any,
  eggs: number,
  chicks: number,
) {
  const newHand = player.gameHand.filter((_, i) => !indicesToRemove.includes(i));
  while (newHand.length < 4) newHand.push(getRandomCard());

  await ctx.db.patch(player._id, {
    gameHand: newHand,
    state: { gameType: "pioupiou", eggs, chicks },
  });

  return await finishTurn({
    ctx,
    room,
    logPayload: log,
    advanceTurn: true,
    winnerName: chicks >= 3 ? player.name : undefined,
    winnerId: chicks >= 3 ? player._id : undefined,
    gameBoardPatch: {
      gameType: "pioupiou",
      pendingAttack: null,
    },
  });
}
