import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { GamePlugin, GameMutationCtx } from "./types";
import { finishTurn, updateLeaderboardAtGameEnd } from "./transitions";

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

const generateDeck = () => {
  return Array.from({ length: 100 }, (_, i) => i + 1);
};

export const themindPlugin: GamePlugin = {
  gameType: "themind",

  getInitialBoard() {
    return {
      gameType: "none",
    };
  },

  getInitialPlayerState(status: string) {
    return {
      initialHand: [],
      initialState: { gameType: "themind", score: 0 },
    };
  },

  async onStart(ctx: GameMutationCtx, roomId: Doc<"rooms">["_id"], players: Doc<"players">[]) {
    const deck = shuffle(generateDeck());
    const hands: Record<string, number[]> = {};

    for (const player of players) {
      const hand = [deck.shift()!];
      hands[player._id] = hand;
      await ctx.db.patch(player._id, {
        gameHand: hand.map(String), // Keep gameHand string-based for consistency, but logic uses numeric hands
        state: { gameType: "themind", score: 0 },
      });
    }

    await ctx.db.patch(roomId, {
      gameBoard: {
        gameType: "themind",
        level: 1,
        lives: players.length,
        emps: 1,
        topCard: null,
        lastPlayedBy: undefined,
        deck: deck,
        discardPile: [],
        hands: hands,
        empVotes: [],
        phase: "PLAYING",
        history: [{ key: "LOG_GAME_STARTED", data: { time: Date.now() } }],
      },
    });
  },
};

export const startNextLevelAction = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameBoard.gameType !== "themind") throw new Error("Invalid room");
    if (room.gameBoard.phase !== "AWAITING_NEXT_LEVEL") throw new Error("Not awaiting next level");
    await nextLevel(ctx, room._id);
  },
});

export const handleAction = mutation({
  args: {
    playerId: v.id("players"),
    actionType: v.string(),
    card: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");
    const room = await ctx.db.get(player.roomId);
    if (!room) throw new Error("Room not found");

    if (room.gameBoard.gameType !== "themind") throw new Error("Invalid game");
    const board = room.gameBoard;

    if (args.actionType === "START_NEXT_LEVEL") {
      if (board.phase !== "AWAITING_NEXT_LEVEL") return { success: false, error: "NOT_AWAITING_NEXT_LEVEL" };
      await nextLevel(ctx, room._id);
      return { success: true };
    }

    if (board.phase !== "PLAYING") return { success: false, error: "NOT_IN_PLAY" };

    if (args.actionType === "PLAY_CARD") {
      const card = args.card!;
      const playerHand = board.hands[player._id] || [];
      if (!playerHand.includes(card)) throw new Error("Card not in hand");

      // Check if anyone has a lower card
      const lowerCards: number[] = [];
      for (const hand of Object.values(board.hands)) {
        lowerCards.push(...hand.filter((c) => c < card));
      }

      if (lowerCards.length > 0) {
        // Penalty: lose a life
        const newLives = board.lives - 1;
        const nextPhase = (newLives <= 0 ? "GAME_OVER" : "PLAYING") as "GAME_OVER" | "PLAYING";

        // Remove played card and ALL lower cards from all hands and move to discardPile
        const newHands: Record<string, number[]> = {};
        const discardedThisTurn = [card, ...lowerCards];
        const newDiscardPile = [...(board.discardPile || []), ...discardedThisTurn].sort((a, b) => a - b);

        for (const [pId, hand] of Object.entries(board.hands)) {
          newHands[pId] = hand.filter((c) => !discardedThisTurn.includes(c));
        }

        const isFailure = nextPhase === "GAME_OVER";

        const patchedGameBoard = {
          ...board,
          lives: newLives,
          phase: nextPhase,
          hands: newHands,
          topCard: card,
          lastPlayedBy: player._id,
          discardPile: newDiscardPile,
          winner: isFailure ? "FAILURE" : board.winner,
          history: [
            ...board.history,
            { 
              key: "LOG_MISTAKE", 
              data: { 
                player: player.name, 
                played: String(card),
                discarded: lowerCards.map(String) 
              } 
            },
          ] as any,
        };

        await ctx.db.patch(room._id, {
          status: isFailure ? "FINISHED" : room.status,
          gameBoard: patchedGameBoard,
        });

        if (isFailure) {
          const players = await ctx.db
            .query("players")
            .withIndex("by_room", (q) => q.eq("roomId", room._id))
            .collect();
          const updatedRoom = { ...room, gameBoard: patchedGameBoard } as any;
          await updateLeaderboardAtGameEnd(ctx, updatedRoom, players);
        } else {
          await checkLevelWin(ctx, room._id, newHands);
        }
      } else {
        // Success
        const newHands: Record<string, number[]> = { ...board.hands };
        newHands[player._id] = playerHand.filter((c) => c !== card);
        const newDiscardPile = [...(board.discardPile || []), card].sort((a, b) => a - b);

        await ctx.db.patch(room._id, {
          gameBoard: {
            ...board,
            hands: newHands,
            topCard: card,
            lastPlayedBy: player._id,
            discardPile: newDiscardPile,
            history: [
              ...board.history,
              { key: "LOG_DISCARD", data: { player: player.name, card: String(card) } }
            ] as any,
          },
        });

        await checkLevelWin(ctx, room._id, newHands);
      }
    }

    if (args.actionType === "TOGGLE_EMP") {
      const currentVotes = board.empVotes || [];
      const newVotes = currentVotes.includes(player._id)
        ? currentVotes.filter((id) => id !== player._id)
        : [...currentVotes, player._id];

      const players = await ctx.db
        .query("players")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();

      if (newVotes.length === players.length && board.emps > 0) {
        // Trigger EMP
        const newHands: Record<string, number[]> = {};
        const removedCards: number[] = [];

        for (const p of players) {
          const hand = board.hands[p._id] || [];
          if (hand.length > 0) {
            const sorted = [...hand].sort((a, b) => a - b);
            removedCards.push(sorted.shift()!);
            newHands[p._id] = sorted;
          } else {
            newHands[p._id] = [];
          }
        }

        const newDiscardPile = [...(board.discardPile || []), ...removedCards].sort((a, b) => a - b);
        const highestRemoved = removedCards.length > 0 ? Math.max(...removedCards) : board.topCard;

        await ctx.db.patch(room._id, {
          gameBoard: {
            ...board,
            emps: board.emps - 1,
            empVotes: [],
            hands: newHands,
            topCard: highestRemoved,
            discardPile: newDiscardPile,
          },
        });

        await checkLevelWin(ctx, room._id, newHands);
      } else {
        await ctx.db.patch(room._id, {
          gameBoard: { ...board, empVotes: newVotes },
        });
      }
    }

    return { success: true };
  },
});

