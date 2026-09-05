import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { PERSONAS } from "./personas";
import { Id } from "../_generated/dataModel";

declare const require: any;

export const dispatchBotTurn = internalMutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "PLAYING" || room.botsHalted) return;

    // 1. Fetch all players in the room once to avoid redundant DB calls
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const board = room.gameBoard as any;
    let targetPlayerIds: Id<"players">[] = [];

    // 2. Identify which bots need to act based on game-specific logic
    if (board.gameType === "pioupiou" && board.pendingAttack) {
      targetPlayerIds = [board.pendingAttack.victimId];
    } else if (board.gameType === "incangold" && board.phase === "DECISION_PHASE") {
      targetPlayerIds = players
        .filter(p => p.isBot && p.state.gameType === "incangold" && p.state.status === "IN_TEMPLE" && !board.decisions[p._id])
        .map(p => p._id);
    } else if (board.gameType === "flip7" && board.phase === "ACTIVE_PLAY") {
      if (board.pendingTargetAction) {
        const sourceBot = players.find(p => String(p._id) === String(board.pendingTargetAction.sourcePlayerId));
        if (sourceBot && sourceBot.isBot) {
          targetPlayerIds = [sourceBot._id];
        }
      } else {
        const currentTurnPlayer = players.find(p => String(p._id) === String(board.currentTurnPlayerId));
        if (currentTurnPlayer && currentTurnPlayer.isBot && (currentTurnPlayer.state as any).status === "ACTIVE") {
          targetPlayerIds = [currentTurnPlayer._id];
        }
      }
    } else if (board.gameType === "dixit") {
      if (board.phase === "CLUE") {
        const storytellerId = room.turnOrder[room.currentTurnIndex];
        targetPlayerIds = [storytellerId];
      } else if (board.phase === "SUBMITTING" || board.phase === "VOTING") {
        const dixitBots = players.filter(p => p.isBot && (
          board.phase === "SUBMITTING" 
            ? !board.submittedCards.some((s: any) => s.playerId === p._id)
            : (p._id !== room.turnOrder[room.currentTurnIndex] && !board.votes.some((v: any) => v.voterId === p._id))
        ));

        if (dixitBots.length > 0) {
          const baseUrl = "https://lunaris-play.vercel.app";
          const tableCards = board.phase === "VOTING" 
            ? (board.shuffledBoardCards || []).map((c: any) => ({ 
                id: c.cardId, 
                url: `${baseUrl}/assets/games/dixit/cards/${c.cardId}.png` 
              }))
            : undefined;

          const batchData = dixitBots.map(bot => ({
            playerId: bot._id,
            persona: bot.persona || "balanced",
            hand: board.phase === "SUBMITTING" 
              ? bot.gameHand.map((id: string) => ({ id, url: `${baseUrl}/assets/games/dixit/cards/${id}.png` }))
              : undefined,
            myCardId: board.phase === "VOTING" 
              ? board.submittedCards.find((s: any) => s.playerId === bot._id)?.cardId
              : undefined,
          }));

          // Trigger Batch AI (No staggering needed as it's one call)
          await ctx.scheduler.runAfter(5000, (internal as any).bots.ai.processDixitBatchAITurn, {
            roomId: room._id,
            phase: board.phase,
            clue: board.currentClue,
            ruleset: board.ruleset,
            bots: batchData,
            tableCards,
          });
          
          return; // Skip individual logic
        }
      }
    } else if (board.gameType === "justone") {
        if (board.phase === "CLUE_INPUT") {
            targetPlayerIds = players.filter(p => p.isBot && p._id !== board.activePlayerId && !board.confirmedPlayers?.includes(p._id)).map(p => p._id);
        } else if (board.phase === "GUESSING") {
            targetPlayerIds = players.filter(p => p.isBot && p._id === board.activePlayerId).map(p => p._id);
        }
    } else {
      targetPlayerIds = [room.turnOrder[room.currentTurnIndex]];
    }

    // 3. Stagger bots to avoid blowing the API quota (especially Vision calls)
    let botIndex = 0;
    for (const playerId of targetPlayerIds) {
        const player = players.find(p => p._id === playerId);
        if (!player || !player.isBot) continue;

        // Mark heartbeat to indicate the game loop is active
        await ctx.db.patch(room._id, { lastMoveTime: Date.now(), botStuck: false });

        // Calculate staggered delay with human-like randomness (15s for Dixit/Vision, 4s for others)
        const staggerStep = room.currentGame === "dixit" ? 15000 : 4000;
        const staggerOffset = botIndex * staggerStep;
        const randomThinkingTime = 3000 + Math.random() * 5000;
        const totalDelay = staggerOffset + randomThinkingTime;

        // Set Thinking State immediately for UI feedback
        const persona = PERSONAS[player.persona || "balanced"];
        const statusText = board.phase === "CLUE" ? "CRAFTING_VISION" : 
                          board.phase === "VOTING" ? "DECODING_SYMBOLS" : 
                          board.phase === "SUBMITTING" ? "DREAMING" : "ANALYZING_STRATEGY";

        await ctx.db.patch(player._id, { 
            isThinking: true, 
            botStatus: `${persona.name} is ${statusText.toLowerCase().replace("_", " ")}...` 
        });
        
        await ctx.scheduler.runAfter(totalDelay, (internal as any).bots.manager.executeMove, {
            roomId: room._id,
            playerId: player._id,
        });

        // Watchdog: ensures bots don't hang indefinitely
        const watchdogBuffer = room.currentGame === "dixit" ? 45000 : 20000;
        await ctx.scheduler.runAfter(totalDelay + watchdogBuffer, (internal as any).bots.manager.watchdog, {
            roomId: room._id,
            playerId: player._id,
            scheduledTime: Date.now() + totalDelay,
        });
        
        botIndex++;
    }
  },
});

