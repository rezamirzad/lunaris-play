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
    status: v.string(),
    currentGame: v.string(),
    currentTurnIndex: v.number(),
    turnOrder: v.array(v.id("players")),
    gameBoard: v.object({
      history: v.optional(v.array(v.any())),
      lastWarning: v.any(),
      phase: v.optional(v.string()),
      currentClue: v.optional(v.string()),
      // FEATURE: Added availableCards to store the shuffled deck
      availableCards: v.optional(v.array(v.string())),
      submittedCards: v.optional(
        v.array(v.object({ playerId: v.id("players"), cardId: v.string() })),
      ),
      votes: v.optional(
        v.array(v.object({ voterId: v.id("players"), cardId: v.string() })),
      ),
      // FEATURE: Added roundResults for the scoring summary
      roundResults: v.optional(
        v.object({ storytellerCard: v.string(), pointsEarned: v.any() }),
      ),
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
      winner: v.optional(v.string()),
      winnerId: v.optional(v.id("players")),
    }),
  }).index("by_roomCode", ["roomCode"]),

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    gameHand: v.array(v.string()),
    state: v.object({
      eggs: v.optional(v.number()),
      chicks: v.optional(v.number()),
      score: v.optional(v.number()),
    }),
    isReady: v.boolean(),
  }).index("by_room", ["roomId"]),
});
