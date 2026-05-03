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
    thumbnail: v.string(),
    minPlayers: v.number(),
    suggestedMax: v.number(),
    absoluteMax: v.number(),
  }).index("by_slug", ["slug"]),

  rooms: defineTable({
    roomCode: v.string(),
    status: v.string(),
    currentGame: v.optional(v.string()),
    gameBoard: v.any(),
    turnOrder: v.array(v.id("players")),
    currentTurnIndex: v.number(),
  }).index("by_roomCode", ["roomCode"]),

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    score: v.number(),
    gameHand: v.any(),
    isReady: v.boolean(),
  }).index("by_room", ["roomId"]),
});