export const executeMove = internalMutation({
  args: { roomId: v.id("rooms"), playerId: v.id("players") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    const player: any = await ctx.db.get(args.playerId);
    if (!room || !player || room.status !== "PLAYING") return;
    
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();
    
    // Clear thinking state as we are now executing
    await ctx.db.patch(player._id, { isThinking: false, botStatus: undefined });

    const board = room.gameBoard as any;
    const persona = PERSONAS[player.persona || "balanced"];

    if (room.currentGame === "pioupiou") {
      const isVictim = board.gameType === "pioupiou" && board.pendingAttack?.victimId === player._id;
      const isCurrentTurn = room.turnOrder[room.currentTurnIndex] === player._id;
      if (!isVictim && !isCurrentTurn) return;

      const state = player.state as any;
      const move = persona.decidePiouPiou(player._id, player.gameHand, state.eggs, state.chicks, [], board);
      await ctx.scheduler.runAfter(0, (internal as any).pioupiou.performBotAction, { playerId: player._id, ...move });
    } 
    else if (room.currentGame === "incangold") {
      if (board.phase !== "DECISION_PHASE") return;
      const state = player.state as any;
      const decision = persona.decideIncanGold(player._id, state.gemsThisRound, [], board);
      // Humanized delay: 1.2s to 3.5s randomized per bot
      const delayMs = 1200 + Math.floor(Math.random() * 2300);
      await ctx.scheduler.runAfter(delayMs, (internal as any).incangold.performBotDecision, { playerId: player._id, decision });
    }
    else if (room.currentGame === "flip7") {
      if (board.phase !== "ACTIVE_PLAY") return;
      const delayMs = (board.mustFlipCount || 0) > 0 ? 350 + Math.floor(Math.random() * 250) : 800 + Math.floor(Math.random() * 1000);

      if (board.pendingTargetAction && String(board.pendingTargetAction.sourcePlayerId) === String(player._id)) {
        const activePlayers = players.filter((p: any) => (p.state as any).status === "ACTIVE");
        let targetId = player._id;
        const rivals = activePlayers.filter((p: any) => String(p._id) !== String(player._id));

        if (board.pendingTargetAction.actionType === "FREEZE") {
          const myScore = (player.state as any).roundScore || 0;
          if (myScore >= 12 || rivals.length === 0) {
            targetId = player._id;
          } else {
            const sortedRivals = [...rivals].sort((a: any, b: any) => ((b.state as any).roundScore || 0) - ((a.state as any).roundScore || 0));
            targetId = sortedRivals[0]._id;
          }
        } else {
          // FLIP_THREE: target top scoring rival
          if (rivals.length > 0) {
            const sortedRivals = [...rivals].sort((a: any, b: any) => ((b.state as any).roundScore || 0) - ((a.state as any).roundScore || 0));
            targetId = sortedRivals[0]._id;
          }
        }

        await ctx.scheduler.runAfter(delayMs, (internal as any).flip7.resolveTargetAction, { playerId: player._id, targetPlayerId: targetId });
      } else {
        const state = player.state as any;
        const mustFlip = (board.mustFlipCount || 0) > 0;
        const hasSecondChance = !!state.hasSecondChance;
        const bankedScore = state.bankedScore || 0;
        const action = mustFlip ? "HIT" : ((persona as any).decideFlip7 ? (persona as any).decideFlip7(player._id, state.roundFaceUpCards || [], hasSecondChance, bankedScore, board) : "HIT");
        await ctx.scheduler.runAfter(delayMs, (internal as any).flip7.performBotTurn, { playerId: player._id, action });
      }
    }
    else if (room.currentGame === "dixit") {
      let relevantCards: string[] = [];
      if (board.phase === "CLUE" || board.phase === "SUBMITTING") {
        relevantCards = player.gameHand;
      } else if (board.phase === "VOTING") {
        relevantCards = (board.shuffledBoardCards || []).map((c: any) => c.cardId).filter((id: string) => !(board.submittedCards || []).some((s: any) => s.playerId === player._id && s.cardId === id));
      }

      if (relevantCards.length === 0) return;

      const prompt = persona.generateDixitPrompt(board.phase, player.maturity || "ADULT", board.currentClue, board.ruleset);
      const baseUrl = "https://lunaris-play.vercel.app";
      const cardImages = relevantCards.map(id => ({ id, url: `${baseUrl}/assets/games/dixit/cards/${id}.png` }));

      await ctx.scheduler.runAfter(0, (internal as any).bots.ai.processDixitAITurn, {
        roomId: room._id,
        playerId: player._id,
        phase: board.phase,
        persona: player.persona || "balanced",
        prompt,
        cardImages
      });
    }
    else if (room.currentGame === "justone") {
      const language = board.language || "en";
      
      let targetWord: string | undefined;
      let providedClues: string[] | undefined;

      if (board.phase === "CLUE_INPUT") {
        targetWord = board.mysteryWord[language as keyof typeof board.mysteryWord] || board.mysteryWord.en;
      } else if (board.phase === "GUESSING") {
        providedClues = Object.entries(board.clues || {})
          .filter(([pId]) => !(board.canceledClues || []).includes(pId))
          .map(([_, clue]) => clue as string);
      }

      await ctx.scheduler.runAfter(0, (internal as any).bots.justone_ai.processJustOneLocalAITurn, {
        roomId: room._id,
        playerId: player._id,
        phase: board.phase,
        language,
        targetWord,
        providedClues
      });
    }
  },
});

