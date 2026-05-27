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
        const { CLUES_DATA } = await import("./justone_clues");
        const lang = args.language as "en" | "fr" | "de" | "fa";
        
        let result: any = {};

        if (args.phase === "CLUE_INPUT" && args.targetWord) {
            // Find word entry (case insensitive)
            const wordEntry = CLUES_DATA.find(e => 
                (e[lang] && e[lang].toLowerCase() === args.targetWord?.toLowerCase()) || 
                (e.en && e.en.toLowerCase() === args.targetWord?.toLowerCase())
            );

            if (wordEntry && wordEntry.clues && wordEntry.clues[lang]) {
                const possibleClues = wordEntry.clues[lang];
                const selectedClue = possibleClues[Math.floor(Math.random() * possibleClues.length)];
                result = { clue: selectedClue };
            } else {
                // Fallback: Pick a very generic word if not in dictionary
                const fallbacks = {
                    en: "CONCEPT",
                    fr: "CONCEPT",
                    de: "KONZEPT",
                    fa: "مفهوم"
                };
                result = { clue: fallbacks[lang] || "HELP" };
            }
        } 
        else if (args.phase === "GUESSING" && args.providedClues) {
            // GUESSING LOGIC:
            // For each word in the dictionary, count how many of the 'providedClues' are in its 'clues' list.
            let bestMatches: { word: string, score: number }[] = [];

            for (const entry of CLUES_DATA) {
                const datasetClues: string[] = entry.clues[lang] || [];
                const score = args.providedClues.filter((pc: string) => 
                    datasetClues.some((dc: string) => dc.toLowerCase() === pc.toLowerCase())
                ).length;

                if (score > 0) {
                    bestMatches.push({ word: entry[lang], score });
                }
            }

            // Sort by score descending
            bestMatches.sort((a, b) => b.score - a.score);
            
            // Result is the top match
            result = { guess: bestMatches.length > 0 ? bestMatches[0].word : "???" };
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
            result: args.phase === "CLUE_INPUT" ? { clue: "HELP" } : { guess: "UNKNOWN" },
        });
    }
  },
});
