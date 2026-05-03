import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomCode: v.string(),
    status: v.string(), // "lobby", "playing", "scoring"
    currentGame: v.string(), // "dixit" | "cluedo"
    // Game-specific board state (e.g., cards on the table)
    gameBoard: v.any(),
    lastAction: v.optional(v.string()),
  }).index("by_roomCode", ["roomCode"]),

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    isHost: v.boolean(),
    score: v.number(),
    // Game-specific player state (e.g., Dixit cards vs Cluedo notes)
    gameHand: v.any(),
  }).index("by_room", ["roomId"]),
});
