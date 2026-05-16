"use client";

import PlayerCard from "../../shared/PlayerCard";
import PiouPiouPlayerStats from "./PiouPiouPlayerStats";
import MatchActivity from "../../shared/MatchActivity";
import PiouPiouMatchActivity from "./MatchActivity";
import { useTranslation } from "@/hooks/useTranslation";
import { BoardProps } from "../registry";
import { motion, AnimatePresence } from "framer-motion";

export default function PiouPiouContainer({ roomData }: BoardProps) {
  const { t } = useTranslation();
  const isGameEnd =
    roomData.status?.toUpperCase() === "FINISHED" ||
    roomData.status?.toUpperCase() === "ARCHIVED";

  // Narrow the gameBoard union safely
  const board =
    roomData.gameBoard.gameType === "pioupiou" ? roomData.gameBoard : null;

  return (
    <div className="game-container relative min-h-[calc(100vh-180px)] font-mono">
      {/* Background Neuro-Grid for the board view */}
      <div className="neuro-grid opacity-30" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10 p-4 lg:p-8">
        {/* PLAYER GRID AREA */}
        <div className="lg:col-span-9 space-y-10">
          <section>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
                PARTICIPANTS
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {roomData.players.map((player, index) => {
                  const playerState =
                    player.state.gameType === "pioupiou" ? player.state : null;

                  const isWinner =
                    isGameEnd &&
                    (board?.winnerId
                      ? String(player._id) === String(board.winnerId)
                      : (playerState?.chicks || 0) >= 3);

                  const isMatchpoint =
                    !isGameEnd &&
                    (playerState?.chicks || 0) === 2 &&
                    (playerState?.eggs || 0) > 0;

                  return (
                    <motion.div
                      key={player._id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
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
                        isGameFinished={isGameEnd}
                        isWinner={isWinner}
                        isMatchpoint={isMatchpoint}
                        isCurrentTurn={
                          !isGameEnd &&
                          roomData.turnOrder[roomData.currentTurnIndex] ===
                            player._id
                        }
                        className="glass-card h-full p-6"
                      >
                        <PiouPiouPlayerStats state={playerState} />
                      </PlayerCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* SYSTEM STATUS & LOGS */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MatchActivity
              history={board?.history || []}
              renderLog={(log) => <PiouPiouMatchActivity log={log} />}
            />
          </motion.div>

          <motion.section
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl font-mono text-[10px]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-zinc-500 font-black uppercase tracking-[0.3em] text-orange-500/50">
                MATCH_TELEMETRY
              </h3>
              <span className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20">
                LIVE
              </span>
            </div>

            <div className="space-y-3 text-zinc-500 border-t border-white/5 pt-6">
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">STATUS:</span>
                <span className="text-zinc-200 font-black uppercase tracking-tighter">
                  {roomData.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">RESOLUTION:</span>
                <span className="text-blue-400 font-black tracking-tighter">
                  {board?.winnerId ? "SYSTEM_DETERMINED" : "LOGIC_INFERRED"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest">ENCRYPTION:</span>
                <span className="text-teal-400/50 font-black tracking-tighter">
                  RSA_AES_256
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
