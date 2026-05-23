import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { finishTurn } from "./transitions";
import { getIncanGoldDeck, INCANGOLD_TREASURES, INCANGOLD_HAZARDS, INCANGOLD_ARTIFACTS } from "./incangold_deck";

/**
 * Standard Fisher-Yates Shuffle
 */
const shuffle = <T>(array: T[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const incangoldPlugin: GamePlugin = {
  gameType: "incangold",

  getInitialBoard() {
    return {
      gameType: "none",
    };
  },

  getInitialPlayerState(status: string) {
    return {
      initialHand: [],
      initialState: {
        gameType: "incangold",
        bankedScore: 0,
        gemsThisRound: 0,
        artifacts: 0,
        status: "AT_CAMP",
      },
    };
  },

  async onStart(ctx: GameMutationCtx, roomId: Doc<"rooms">["_id"], players: Doc<"players">[]) {
    // Round 1: Add first artifact
    const initialDeck = shuffle(getIncanGoldDeck([], ["A_1"]));

    for (const player of players) {
      await ctx.db.patch(player._id, {
        gameHand: [],
        state: {
          gameType: "incangold",
          bankedScore: 0,
          gemsThisRound: 0,
          artifacts: 0,
          status: "IN_TEMPLE",
        },
      });
    }

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "incangold",
        phase: "ROUND_INTRO",
        currentRound: 1,
        deck: initialDeck,
        path: [],
        gemsOnPath: 0,
        cardGems: {},
        artifactsOnPath: [],
        collectedArtifactsCount: 0,
        decisions: {},
        eliminatedHazards: [],
        roundHistory: [],
        history: [{ key: "LOG_GAME_STARTED", data: { time: Date.now() } }],
      },
    });
  },
};

export const drawCard = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "incangold") throw new Error("Invalid room");

    const board = room.gameBoard;
    const deck = [...board.deck];
    const cardId = deck.pop();
    if (!cardId) throw new Error("Deck is empty");

    const path = [...board.path, cardId];
    const cardIndex = path.length - 1;
    let phase: any = "REVEAL_PHASE";
    let cardGems = { ...board.cardGems };
    const artifactsOnPath = [...board.artifactsOnPath];
    const eliminatedHazards = [...board.eliminatedHazards];
    const roundHistory = Array.isArray(board.roundHistory) ? [...board.roundHistory] : [];

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();
    
    const activePlayers = players.filter(p => p.state.gameType === "incangold" && p.state.status === "IN_TEMPLE");

    if (cardId.startsWith("T_")) {
      const treasure = INCANGOLD_TREASURES.find(t => t.id === cardId);
      if (treasure) {
        const share = Math.floor(treasure.value / activePlayers.length);
        const remainder = treasure.value % activePlayers.length;
        cardGems[cardIndex] = remainder;

        for (const p of activePlayers) {
          if (p.state.gameType !== "incangold") continue;
          await ctx.db.patch(p._id, {
            state: {
              ...p.state,
              gemsThisRound: p.state.gemsThisRound + share,
            }
          });
        }
      }
    } else if (cardId.startsWith("H_")) {
      const hazard = INCANGOLD_HAZARDS.find(h => h.id === cardId);
      if (hazard) {
        const isDuplicate = board.path.some(pId => {
            const existingHazard = INCANGOLD_HAZARDS.find(h2 => h2.id === pId);
            return existingHazard && existingHazard.type === hazard.type;
        });

        if (isDuplicate) {
          phase = "ROUND_RESULTS";
          eliminatedHazards.push(cardId); // Retire the second hazard

          const playerResults: Record<string, any> = {};
          let totalLost = 0;
          let totalFound = 0;

          Object.values(cardGems).forEach(v => totalLost += v);

          for (const p of players) {
             if (p.state.gameType !== "incangold") continue;
             if (p.state.status === "IN_TEMPLE") {
                const lost = p.state.gemsThisRound;
                totalLost += lost;
                playerResults[p._id] = { gained: 0, lost: lost, artifacts: 0, status: "CRASHED" };
                await ctx.db.patch(p._id, {
                  state: { ...p.state, gemsThisRound: 0, status: "AT_CAMP" }
                });
             } else {
                playerResults[p._id] = { gained: p.state.gemsThisRound, lost: 0, artifacts: p.state.artifacts, status: "SAFE" };
             }
          }

          board.path.forEach(pid => {
              if (pid.startsWith("T_")) totalFound += INCANGOLD_TREASURES.find(t => t.id === pid)?.value || 0;
          });

          roundHistory.push({
             round: board.currentRound,
             gemsFound: totalFound,
             gemsLost: totalLost,
             artifactsFound: 0, // No artifacts collected on crash
             playerResults
          });
        }
      }
    } else if (cardId.startsWith("A_")) {
      artifactsOnPath.push(cardId);
    }

    await ctx.db.patch(room._id, {
      gameBoard: {
        ...board,
        phase,
        deck,
        path,
        cardGems,
        artifactsOnPath,
        eliminatedHazards,
        roundHistory,
        lastDrawnCard: cardId,
        decisions: {},
      }
    });

    return { success: true };
  }
});

