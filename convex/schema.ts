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
    status: v.string(), // "LOBBY", "PLAYING", "FINISHED"
    currentGame: v.string(),
    currentTurnIndex: v.number(),
    turnOrder: v.array(v.id("players")),
    gameBoard: v.object({
      history: v.optional(v.array(v.any())),
      lastWarning: v.any(),
      // Generic field for game phases (e.g., "CLUE", "SUBMITTING", "VOTING")
      phase: v.optional(v.string()),
      currentClue: v.optional(v.string()),
      // Tracks which card ID was submitted by which player ID
      submittedCards: v.optional(
        v.array(
          v.object({
            playerId: v.id("players"),
            cardId: v.string(),
          }),
        ),
      ),
      // Tracks who voted for which card ID
      votes: v.optional(
        v.array(
          v.object({
            voterId: v.id("players"),
            cardId: v.string(),
          }),
        ),
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
      // Piou Piou specific
      eggs: v.optional(v.number()),
      chicks: v.optional(v.number()),
      // Dixit specific (Score)
      score: v.optional(v.number()),
    }),
    isReady: v.boolean(),
  }).index("by_room", ["roomId"]),
});
