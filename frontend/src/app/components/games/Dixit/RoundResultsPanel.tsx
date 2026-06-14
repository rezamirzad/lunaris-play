"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { calculateRank } from "@/lib/utils";

interface RoundResultsPanelProps {
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
}

/**
 * RoundResultsPanel: Optimized for vertical sidebar display.
 * Displays players in a vertical list leaderboard with clear point breakdowns.
 */
export default function RoundResultsPanel({
  roomData,
}: RoundResultsPanelProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;
  if (!board || (board.phase !== "RESULTS" && (board.phase as string) !== "VOTING_REVEAL") || !board.roundResults) return null;

  const pointsMap = board.roundResults.pointsEarned || {};
  const allScores = roomData.players.map((p) =>
    p.state.gameType === "dixit" ? p.state.score || 0 : 0,
  );

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
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="p-6 rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5 backdrop-blur-3xl font-mono shadow-[0_0_80px_rgba(59,130,246,0.15)] w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-0.5">
          <span className="text-[9px] tracking-[0.4em] text-blue-400 font-black uppercase opacity-60">
            {t.results}
          </span>
          <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">
            {t.dixit_round_summary || "ROUND SUMMARY"}
          </h2>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <span className="text-xl">📊</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-h-full overflow-y-auto no-scrollbar">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => {
            const pointsEarned = pointsMap[player._id] || 0;
            const totalScore =
              player.state.gameType === "dixit" ? player.state.score : 0;
            const rank = calculateRank(totalScore || 0, allScores);
            const isLeader = rank === 1;

            const storytellerId = roomData.turnOrder[roomData.currentTurnIndex];
            const isST = player._id === storytellerId;
            const results = board.roundResults!;
            const myCard = board.submittedCards?.find((c) => c.playerId === player._id)?.cardId;
            const votedCorrect = board.votes?.some((v) => v.voterId === player._id && v.cardId === results.storytellerCard);
            const votesForMe = board.votes?.filter((v) => v.cardId === myCard && v.voterId !== player._id).length || 0;
            const votesForStoryteller = board.votes?.filter((v) => v.cardId === results.storytellerCard).length || 0;
            const totalGuessers = roomData.players.length - 1;
            const isAllOrNone = votesForStoryteller === totalGuessers || votesForStoryteller === 0;

            const breakdown = [];
            if (isST) {
                if (!isAllOrNone) breakdown.push({ label: "Storyteller Success", pts: 3, icon: "🔮" });
                else breakdown.push({ label: "Too Obvious / Vague", pts: 0, icon: "⚠️" });
            } else {
                if (isAllOrNone) breakdown.push({ label: "Insight Bonus", pts: 2, icon: "🧠" });
                else if (votedCorrect) {
                    const myVotes = board.votes?.filter(v => v.voterId === player._id).length || 1;
                    if (board.ruleset === "ODYSSEY" && myVotes === 1) breakdown.push({ label: "Risk Reward", pts: 4, icon: "🎲" });
                    else breakdown.push({ label: "Correct Guess", pts: 3, icon: "🎯" });
                }
                if (votesForMe > 0) {
                    const decoyPts = board.ruleset === "ODYSSEY" ? Math.min(3, votesForMe) : votesForMe;
                    breakdown.push({ label: "Deception", pts: decoyPts, icon: "🎭" });
                }
            }

            return (
              <motion.div
                key={player._id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex flex-col gap-2 p-4 border rounded-3xl group transition-all ${isLeader ? "bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]" : "bg-black/40 border-white/5 hover:border-blue-500/30"}`}
              >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3.5 min-w-0">
                    <div
                        className={`h-8 w-8 text-xs shrink-0 rounded-full flex items-center justify-center font-black border transition-colors ${isLeader ? "bg-yellow-400 border-yellow-500 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]" : "bg-zinc-800 border-white/10 group-hover:bg-blue-500 group-hover:text-white"}`}
                    >
                        {isFA ? toPersianDigits(rank) : rank}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                            className={`font-black uppercase tracking-tight italic truncate text-sm ${isLeader ? "text-yellow-400" : "text-white"}`}
                            >
                            {player.name} {isLeader && "👑"}
                            </span>
                            {player.isBot && (
                                <Image
                                    src="/assets/general/artificial-intelligence-design-png.webp" 
                                    alt="AI" 
                                    width={10}
                                    height={10}
                                    className="opacity-80" 
                                />
                            )}
                        </div>
                    </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                    <span
                        className={`font-black italic tracking-tighter text-lg leading-none ${isLeader ? "text-yellow-400" : pointsEarned > 0 ? "text-teal-400" : "text-zinc-600"}`}
                    >
                        +{isFA ? toPersianDigits(pointsEarned) : pointsEarned}
                    </span>
                    </div>
                </div>

                {/* 🧩 BREAKDOWN TAGS */}
                <div className="flex flex-wrap gap-1.5 mt-1 border-t border-white/5 pt-3">
                    {breakdown.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                            <span className="text-[10px] grayscale brightness-150">{item.icon}</span>
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                            <span className="text-[9px] font-black text-blue-400">+{item.pts}</span>
                        </div>
                    ))}
                    {breakdown.length === 0 && (
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] italic ml-1">No points earned this round</span>
                    )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
