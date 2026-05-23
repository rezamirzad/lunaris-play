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
  v.object({ key: v.literal("LOG_DISCARD"), data: v.object({ player: v.string(), card: v.string() }) }),
  v.object({ key: v.literal("LOG_MISTAKE"), data: v.object({ player: v.string(), played: v.string(), discarded: v.array(v.string()) }) }),
  v.object({ key: v.literal("LOG_LEVEL_CLEARED"), data: v.object({ level: v.number() }) })
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
      }),
      // Neural Sync (The Mind) state
      v.object({
        gameType: v.literal("themind"),
        level: v.number(),
        lives: v.number(),
        emps: v.number(),
        topCard: v.union(v.number(), v.null()),
        lastPlayedBy: v.optional(v.id("players")),
        deck: v.array(v.number()),
        discardPile: v.array(v.number()),
        hands: v.record(v.string(), v.array(v.number())),
        empVotes: v.array(v.id("players")),
        phase: v.union(v.literal("SYNCING"), v.literal("PLAYING"), v.literal("GAME_OVER"), v.literal("VICTORY"), v.literal("AWAITING_NEXT_LEVEL")),
        history: v.array(HistoryEvent),
        winner: v.optional(v.string()),
        winnerId: v.optional(v.id("players")),
      }),
      // Just One state
      v.object({
        gameType: v.literal("justone"),
        language: v.union(v.literal("en"), v.literal("fr"), v.literal("de"), v.literal("fa")),
        round: v.number(),
        score: v.number(),
        activePlayerId: v.id("players"),
        mysteryWord: v.object({
          en: v.string(),
          fr: v.string(),
          de: v.string(),
          fa: v.string(),
        }),
        usedWords: v.array(v.string()),
        clues: v.record(v.string(), v.string()),
        canceledClues: v.array(v.id("players")),
        confirmedPlayers: v.array(v.id("players")),
        lastGuess: v.optional(v.string()),
        lenientVotes: v.record(v.string(), v.boolean()),
        phase: v.union(
          v.literal("LOBBY"),
          v.literal("CLUE_INPUT"),
          v.literal("VALIDATION"),
          v.literal("GUESSING"),
          v.literal("LENIENT_VALIDATION"),
          v.literal("ROUND_RESULTS"),
          v.literal("GAME_OVER")
        ),
        history: v.array(HistoryEvent),
        winner: v.optional(v.string()),
        winnerId: v.optional(v.id("players")),
      }),
      // Time Attack (Sync Wave) state
      v.object({
        gameType: v.literal("timeattack"),
        phase: v.union(
          v.literal("ROUND_INTRO"),
          v.literal("ACTIVE_PLAY"),
          v.literal("ROUND_REVEAL"),
          v.literal("FINAL_LEADERBOARD")
        ),
        currentRound: v.number(), // 1 to 7
        targetMs: v.number(),     // Global target for the round
        visuals: v.union(v.literal("FULL"), v.literal("BLIND"), v.literal("DISTRACTED")),
        interaction: v.union(v.literal("TAP"), v.literal("PRESS_RELEASE")),
        serverStartTime: v.number(),
        // Submissions keyed by player ID string
        submissions: v.record(v.string(), v.object({
          inputs: v.array(v.object({
            timestamp: v.number(),
            type: v.union(v.literal("TAP"), v.literal("PRESS"), v.literal("RELEASE"))
          })),
          personalStartTime: v.optional(v.number()),
          finalDeltaMs: v.optional(v.number()),
          actualMs: v.optional(v.number()),
          pointsEarned: v.optional(v.number())
        })),
        roundResults: v.optional(v.record(v.string(), v.number())),
        history: v.array(HistoryEvent),
        winner: v.optional(v.string()),
        winnerId: v.optional(v.id("players")),
      }),
      // Incan Gold state
      v.object({
        gameType: v.literal("incangold"),
        phase: v.union(
          v.literal("ROUND_INTRO"),      // Show round 1-5 intro
          v.literal("EXPEDITION_PHASE"), // Reveal a card
          v.literal("REVEAL_PHASE"),     // Reveal card details
          v.literal("DECISION_PHASE"),   // Players choose STAY or LEAVE
          v.literal("VOTE_REVEAL"),      // Show everyone's choices
          v.literal("ROUND_RESULTS"),    // Summary of the expedition
          v.literal("FINAL_LEADERBOARD") // Game end
        ),
        currentRound: v.number(),         // 1 to 5
        deck: v.array(v.string()),        // IDs: "T_5", "H_Snake_1", "A_Idol_1"
        path: v.array(v.string()),        // Cards currently on the path
        gemsOnPath: v.number(),           // Remainder gems left on the ground
        cardGems: v.record(v.string(), v.number()), // index -> gems remaining on card
        artifactsOnPath: v.array(v.string()), // IDs of artifacts currently on the path
        collectedArtifactsCount: v.number(),  // Total artifacts safely returned to camp (for point scaling)
        decisions: v.record(v.string(), v.union(v.literal("STAY"), v.literal("LEAVE"))), // PlayerId -> Choice
        lastDrawnCard: v.optional(v.string()),
        eliminatedHazards: v.array(v.string()), // Hazard types removed from deck after crash
        roundHistory: v.optional(v.array(v.object({
          round: v.number(),
          gemsFound: v.number(),
          gemsLost: v.number(),
          artifactsFound: v.number(),
          playerResults: v.record(v.string(), v.object({
            gained: v.number(),
            lost: v.number(),
            artifacts: v.number(),
            status: v.union(v.literal("SAFE"), v.literal("CRASHED"))
          }))
        }))),
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
      }),
      v.object({
        gameType: v.literal("themind"),
        score: v.number(),
      }),
      v.object({
        gameType: v.literal("justone"),
        score: v.number(),
      }),
      v.object({
        gameType: v.literal("timeattack"),
        score: v.number(),
      }),
      v.object({
        gameType: v.literal("incangold"),
        bankedScore: v.number(),      // Total gems safely in camp
        gemsThisRound: v.number(),    // Unbanked gems (at risk)
        artifacts: v.number(),        // Number of artifacts collected
        status: v.union(v.literal("IN_TEMPLE"), v.literal("AT_CAMP")),
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

  security_logs: defineTable({
    event: v.string(),
    timestamp: v.number(),
    details: v.any(),
  }).index("by_timestamp", ["timestamp"]),
});