async function checkLevelWin(ctx: GameMutationCtx, roomId: Doc<"rooms">["_id"], hands: Record<string, number[]>) {
  const allHandsEmpty = Object.values(hands).every((h) => h.length === 0);
  if (allHandsEmpty) {
    const room = await ctx.db.get(roomId);
    if (!room || room.gameBoard.gameType !== "themind") return;
    const board = room.gameBoard;

    await ctx.db.patch(roomId, {
      gameBoard: {
        ...board,
        phase: "AWAITING_NEXT_LEVEL",
        history: [
          ...board.history,
          { key: "LOG_LEVEL_CLEARED", data: { level: board.level } }
        ] as any,
      },
    });
  }
}

async function nextLevel(ctx: GameMutationCtx, roomId: Doc<"rooms">["_id"]) {
  const room = await ctx.db.get(roomId);
  if (!room || room.gameBoard.gameType !== "themind") return;
  const board = room.gameBoard;
  const nextLvl = board.level + 1;

  if (nextLvl > 12) {
    const patchedGameBoard = { 
      ...board, 
      phase: "VICTORY",
      winner: "TEAM"
    };
    await ctx.db.patch(roomId, {
      status: "FINISHED",
      gameBoard: patchedGameBoard as any,
    });

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    const updatedRoom = { ...room, gameBoard: patchedGameBoard } as any;
    await updateLeaderboardAtGameEnd(ctx, updatedRoom, players);
    return;
  }

  const players = await ctx.db
    .query("players")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();

  const deck = shuffle(generateDeck());
  const hands: Record<string, number[]> = {};

  // Rewards
  let newEmps = board.emps;
  let newLives = board.lives;
  if ([2, 5, 8].includes(nextLvl)) newEmps++;
  if ([3, 6, 9].includes(nextLvl)) newLives++;

  for (const player of players) {
    const hand = deck.splice(0, nextLvl).sort((a, b) => a - b);
    hands[player._id] = hand;
    await ctx.db.patch(player._id, { gameHand: hand.map(String) });
  }

  await ctx.db.patch(roomId, {
    gameBoard: {
      ...board,
      level: nextLvl,
      lives: newLives,
      emps: newEmps,
      topCard: null,
      lastPlayedBy: undefined,
      deck: deck,
      discardPile: [],
      hands: hands,
      empVotes: [],
      phase: "PLAYING",
    },
  });
}
