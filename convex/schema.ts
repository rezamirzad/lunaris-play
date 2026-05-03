import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    slug: v.string(),
    title: v.string(),
    title_fr: v.optional(v.string()),
    title_de: v.optional(v.string()),
    title_fa: v.optional(v.string()),
    description: v.string(),
    description_fr: v.optional(v.string()),
    description_de: v.optional(v.string()),
    description_fa: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    minPlayers: v.number(),
    suggestedMax: v.number(),
    absoluteMax: v.number(),
  }),

  rooms: defineTable({
    roomCode: v.string(),
    status: v.string(), // "LOBBY" | "PLAYING" | "FINISHED"
    currentGame: v.string(),
    currentTurnIndex: v.number(),
    turnOrder: v.array(v.id("players")),
    gameBoard: v.object({
      history: v.optional(v.array(v.any())),
      lastWarning: v.optional(v.union(v.any(), v.null())),
      pendingAttack: v.optional(
        v.union(
          v.null(),
          v.object({
            attackerId: v.id("players"),
            victimId: v.id("players"),
            card: v.string(),
            indices: v.array(v.number()),
          }),
        ),
      ),
    }),
  }).index("by_roomCode", ["roomCode"]), // <--- FIXED: Added the missing index here

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    gameHand: v.array(v.string()),
    state: v.object({
      eggs: v.number(),
      chicks: v.number(),
    }),
    isReady: v.boolean(),
  }).index("by_room", ["roomId"]),
});
