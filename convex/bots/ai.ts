"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

declare const Buffer: any;
declare const process: any;

/**
 * MODELS configuration:
 * 2026 Context: Use 2.5-flash as primary. 
 * Resilience against quota/spending blocks and API field variations.
 */
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

const API_VERSION = "v1beta";

function getApiUrl(modelId: string) {
  return `https://generativelanguage.googleapis.com/${API_VERSION}/models/${modelId}:generateContent`;
}

/**
 * buildPayload: Creates a flexible payload. 
 * If useJsonMode is false, we omit the restrictive schema/mime fields to avoid 400 errors.
 */
function buildPayload(prompt: string, imageParts: any[], useJsonMode: boolean, temperature: number) {
  const generationConfig: any = { temperature };
  
  if (useJsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  return {
    contents: [{ role: "user", parts: [...imageParts, { text: prompt }] }],
    generationConfig,
  };
}

/**
 * parseRobustJson: Extracts JSON from a response string, even if wrapped in markdown blocks.
 */
function parseRobustJson(text: string) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in text");
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error("[BOT_TELEMETRY] ❌ JSON_PARSE_ERROR:", text);
        throw e;
    }
}

/**
 * Dixit AI Brain: Uses Gemini Flash (Vision) to play Dixit.
 * (Fallback version)
 */
export const processDixitAITurn = internalAction({
  args: {
    roomId: v.id("rooms"),
    playerId: v.id("players"),
    phase: v.string(),
    persona: v.string(),
    prompt: v.string(),
    cardImages: v.array(v.object({ id: v.string(), url: v.string() })),
  },
  handler: async (ctx, args): Promise<void> => {
    const apiKey = (process as any).env.GEMINI_API_KEY;
    if (!apiKey) return;

    let modelIdx = 0;
    let useJsonMode = true;

    while (modelIdx < MODELS.length) {
      const modelId = MODELS[modelIdx];
      const apiUrl = getApiUrl(modelId);

      try {
        console.log(`[BOT_TELEMETRY] 📡 Dixit Individual | Model: ${modelId} | Mode: ${useJsonMode ? "JSON" : "TEXT"} | Cards: ${args.cardImages.length} | Phase: ${args.phase}`);
        
        const imageParts = await Promise.all(
          args.cardImages.map(async (img, index) => {
            const resp = await fetch(img.url);
            if (!resp.ok) return null;
            const buffer = await resp.arrayBuffer();
            const base64String = Buffer.from(buffer).toString("base64");
            return [
              { text: `Image ${index + 1}:` },
              { inline_data: { mime_type: "image/png", data: base64String } },
            ];
          }),
        );

        const validImageParts = imageParts.filter(Boolean).flat() as any[];
        const payload = buildPayload(args.prompt, validImageParts, useJsonMode, 0.9);

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000),
        });

        const data = await response.json();
        console.log(`[BOT_TELEMETRY] 📥 INDIVIDUAL_RAW_RESPONSE (${modelId}):`, JSON.stringify(data));
        
        if (data.error) {
          const msg = data.error.message;
          console.error(`[BOT_TELEMETRY] 📥 API_ERROR (${modelId}) | Status: ${response.status} | Message: ${msg}`);
          
          if (msg.includes("spending cap")) {
              console.error("CRITICAL: YOUR GOOGLE AI SPENDING CAP HAS BEEN REACHED. Go to AI Studio to increase it.");
          }

          // If the model doesn't support the configuration (400), try without JSON mode before switching models
          if (response.status === 400 && useJsonMode) {
              useJsonMode = false;
              continue; 
          }

          modelIdx++;
          useJsonMode = true;
          continue;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response");

        const result = parseRobustJson(text);
        const safeIdx = Math.max(0, Math.min((result.selectedIndex || 1) - 1, args.cardImages.length - 1));
        const selectedCard = args.cardImages[safeIdx];

        await ctx.runMutation((internal as any).bots.manager.applyAIResult, {
          roomId: args.roomId,
          playerId: args.playerId,
          gameType: "dixit",
          result: { ...result, cardId: selectedCard.id },
        });
        return;
      } catch (error: any) {
        console.error(`[BOT_TELEMETRY] ⚠️ Individual Attempt (${modelId}) Failed: ${error.message}`);
        modelIdx++;
        useJsonMode = true;
        if (modelIdx < MODELS.length) await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },
});

