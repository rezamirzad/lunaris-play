"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog } from "@/lib/translations";
import { motion } from "framer-motion";
import { getOrdinal } from "@/lib/utils";
import StorytellerBadge from "./StorytellerBadge";

export default function DixitPlayerStats({
  state,
  rank,
  totalPlayers,
  isST,
  isBot = false,
  isGameEnd = false,
}: {
  state?: { score?: number } | null;
  rank: number;
  totalPlayers: number;
  isST: boolean;
  isBot?: boolean;
  isGameEnd?: boolean;
}) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const isLeader = rank === 1;

  const score = state?.score ?? 0;

  const rankDisplay = isFA ? toPersianDigits(rank) : getOrdinal(rank);

  const totalDisplay = isFA ? toPersianDigits(totalPlayers) : totalPlayers;

  const rankString = formatLog(
    t.rank_out_of,
    {
      rank: rankDisplay,
      total: totalDisplay,
    }
  );

  return (
    <div className="flex flex-col gap-3 w-full font-mono relative">
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
            <span
              className={`text-3xl font-black tracking-tighter tabular-nums ${isLeader ? "text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]" : "text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"}`}
            >
              {isFA ? toPersianDigits(score) : score}
            </span>
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-zinc-600 tracking-widest">
                {t.shared_points}
                </span>
                {isBot && (
                    <Image 
                        src="/assets/general/artificial-intelligence-design-png.webp" 
                        alt="AI" 
                        width={14}
                        height={14}
                        className="opacity-80" 
                    />
                )}
            </div>
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
          <span
            dir={isFA ? "rtl" : "ltr"}
            className={`text-[10px] font-black uppercase ${isFA ? "" : "tracking-[0.1em]"} px-2 py-1 rounded border ${isLeader ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-white bg-blue-500/10 border-blue-500/20"}`}
          >
            {rankString}
            {isLeader && <span className={isFA ? "mr-1" : "ml-1"}>👑</span>}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
