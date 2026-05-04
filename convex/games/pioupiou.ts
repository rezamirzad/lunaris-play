import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export const getRandomCard = () => {
  const cards = ["CHICKEN", "ROOSTER", "NEST", "FOX"];
  return cards[Math.floor(Math.random() * cards.length)];
};

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

    let { eggs = 0, chicks = 0 } = player.state || {};
    let logPayload: any = null;
    const cards = args.cards;

    const isFox = cards.length === 1 && cards[0] === "FOX";
    const isLay =
      cards.length === 3 &&
      cards.includes("ROOSTER") &&
      cards.includes("CHICKEN") &&
      cards.includes("NEST");
    const isHatch =
      cards.length === 2 &&
      cards.filter((c) => c === "CHICKEN").length === 2 &&
      eggs > 0;
    const isDiscard =
      (cards.length === 1 && !isFox) || args.actionType === "DISCARD";

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
    if (isFox && args.actionType !== "DISCARD") {
      if (!args.targetPlayerId) throw new Error("Target required");

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
