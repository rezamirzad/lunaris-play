import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

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

    // This is a legacy dispatcher for Piou Piou 
    // New games should call their own handleAction mutations directly
    if (room.currentGame.toLowerCase() === "pioupiou") {
       // We can just call the pioupiou handleAction if we want, but for now
       // let's keep the existing logic refactored to use the new schema.
       
       if (player.state.gameType === "pioupiou" && room.gameBoard.gameType === "pioupiou") {
          const currentState = player.state;
          const currentEggs = currentState.eggs || 0;
          const currentChicks = currentState.chicks || 0;

          if (args.actionType === "PLAY") {
            if (args.cards.length === 3) {
              await ctx.db.patch(player._id, {
                state: { ...currentState, gameType: "pioupiou", eggs: currentEggs + 1 },
              });
            } else if (args.cards.length === 2) {
              if (currentEggs > 0) {
                const newChicks = currentChicks + 1;
                await ctx.db.patch(player._id, {
                  state: {
                    ...currentState,
                    gameType: "pioupiou",
                    eggs: currentEggs - 1,
                    chicks: newChicks,
                  },
                });
                if (newChicks >= 3) {
                  await ctx.db.patch(room._id, {
                    status: "FINISHED",
                    gameBoard: { ...room.gameBoard, gameType: "pioupiou", winner: player.name },
                  });
                }
              }
            }
          }
       }

       const newHand = player.gameHand.filter((_, i) => !args.indices.includes(i));
       while (newHand.length < 4) {
          newHand.push("ROOSTER"); // Fallback for legacy
       }
       await ctx.db.patch(player._id, { gameHand: newHand });
    }
    
    // Dixit already has its own handleAction in games/dixit.ts
    // The frontend should be updated to call api.games.dixit.handleAction
  },
});
