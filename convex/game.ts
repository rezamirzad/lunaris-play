// convex/game.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Card Types based on rules: 🐥 (Chicken), 🐓 (Rooster), 🛖 (Nest), 🦊 (Fox)
export const playAction = mutation({
  args: {
    playerId: v.id("players"),
    action: v.string(), // "LAY_EGG", "HATCH_CHICK", "FOX_ATTACK"
    targetPlayerId: v.optional(v.id("players")),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;

    if (args.action === "LAY_EGG") {
      // Rule: 1 Rooster + 1 Chicken + 1 Nest = 1 Egg
      await ctx.db.patch(args.playerId, {
        gameHand: { ...player.gameHand, eggs: (player.gameHand.eggs || 0) + 1 },
      });
    } else if (args.action === "HATCH_CHICK") {
      // Rule: 2 Chickens + "Piu Piu" sound = 1 Chick
      if (player.gameHand.eggs > 0) {
        await ctx.db.patch(args.playerId, {
          gameHand: {
            ...player.gameHand,
            eggs: player.gameHand.eggs - 1,
            chicks: (player.gameHand.chicks || 0) + 1,
          },
        });
      }
    } else if (args.action === "FOX_ATTACK" && args.targetPlayerId) {
      // Rule: Fox can steal an egg unless defended by 2 Roosters
      const target = await ctx.db.get(args.targetPlayerId);
      if (target && target.gameHand.eggs > 0) {
        // Here we'd usually check for a defense reaction, but for now, we steal
        await ctx.db.patch(args.targetPlayerId, {
          gameHand: { ...target.gameHand, eggs: target.gameHand.eggs - 1 },
        });
        await ctx.db.patch(args.playerId, {
          gameHand: { ...player.gameHand, eggs: player.gameHand.eggs + 1 },
        });
      }
    }
  },
});

export const getRoomState = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .unique();
    if (!room) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    return { ...room, players };
  },
});
