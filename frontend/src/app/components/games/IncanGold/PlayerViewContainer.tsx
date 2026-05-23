"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog } from "@/lib/translations";
import { useRouter } from "next/navigation";

const PlayerViewContainer: React.FC<PlayerProps> = ({ player, roomData }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const incanApi = (api as any).incangold;
  const submitDecision = useMutation(incanApi.submitDecision);

  const [pendingDecision, setPendingDecision] = React.useState(false);

  const board = roomData.gameBoard;
  const myState = player.state;
  const hasDecided = (board as any).decisions?.[player._id];

  React.useEffect(() => {
    if (hasDecided) {
      setPendingDecision(false);
    }
  }, [hasDecided]);

  if (board.gameType !== "incangold") return null;
  if (myState.gameType !== "incangold") return null;

  const handleDecision = async (decision: "STAY" | "LEAVE") => {
    if (pendingDecision) return;
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setPendingDecision(true);
    try {
      await submitDecision({ playerId: player._id, decision });
    } catch (err) {
      console.error("Failed to submit decision:", err);
      setPendingDecision(false);
    }
  };

  const isInTemple = myState.status === "IN_TEMPLE";
  const isDecisionPhase = board.phase === "DECISION_PHASE";
  const totalPathGems = Object.values(
    (board.cardGems as Record<string, number>) || {},
  ).reduce((a, b) => a + b, 0);

  if (board.phase === "FINAL_LEADERBOARD") {
    const players = roomData.players;
    const sortedPlayers = [...players].sort((a, b) => {
      const scoreA = (a.state as any).bankedScore || 0;
      const scoreB = (b.state as any).bankedScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return (
        ((b.state as any).artifacts || 0) - ((a.state as any).artifacts || 0)
      );
    });

    return (
      <div className="w-full min-h-[400px] max-w-xl md:max-w-2xl mx-auto bg-[#0a0500] text-amber-50 flex flex-col p-4 md:p-6 select-none font-serif relative rounded-2xl border border-white/5 shadow-2xl overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

        <header className="text-center border-b border-white/5 pb-3">
          <h2 className="text-xl md:text-2xl font-black text-amber-400 tracking-tighter uppercase italic leading-none">
            {t.incangold_hall_of_riches}
          </h2>
          <p className="text-[9px] md:text-xs text-amber-500/40 font-bold uppercase tracking-widest mt-1">
            {t.incangold_final_stats}
          </p>
        </header>

        <div className="flex-1 bg-white/5 rounded-xl border border-amber-900/20 p-3 overflow-y-auto my-3 max-h-64 custom-scrollbar backdrop-blur-sm shadow-2xl">
          <table className="w-full text-xs md:text-sm uppercase font-black tracking-tighter border-separate border-spacing-y-1.5">
            <thead>
              <tr className="text-amber-500/40 text-[10px] md:text-xs">
                <th className="text-left py-0.5 italic opacity-60">
                  {t.incangold_rank}
                </th>
                <th className="text-left py-0.5 italic opacity-60">
                  {t.incangold_adventurer}
                </th>
                <th className="text-right py-0.5 italic opacity-60">
                  {t.incangold_total_wealth}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((p, idx) => (
                <tr
                  key={p._id}
                  className={`${p._id === player._id ? "bg-amber-500/20 ring-1 ring-amber-500/40" : "bg-white/5"} rounded-md overflow-hidden`}
                >
                  <td className="py-2 px-3 text-amber-400/80 font-serif">
                    #{idx + 1}
                  </td>
                  <td className="py-2 px-3 text-slate-200">
                    <div className="flex items-center gap-1.5">
                      {idx === 0 && (
                        <span className="text-xs md:text-sm">👑</span>
                      )}
                      <span className="truncate max-w-[120px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-black">
                    {(p.state as any).bankedScore} 💎
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-gradient-to-b from-amber-500 to-amber-700 text-amber-950 py-3.5 md:py-4 rounded-xl font-black text-sm md:text-base shadow-xl active:translate-y-1 transition-all border-t border-amber-100/50 uppercase italic"
        >
          {t.incangold_back_to_arcade}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[480px] max-w-md mx-auto bg-[#0a0500] text-white flex flex-col justify-between p-3.5 select-none font-serif relative rounded-3xl border border-white/5 shadow-2xl overflow-hidden transition-all duration-300">
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

      {/* 1. Header Row */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2.5 z-10 relative">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-widest leading-none">
            {t.incangold_title}
          </span>
          <span className="text-[9px] md:text-[10px] font-medium text-slate-400 mt-1.5 uppercase tracking-tighter">
            {formatLog(t.incangold_round, { round: board.currentRound })} / 5
          </span>
        </div>

        <div className="bg-white/5 px-2.5 py-1 rounded-full border border-white/10 text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-inner">
          {board.phase === "DECISION_PHASE"
            ? "⚡ " + t.incangold_decide
            : "✨ Expedition Active"}
        </div>
      </div>

      {/* 2. Central Context Panel */}
      <div className="my-3 py-4 md:py-6 px-4 bg-gradient-to-b from-white/[0.04] to-transparent rounded-2xl border border-white/[0.03] flex flex-col items-center justify-center text-center z-10 relative shadow-2xl">
        <AnimatePresence mode="wait">
          {!isInTemple ? (
            <motion.div
              key="at-camp"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-4xl md:text-5xl mb-2.5 filter drop-shadow-lg">
                ⛺
              </span>
              <h2 className="text-base md:text-lg font-black text-slate-400 tracking-tighter uppercase italic leading-none">
                {board.phase === "ROUND_RESULTS"
                  ? t.incangold_expedition_result
                  : t.incangold_resting_camp}
              </h2>
              <p className="text-slate-600 mt-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic text-center opacity-70">
                {t.incangold_safe_reach}
              </p>
            </motion.div>
          ) : hasDecided ? (
            <motion.div
              key="decided"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-3xl text-emerald-400">✓</span>
              </div>
              <h2 className="text-base md:text-lg font-black text-emerald-400 tracking-tighter uppercase italic leading-none">
                {t.incangold_locked}
              </h2>
              <p className="text-amber-500/40 text-[8px] font-black uppercase tracking-[0.3em] animate-pulse italic mt-2">
                {t.incangold_waiting_reveal}
              </p>
            </motion.div>
          ) : isDecisionPhase ? (
            <motion.div
              key="deciding"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">
                {t.incangold_the_dilemma}
              </span>
              <div className="text-sm font-bold bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 text-amber-400 flex items-center gap-2 shadow-inner">
                <span className="text-lg">🏺</span>
                <span className="uppercase text-[10px] md:text-xs tracking-tighter font-black">
                  {formatLog(t.incangold_on_path_bonus, { n: totalPathGems })}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="animate-spin-slow mb-3">
                <span className="text-4xl md:text-5xl filter drop-shadow-2xl">
                  🏺
                </span>
              </div>
              <h2 className="text-base md:text-lg font-black text-amber-500/80 tracking-tighter uppercase italic leading-none text-center">
                {t.incangold_exploring}
              </h2>
              <p className="text-amber-50/20 text-[8px] font-black uppercase tracking-[0.4em] italic mt-3 animate-pulse">
                {t.timeattack_eyes_on_phone}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Player Stats Panel */}
      <div className="flex flex-col gap-2.5 mb-5 z-10 relative">
        <div
          className={`flex justify-between items-center bg-black/50 px-4 py-3 rounded-2xl border border-white/5 shadow-lg transition-all duration-500 ${isInTemple ? "opacity-100 ring-1 ring-amber-500/10" : "opacity-40"}`}
        >
          <span className="text-[10px] font-black text-amber-500/60 uppercase italic tracking-widest">
            {t.incangold_in_hand}
          </span>
          <div className="flex items-center gap-2 leading-none">
            <span className="text-xl md:text-2xl font-black tabular-nums text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              {myState.gemsThisRound}
            </span>
            <span className="text-lg">💎</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-black/50 px-4 py-3 rounded-2xl border border-white/5 shadow-lg ring-1 ring-emerald-500/10">
          <div className="flex items-center gap-2 leading-none">
            <span className="text-[10px] font-black text-emerald-500/60 uppercase italic tracking-widest">
              {t.incangold_chest_total}
            </span>
          </div>

          <div className="flex items-center gap-2 leading-none">
            {myState.artifacts > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shadow-inner">
                <span className="text-xs">🏺</span>
                <span className="text-[11px] font-black text-amber-500 tabular-nums">
                  {myState.artifacts}
                </span>
              </div>
            )}
            <span className="text-xl md:text-2xl font-black tabular-nums text-emerald-400 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              {myState.bankedScore}
            </span>
            <span className="text-lg">⛺</span>
          </div>
        </div>
      </div>

      {/* 4. Actions / Footer */}
      <div className="z-20 w-full mb-1">
        {isDecisionPhase && isInTemple && !hasDecided ? (
          <div className="grid grid-cols-2 gap-3 w-full pb-1">
            <button
              onClick={() => handleDecision("STAY")}
              disabled={pendingDecision}
              className="w-full py-4.5 md:py-5 bg-gradient-to-b from-emerald-500 to-emerald-800 active:scale-95 disabled:opacity-50 text-white font-black rounded-2xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all text-sm uppercase tracking-[0.2em] italic border-t border-emerald-300/30"
            >
              {t.incangold_stay} 🤠
            </button>
            <button
              onClick={() => handleDecision("LEAVE")}
              disabled={pendingDecision}
              className="w-full py-4.5 md:py-5 bg-gradient-to-b from-rose-500 to-rose-700 active:scale-95 disabled:opacity-50 text-white font-black rounded-2xl shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-all text-sm uppercase tracking-[0.2em] italic border-t border-rose-300/30"
            >
              {t.incangold_leave} 🏃‍♂️
            </button>
          </div>
        ) : (
          <div className="pt-3.5 border-t border-white/5 flex justify-between items-center px-1 opacity-60">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic truncate max-w-[120px]">
              {player.name}
            </span>
            <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isInTemple ? "bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-slate-700"}`}
              />
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] italic leading-none">
                {formatLog(t.incangold_cave_n, { n: board.currentRound })}
              </span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;700;900&display=swap");
        .font-serif {
          font-family: "Cinzel", serif;
        }
        h1,
        h2,
        h3,
        h4,
        button {
          font-family: "Cinzel Decorative", cursive;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PlayerViewContainer;