export const startDecision = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "incangold") throw new Error("Invalid room");
    if (room.gameBoard.phase !== "REVEAL_PHASE" && room.gameBoard.phase !== "ROUND_INTRO" && room.gameBoard.phase !== "EXPEDITION_PHASE") {
        // Can start decision from multiple phases
    }

    await ctx.db.patch(room._id, {
      gameBoard: {
        ...room.gameBoard,
        phase: "DECISION_PHASE",
        decisions: {},
      }
    });

    return { success: true };
  }
});

export const submitDecision = mutation({
  args: {
    playerId: v.id("players"),
    decision: v.union(v.literal("STAY"), v.literal("LEAVE")),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player || player.state.gameType !== "incangold") throw new Error("Invalid player");
    const room = await ctx.db.get(player.roomId);
    if (!room || room.gameBoard.gameType !== "incangold") throw new Error("Invalid room");

    const board = room.gameBoard;
    if (board.phase !== "DECISION_PHASE") throw new Error("Not in decision phase");

    const newDecisions = { ...board.decisions, [args.playerId]: args.decision };
    
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();
    
    const activePlayers = players.filter(p => p.state.gameType === "incangold" && p.state.status === "IN_TEMPLE");

    if (Object.keys(newDecisions).length === activePlayers.length) {
      await resolveDecisions(ctx, room, players, newDecisions);
    } else {
      await ctx.db.patch(room._id, {
        gameBoard: {
          ...board,
          decisions: newDecisions,
        }
      });
    }

    return { success: true };
  }
});

async function resolveDecisions(ctx: GameMutationCtx, room: Doc<"rooms">, players: Doc<"players">[], decisions: Record<string, "STAY" | "LEAVE">) {
  if (room.gameBoard.gameType !== "incangold") return;
  const board = room.gameBoard;
  
  const leavingPlayers = players.filter(p => decisions[p._id] === "LEAVE");
  let cardGems = { ...board.cardGems };
  let artifactsOnPath = [...board.artifactsOnPath];
  let collectedArtifactsCount = board.collectedArtifactsCount;

  if (leavingPlayers.length > 0) {
    let totalPathGems = 0;
    Object.keys(cardGems).forEach(idx => {
        totalPathGems += cardGems[parseInt(idx)];
    });

    const share = Math.floor(totalPathGems / leavingPlayers.length);
    const remainder = totalPathGems % leavingPlayers.length;

    // Artifact acquisition: ONLY if exactly ONE player leaves
    let artifactsCollectedThisTurn = 0;
    let artifactPointsThisTurn = 0;
    if (leavingPlayers.length === 1) {
        artifactsOnPath.forEach(() => {
            collectedArtifactsCount++;
            artifactsCollectedThisTurn++;
            artifactPointsThisTurn += (collectedArtifactsCount <= 3) ? 5 : 10;
        });
        artifactsOnPath = [];
    }

    for (const p of leavingPlayers) {
      if (p.state.gameType !== "incangold") continue;
      await ctx.db.patch(p._id, {
        state: {
          ...p.state,
          bankedScore: p.state.bankedScore + p.state.gemsThisRound + share + artifactPointsThisTurn,
          gemsThisRound: p.state.gemsThisRound + share + artifactPointsThisTurn, // Total gained this round
          artifacts: p.state.artifacts + artifactsCollectedThisTurn,
          status: "AT_CAMP",
        }
      });
    }

    // Update gems on path: clear all, place remainder on first card (or index 0)
    const newCardGems: Record<number, number> = {};
    if (remainder > 0 && board.path.length > 0) {
        newCardGems[0] = remainder;
    }
    cardGems = newCardGems;
  }

  await ctx.db.patch(room._id, {
    gameBoard: {
      ...board,
      phase: "VOTE_REVEAL",
      cardGems,
      artifactsOnPath,
      collectedArtifactsCount,
      decisions,
    }
  });
}

