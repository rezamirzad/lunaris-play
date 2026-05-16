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
 * Features: Node-link SVG animations and real-time sync telemetry.
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
      { id: "en", label: "EN_PROT" },
      { id: "fr", label: "FR_PROT" },
      { id: "de", label: "DE_PROT" },
      { id: "fa", label: "FA_PROT" },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] text-center">
          LANGUAGE_SETTINGS
        </h3>
        <div className="flex gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl">
          {langs.map((l) => (
            <button
              key={l.id}
              onClick={() => setJustOneLang(l.id)}
              className={`flex-1 py-3 px-4 rounded-xl border-2 font-black text-xs tracking-widest transition-all cursor-pointer text-center ${
                justoneLang === l.id
                  ? "border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)] scale-105"
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 font-mono relative">
      {/* 🔮 CENTRAL HUB SVG LINKING (BOARD VIEW ONLY) */}
      {isBoardView && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            {/* Central Hub Glow */}
            <circle
              cx="600"
              cy="180"
              r="100"
              fill="url(#hubGradient)"
              opacity="0.3"
            />

            {/* Animated Node Links */}
            {players.map((_, i) => {
              // Map indices to horizontal grid positions
              const targetX = 150 + i * 300;
              const isSynced = players[i].isReady;

              return (
                <g key={i}>
                  <motion.path
                    d={`M600 180 C 600 300, ${targetX} 300, ${targetX} 450`}
                    stroke={isSynced ? "#2dd4bf" : "#27272a"}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                  {isSynced && (
                    <motion.circle r="3" fill="#2dd4bf">
                      <animateMotion
                        path={`M600 180 C 600 300, ${targetX} 300, ${targetX} 450`}
                        dur="3s"
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
                gradientTransform="translate(600 180) rotate(90) scale(150)"
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
        className="text-center space-y-6 relative z-10"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-20 bg-teal-400/20" />
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-teal-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(45,212,191,1)]" />
            <span className="text-[10px] tracking-[0.6em] text-teal-400 font-black">
              {t.lobbyInitiation}
            </span>
          </div>
          <div className="h-[1px] w-20 bg-teal-400/20" />
        </div>

        <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase text-white [text-shadow:0_0_30px_rgba(255,255,255,0.2)]">
          {localizedGameTitle || room.currentGame}
        </h2>

        <div className="flex items-center justify-center gap-8 pt-8">
          <div className="flex flex-col items-center group">
            <span className="text-[12px] mb-2 font-black tracking-widest group-hover:text-teal-400/50 transition-colors">
              {t.connectedPlayers}
            </span>
            <div className="bg-zinc-900/50 border border-white/5 px-4 py-1 rounded-lg">
              <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
                {isFA ? toPersianDigits(totalCount) : totalCount}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center group">
            <span className="text-[12px] mb-2 font-black tracking-widest group-hover:text-teal-400/50 transition-colors">
              {t.readyPlayers}
            </span>
            <div
              className={`bg-zinc-900/50 border px-4 py-1 rounded-lg transition-colors ${isAllReady ? "border-teal-400/30" : "border-white/5"}`}
            >
              <span
                className={`text-2xl font-black tabular-nums tracking-tighter ${isAllReady ? "text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.3)]" : "text-orange-500"}`}
              >
                {isFA ? toPersianDigits(readyCount) : readyCount} /{" "}
                {isFA ? toPersianDigits(totalCount) : totalCount}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 👤 PARTICIPANT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <PlayerCard
                name={player.name}
                isReady={player.isReady}
                isCurrentTurn={false}
                statusOverride={player.isReady ? t.ready : t.waiting}
                className={
                  player.isReady ? "border-teal-400/30" : "border-teal-400"
                }
              >
                <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: player.isReady ? "100%" : "10%" }}
                    className={`h-full transition-all duration-1000 ${player.isReady ? "bg-teal-400" : "bg-zinc-800"}`}
                  />
                </div>
              </PlayerCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ⌨️ COMMAND CONTROL */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-6 pt-12 relative z-10"
      >
        {isBoardView ? (
          <div className="space-y-8">
            {room.currentGame === "justone" && renderLanguageSelector()}

            <div className="space-y-4">
              <motion.button
                whileHover={
                  isAllReady
                    ? {
                        scale: 1.05,
                        boxShadow: "0 0 50px rgba(45,212,191,0.5)",
                      }
                    : {}
                }
                whileTap={isAllReady ? { scale: 0.95 } : {}}
                disabled={!isAllReady}
                onClick={handleStartGame}
                className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-2xl tracking-[0.3em] transition-all relative overflow-hidden group shadow-2xl ${
                  isAllReady
                    ? "bg-white text-black"
                    : "bg-zinc-950  border border-white/5 cursor-not-allowed"
                }`}
              >
                <div className="absolute inset-0 bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {isAllReady ? t.matchInitiation : t.waitingForPlayers}
                </span>
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: me?.isReady
                ? "none"
                : "0 0 40px rgba(255,255,255,0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleReady}
            className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-2xl tracking-[0.3em] transition-all border-2 ${
              me?.isReady
                ? "bg-teal-400/10 border-teal-400/40 text-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.2)]"
                : "bg-white text-black border-transparent"
            }`}
          >
            {me?.isReady ? t.notReady : t.ready}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
