"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { calculateRank } from "@/lib/utils";

interface RoundResultsPanelProps {
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
}

export default function RoundResultsPanel({
  roomData,
}: RoundResultsPanelProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;
  if (!board || board.phase !== "RESULTS" || !board.roundResults) return null;

  const pointsMap = board.roundResults.pointsEarned || {};
  const allScores = roomData.players.map((p) =>
    p.state.gameType === "dixit" ? p.state.score || 0 : 0,
  );

  // Sort players by points earned this round, then by total score
  const sortedPlayers = [...roomData.players].sort((a, b) => {
    const pointsA = pointsMap[a._id] || 0;
    const pointsB = pointsMap[b._id] || 0;
    if (pointsB !== pointsA) return pointsB - pointsA;

    const scoreA = a.state.gameType === "dixit" ? a.state.score : 0;
    const scoreB = b.state.gameType === "dixit" ? b.state.score : 0;
    return (scoreB || 0) - (scoreA || 0);
  });

  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
      className="mt-12 p-8 rounded-[3rem] border border-blue-500/20 bg-blue-500/5 backdrop-blur-3xl font-mono shadow-[0_0_50px_rgba(59,130,246,0.1)]"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <span className="text-[8px] tracking-[0.6em] text-blue-400 font-black uppercase opacity-60">
            {t.results}
          </span>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            {t.dixit_round_summary || "ROUND_SUMMARY"}
          </h2>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <span className="text-xl">📊</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => {
            const pointsEarned = pointsMap[player._id] || 0;
            const totalScore =
              player.state.gameType === "dixit" ? player.state.score : 0;
            const rank = calculateRank(totalScore || 0, allScores);
            const isLeader = rank === 1;

            return (
              <motion.div
                key={player._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 border rounded-2xl group transition-all ${isLeader ? "bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]" : "bg-black/40 border-white/5 hover:border-blue-500/30"}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${isLeader ? "bg-yellow-400 border-yellow-500 text-black" : "bg-zinc-800 border-white/10 group-hover:bg-blue-500 group-hover:text-white"}`}
                  >
                    {isFA ? toPersianDigits(rank) : rank}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`font-black uppercase text-sm tracking-tight italic ${isLeader ? "text-yellow-400" : "text-white"}`}
                    >
                      {player.name} {isLeader && "👑"}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-bold tracking-widest">
                      {t.dixit_score}:{" "}
                      {isFA
                        ? toPersianDigits(totalScore || 0)
                        : totalScore || 0}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-xl font-black italic tracking-tighter ${isLeader ? "text-yellow-400 shadow-yellow-500/20" : pointsEarned > 0 ? "text-teal-400 shadow-teal-500/20" : "text-zinc-600"}`}
                  >
                    +{isFA ? toPersianDigits(pointsEarned) : pointsEarned}
                  </span>
                  <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">
                    {t.shared_points}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
