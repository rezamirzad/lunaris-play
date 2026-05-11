"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import NodeGlyph from "./shared/NodeGlyph";

/**
 * Leaderboard: Cinematic 'Hall of Fame' for the Top Nodes.
 */
export default function Leaderboard() {
  const leaderboard = useQuery(api.engine.getLeaderboard);
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase px-4 flex justify-between items-center">
        <span>{t.hallOfFame}</span>
        <span className="text-teal-400/50">HALL_OF_FAME</span>
      </h2>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="divide-y divide-white/5">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-5 group hover:bg-teal-500/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 text-[10px] font-black text-zinc-700 group-hover:text-teal-400 transition-colors">
                  {isFA ? toPersianDigits(index + 1) : index + 1}
                </div>
                <NodeGlyph name={user.name} size="sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-black italic text-white uppercase tracking-tight">
                    {user.name}
                  </span>
                  <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest">
                    GAMES:{" "}
                    {isFA
                      ? toPersianDigits(user.gamesPlayed)
                      : user.gamesPlayed}{" "}
                    {" // WINS: "}
                    {isFA ? toPersianDigits(user.wins) : user.wins}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-lg font-black italic tracking-tighter text-teal-400 shadow-teal-500/20">
                  {isFA ? toPersianDigits(user.totalScore) : user.totalScore}
                </span>
                <span className="text-[6px] text-zinc-600 font-black uppercase tracking-widest">
                  SYNC_POINTS
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 bg-zinc-950/50 border-t border-white/5 text-center">
          <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.4em]">
            GLOBAL_LEADERBOARD_v1.0 // PERSISTENT_STORAGE_ACTIVE
          </p>
        </div>
      </div>
    </motion.section>
  );
}
