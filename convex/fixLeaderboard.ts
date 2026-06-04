import { internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const fix = internalMutation(async (ctx) => {
  const rooms = await ctx.db
    .query("rooms")
    .filter((q) => q.eq(q.field("status"), "FINISHED"))
    .collect();

  for (const room of rooms) {
    // 1. Safely check that the game is Dixit and the properties actually exist
    if (
      room.gameBoard.gameType === "dixit" &&
      "winnerIds" in room.gameBoard &&
      "winnerId" in room.gameBoard
    ) {
      // 2. Extract them to local variables. This prevents TypeScript from
      // "forgetting" the type narrowing inside the array callbacks below.
      const allWinnerIds = room.gameBoard.winnerIds as Id<"players">[];
      const primaryWinnerId = room.gameBoard.winnerId;

      if (allWinnerIds && allWinnerIds.length > 1) {
        // Find the winners that wasn't the primary winnerId
        const secondaryWinners = allWinnerIds.filter(
          (id) => id !== primaryWinnerId,
        );

        for (const winnerId of secondaryWinners) {
          const player = await ctx.db.get(winnerId);
          if (player && !player.isBot) {
            const profile = await ctx.db
              .query("users")
              .withIndex("by_name", (q) => q.eq("name", player.name))
              .unique();
            if (profile) {
              await ctx.db.patch(profile._id, {
                wins: (profile.wins || 0) + 1,
              });
              console.log(`Incremented wins for profile ${profile.name}`);
            }
          }
        }
      }
    }
  }
});