export const finishVoteReveal = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "incangold") throw new Error("Invalid room");
    const board = room.gameBoard;
    if (board.phase !== "VOTE_REVEAL") throw new Error("Not in vote reveal phase");

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const remainingPlayers = players.filter(p => p.state.gameType === "incangold" && p.state.status === "IN_TEMPLE");
    
    if (remainingPlayers.length === 0) {
        // Round ends
        const roundHistory = Array.isArray(board.roundHistory) ? [...board.roundHistory] : [];
        const playerResults: Record<string, any> = {};
        let totalLost = 0;
        let totalFound = 0;

        Object.values(board.cardGems).forEach(v => totalLost += v);
        board.path.forEach(pid => {
            if (pid.startsWith("T_")) totalFound += INCANGOLD_TREASURES.find(t => t.id === pid)?.value || 0;
        });

        for (const p of players) {
            if (p.state.gameType !== "incangold") continue;
            playerResults[p._id] = { 
                gained: p.state.status === "AT_CAMP" ? p.state.gemsThisRound : 0, 
                lost: p.state.status === "IN_TEMPLE" ? p.state.gemsThisRound : 0, 
                artifacts: p.state.artifacts,
                status: p.state.status === "AT_CAMP" ? "SAFE" : "CRASHED" 
            };
        }

        roundHistory.push({
            round: board.currentRound,
            gemsFound: totalFound,
            gemsLost: totalLost,
            artifactsFound: 0, // In this flow, artifacts are only found if someone leaves solo
            playerResults
        });

        await ctx.db.patch(room._id, {
            gameBoard: { ...board, phase: "ROUND_RESULTS", roundHistory, decisions: {} }
        });
        return;
    }

    await ctx.db.patch(room._id, {
        gameBoard: { ...board, phase: "EXPEDITION_PHASE", decisions: {} }
    });
  }
});

export const nextRound = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "incangold") throw new Error("Invalid room");

    const board = room.gameBoard;
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (board.currentRound === 5) {
      let winnerName = "";
      let winnerId: any = undefined;
      let maxScore = -1;

      for (const p of players) {
        if (p.state.gameType === "incangold") {
          const score = p.state.bankedScore;
          if (score > maxScore) {
            maxScore = score;
            winnerName = p.name;
            winnerId = p._id;
          } else if (score === maxScore) {
              // Tie-breaker: most artifacts
              const pWinner = players.find(wp => wp._id === winnerId);
              if (pWinner && pWinner.state.gameType === "incangold" && p.state.artifacts > pWinner.state.artifacts) {
                  winnerName = p.name;
                  winnerId = p._id;
              }
          }
        }
      }

      return await finishTurn({
        ctx,
        room,
        advanceTurn: false,
        winnerName,
        winnerId,
        gameBoardPatch: {
          gameType: "incangold",
          phase: "FINAL_LEADERBOARD",
        }
      });
    }

    const nextRoundNumber = board.currentRound + 1;
    
    // Artifact Logic: "If an Artifact is not discovered in its disclosure round, it stays in the deck"
    // So we need to keep track of uncollected artifacts.
    // Uncollected artifacts = All artifacts introduced so far minus those collected.
    const uncollectedArtifacts: string[] = [];
    for (let i = 1; i <= nextRoundNumber; i++) {
        const aId = `A_${i}`;
        // Was it collected? We can check players' artifacts or board.collectedArtifactsCount
        // Actually, let's just use the current round's artifact index.
        uncollectedArtifacts.push(aId);
    }
    // Filter out artifacts already safely banked (this is tricky since we don't store IDs in player state)
    // Let's assume artifacts are added sequentially.
    // The rules say: "The five Artifact cards are shuffled and placed face-down, one under each of the Temple cards."
    // This means round 1 has Artifact 1, round 2 has Artifact 2, etc.
    // If Artifact 1 wasn't found in round 1, it stays for round 2.
    
    // We'll track uncollected artifact IDs in a simplified way for now:
    const activeArtifacts: string[] = [];
    for (let i = 1; i <= nextRoundNumber; i++) {
        // If it was already collected (count >= i), skip.
        if (board.collectedArtifactsCount < i) {
            activeArtifacts.push(`A_${i}`);
        }
    }

    const shuffledDeck = shuffle(getIncanGoldDeck(board.eliminatedHazards, activeArtifacts));

    for (const p of players) {
        if (p.state.gameType !== "incangold") continue;
        await ctx.db.patch(p._id, {
            state: {
                ...p.state,
                gemsThisRound: 0,
                status: "IN_TEMPLE",
            }
        });
    }

    await ctx.db.patch(room._id, {
        gameBoard: {
            ...board,
            phase: "ROUND_INTRO",
            currentRound: nextRoundNumber,
            deck: shuffledDeck,
            path: [],
            cardGems: {},
            artifactsOnPath: [],
            decisions: {},
        }
    });

    return { success: true };
  }
});
