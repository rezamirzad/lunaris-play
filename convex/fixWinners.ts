import { internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const fix = internalMutation(async (ctx) => {
  const rooms = await ctx.db.query("rooms").filter(q => q.eq(q.field("status"), "FINISHED")).collect();
  
  for (const room of rooms) {
    if (room.gameBoard.gameType === "dixit") {
      const players = await ctx.db.query("players").withIndex("by_room", q => q.eq("roomId", room._id)).collect();
      const potentialWinners = players.filter((p) => (p.state.gameType === "dixit" ? p.state.score : 0) >= 30);
      
      if (potentialWinners.length > 0) {
        const maxScore = Math.max(...potentialWinners.map((p) => (p.state.gameType === "dixit" ? p.state.score : 0)));
        const winners = potentialWinners.filter((p) => (p.state.gameType === "dixit" ? p.state.score : 0) === maxScore);
        
        if (winners.length > 1) {
          const winnerName = winners.map(w => w.isBot ? `${w.name} 🤖` : w.name).join(" & ");
          const winnerId = winners[0]._id;
          const winnerIds = winners.map(w => w._id as Id<"players">);
          
          await ctx.db.patch(room._id, {
            gameBoard: {
              ...room.gameBoard,
              winner: winnerName,
              winnerId: winnerId,
              winnerIds: winnerIds
            } as any
          });
          console.log(`Patched room ${room._id} with multiple winners: ${winnerName}`);
        }
      }
    }
  }
});
