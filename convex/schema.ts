import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomCode: v.string(),
    hostId: v.optional(v.id("players")),
    status: v.string(), // "LOBBY", "PLAYING", "GAME_OVER"
    currentGame: v.optional(v.string()),
    // Generic store for board-wide data
    gameBoardState: v.any(),
    turnOrder: v.array(v.id("players")),
    currentTurnIndex: v.number(),
  }).index("by_roomCode", ["roomCode"]),

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    score: v.number(),
    // Generic store for private hand data
    gameHandState: v.any(),
    isReady: v.boolean(),
  }).index("by_room", ["roomId"]),
});
