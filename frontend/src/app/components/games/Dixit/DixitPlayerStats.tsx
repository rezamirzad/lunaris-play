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
  persona,
  maturity,
  isGameEnd = false,
}: {
  state?: { score?: number } | null;
  rank: number;
  totalPlayers: number;
  isST: boolean;
  isBot?: boolean;
  persona?: string;
  maturity?: "CHILD" | "ADULT" | string;
  isGameEnd?: boolean;
}) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const isLeader = rank === 1;

  const score = state?.score ?? 0;

  const rankDisplay = isFA ? toPersianDigits(rank) : getOrdinal(rank);
  const totalDisplay = isFA ? toPersianDigits(totalPlayers) : totalPlayers;

  const rankString = formatLog(t.rank_out_of, {
    rank: rankDisplay,
    total: totalDisplay,
  });

  const getPersonaLabel = (p?: string) => {
    switch (p) {
      case "aggressive":
      case "wild":
        return { name: "The Mad Hatter", icon: "🎩", style: "bg-purple-950/80 text-purple-300 border-purple-500/40" };
      case "cautious":
        return { name: "The Wise Owl", icon: "🦉", style: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40" };
      case "intuitive":
        return { name: "The Mystic", icon: "🔮", style: "bg-indigo-950/80 text-indigo-300 border-indigo-500/40" };
      default:
        return { name: "The Dreamer", icon: "✨", style: "bg-amber-950/80 text-amber-300 border-amber-500/40" };
    }
  };

  const personaInfo = getPersonaLabel(persona);
  const ageLabel = maturity === "CHILD" ? "👶 Age 7–12" : "👤 Age 18+";

  return (
    <div className="flex flex-col gap-2 w-full font-mono relative">
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

      {/* Bot Persona & Age Range Badge */}
      {isBot && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-sm ${personaInfo.style}`}>
            <span>{personaInfo.icon}</span>
            <span>{personaInfo.name}</span>
          </span>
          <span className={`text-[9px] font-mono font-bold border px-2 py-0.5 rounded-md shadow-sm ${
            maturity === "CHILD" 
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
              : "bg-blue-500/20 text-blue-300 border-blue-500/40"
          }`}>
            {ageLabel}
          </span>
        </div>
      )}
    </div>
  );
}
