"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import NodeGlyph from "./shared/NodeGlyph";

import { calculateRank, getOrdinal } from "@/lib/utils";

/**
 * Leaderboard: Cinematic 'Hall of Fame' Continuous Ticker
 */
export default function Leaderboard() {
  const leaderboard = useQuery(api.engine.getLeaderboard);
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  if (!leaderboard || leaderboard.length === 0) return null;

  const allWins = leaderboard.map((u) => u.wins || 0);

  // We extract the list into a helper function so we can render it twice.
  // Rendering it twice inside a 50% moving container creates the perfect seamless infinite loop.
  const renderList = (isDuplicate = false) => (
    <div className="flex flex-col">
      {leaderboard.map((user, index) => {
        const rank = calculateRank(user.wins || 0, allWins);
        const ordinalRank = isFA ? toPersianDigits(rank) : getOrdinal(rank);

        return (
          <div
            // If it's the duplicate list, append "-dup" to the key to satisfy React
            key={`${user._id}${isDuplicate ? "-dup" : ""}`}
            className="flex items-center justify-between p-5 group hover:bg-teal-500/5 transition-colors border-b border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 text-[10px] font-black text-zinc-700 group-hover:text-teal-400 transition-colors">
                {ordinalRank}
              </div>
              <NodeGlyph name={user.name} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-black italic text-white uppercase tracking-tight">
                  {user.name}
                </span>
                <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">
                  {t.game}:{" "}
                  {isFA ? toPersianDigits(user.gamesPlayed) : user.gamesPlayed}{" "}
                  {" // "} {t.wins}: {" "}
                  {isFA ? toPersianDigits(user.wins) : user.wins}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-lg font-black italic tracking-tighter text-teal-400 shadow-teal-500/20">
                {isFA ? toPersianDigits(user.totalScore) : user.totalScore}
              </span>
              <span className="text-[6px] text-zinc-600 font-black uppercase tracking-widest">
                {t.shared_score}
              </span>
            </div>
          </div>
        );
      })}

      {/* This is the "space" you requested that continues the flow before the next loop starts. 
        It acts as a seamless visual separator.
      */}
      <div className="h-20 flex items-center justify-center border-b border-white/5 bg-black/20">
        <span className="text-[10px] text-zinc-800 font-black tracking-[0.5em] uppercase">
          {"/// END_OF_CYCLE ///"}
        </span>
      </div>
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase px-4 flex justify-between items-center">
        <span>{t.hallOfFame || "HALL OF FAME"}</span>
        <span className="text-teal-400/50">HALL_OF_FAME</span>
      </h2>

      {/* The Fixed Container. 
        h-[450px] forces a specific height. Adjust this value to fit your layout. 
        overflow-hidden ensures the scrolling content doesn't bleed out.
      */}
      <div className="relative h-[450px] bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col">
        {/* Fading Gradients (Top & Bottom) for that cinematic rolling effect */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-zinc-950/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-12 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950/80 to-transparent z-10 pointer-events-none" />

        {/* The Moving Ticker */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            animate={{
              y: ["0%", "-50%"],
            }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              // Dynamic speed: scales with the number of players so it doesn't get too fast
              duration: 1,
            }}
            className="flex flex-col"
          >
            {/* We render the list exactly twice to create the infinite loop */}
            {renderList(false)}
            {renderList(true)}
          </motion.div>
        </div>

        <div className="relative z-20 p-4 bg-zinc-950 border-t border-white/5 text-center shrink-0">
          <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.4em]">
            {t.footer}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
