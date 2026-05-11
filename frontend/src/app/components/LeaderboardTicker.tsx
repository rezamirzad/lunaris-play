"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { motion } from "framer-motion";

export default function LeaderboardTicker() {
  const leaderboard = useQuery(api.engine.getLeaderboard);
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  if (!leaderboard || leaderboard.length === 0) return null;

  // Duplicate the list to ensure a seamless infinite scroll
  const items = [...leaderboard, ...leaderboard, ...leaderboard];

  return (
    <div className="w-full bg-zinc-900/40 border border-white/5 backdrop-blur-md overflow-hidden py-3 rounded-2xl relative z-50">
      <div className="flex whitespace-nowrap animate-marquee hover:pause-animation">
        {items.map((user, idx) => (
          <div
            key={`${user._id}-${idx}`}
            className="flex items-center gap-8 px-8 border-r border-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                #
                {isFA
                  ? toPersianDigits((idx % leaderboard.length) + 1)
                  : (idx % leaderboard.length) + 1}
              </span>
              <span className="text-sm font-black italic text-white uppercase tracking-tighter">
                {user.name}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {t.game}:
                </span>
                <span className="text-xs font-black text-white tabular-nums">
                  {isFA
                    ? toPersianDigits(user.gamesPlayed || 0)
                    : user.gamesPlayed || 0}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {t.wins}:
                </span>
                <span className="text-xs font-black text-teal-400 tabular-nums">
                  {isFA ? toPersianDigits(user.wins || 0) : user.wins || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative Edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-app to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-app to-transparent pointer-events-none z-10" />
    </div>
  );
}
