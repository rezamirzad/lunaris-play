import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const getRandomCard = () => {
  const cards = ["CHICKEN", "ROOSTER", "NEST", "FOX"];
  return cards[Math.floor(Math.random() * cards.length)];
};

// Add this to your imports at the top
// import { v } from "convex/values";
// import { mutation } from "../_generated/server";

// convex/games/pioupiou.ts

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

    // 1. Generate Turn Order
    // We map the database IDs to a static array to lock the sequence
    const turnOrder = players.map((p) => p._id);

    // 2. Initial Deal: 4 cards per node
    for (const player of players) {
      const initialHand = [
        getRandomCard(),
        getRandomCard(),
        getRandomCard(),
        getRandomCard(),
      ];

      await ctx.db.patch(player._id, {
        gameHand: initialHand,
        state: { eggs: 0, chicks: 0 },
      });
    }

    // 3. Initialize Board with Turn Order
    await ctx.db.patch(args.roomId, {
      status: "ACTIVE",
      turnOrder: turnOrder, // CRITICAL: Fixes the "Everyone is waiting" bug
      currentTurnIndex: 0, // Starts with the first player in the array
      gameBoard: {
        ...room.gameBoard,
        history: [{ key: "LOG_GAME_STARTED", data: { time: Date.now() } }],
        pendingAttack: null,
      },
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
    actionType: v.optional(v.string()), // "PLAY", "ATTACK", "DEFEND", "ACCEPT", "DISCARD"
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room) throw new Error("Room not found");

    if (room.status === "FINISHED") {
      throw new Error("Game is already finished!");
    }

    let { eggs = 0, chicks = 0 } = player.state || {};
    let logPayload: any = null;
    const cards = args.cards;

    // 1. REFINED LOGIC GATES
    const isFoxCard = cards.length === 1 && cards[0] === "FOX";

    // An attack only happens if it's a FOX AND the action is specifically "ATTACK"
    const isFoxAttack = isFoxCard && args.actionType === "ATTACK";

    // A discard happens if it's a standard single card OR a Fox with no attack intent
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

    // --- 1. DEFEND LOGIC (Victim blocks Fox) ---
    if (args.actionType === "DEFEND") {
      const attack = room.gameBoard.pendingAttack;
      if (!attack) throw new Error("No pending attack");

      const attacker = await ctx.db.get(attack.attackerId);
      logPayload = {
        key: "LOG_FOX_BLOCKED",
        data: { target: player.name }, // Victim name
      };

      // Attacker loses their Fox (refill them)
      await refillPlayer(ctx, attack.attackerId, attacker!, attack.indices);

      // Victim loses their 2 Roosters and turn ends
      return await finishTurn(
        ctx,
        room,
        player,
        args.indices,
        logPayload,
        eggs,
        chicks,
      );
    }

    // --- 2. ACCEPT LOGIC (Victim gives egg) ---
    if (args.actionType === "ACCEPT") {
      const attack = room.gameBoard.pendingAttack;
      if (!attack) throw new Error("No pending attack");

      const attacker = await ctx.db.get(attack.attackerId);

      // Transfer Egg: Attacker +1
      const attackerEggs = (attacker!.state?.eggs || 0) + 1;
      await ctx.db.patch(attacker!._id, {
        state: { ...attacker!.state, eggs: attackerEggs },
      });

      // Transfer Egg: Victim -1
      eggs = Math.max(0, eggs - 1);

      logPayload = {
        key: "LOG_FOX_SUCCESS",
        data: { player: attacker!.name, target: player.name },
      };

      // Attacker loses their Fox (refill them)
      await refillPlayer(ctx, attack.attackerId, attacker!, attack.indices);

      // Victim didn't play cards, but turn ends and egg count updated
      return await finishTurn(ctx, room, player, [], logPayload, eggs, chicks);
    }

    // --- 3. ATTACK INITIATION (Active player plays Fox) ---
    if (isFoxAttack) {
      if (!args.targetPlayerId)
        throw new Error("Target required for Fox attack");

      const victim = await ctx.db.get(args.targetPlayerId);
      if (!victim || (victim.state?.eggs || 0) <= 0) {
        throw new Error("Invalid target: Player has no eggs to steal");
      }

      // We don't call finishTurn yet! We wait for the victim to Defend or Accept.
      // We just move the game into a "Pending Attack" state.
      await ctx.db.patch(room._id, {
        gameBoard: {
          ...room.gameBoard,
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

    // --- 4. STANDARD MOVES (Lay, Hatch, Discard) ---
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
        data: { player: player.name, card: cards[0] },
      };
    } else {
      return { error: "INVALID" };
    }

    return await finishTurn(
      ctx,
      room,
      player,
      args.indices,
      logPayload,
      eggs,
      chicks,
    );
  },
});

async function refillPlayer(
  ctx: any,
  pId: any,
  pDoc: Doc<"players">,
  indices: number[],
) {
  const newHand = pDoc.gameHand.filter((_, i) => !indices.includes(i));
  while (newHand.length < 4) newHand.push(getRandomCard());
  await ctx.db.patch(pId, { gameHand: newHand });
}

async function finishTurn(
  ctx: any,
  room: Doc<"rooms">,
  player: Doc<"players">,
  indices: number[],
  log: any,
  eggs: number,
  chicks: number,
) {
  // Filter out played cards and refill
  const newHand = player.gameHand.filter((_, i) => !indices.includes(i));
  while (newHand.length < 4) newHand.push(getRandomCard());

  const isWinner = chicks >= 3;
  const newStatus = isWinner ? "FINISHED" : room.status;
  const history = [log, ...(room.gameBoard?.history || [])].slice(0, 8);

  // Update the player who just finished their action (the Victim in Fox cases)
  await ctx.db.patch(player._id, {
    gameHand: newHand,
    state: { ...player.state, eggs, chicks },
  });

  // Advance turn and clear pending attack
  await ctx.db.patch(room._id, {
    status: newStatus,
    currentTurnIndex: isWinner
      ? room.currentTurnIndex
      : (room.currentTurnIndex + 1) % room.turnOrder.length,
    gameBoard: {
      ...room.gameBoard,
      history,
      winner: isWinner ? player.name : room.gameBoard?.winner,
      pendingAttack: null, // Critical: Clear the fox state
    },
  });

  return { success: true, won: isWinner };
}
