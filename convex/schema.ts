// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomCode: v.string(),
    hostId: v.optional(v.id("players")),
    status: v.string(), // "LOBBY", "PLAYING", "GAME_OVER"
    currentGame: v.optional(v.string()),
    gameBoard: v.any(), // Changed from gameBoardState to gameBoard
    turnOrder: v.array(v.id("players")),
    currentTurnIndex: v.number(),
  }).index("by_roomCode", ["roomCode"]),

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    score: v.number(),
    gameHand: v.any(), // Changed from gameHandState to gameHand
    isReady: v.boolean(),
  }).index("by_room", ["roomId"]),

  games: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    thumbnail: v.string(),
    minPlayers: v.number(),
    suggestedMax: v.number(), // The "Best with" number (e.g., 5)
    absoluteMax: v.number(), // The hard limit (e.g., 8)
  }).index("by_slug", ["slug"]),
});
