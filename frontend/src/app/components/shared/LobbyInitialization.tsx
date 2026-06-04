"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import PlayerCard from "./PlayerCard";
import { useState, useEffect } from "react";
import { useAdmin } from "../../admin/AdminGateway";
import { QRCodeSVG } from "qrcode.react";

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
  const { isAdmin, adminPassword } = useAdmin();

  const toggleReady = useMutation(api.engine.toggleReady);
  const startGame = useMutation(api.engine.startGame);
  const addBot = useMutation(api.engine.addBot);
  const removePlayer = useMutation(api.engine.removePlayer);
  const startJustOneMatch = useMutation(api.justone.startJustOneMatch);
  const dixitAction = useMutation(api.dixit.handleAction);

  const [justoneLang, setJustOneLang] = useState<"en" | "fr" | "de" | "fa">(
    "en",
  );

  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.origin);
      url.searchParams.set("join", room.roomCode);
      setJoinUrl(url.toString());
    }
  }, [room.roomCode]);

  const readyCount = players.filter((p) => p.isReady).length;
  const totalCount = players.length;
  const isAllReady = readyCount === totalCount && totalCount >= 2;

  const handleToggleReady = async () => {
    if (me) {
      await toggleReady({ playerId: me._id });
    }
  };

  const handleStartGame = async () => {
    if (!isAdmin || !adminPassword) return;
    if (room.currentGame === "justone") {
      await startJustOneMatch({
        roomId: room._id,
        language: justoneLang,
        adminPassword,
      });
    } else {
      await startGame({ roomId: room._id, adminPassword });
    }
  };

  const handleAddBot = async () => {
    if (!isAdmin || !adminPassword) return;
    try {
      await addBot({ roomCode: room.roomCode, adminPassword });
    } catch (e) {
      console.error("Add bot failed", e);
    }
  };

  const handleKick = async (playerId: string) => {
    if (!isAdmin || !adminPassword) return;
    try {
      await removePlayer({ playerId: playerId as any, adminPassword });
    } catch (e) {
      console.error("Kick failed", e);
    }
  };

  const handleToggleRuleset = async () => {
    if (!isAdmin || room.currentGame !== "dixit" || !me) return;
    const currentRuleset = (room.gameBoard as any).ruleset || (players.length > 6 ? "ODYSSEY" : "CLASSIC");
    const nextRuleset = currentRuleset === "CLASSIC" ? "ODYSSEY" : "CLASSIC";
    
    try {
      await dixitAction({
        playerId: me._id,
        actionType: "SET_RULESET",
        ruleset: nextRuleset,
        adminPin: adminPassword,
      });
    } catch (e) {
      console.error("Ruleset toggle failed", e);
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
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {langs.map((l) => (
          <button
            key={l.id}
            onClick={() => setJustOneLang(l.id)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${justoneLang === l.id ? "bg-white text-black shadow-lg" : "bg-white/5 text-zinc-500 hover:bg-white/10"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  };

  const dixitRuleset = (room.gameBoard as any).ruleset || (players.length > 6 ? "ODYSSEY" : "CLASSIC");

  return (
    <div className="flex flex-col items-center gap-12 w-full transition-all duration-300">
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

        {/* ⚙️ RULESET TOGGLE (DIXIT ONLY) */}
        {isAdmin && room.currentGame === "dixit" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-col items-center gap-2">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Active Ruleset</span>
            <button 
                onClick={handleToggleRuleset}
                className="group flex items-center gap-4 bg-black/40 border border-white/10 px-6 py-2 rounded-2xl hover:border-blue-500/50 transition-all"
            >
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${dixitRuleset !== 'ODYSSEY' ? 'text-blue-400' : 'text-zinc-600'}`}>Classic (3-6)</span>
                <div className="w-10 h-5 bg-zinc-800 rounded-full p-1 relative">
                    <motion.div 
                        animate={{ x: dixitRuleset === 'ODYSSEY' ? 20 : 0 }}
                        className="w-3 h-3 bg-white rounded-full shadow-lg"
                    />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${dixitRuleset === 'ODYSSEY' ? 'text-blue-400' : 'text-zinc-600'}`}>Odyssey (7-12)</span>
            </button>
          </motion.div>
        )}

        {isBoardView && joinUrl && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-6 pt-8"
          >
            {/* 💎 PROMINENT ROOM CODE */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-1">
                Room Access Link
              </span>
              <div className="bg-white/5 border border-white/10 px-12 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl group hover:border-teal-400/50 transition-all">
                <h3 className="text-7xl font-black tracking-[0.2em] text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:text-teal-400 transition-colors">
                  {room.roomCode}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] group hover:scale-105 transition-transform duration-500">
              <QRCodeSVG
                value={joinUrl}
                size={260}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[18px] font-black tracking-[0.2em] text-teal-400 uppercase animate-pulse">
                {t.step2}
              </span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                {joinUrl}
              </span>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-[4vw] pt-[2vh]">
          <div className="flex flex-col items-center group">
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-xs md:text-sm mb-1.5 font-black tracking-widest text-zinc-500 group-hover:text-teal-400/50 transition-colors ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.connectedPlayers}
            </span>
            <div className="bg-zinc-900/50 border border-white/5 px-4 py-1 rounded-xl flex items-center gap-3">
              <span className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                {isFA ? toPersianDigits(totalCount) : totalCount}
              </span>
              {isAdmin && (
                <button
                  onClick={handleAddBot}
                  className="p-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-400 text-[10px] font-black uppercase transition-all"
                >
                  + BOT
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center group">
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-xs md:text-sm mb-1.5 font-black tracking-widest text-zinc-500 group-hover:text-teal-400/50 transition-colors ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.readyPlayers}
            </span>
            <div className="bg-zinc-900/50 border border-white/5 px-4 py-1 rounded-xl">
              <span className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                {isFA ? toPersianDigits(readyCount) : readyCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pt-4">
          {room.currentGame === "justone" && isAdmin && renderLanguageSelector()}

          {isBoardView ? (
            <motion.button
              disabled={!isAllReady || !isAdmin}
              whileHover={isAllReady && isAdmin ? { scale: 1.05 } : {}}
              whileTap={isAllReady && isAdmin ? { scale: 0.95 } : {}}
              onClick={handleStartGame}
              className={`px-12 py-4 rounded-[2rem] font-black uppercase text-lg tracking-[0.3em] transition-all ${isAllReady && isAdmin ? "bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:bg-teal-400 hover:text-white" : "bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed"}`}
            >
              {t.matchInitiation}
            </motion.button>
          ) : me && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleReady}
              className={`px-12 py-5 rounded-[2rem] font-black uppercase text-lg tracking-[0.3em] transition-all shadow-2xl ${
                me.isReady 
                  ? "bg-teal-500 text-white shadow-[0_0_40px_rgba(45,212,191,0.3)]" 
                  : "bg-white text-black hover:bg-teal-400 hover:text-white"
              }`}
            >
              {me.isReady ? t.ready : "Mark Ready"}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* 👤 PARTICIPANT GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl relative z-10">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
            >
              <PlayerCard
                name={player.name}
                isReady={player.isReady}
                isCurrentTurn={false}
                statusOverride={
                  player.isBot
                    ? "BOT 🤖"
                    : player.isReady
                      ? t.ready
                      : t.waiting
                }
                className={
                  player.isReady
                    ? "border-teal-400/30 bg-teal-500/[0.02]"
                    : "border-zinc-800 bg-zinc-950/40"
                }
              >
                <div className="flex items-center justify-between mt-3">
                  <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden relative mr-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: player.isReady ? "100%" : "0%" }}
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ${player.isReady ? "bg-teal-400" : "bg-zinc-800"}`}
                    />
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleKick(player._id)}
                      className="p-1 hover:bg-rose-500/20 text-rose-500 rounded transition-colors"
                      title="Kick Player"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </PlayerCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