export const applyAIResult = internalMutation({
  args: { 
    roomId: v.id("rooms"), 
    playerId: v.id("players"), 
    gameType: v.string(), 
    result: v.any() 
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "PLAYING") return;
    const board = room.gameBoard as any;

    if (args.gameType === "dixit") {
      const { handleActionInternal } = (require as any)("../dixit");
      const clue = args.result.clues ? args.result.clues.en : args.result.clue;
      
      // Reset AI error flag on success
      await ctx.db.patch(args.playerId, { aiError: false });

      const player: any = await ctx.db.get(args.playerId);
      let cardId = args.result.cardId;
      
      // Filter candidates identically to how they were presented to the AI (exclude own card)
      const candidates = board.phase === "VOTING" 
        ? (board.shuffledBoardCards || []).filter((c: any) => 
            !(board.submittedCards || []).some((s: any) => s.playerId === args.playerId && s.cardId === c.cardId)
          )
        : [];

      if (!cardId && args.result.selectedIndex) {
          if (board.phase === "VOTING") {
              cardId = candidates[args.result.selectedIndex - 1]?.cardId;
          } else {
              cardId = player.gameHand[args.result.selectedIndex - 1];
          }
      }

      const voteIds = Array.isArray(args.result.selectedIndices)
          ? args.result.selectedIndices.map((idx: number) => candidates[idx - 1]?.cardId).filter(Boolean)
          : (cardId && board.phase === "VOTING" ? [cardId] : []);

      await handleActionInternal(ctx, {
        playerId: args.playerId,
        actionType: board.phase === "CLUE" ? "SUBMIT_CLUE" : board.phase === "SUBMITTING" ? "SUBMIT_CARD" : "SUBMIT_VOTE",
        cardId: cardId,
        voteIds: board.phase === "VOTING" ? voteIds : undefined,
        clue: clue,
        clues: args.result.clues,
      });
    }
    else if (args.gameType === "justone") {
        const { handleActionInternal } = (require as any)("../justone");
        await handleActionInternal(ctx, {
            playerId: args.playerId,
            actionType: board.phase === "CLUE_INPUT" ? "SUBMIT_CLUE" : "SUBMIT_GUESS",
            clue: args.result.clue,
            clues: args.result.clues,
            guess: args.result.guess
        });
    }
  }
});

export const setAIError = internalMutation({
  args: { playerId: v.id("players"), error: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, { aiError: args.error });
  },
});

export const watchdog = internalMutation({
  args: { roomId: v.id("rooms"), playerId: v.id("players"), scheduledTime: v.number() },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status !== "PLAYING") return;

    if (room.turnOrder[room.currentTurnIndex] === args.playerId && 
        room.lastMoveTime && room.lastMoveTime <= args.scheduledTime + 1000) {
      
      await ctx.db.patch(room._id, { botStuck: true });
      await ctx.scheduler.runAfter(0, (internal as any).bots.manager.executeMove, {
        roomId: room._id,
        playerId: args.playerId,
      });
    }
  },
});
