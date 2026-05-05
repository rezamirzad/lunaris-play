"use client";

import PlayerController from "../../shared/PlayerController";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook
import { toPersianDigits } from "@/lib/translations"; // Numerical localization
import MatchActivity from "./MatchActivity"; // Specialized log renderer[cite: 2]

interface DixitPlayerViewProps {
  player: any;
  roomData: any;
  isMyTurn: boolean;
}

/**
 * DixitPlayerView: Specialized dashboard for the Dixit session.
 * Reuses the SharedPlayerController shell to maintain visual parity[cite: 2].
 */
export default function DixitPlayerView({
  player,
  roomData,
  isMyTurn,
}: DixitPlayerViewProps) {
  const { t, lang } = useTranslation(); // Destructured localization set[cite: 2]
  const isFA = lang === "fa";

  // LOGIC: Check if the player is the Storyteller for this turn[cite: 2]
  const isStoryteller = roomData.gameBoard?.storytellerId === player._id;

  return (
    <PlayerController
      player={player}
      roomData={roomData}
      isMyTurn={isMyTurn}
      /* FIX: Pass required logging props to avoid shared component breakdown[cite: 2] */
      history={roomData.gameBoard?.history || []}
      renderLog={(log) => <MatchActivity log={log} />}
      /* SLOT: Dixit Score Tracking */
      statsSlot={
        <div className="flex justify-between items-end w-full font-mono">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
              {/* Localized Score Buffer Label[cite: 2] */}
              {t.dixit_score}_Buffer
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-teal-500 tracking-tighter">
                {isFA
                  ? toPersianDigits(player.state?.score || 0)
                  : player.state?.score || 0}
              </span>
              <span className="text-xs opacity-50">
                / {isFA ? toPersianDigits(30) : 30}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
              Node_Status
            </span>
            <span
              className={`text-xs font-black uppercase tracking-widest ${isMyTurn ? "text-teal-500" : "text-white"}`}
            >
              {/* Localized Storyteller / Guesser Role[cite: 2] */}
              {isMyTurn ? t.storyteller : "Guesser"}
            </span>
          </div>
        </div>
      }
      /* SLOT: Dixit Action Matrix */
      actionsSlot={
        <div className="space-y-4">
          <h3 className="text-zinc-600 text-[9px] uppercase tracking-widest font-black">
            STORY_MATRIX
          </h3>
          <div className="flex flex-col gap-2">
            {isStoryteller ? (
              <button className="w-full px-4 py-2 rounded-xl border border-teal-500/30 bg-teal-500/5 text-[9px] uppercase text-teal-500 font-black tracking-widest hover:bg-teal-500/10 transition-all">
                {/* Localized Action Trigger[cite: 2] */}
                {t.action}
              </button>
            ) : (
              <button
                disabled
                className="w-full px-4 py-2 rounded-xl border border-white/5 text-[9px] uppercase text-zinc-700 bg-white/[0.02] cursor-not-allowed font-black tracking-widest"
              >
                {/* Localized Waiting State[cite: 2] */}
                {t.waiting}
              </button>
            )}
          </div>
        </div>
      }
    />
  );
}
