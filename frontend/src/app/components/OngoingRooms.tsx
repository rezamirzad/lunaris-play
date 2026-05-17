"use client";

import React from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";

interface OngoingRoomsProps {
  rooms: (Doc<"rooms"> & { isJoinable: boolean })[] | undefined;
  onJoin: (code: string) => void;
  onViewBoard: (code: string) => void;
  t: any;
}

export default function OngoingRooms({
  rooms,
  onJoin,
  onViewBoard,
  t,
}: OngoingRoomsProps) {
  if (!rooms || rooms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 border-2 border-dashed border-zinc-900 rounded-[2rem] text-center opacity-40 font-mono"
      >
        <p className="text-zinc-600 font-bold uppercase text-[9px] tracking-[0.3em]">
          {t.noOngoing}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      {rooms.map((room, index) => {
        const isFinished = room.status === "FINISHED";
        const winnerName = (room.gameBoard as any)?.winner;

        return (
          <motion.div
            key={room._id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className={`group bg-zinc-900/30 border p-5 rounded-3xl space-y-4 transition-all duration-300 ${isFinished ? "border-zinc-800/30 opacity-60" : "border-zinc-800 hover:border-teal-400/30 hover:bg-zinc-900/50"}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black bold text-white tracking-tighter uppercase">
                    {room.roomCode}
                  </span>
                  {isFinished && winnerName && (
                    <div
                      className={`flex items-center gap-1.5 border px-2 py-0.5 rounded-lg shrink-0 ${winnerName === "FAILURE" ? "bg-rose-500/10 border-rose-500/20" : "bg-teal-400/10 border-teal-400/20"}`}
                    >
                      <span className="text-[10px]">
                        {winnerName === "FAILURE" ? "⚠️" : "🏆"}
                      </span>
                      <span
                        className={`text-[9px] font-black italic uppercase truncate max-w-[80px] ${winnerName === "FAILURE" ? "text-rose-500" : "text-teal-500"}`}
                      >
                        {winnerName === "FAILURE" ? "TEAM" : winnerName}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-teal-400/70 uppercase tracking-[0.2em] mt-1">
                  {room.currentGame?.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  {!isFinished && (
                    <motion.span
                      animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"
                    />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${isFinished ? "bg-zinc-800" : "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewBoard(room.roomCode)}
                className="bg-zinc-900/50 border border-white/2 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all"
              >
                {t.board}
              </motion.button>
              <motion.button
                whileHover={
                  !isFinished
                    ? { scale: 1.02, backgroundColor: "rgba(45,212,191,0.1)" }
                    : {}
                }
                whileTap={!isFinished ? { scale: 0.98 } : {}}
                onClick={() => !isFinished && onJoin(room.roomCode)}
                disabled={isFinished}
                className={`py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${isFinished ? "bg-zinc-950 text-zinc-500 cursor-not-allowed border border-white/5" : "bg-teal-400/10 border border-teal-400/30 text-teal-400 hover:text-white"}`}
              >
                {isFinished ? t.statusArchived : t.enterLobby}
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
