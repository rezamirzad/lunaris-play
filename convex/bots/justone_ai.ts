import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Just One Local AI Brain: Uses a predefined clues dataset to simulate AI behavior.
 */
export const processJustOneLocalAITurn = internalAction({
  args: {
    roomId: v.id("rooms"),
    playerId: v.id("players"),
    phase: v.string(),
    language: v.string(), // "en" | "fr" | "de" | "fa"
    targetWord: v.optional(v.string()), // The word for which we need a clue
    providedClues: v.optional(v.array(v.string())), // Clues provided by others for guessing
  },
  handler: async (ctx, args): Promise<void> => {
    try {
        const lang = args.language as "en" | "fr" | "de" | "fa";
        let result: any = {};

        if (args.phase === "CLUE_INPUT" && args.targetWord) {
            // Fetch word entry from database
            const wordEntry = await ctx.runQuery(api.justone.getClueDataForWord, { 
                word: args.targetWord,
                language: lang 
            });

            if (wordEntry && wordEntry.clues && wordEntry.clues[lang]) {
                const possibleClues = wordEntry.clues[lang];
                const selectedClue = possibleClues[Math.floor(Math.random() * possibleClues.length)];
                result = { clue: selectedClue };
            } else {
                result = { clue: "???" };
            }
        } 
        else if (args.phase === "GUESSING" && args.providedClues) {
            // Fetch all clues from DB to guess
            const allEntries = await ctx.runQuery(api.justone.getAllClues);
            
            let bestMatches: { word: string, score: number }[] = [];

            for (const entry of allEntries) {
                const datasetClues: string[] = entry.clues[lang] || [];
                const score = args.providedClues.filter((pc: string) => 
                    datasetClues.some((dc: string) => dc.toLowerCase() === pc.toLowerCase())
                ).length;

                if (score > 0) {
                    bestMatches.push({ word: entry.word[lang], score });
                }
            }

            // ... (rest of guessing logic remains the same)

            // Sort by match count descending
            bestMatches.sort((a, b) => b.score - a.score);
            
            // LOGIC: If we have multiple matches, we only guess if the top match is significantly better,
            // or if we have at least 2 clues pointing to it. Otherwise, we might pass.
            if (bestMatches.length > 0) {
                const top = bestMatches[0];
                const runnerUp = bestMatches[1];
                
                // Confidence Check
                const confidence = runnerUp ? top.score - runnerUp.score : top.score;
                
                if (confidence >= 1 || top.score >= 2) {
                    result = { guess: top.word };
                } else {
                    // Too unsure, simulate a 'Pass'
                    result = { guess: "" }; 
                }
            } else {
                result = { guess: "" };
            }
        }

        await ctx.runMutation((internal as any).bots.manager.applyAIResult, {
            roomId: args.roomId,
            playerId: args.playerId,
            gameType: "justone",
            result,
        });

    } catch (error: any) {
        console.error("[BOT_TELEMETRY] ❌ JustOne Local AI Failed:", error.message);
        await ctx.runMutation((internal as any).bots.manager.applyAIResult, {
            roomId: args.roomId,
            playerId: args.playerId,
            gameType: "justone",
            result: args.phase === "CLUE_INPUT" ? { clue: "ERROR" } : { guess: "" },
        });
    }
  },
});
