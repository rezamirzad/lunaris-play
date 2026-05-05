// convex/rooms.ts
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;
    return room;
  },
});
