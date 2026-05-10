import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Strictly typed history events to replace v.any()
const HistoryEvent = v.union(
  v.object({ key: v.literal("LOG_JOINED"), data: v.object({ player: v.string() }) }),
  v.object({ key: v.literal("LOG_GAME_STARTED"), data: v.object({ time: v.number() }) }),
  v.object({ key: v.literal("LOG_FOX_BLOCKED"), data: v.object({ target: v.string() }) }),
  v.object({ key: v.literal("LOG_FOX_SUCCESS"), data: v.object({ player: v.string(), target: v.string() }) }),
  v.object({ key: v.literal("LOG_LAY_EGG"), data: v.object({ player: v.string() }) }),
  v.object({ key: v.literal("LOG_HATCH"), data: v.object({ player: v.string() }) }),
  v.object({ key: v.literal("LOG_DISCARD"), data: v.object({ player: v.string(), card: v.string() }) })
);

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
    status: v.union(v.literal("LOBBY"), v.literal("PLAYING"), v.literal("FINISHED"), v.literal("CANCELLED")),
    currentGame: v.string(),
    currentTurnIndex: v.number(),
    turnOrder: v.array(v.id("players")),
    gameBoard: v.union(
      // Lobby state
      v.object({
        gameType: v.literal("none"),
      }),
      // Dixit state
      v.object({
        gameType: v.literal("dixit"),
        phase: v.union(v.literal("CLUE"), v.literal("SUBMITTING"), v.literal("VOTING"), v.literal("RESULTS")),
        currentClue: v.optional(v.string()),
        availableCards: v.array(v.string()),
        usedCards: v.array(v.string()),
        submittedCards: v.array(v.object({ playerId: v.id("players"), cardId: v.string() })),
        shuffledBoardCards: v.optional(v.array(v.object({ playerId: v.id("players"), cardId: v.string() }))),
        votes: v.array(v.object({ voterId: v.id("players"), cardId: v.string() })),
        roundResults: v.optional(
          v.object({
            storytellerCard: v.string(),
            pointsEarned: v.record(v.string(), v.number()),
          })
        ),
        history: v.array(HistoryEvent),
        winner: v.optional(v.string()),
        winnerId: v.optional(v.id("players")),
      }),
      // Piou Piou state
      v.object({
        gameType: v.literal("pioupiou"),
        pendingAttack: v.union(
          v.null(),
          v.object({
            attackerId: v.id("players"),
            victimId: v.id("players"),
            card: v.string(),
            indices: v.array(v.number()),
          })
        ),
        history: v.array(HistoryEvent),
        winner: v.optional(v.string()),
        winnerId: v.optional(v.id("players")),
      })
    ),
  }).index("by_roomCode", ["roomCode"]),

  players: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    gameHand: v.array(v.string()),
    isReady: v.boolean(),
    state: v.union(
      v.object({ gameType: v.literal("none") }), // For LOBBY
      v.object({
        gameType: v.literal("dixit"),
        score: v.number(),
      }),
      v.object({
        gameType: v.literal("pioupiou"),
        eggs: v.number(),
        chicks: v.number(),
      })
    ),
  }).index("by_room", ["roomId"]),

  users: defineTable({
    name: v.string(),
    totalScore: v.number(),
    wins: v.number(),
    gamesPlayed: v.number(),
    lastLogin: v.number(),
  }).index("by_name", ["name"])
    .index("by_totalScore", ["totalScore"]),
});
