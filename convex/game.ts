import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    actionType: v.string(),
    indices: v.array(v.number()),
    cards: v.array(v.string()),
    targetPlayerId: v.optional(v.id("players")),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room) throw new Error("Room not found");

    const currentState = player.state || {};
    const currentEggs = currentState.eggs || 0;
    const currentChicks = currentState.chicks || 0;

    // 1. HANDLE PIOU PIOU ACTIONS
    if (args.actionType === "PLAY") {
      if (args.cards.length === 3) {
        await ctx.db.patch(player._id, {
          state: { ...currentState, eggs: currentEggs + 1 },
        });
      } else if (args.cards.length === 2) {
        if (currentEggs > 0) {
          const newChicks = currentChicks + 1;
          await ctx.db.patch(player._id, {
            state: {
              ...currentState,
              eggs: currentEggs - 1,
              chicks: newChicks,
            },
          });
          if (newChicks >= 3) {
            await ctx.db.patch(room._id, {
              status: "FINISHED",
              gameBoard: { ...room.gameBoard, winner: player.name },
            });
          }
        }
      }
    }

    const isDixit = room.currentGame?.toLowerCase() === "dixit";
    const newHand = player.gameHand.filter((_, i) => !args.indices.includes(i));

    // Simple refill logic
    while (newHand.length < (isDixit ? 6 : 4)) {
      newHand.push(
        isDixit ? `dixit_${Math.floor(Math.random() * 100)}` : "ROOSTER",
      );
    }

    await ctx.db.patch(player._id, { gameHand: newHand });
  },
});
