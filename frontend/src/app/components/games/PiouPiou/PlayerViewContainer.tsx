"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import PlayerController from "../../shared/PlayerController";
import PlayerCard from "../../shared/PlayerCard";
import PiouPiouPlayerStats from "./PiouPiouPlayerStats";
import ComboHints from "./ComboHints";
import PiouPiouHandGrid from "./PiouPiouHandGrid";
import PiouPiouMatchActivity from "./MatchActivity";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import { PlayerProps, GAME_REGISTRY } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";

export default function PiouPiouPlayerView({ player, roomData }: PlayerProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const playAction = useMutation(api.pioupiou.handleAction);

  // Narrowing union: roomData.gameBoard
  const board =
    roomData.gameBoard.gameType === "pioupiou" ? roomData.gameBoard : null;
  const isGameFinished = roomData.status?.toUpperCase() === "FINISHED";
  const winnerName = board?.winner;
  const amIWinner = String(board?.winnerId || "") === String(player._id);

  // Narrowing union: player.state
  const playerState =
    player.state.gameType === "pioupiou" ? player.state : null;
  const isMatchpoint =
    !isGameFinished &&
    (playerState?.chicks || 0) === 2 &&
    (playerState?.eggs || 0) > 0;

  const pendingAttack = board?.pendingAttack;
  const isVictim = pendingAttack?.victimId === player._id;
  const isAttackActive = !!pendingAttack;

  const attackerId = pendingAttack?.attackerId;
  const attackerPlayer = roomData.players.find(
    (p) => String(p._id) === String(attackerId),
  );
  const attackerName = attackerPlayer?.name || "An Unknown Predator";

  const isMyTurn = useMemo(() => {
    if (isAttackActive) return isVictim;
    return (
      String(roomData.turnOrder?.[roomData.currentTurnIndex]) ===
      String(player._id)
    );
  }, [
    roomData.turnOrder,
    roomData.currentTurnIndex,
    player._id,
    isAttackActive,
    isVictim,
  ]);

  const protocol = useMemo(() => {
    const keys = selectedCards.map((k) => k.split("-")[0].toLowerCase());
    const counts = keys.reduce((acc: Record<string, number>, key: string) => {
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    if (keys.length === 1 && counts.fox === 1) return "STEAL_EGG";
    if (
      keys.length === 3 &&
      counts.chicken === 1 &&
      counts.rooster === 1 &&
      counts.nest === 1
    )
      return "LAY_EGG";
    if (keys.length === 2 && counts.chicken === 2) return "HATCH";
    if (keys.length === 1) return "DISCARD";

    return null;
  }, [selectedCards]);

  const handleProtocolExecution = async (forcedAction?: string) => {
    const isAttackInitiation = protocol === "STEAL_EGG" && !forcedAction;
    const actionType = forcedAction || (isAttackInitiation ? "ATTACK" : "PLAY");

    try {
      const indices = selectedCards.map((k) => parseInt(k.split("-")[1]));
      const cards = selectedCards.map((k) => k.split("-")[0].toUpperCase());

      await playAction({
        playerId: player._id,
        indices,
        cards,
        actionType,
        targetPlayerId: isAttackInitiation ? (targetId as Doc<"players">["_id"]) : undefined,
      });

      setSelectedCards([]);
      setTargetId(null);
    } catch (error) {
      console.error("[LUMZ_CRITICAL]: Protocol Execution Failed", error);
    }
  };

  const isTargetRequired = protocol === "STEAL_EGG";
  const canExecute =
    isMyTurn && protocol && (!isTargetRequired || targetId) && !isGameFinished;
  const otherPlayers = roomData.players.filter(
    (p) => String(p._id) !== String(player._id),
  );

  const roosterCount = useMemo(() => {
    return (
      player.gameHand?.filter(
        (card: string) => card.toUpperCase() === "ROOSTER",
      ).length || 0
    );
  }, [player.gameHand]);

  const canDefend = roosterCount >= 2;

  return (
    <div className="relative min-h-[calc(100vh-180px)] bg-zinc-950/50 rounded-[3rem] overflow-hidden flex flex-col font-mono">
      {/* 🏆 WINNER OVERLAY */}
      <AnimatePresence>
        {isGameFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-zinc-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative bg-zinc-900 rounded-full p-8 border border-teal-400/20 shadow-[0_0_50px_rgba(45,212,191,0.15)]"
            >
              <span className="text-6xl">🏆</span>
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-6xl font-black italic text-white uppercase tracking-tighter"
            >
              {amIWinner ? t.victory : t.gameOver}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-zinc-500 uppercase tracking-[0.4em] text-xs"
            >
              {winnerName} {t.victory.toLowerCase()}
            </motion.p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = `/`)}
              className="mt-12 px-12 py-4 bg-white text-black font-black uppercase rounded-2xl hover:bg-teal-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {t.exit}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🦊 VICTIM DEFENSE OVERLAY */}
      <AnimatePresence>
        {isVictim && !isGameFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8">
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="space-y-2"
              >
                <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-none">
                  {t.attack}
                </h2>
                <p className="text-red-400 uppercase tracking-[0.3em] text-[10px]">
                  {attackerName} {t.attack.toLowerCase()}
                </p>
              </motion.div>

              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <motion.button
                    whileHover={canDefend ? { scale: 1.02 } : {}}
                    whileTap={canDefend ? { scale: 0.98 } : {}}
                    disabled={!canDefend}
                    onClick={() => handleProtocolExecution("DEFEND")}
                    className={`w-full py-5 font-black uppercase rounded-2xl transition-all text-lg tracking-widest ${
                      canDefend
                        ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        : "bg-zinc-900 text-zinc-700 border border-white/5 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {t.defend}
                  </motion.button>
                  {!canDefend && (
                    <p className="text-[10px] text-orange-500 uppercase tracking-[0.2em] animate-pulse">
                      {t.noRoosters}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProtocolExecution("ACCEPT")}
                  className="w-full py-5 border-2 border-white/20 text-white font-black uppercase rounded-2xl text-lg tracking-widest"
                >
                  {t.accept}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isMyTurn && !isGameFinished}
        className="flex-grow"
        history={board?.history || []}
        renderLog={(log) => <PiouPiouMatchActivity log={log} />}
        statsSlot={
          <div className="flex flex-col gap-6 w-full lg:w-80">
            {/* PLAYER HUD */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">
                {GAME_REGISTRY.pioupiou.visuals.emoji}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${isMyTurn ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-pulse" : "bg-zinc-700"}`}
                />
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">
                  {isMyTurn ? t.yourTurn : t.waiting}
                </span>
              </div>

              <div className="mt-4 text-3xl font-black text-white italic tracking-tighter uppercase truncate">
                {player.name}
              </div>

              <div className="mt-6 border-t border-white/5 pt-6">
                <PiouPiouPlayerStats state={playerState} />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden"
            >
              <ComboHints
                hand={player.gameHand || []}
                eggs={playerState?.eggs || 0}
                otherPlayers={otherPlayers}
                lang={lang}
              />
            </motion.div>

            {/* TARGET SELECTION */}
            <AnimatePresence>
              {isTargetRequired && isMyTurn && !isAttackActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2 p-3 bg-zinc-900/50 border border-white/5 rounded-2xl overflow-x-auto no-scrollbar"
                >
                  {otherPlayers.map((opp) => {
                    const oppState =
                      opp.state.gameType === "pioupiou" ? opp.state : null;
                    const eggCount = oppState?.eggs || 0;
                    const hasEggs = eggCount > 0;
                    return (
                      <motion.button
                        key={opp._id}
                        whileHover={hasEggs ? { scale: 1.05 } : {}}
                        whileTap={hasEggs ? { scale: 0.95 } : {}}
                        disabled={!hasEggs}
                        onClick={() => setTargetId(String(opp._id))}
                        className={`flex-shrink-0 py-3 px-4 rounded-xl text-[10px] uppercase font-black border transition-all ${
                          targetId === String(opp._id)
                            ? "border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                            : hasEggs
                              ? "border-white/10 text-zinc-400 bg-black/20"
                              : "border-white/5 text-zinc-700 bg-transparent opacity-30"
                        }`}
                      >
                        {opp.name}{" "}
                        <span className="ml-1">
                          🥚{isFA ? toPersianDigits(eggCount) : eggCount}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTION STACK */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <motion.button
                whileHover={
                  canExecute
                    ? {
                        scale: 1.02,
                        boxShadow: "0 0 30px rgba(45,212,191,0.2)",
                      }
                    : {}
                }
                whileTap={canExecute ? { scale: 0.98 } : {}}
                disabled={!canExecute}
                onClick={() => handleProtocolExecution()}
                className={`w-full py-5 rounded-2xl border-2 text-xs uppercase font-black tracking-[0.2em] transition-all ${
                  canExecute
                    ? "border-teal-400 bg-teal-400/10 text-teal-400"
                    : "opacity-20 border-white/5 text-zinc-600"
                }`}
              >
                {isTargetRequired && !targetId
                  ? "SELECT_TARGET"
                  : protocol
                    ? protocol.replace("_", " ")
                    : "WAITING_FOR_SEQUENCE"}
              </motion.button>

              {protocol === "STEAL_EGG" && isMyTurn && (
                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  onClick={() => handleProtocolExecution("PLAY")}
                  className="w-full py-3 bg-transparent text-zinc-500 text-[10px] uppercase font-bold rounded-xl border border-white/5 tracking-widest"
                >
                  {t.discard} {t.fox}
                </motion.button>
              )}
            </motion.div>
          </div>
        }
        actionsSlot={
          <div className="flex-grow flex items-center justify-center min-h-[400px]">
            <PiouPiouHandGrid
              hand={player.gameHand || []}
              isMyTurn={isMyTurn && !isGameFinished}
              selectedCards={selectedCards}
              onCardSelect={(key) =>
                !isGameFinished &&
                isMyTurn &&
                setSelectedCards((prev) =>
                  prev.includes(key)
                    ? prev.filter((k) => k !== key)
                    : [...prev, key],
                )
              }
            />
          </div>
        }
      />
    </div>
  );
}
