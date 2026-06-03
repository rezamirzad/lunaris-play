# Architectural Specification & Implementation Roadmap: Incan Gold (Diamant)

**Status:** Draft / Pending Approval
**Architect:** Atlas (Senior Backend Architect)

## 1. Overview
Incan Gold is a "push-your-luck" party game where players explore a temple for gems, deciding each turn whether to venture deeper or retreat to safety with their loot. The implementation follows the decoupled Convex/Next.js pattern used in our existing suite.

## 2. Convex Database Schema Expansion (schema.ts)

### 2.1 Game Board State (incangold)
We will add a new union member to the gameBoard in rooms table.

```typescript
v.object({
  gameType: v.literal("incangold"),
  phase: v.union(
    v.literal("ROUND_INTRO"),      // Show round 1-5 intro
    v.literal("EXPEDITION_PHASE"), // Reveal a card
    v.literal("DECISION_PHASE"),   // Players choose STAY or LEAVE
    v.literal("REVEAL_PHASE"),     // Reveal choices and distribute path gems
    v.literal("ROUND_RESULTS"),    // Summary of the expedition
    v.literal("FINAL_LEADERBOARD") // Game end
  ),
  currentRound: v.number(),         // 1 to 5
  deck: v.array(v.string()),        // IDs: "T_5", "H_Snake_1", "A_Idol_1"
  path: v.array(v.string()),        // Cards currently on the path
  gemsOnPath: v.number(),           // Remainder gems left on the ground
  artifactsOnPath: v.array(v.string()), // Artifacts currently on the path
  decisions: v.record(v.string(), v.union(v.literal("STAY"), v.literal("LEAVE"))), // PlayerId -> Choice
  lastDrawnCard: v.optional(v.string()),
  eliminatedHazards: v.array(v.string()), // Hazard types removed from deck after crash
  history: v.array(HistoryEvent),
  winner: v.optional(v.string()),
  winnerId: v.optional(v.id("players")),
})
```

### 2.2 Player State (incangold)
Update the state union in players table.

```typescript
v.object({
  gameType: v.literal("incangold"),
  bankedScore: v.number(),      // Total gems safely in camp
  gemsThisRound: v.number(),    // Unbanked gems (at risk)
  status: v.union(v.literal("IN_TEMPLE"), v.literal("AT_CAMP")),
})
```

## 3. Game Engine Logic (incangold.ts)

### 3.1 Deck Composition
- Treasure Cards: 15 cards with values (1, 2, 3, 4, 5, 5, 7, 7, 9, 11, 11, 13, 14, 15, 17).
- Hazard Cards: 15 cards (3 each of 5 types: Snake, Spider, Mummy, Fire, Rockslide).
- Artifact Cards: 5 unique artifacts (one added to deck each round).

### 3.2 State Transitions & Mutations

#### Mutation: drawCard
Triggered by the TV screen or timer to progress the expedition.
- Pop from deck, add to path.
- If Treasure (T_X): 
  - activePlayers = players.filter(p => p.status === "IN_TEMPLE")
  - share = floor(X / activePlayers.length)
  - remainder = X % activePlayers.length
  - Add share to each active player's gemsThisRound.
  - Add remainder to board gemsOnPath.
  - Transition to DECISION_PHASE.
- If Hazard (H_Type_N):
  - Check if path already contains H_Type.
  - If Crash: 
    - Active players lose gemsThisRound (reset to 0).
    - Remove ONE instance of H_Type from future decks (add to eliminatedHazards).
    - Transition to ROUND_RESULTS.
  - If Safe: Transition to DECISION_PHASE.
- If Artifact (A_X):
  - Place on path (add to artifactsOnPath).
  - Transition to DECISION_PHASE.

#### Mutation: submitDecision
Triggered by mobile controllers.
- Update decisions record.
- If decisions.length === activePlayers.length, transition to REVEAL_PHASE.

#### Mutation: resolveDecisions (Internal/Auto)
- leavingPlayers = players.filter(p => decisions[p._id] === "LEAVE")
- If leavingPlayers.length > 0:
  - share = floor(gemsOnPath / leavingPlayers.length)
  - remainder = gemsOnPath % leavingPlayers.length
  - Each leaving player: bankedScore += gemsThisRound + share, gemsThisRound = 0, status = "AT_CAMP".
  - Artifact Bonus: If leavingPlayers.length === 1, the player takes ALL artifactsOnPath.
  - Update board: gemsOnPath = remainder, artifactsOnPath = [].
- Check win/next round condition:
  - If allPlayers.status === "AT_CAMP", transition to ROUND_RESULTS.
  - Else, transition to EXPEDITION_PHASE (next draw).

## 4. Implementation Roadmap

### Phase 1: Data Foundations & Schema
- [🏗️ Atlas Task]: Update schema.ts with Incan Gold game board and player state objects.
- [🏗️ Atlas Task]: Define INCANGOLD_DECK constants in a new incangold_deck.ts.
- [🔍 Cypher Task]: Validate schema unions for type safety across mutations.

### Phase 2: Backend Plugin & Core Transitions
- [🏗️ Atlas Task]: Create convex/incangold.ts implementing GamePlugin (onStart, getInitialBoard).
- [🏗️ Atlas Task]: Register incangoldPlugin in convex/registry.ts.
- [🏗️ Atlas Task]: Implement drawCard and submitDecision mutations.
- [🔍 Cypher Task]: Audit resolveDecisions logic for "remainder gem" edge cases (e.g., 2 players leaving with 5 gems on path).

### Phase 3: TV Screen (The "Temple Path")
- [🎨 Aura Task]: Design the Expedition Screen:
  - Centered "Path" where cards are dealt.
  - Sidebar showing active players vs. players at camp.
  - Visual indicators for Hazard counts (to build tension).
- [💻 Frontend Task]: Integration of client hooks, animation handoffs, and event listeners.
- [💻 Frontend Task]: Create TemplePath component with Framer Motion for card dealing animations.

### Phase 4: Mobile Controller (The "Decision Hub")
- [🎨 Aura Task]: Simple two-button layout: "STAY" (Green/Deep In) vs. "LEAVE" (Red/Back to Camp).
- [🎨 Aura Task]: Status display: "Current Loot" vs. "Banked Score".
- [💻 Frontend Task]: Wire buttons to submitDecision mutation with haptic feedback.

### Phase 5: Polish & Game Loop Completion
- [🏗️ Atlas Task]: Implement ROUND_RESULTS logic (clean up path, reshuffle deck, add next artifact).
- [🏗️ Atlas Task]: Final Leaderboard logic integration with transitions.ts.
- [🎨 Aura Task]: "Crash" animation and "Safe Return" celebration visuals.
- [🔍 Cypher Task]: Performance audit for simultaneous decision reveals in 8-player lobbies.

---
**Next Step:** User Approval of Architectural Specification.
