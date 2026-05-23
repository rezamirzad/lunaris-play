"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import PlayerCard from "./PlayerCard";
import { useState } from "react";

interface LobbyInitializationProps {
  room: Doc<"rooms">;
  players: Doc<"players">[];
  me?: Doc<"players">;
  isBoardView?: boolean;
  localizedGameTitle?: string;
}

/**
 * LobbyInitialization: Ultra-premium 'Top Class' boot-up sequence.
 * Features: Node-link SVG animations and real-time fluid scaling telemetry.
 */
export default function LobbyInitialization({
  room,
  players,
  me,
  isBoardView = false,
  localizedGameTitle,
}: LobbyInitializationProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const toggleReady = useMutation(api.engine.toggleReady);
  const startGame = useMutation(api.engine.startGame);
  const startJustOneMatch = useMutation(api.justone.startJustOneMatch);

  const [justoneLang, setJustOneLang] = useState<"en" | "fr" | "de" | "fa">(
    "en",
  );

  const readyCount = players.filter((p) => p.isReady).length;
  const totalCount = players.length;
  const isAllReady = readyCount === totalCount && totalCount >= 2;

  const handleToggleReady = async () => {
    if (me) {
      await toggleReady({ playerId: me._id });
    }
  };

  const handleStartGame = async () => {
    if (room.currentGame === "justone") {
      await startJustOneMatch({ roomId: room._id, language: justoneLang });
    } else {
      await startGame({ roomId: room._id });
    }
  };

  const renderLanguageSelector = () => {
    const langs: { id: "en" | "fr" | "de" | "fa"; label: string }[] = [
      { id: "en", label: "English" },
      { id: "fr", label: "Français" },
      { id: "de", label: "Deutsch" },
      { id: "fa", label: "Farsi" },
    ];

    return (
      <div className="space-y-[1.5vh]">
        <h3 className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-[0.4em] text-center">
          {t.shared_language}
        </h3>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-2xl">
          {langs.map((l) => (
            <button
              key={l.id}
              onClick={() => setJustOneLang(l.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-black text-xs transition-all cursor-pointer text-center whitespace-nowrap ${
                justoneLang === l.id
                  ? "border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)] scale-102"
                  : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-500"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-7xl mx-auto px-4 py-[4vh] space-y-[6vh] font-mono relative overflow-hidden transition-all duration-300">
      {/* 🔮 CENTRAL HUB SVG LINKING (BOARD VIEW ONLY - Responsive Layout Mapping) */}
      {isBoardView && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
          <svg
            className="w-full h-full min-h-[500px]"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle
              cx="600"
              cy="180"
              r="120"
              fill="url(#hubGradient)"
              opacity="0.3"
            />
            {players.map((_, i) => {
              const targetX =
                150 + i * (900 / Math.max(1, players.length - 1 || 1));
              const isSynced = players[i].isReady;

              return (
                <g key={i}>
                  <motion.path
                    d={`M600 180 C 600 320, ${targetX} 320, ${targetX} 550`}
                    stroke={isSynced ? "#2dd4bf" : "#27272a"}
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: i * 0.08 }}
                  />
                  {isSynced && (
                    <motion.circle r="4" fill="#2dd4bf">
                      <animateMotion
                        path={`M600 180 C 600 320, ${targetX} 320, ${targetX} 550`}
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  )}
                </g>
              );
            })}

            <defs>
              <radialGradient
                id="hubGradient"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(600 180) rotate(90) scale(180)"
              >
                <stop stopColor="#2dd4bf" />
                <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 📡 TERMINAL DEPLOYMENT HEADER */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-[2vh] relative z-10 w-full"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 md:w-20 bg-teal-400/20" />
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 bg-teal-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(45,212,191,1)]" />
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-[10px] sm:text-xs tracking-[0.4em] text-teal-400 font-black uppercase ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.lobbyInitiation}
            </span>
          </div>
          <div className="h-[1px] w-12 md:w-20 bg-teal-400/20" />
        </div>

        <h2 className="text-4xl md:text-6xl lg:text-[4.5vw] font-black italic tracking-tighter uppercase text-white leading-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          {localizedGameTitle || room.currentGame}
        </h2>

        <div className="flex items-center justify-center gap-[4vw] pt-[2vh]">
          <div className="flex flex-col items-center group">
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-xs md:text-sm mb-1.5 font-black tracking-widest text-zinc-500 group-hover:text-teal-400/50 transition-colors ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.connectedPlayers}
            </span>
            <div className="bg-zinc-900/50 border border-white/5 px-4 py-1 rounded-xl">
              <span className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                {isFA ? toPersianDigits(totalCount) : totalCount}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center group">
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-xs md:text-sm mb-1.5 font-black tracking-widest text-zinc-500 group-hover:text-teal-400/50 transition-colors ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.readyPlayers}
            </span>
            <div
              className={`bg-zinc-900/50 border px-4 py-1 rounded-xl transition-colors ${isAllReady ? "border-teal-400/30 shadow-[0_0_15px_rgba(45,212,191,0.1)]" : "border-white/5"}`}
            >
              <span
                className={`text-xl md:text-3xl font-black tabular-nums tracking-tighter ${isAllReady ? "text-teal-400" : "text-orange-500"}`}
              >
                {isFA ? toPersianDigits(readyCount) : readyCount} /{" "}
                {isFA ? toPersianDigits(totalCount) : totalCount}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 👤 PARTICIPANT GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl relative z-10">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
            >
              <PlayerCard
                name={player.name}
                isReady={player.isReady}
                isCurrentTurn={false}
                statusOverride={player.isReady ? t.ready : t.waiting}
                className={
                  player.isReady
                    ? "border-teal-400/30 bg-teal-500/[0.02]"
                    : "border-zinc-800 bg-zinc-950/40"
                }
              >
                <div className="w-full h-1 bg-zinc-900 rounded-full mt-3 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: player.isReady ? "100%" : "0%" }}
                    className={`absolute inset-y-0 left-0 transition-all duration-700 ${player.isReady ? "bg-teal-400" : "bg-zinc-800"}`}
                  />
                </div>
              </PlayerCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ⌨️ COMMAND CONTROL PANEL */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md sm:max-w-lg space-y-4 md:space-y-6 pt-4 relative z-10"
      >
        {isBoardView ? (
          <div className="space-y-[3vh] w-full">
            {room.currentGame === "justone" && renderLanguageSelector()}

            <div className="w-full">
              <motion.button
                whileHover={
                  isAllReady
                    ? {
                        scale: 1.02,
                        boxShadow: "0 0 40px rgba(45,212,191,0.3)",
                      }
                    : {}
                }
                whileTap={isAllReady ? { scale: 0.98 } : {}}
                disabled={!isAllReady}
                onClick={handleStartGame}
                className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase text-lg md:text-xl transition-all relative overflow-hidden group shadow-xl ${
                  isAllReady
                    ? "bg-white text-black cursor-pointer"
                    : "bg-zinc-950 text-zinc-600 border border-white/5 cursor-not-allowed"
                } ${isFA ? "fa-text-fix" : "tracking-[0.2em]"}`}
              >
                <div className="absolute inset-0 bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span
                  dir={isFA ? "rtl" : "ltr"}
                  className="relative z-10 group-hover:text-white transition-colors duration-300"
                >
                  {isAllReady ? t.matchInitiation : t.waitingForPlayers}
                </span>
              </motion.button>
            </div>
          </div>
        ) : (
          /* UX FIX: Button acts as an explicit instruction block to resolve state paradox */
          <div className="flex flex-col items-center gap-3 w-full">
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: me?.isReady
                  ? "0 0 30px rgba(239,68,68,0.15)"
                  : "0 0 30px rgba(45,212,191,0.25)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleReady}
              className={`w-full py-5 md:py-6 rounded-2xl font-black uppercase text-lg md:text-xl transition-all border-2 cursor-pointer shadow-lg ${
                me?.isReady
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  : "bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent hover:brightness-110"
              } ${isFA ? "fa-text-fix" : "tracking-[0.2em]"}`}
            >
              <span dir={isFA ? "rtl" : "ltr"}>
                {me?.isReady ? "Change to Not Ready ❌" : "Tap to Set Ready 👍"}
              </span>
            </motion.button>

            {/* Status Display badge helping confirm current state instantly */}
            <div
              className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${me?.isReady ? "bg-teal-500/10 border-teal-500/20 text-teal-400 animate-pulse" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}
            >
              Current Status: {me?.isReady ? t.ready : t.waiting}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
