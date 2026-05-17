"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog } from "@/lib/translations";
import { motion } from "framer-motion";
import { getOrdinal } from "@/lib/utils";

export default function DixitPlayerStats({
  state,
  rank,
  totalPlayers,
  isST,
}: {
  state?: { score?: number } | null;
  rank: number;
  totalPlayers: number;
  isST: boolean;
}) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const isLeader = rank === 1;

  const score = state?.score ?? 0;

  const rankDisplay = isFA
    ? toPersianDigits(rank)
    : getOrdinal(rank);
  
  const totalDisplay = isFA
    ? toPersianDigits(totalPlayers)
    : totalPlayers;

  const rankString = formatLog(t.rank_out_of, {
    rank: rankDisplay,
    total: totalDisplay,
  }, lang);

  return (
    <div className="flex flex-col gap-3 w-full font-mono">
      {/* STORYTELLER BADGE */}
      {isST && (
        <motion.div
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-blue-500/20 border border-blue-500/30 rounded-full py-0.5 px-3 self-start"
        >
          <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.3em]">
            ⚡ {t.storyteller}
          </span>
        </motion.div>
      )}

      <div className="flex justify-between items-end w-full">
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col"
        >
          <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 mb-2 font-black opacity-60">
            {t.dixit_score}
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tighter tabular-nums ${isLeader ? "text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]" : "text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"}`}>
              {isFA ? toPersianDigits(score) : score}
            </span>
            <span className="text-[10px] font-black text-zinc-600 tracking-widest">
              {t.shared_points}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col items-end"
        >
          <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 mb-2 font-black opacity-60">
            {t.rank}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded border ${isLeader ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-white bg-blue-500/10 border-blue-500/20"}`}>
            {rankString}
            {isLeader && <span className="ml-1">👑</span>}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