/**
 * Dixit Batch AI Brain: Processes multiple bots in a single high-fidelity vision prompt.
 */
export const processDixitBatchAITurn = internalAction({
  args: {
    roomId: v.id("rooms"),
    phase: v.string(),
    clue: v.optional(v.string()),
    ruleset: v.optional(v.string()),
    bots: v.array(v.object({
      playerId: v.id("players"),
      persona: v.string(),
      hand: v.optional(v.array(v.object({ id: v.string(), url: v.string() }))),
      myCardId: v.optional(v.string()),
    })),
    tableCards: v.optional(v.array(v.object({ id: v.string(), url: v.string() }))),
  },
  handler: async (ctx, args): Promise<void> => {
    const apiKey = (process as any).env.GEMINI_API_KEY;
    if (!apiKey) return;

    let modelIdx = 0;
    let useJsonMode = true;

    while (modelIdx < MODELS.length) {
      const modelId = MODELS[modelIdx];
      const apiUrl = getApiUrl(modelId);

      try {
        const isSubmitting = args.phase === "SUBMITTING";
        const isVoting = args.phase === "VOTING";

        let prompt = "";
        const cardImages: { id: string; url: string }[] = [];

        if (isSubmitting) {
          args.bots.forEach((bot) => {
            bot.hand?.forEach((card) => {
              cardImages.push(card);
            });
          });
        } else if (isVoting) {
          args.tableCards?.forEach((card) => {
            cardImages.push(card);
          });
        }

        console.log(`[BOT_TELEMETRY] 📡 Dixit Batch | Model: ${modelId} | Mode: ${useJsonMode ? "JSON" : "TEXT"} | Bots: ${args.bots.length} | Total Images: ${cardImages.length} | Phase: ${args.phase}`);

        if (isSubmitting) {
          prompt = `You are a Grandmaster of Abstract Metaphor. You are controlling ${args.bots.length} independent Dixit players.
The Storyteller has provided the clue: "${args.clue}".

YOUR OBJECTIVE: For EACH player, select the single best card from their private hand that aligns with this clue.

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. TOTAL ISOLATION: You are acting as ${args.bots.length} separate consciousnesses. Player A's hand is invisible to Player B. Do NOT compare hands.
2. SUBTLETY OVER LITERALISM: Dixit is about abstract connections. Avoid the most obvious literal matches unless no other option exists. 

DATA STRUCTURE:
Below are labeled "Packs" of images. Each pack belongs to one player.
`;
          let globalCardIdx = 0;
          args.bots.forEach((bot, botIdx) => {
            const packId = botIdx + 1;
            prompt += `\n[PACK ${packId} - Player: ${bot.playerId}]\n`;
            bot.hand?.forEach((card, cardIdx) => {
              prompt += `- Image ${globalCardIdx + 1}: (Pack ${packId}, Card ${cardIdx + 1})\n`;
              globalCardIdx++;
            });
          });

          prompt += `\nRETURN FORMAT:
Return a strict JSON object with a 'results' array. Each element must contain 'playerId' and 'selectedIndex' (the index 1-6 WITHIN THEIR OWN PACK).
Example: {"results": [{"playerId": "...", "selectedIndex": 3}, ...]}`;

        } else if (isVoting) {
          prompt = `You are a Master of Psychological Deduction. You are controlling ${args.bots.length} independent Dixit players.
The Storyteller's clue is: "${args.clue}". One card is the Storyteller's. The others are traps.

YOUR OBJECTIVE: For EACH player, identify the Storyteller's card.

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. NO SELF-VOTING: A player is FORBIDDEN from voting for their own card index.
2. INDEPENDENT DEDUCTION: Each player makes their own guess. 

DATA STRUCTURE:
Below are the ${args.tableCards?.length} cards on the table:
`;
          args.tableCards?.forEach((card, idx) => {
            prompt += `- Image ${idx + 1}: (Card ID: ${card.id})\n`;
          });

          prompt += `\nPLAYER RESTRICTIONS:\n`;
          args.bots.forEach((bot) => {
            const myIdx = args.tableCards?.findIndex(c => c.id === bot.myCardId);
            prompt += `- Player ${bot.playerId}: Their card is Image ${myIdx !== undefined ? myIdx + 1 : 'N/A'}. THEY CANNOT VOTE FOR THIS.\n`;
          });

          prompt += `\nRETURN FORMAT:
Return a strict JSON object with a 'results' array. Each element must contain 'playerId' and 'selectedIndex' (the 1-based index of the table card).
Example: {"results": [{"playerId": "...", "selectedIndex": 4}, ...]}`;
        }

        const imageParts = await Promise.all(
          cardImages.map(async (img, index) => {
            const resp = await fetch(img.url);
            if (!resp.ok) return null;
            const buffer = await resp.arrayBuffer();
            const base64String = Buffer.from(buffer).toString("base64");
            return [
              { text: `Image ${index + 1}:` },
              { inline_data: { mime_type: "image/png", data: base64String } },
            ];
          }),
        );

        const validImageParts = imageParts.filter(Boolean).flat() as any[];
        const payload = buildPayload(prompt, validImageParts, useJsonMode, 0.8);

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(60000),
        });

        const data = await response.json();
        console.log(`[BOT_TELEMETRY] 📥 BATCH_RAW_RESPONSE (${modelId}):`, JSON.stringify(data));
        
        if (data.error) {
          const msg = data.error.message;
          console.error(`[BOT_TELEMETRY] 📥 BATCH_API_ERROR (${modelId}) | Status: ${response.status} | Message: ${msg}`);
          
          if (msg.includes("spending cap")) {
              console.error("CRITICAL: YOUR GOOGLE AI SPENDING CAP HAS BEEN REACHED.");
          }

          if (response.status === 400 && useJsonMode) {
              useJsonMode = false;
              continue; 
          }

          modelIdx++;
          useJsonMode = true;
          continue;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response");

        const result = parseRobustJson(text);

        for (const res of result.results) {
          const bot = args.bots.find(b => b.playerId === res.playerId);
          if (!bot) continue;

          let selectedCardId = "";
          if (isSubmitting && bot.hand) {
             const safeIdx = Math.max(0, Math.min(res.selectedIndex - 1, bot.hand.length - 1));
             selectedCardId = bot.hand[safeIdx].id;
          } else if (isVoting && args.tableCards) {
             const safeIdx = Math.max(0, Math.min(res.selectedIndex - 1, args.tableCards.length - 1));
             selectedCardId = args.tableCards[safeIdx].id;
          }

          if (selectedCardId) {
            await ctx.runMutation((internal as any).bots.manager.applyAIResult, {
              roomId: args.roomId,
              playerId: bot.playerId,
              gameType: "dixit",
              result: { cardId: selectedCardId },
            });
          }
        }
        return;
      } catch (error: any) {
        console.error(`[BOT_TELEMETRY] ⚠️ Batch Attempt (${modelId}) Failed: ${error.message}`);
        modelIdx++;
        useJsonMode = true;
        if (modelIdx < MODELS.length) await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Final Fallback: Individual moves
    for (const bot of args.bots) {
        await ctx.runMutation((internal as any).bots.manager.executeMove, {
            roomId: args.roomId,
            playerId: bot.playerId,
        });
    }
  },
});
