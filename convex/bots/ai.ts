"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { Buffer } from "buffer";

declare const process: any;

// Use v1beta so the API correctly resolves the "gemini-1.5-flash" alias without throwing a 404
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Dixit AI Brain: Uses Gemini 1.5 Flash (Vision) to play Dixit.
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
    if (!apiKey) {
      console.error("[BOT_TELEMETRY] ❌ GEMINI_API_KEY not found.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 2;
    let lastError = "";

    while (attempts < maxAttempts) {
      try {
        console.log(
          `[BOT_TELEMETRY] 📡 Dixit Attempt ${attempts + 1}/${maxAttempts} | Cards: ${args.cardImages.length} | Phase: ${args.phase}`,
        );

        const imageParts = await Promise.all(
          args.cardImages.map(async (img, index) => {
            try {
              const resp = await fetch(`${img.url}?v=${attempts}`, {
                signal: AbortSignal.timeout(10000),
              });
              if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

              const buffer = await resp.arrayBuffer();
              // Native Buffer is 100x faster than the for-loop
              const base64String = Buffer.from(buffer).toString("base64");

              // Interleave text tags to prevent the AI from miscounting images
              return [
                { text: `Image ${index + 1}:` },
                { inline_data: { mime_type: "image/png", data: base64String } },
              ];
            } catch (e: any) {
              console.warn(
                `[BOT_TELEMETRY] ⚠️ Failed to fetch ${img.url}: ${e.message}`,
              );
              return null;
            }
          }),
        );

        const validImageParts = imageParts.filter(Boolean).flat();
        if (validImageParts.length === 0)
          throw new Error("No images could be fetched.");

        const payload = {
          contents: [
            {
              role: "user",
              parts: [...validImageParts, { text: args.prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json", // camelCase required by Google REST API
            temperature: 0.9,
          },
        };

        const startTime = Date.now();
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000),
        });

        const data = await response.json();
        const duration = Date.now() - startTime;

        if (data.error) {
          console.error(
            "[BOT_TELEMETRY] 📥 API Response Error:",
            JSON.stringify(data.error),
          );
          if (data.error.message.includes("quota") || response.status === 429) {
            const retryMatch = data.error.message.match(/retry in ([\d.]+)s/);
            const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : 15;
            console.warn(
              `[BOT_TELEMETRY] ⏳ Quota exceeded. Waiting ${retrySeconds}s...`,
            );
            await new Promise((resolve) =>
              setTimeout(resolve, (retrySeconds + 1) * 1000),
            );
            attempts++;
            continue;
          }
          throw new Error(`Gemini API Error: ${data.error.message}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.error(
            "[BOT_TELEMETRY] 📥 Empty Response Data:",
            JSON.stringify(data),
          );
          throw new Error("Empty response from Gemini");
        }

        console.log("[BOT_TELEMETRY] 📥 Raw AI Response:", text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;
        const result = JSON.parse(cleanJson);

        console.log(
          `[BOT_TELEMETRY] ✅ GEMINI_API_SUCCESS (Dixit) | Duration: ${duration}ms`,
        );

        // Ensure we map the selected index correctly bounds-checked
        const parsedIdx = (result.selectedIndex || 1) - 1;
        const safeIdx = Math.max(
          0,
          Math.min(parsedIdx, args.cardImages.length - 1),
        );
        const selectedCard = args.cardImages[safeIdx];

        return await ctx.runMutation(
          (internal as any).bots.manager.applyAIResult,
          {
            roomId: args.roomId,
            playerId: args.playerId,
            gameType: "dixit",
            result: { ...result, cardId: selectedCard.id },
          },
        );
      } catch (error: any) {
        lastError = error.message || String(error);
        console.error(
          `[BOT_TELEMETRY] ⚠️ Dixit Attempt ${attempts + 1} Failed: ${lastError}`,
        );
        attempts++;
        if (attempts < maxAttempts)
          await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // --- FALLBACK ---
    console.error(
      "[BOT_TELEMETRY] ❌ AI_FALLBACK_TRIGGERED (Dixit) | Error:",
      lastError,
    );

    await ctx.runMutation((internal as any).bots.manager.setAIError, {
      playerId: args.playerId,
      error: true,
    });

    const genericClues = [
      "A forgotten dream",
      "The silent whisper",
      "Hidden paths",
      "Fading echoes",
      "The light within",
      "Eternal dance",
    ];
    const randomClue =
      genericClues[Math.floor(Math.random() * genericClues.length)];
    await ctx.runMutation((internal as any).bots.manager.applyAIResult, {
      roomId: args.roomId,
      playerId: args.playerId,
      gameType: "dixit",
      result: {
        selectedIndex: 1,
        cardId: args.cardImages[0].id,
        clue: randomClue,
      },
    });
  },
});

/**
 * Just One AI Brain: Uses Gemini 1.5 Flash (Text) to play Just One.
 */
export const processJustOneAITurn = internalAction({
  args: {
    roomId: v.id("rooms"),
    playerId: v.id("players"),
    phase: v.string(),
    persona: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const apiKey = (process as any).env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: args.prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.9,
        },
      };

      const startTime = Date.now();
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (data.error) throw new Error(data.error.message);

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch ? jsonMatch[0] : text);

      console.log(
        `[BOT_TELEMETRY] ✅ GEMINI_API_SUCCESS (JustOne) | Duration: ${duration}ms`,
      );

      await ctx.runMutation((internal as any).bots.manager.applyAIResult, {
        roomId: args.roomId,
        playerId: args.playerId,
        gameType: "justone",
        result,
      });
    } catch (error: any) {
      console.error("[BOT_TELEMETRY] ❌ JustOne AI Failed:", error.message);
      await ctx.runMutation((internal as any).bots.manager.applyAIResult, {
        roomId: args.roomId,
        playerId: args.playerId,
        gameType: "justone",
        result:
          args.phase === "CLUE_INPUT"
            ? { clues: { en: "LINK", fr: "LIEN", de: "LINK", fa: "لینک" } }
            : { guess: "UNKNOWN" },
      });
    }
  },
});
