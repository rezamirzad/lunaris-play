import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const importClues = mutation({
  args: {
    cluesData: v.array(v.object({
      word: v.object({
        en: v.string(),
        fr: v.string(),
        de: v.string(),
        fa: v.string(),
      }),
      clues: v.object({
        en: v.array(v.string()),
        fr: v.array(v.string()),
        de: v.array(v.string()),
        fa: v.array(v.string()),
      }),
      difficulty: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    for (const entry of args.cluesData) {
      const existing = await ctx.db.query("justone_clues")
        .filter(q => q.eq(q.field("word.en"), entry.word.en))
        .first();
      
      if (!existing) {
        await ctx.db.insert("justone_clues", entry);
      }
    }
  },
});
