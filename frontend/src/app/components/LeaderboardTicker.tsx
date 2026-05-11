"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { motion } from "framer-motion";

import { calculateRank, getOrdinal } from "@/lib/utils";

export default function LeaderboardTicker() {
  const leaderboard = useQuery(api.engine.getLeaderboard);
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  if (!leaderboard || leaderboard.length === 0) return null;

  const allWins = leaderboard.map((u) => u.wins || 0);

  // Map the leaderboard items to a flat array of components
  const renderItems = (keyPrefix: string) =>
    leaderboard.map((user, idx) => {
      const rank = calculateRank(user.wins || 0, allWins);
      const ordinalRank = isFA ? toPersianDigits(rank) : getOrdinal(rank);

      // Determine podium status
      const isFirst = rank === 1;
      const isSecond = rank === 2;
      const isThird = rank === 3;

      // Determine text color based on rank
      let rankColor = "text-white";
      if (isFirst)
        rankColor =
          "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
      else if (isSecond)
        rankColor = "text-zinc-300 drop-shadow-[0_0_5px_rgba(212,212,216,0.5)]";
      else if (isThird)
        rankColor = "text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]";

      return (
        <div
          key={`${keyPrefix}-${user._id}-${idx}`}
          className="flex items-center gap-8 px-8 border-r border-white/5"
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                isFirst
                  ? "text-yellow-400"
                  : isSecond
                    ? "text-zinc-300"
                    : isThird
                      ? "text-amber-500"
                      : "text-white"
              }`}
            >
              {ordinalRank}
            </span>

            <span
              className={`text-sm font-black italic uppercase tracking-tighter flex items-center gap-1.5 ${rankColor}`}
            >
              {/* Crown for 1st place */}
              {isFirst && <span className="text-base leading-none">👑</span>}

              {user.name}

              {/* Medals for Top 3 */}
              {isFirst && <span className="text-base leading-none">🥇</span>}
              {isSecond && <span className="text-base leading-none">🥈</span>}
              {isThird && <span className="text-base leading-none">🥉</span>}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {t.game}:
              </span>
              <span className="text-xs font-black text-white tabular-nums">
                {isFA
                  ? toPersianDigits(user.gamesPlayed || 0)
                  : user.gamesPlayed || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {t.wins}:
              </span>
              <span
                className={`text-xs font-black tabular-nums ${isFirst ? "text-yellow-400" : "text-teal-400"}`}
              >
                {isFA ? toPersianDigits(user.wins || 0) : user.wins || 0}
              </span>
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="w-full bg-zinc-900/40 border border-white/5 backdrop-blur-md overflow-hidden py-3 rounded-2xl relative z-50 group">
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={{
          x: [0, "-50%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: leaderboard.length * 5,
            ease: "linear",
          },
        }}
      >
        <div className="flex items-center">
          {/* Initial padding for breathing room at the start of the sequence */}
          <div className="w-64 flex-shrink-0" />
          {renderItems("set1")}
        </div>
        <div className="flex items-center">
          <div className="w-64 flex-shrink-0" />
          {renderItems("set2")}
        </div>
      </motion.div>

      {/* Decorative Edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none z-10" />
    </div>
  );
}
