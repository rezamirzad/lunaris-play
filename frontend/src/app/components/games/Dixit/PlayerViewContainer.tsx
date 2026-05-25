"use client";

import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import PlayerController from "../../shared/PlayerController";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog, fixPersianPunctuation } from "@/lib/translations";
import MatchActivity from "./MatchActivity";
import { PlayerProps, GAME_REGISTRY } from "../registry";
import { motion } from "framer-motion";
import DixitHand from "./DixitHand";
import StorytellerBadge from "./StorytellerBadge";
import { calculateRank, getOrdinal } from "@/lib/utils";

export default function DixitPlayerView({
  player,
  roomData,
  isMyTurn,
}: PlayerProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;
  const storytellerId = roomData.turnOrder[roomData.currentTurnIndex];
  const isST = storytellerId === player._id;

  const playerState = player.state.gameType === "dixit" ? player.state : null;

  const allScores = roomData.players.map((p) =>
    p.state.gameType === "dixit" ? p.state.score || 0 : 0,
  );
  const totalPlayers = roomData.players.length;
  const rank = calculateRank(playerState?.score || 0, allScores);
  const isLeader = rank === 1;

  const rankDisplay = isFA ? toPersianDigits(rank) : getOrdinal(rank);
  const totalDisplay = isFA ? toPersianDigits(totalPlayers) : totalPlayers;

  const rankString = formatLog(
    t.rank_out_of,
    {
      rank: rankDisplay,
      total: totalDisplay,
    },
    lang,
  );

  // Localized clue logic for the player's device
  const activeClue = board?.currentClues
    ? board.currentClues[lang as keyof typeof board.currentClues] ||
      board.currentClue
    : board?.currentClue;

  return (
    <div className="relative min-h-0 bg-zinc-950/50 rounded-[2.5rem] sm:rounded-[3rem] flex flex-col font-mono">
      <div className="scanline opacity-20" />

      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isMyTurn}
        className="flex-grow"
        statsSlot={
          <div className="flex flex-col gap-3 sm:gap-6 w-full lg:w-80">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`backdrop-blur-xl border border-white/5 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden ${isLeader ? "bg-yellow-500/10" : "bg-zinc-900/80"}`}
            >
              {isST && <StorytellerBadge />}
              <div className="absolute top-0 right-0 p-4 opacity-60 text-3xl sm:text-4xl">
                {isLeader ? "👑" : GAME_REGISTRY.dixit.visuals.emoji}
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${isST ? "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" : "bg-zinc-700"}`}
                />
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">
                  {isST ? t.storyteller : t.dixit_wait_others}
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-3 sm:mt-4">
                <div
                  className={`text-2xl sm:text-3xl font-black italic uppercase truncate ${isLeader ? "text-yellow-400" : "text-white"}`}
                >
                  {player.name}
                </div>
              </div>

              <div className="mt-4 sm:mt-6 border-t border-white/5 pt-4 sm:pt-6 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
                    {t.dixit_score}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl sm:text-3xl font-black tracking-tighter tabular-nums ${isLeader ? "text-yellow-400" : "text-blue-500"}`}
                    >
                      {isFA
                        ? toPersianDigits(playerState?.score || 0)
                        : playerState?.score || 0}
                    </span>
                    <span className="text-[10px] sm:text-xs opacity-50 font-black">
                      / {isFA ? toPersianDigits(30) : 30}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-black">
                    {t.rank}
                  </span>
                  <span
                    dir={isFA ? "rtl" : "ltr"}
                    className={`text-[9px] sm:text-[10px] font-black uppercase ${isFA ? "" : "tracking-widest"} ${isLeader ? "text-yellow-400" : "text-white"}`}
                  >
                    {rankString}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* LOCALIZED ACTIVE CLUE HUD (For Player Hand) - Hidden on mobile to save space as it is in the hand */}
            {activeClue &&
              (board?.phase === "SUBMITTING" || board?.phase === "VOTING") && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="hidden lg:block bg-blue-500/10 border border-blue-500/30 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] backdrop-blur-md"
                >
                  <span className="text-[7px] sm:text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-1 sm:mb-2">
                    {t.dixit_clue_received}
                  </span>
                  <div
                    className={`text-lg sm:text-xl font-black text-white italic tracking-tighter uppercase leading-tight`}
                    dir={lang === 'fa' ? 'rtl' : 'ltr'}
                  >
                    {fixPersianPunctuation(activeClue, lang)}
                  </div>
                </motion.div>
              )}
          </div>
        }
        actionsSlot={
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <DixitHand room={roomData} player={player} />
          </div>
        }
      />
    </div>
  );
}
