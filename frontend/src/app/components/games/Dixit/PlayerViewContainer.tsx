"use client";

import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import PlayerController from "../../shared/PlayerController";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog } from "@/lib/translations";
import MatchActivity from "./MatchActivity";
import { PlayerProps, GAME_REGISTRY } from "../registry";
import { motion, AnimatePresence } from "framer-motion";
import DixitHand from "./DixitHand";
import { calculateRank, getOrdinal } from "@/lib/utils";

export default function DixitPlayerView({
  player,
  roomData,
  isMyTurn,
}: PlayerProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const dixitAction = useMutation(api.dixit.handleAction);

  // Narrowing union: roomData.gameBoard
  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;
  const storytellerId = roomData.turnOrder[roomData.currentTurnIndex];
  const isST = storytellerId === player._id;

  // Narrowing union: player.state
  const playerState = player.state.gameType === "dixit" ? player.state : null;

  const allScores = roomData.players.map((p) => (p.state.gameType === "dixit" ? p.state.score || 0 : 0));
  const totalPlayers = roomData.players.length;
  const rank = calculateRank(playerState?.score || 0, allScores);
  const isLeader = rank === 1;

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
    <div className="relative min-h-[calc(100vh-180px)] bg-zinc-950/50 rounded-[3rem] overflow-hidden flex flex-col font-mono">
      {/* Background scanline effect specific to the player view */}
      <div className="scanline opacity-20" />

      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isMyTurn}
        className="flex-grow"
        history={board?.history || []}
        renderLog={(log) => <MatchActivity log={log} />}
        statsSlot={
          <div className="flex flex-col gap-6 w-full lg:w-80">
            {/* PLAYER HUD */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden ${isLeader ? "bg-yellow-500/10" : "bg-zinc-900/80"}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-60 text-4xl">
                {isLeader ? "👑" : GAME_REGISTRY.dixit.visuals.emoji}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${isST ? "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" : "bg-zinc-700"}`}
                />
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">
                  {isST ? "STORYTELLER_ACTIVE" : "GUESSER_WAITING"}
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-4">
                {isST && (
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] bg-blue-400/10 px-2 py-0.5 rounded w-fit mb-1 border border-blue-400/20">
                    ⚡ {t.storyteller}
                  </span>
                )}
                <div className={`text-3xl font-black italic tracking-tighter uppercase truncate ${isLeader ? "text-yellow-400" : "text-white"}`}>
                  {player.name}
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-6 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
                    SCORE
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black tracking-tighter tabular-nums ${isLeader ? "text-yellow-400" : "text-blue-500"}`}>
                      {isFA
                        ? toPersianDigits(playerState?.score || 0)
                        : playerState?.score || 0}
                    </span>
                    <span className="text-xs opacity-50 font-black">
                      / {isFA ? toPersianDigits(30) : 30}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
                    RANK
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isLeader ? "text-yellow-400" : "text-white"}`}>
                    {rankString}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ACTION STACK */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] px-2">
                COMMAND_MATRIX
              </h3>
              <div className="flex flex-col gap-3">
                {/* Board Phase Telemetry */}
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between items-center text-[8px] text-zinc-500 mb-2">
                    <span>PROCESS_PHASE</span>
                    <span className="text-blue-500 font-black">
                      {board?.phase}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          board?.phase === "RESULTS"
                            ? "100%"
                            : board?.phase === "VOTING"
                              ? "75%"
                              : board?.phase === "SUBMITTING"
                                ? "50%"
                                : "25%",
                      }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        }
        actionsSlot={
          <div className="flex-grow overflow-hidden">
            <DixitHand room={roomData} player={player} initialLang={lang} />
          </div>
        }
      />
    </div>
  );
}
