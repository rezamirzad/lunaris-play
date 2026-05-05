"use client";

import { Id } from "../../../../../convex/_generated/dataModel";
import PlayerCard from "../../shared/PlayerCard";
import DixitPlayerStats from "./DixitPlayerStats";
import MatchActivity from "../../shared/MatchActivity";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

interface DixitContainerProps {
  roomId: Id<"rooms">;
  roomData: any;
}

export default function DixitContainer({
  roomId,
  roomData,
}: DixitContainerProps) {
  const { t } = useTranslation(); // Destructured localized translation set

  return (
    <div className="game-container dixit-theme p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono">
        {/* Left Column: Player Management */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <h3 className="text-zinc-500 text-xs font-mono uppercase mb-4 tracking-widest text-blue-400/60">
              {t.players}{" "}
              {/* Localized: Participants/JOUEURS/SPIELER/بازیکن[cite: 2] */}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {roomData.players.map((player: any) => {
                // Determine if this specific player is the storyteller
                const isCurrentTurn =
                  roomData.turnOrder[roomData.currentTurnIndex] === player._id;

                return (
                  <PlayerCard
                    key={player._id}
                    name={player.name}
                    isReady={player.isReady}
                    isCurrentTurn={isCurrentTurn}
                    /**
                     * FIX: Pass the Storyteller role as an override.
                     * Refactored to use localized t.storyteller[cite: 2]
                     */
                    statusOverride={isCurrentTurn ? t.storyteller : undefined}
                  >
                    <DixitPlayerStats state={player.state} />
                  </PlayerCard>
                );
              })}
            </div>
          </section>

          <section className="player-hand border border-white/10 p-4 rounded-lg bg-zinc-900/50 min-h-[200px]">
            <h3 className="text-white mb-4 font-semibold uppercase text-xs tracking-widest text-blue-400">
              {t.availableMoves}{" "}
              {/* Localized: Inventory/MOUVEMENTS POSSIBLES/MÖGLICHE ZÜGE/حرکت‌های ممکن[cite: 2] */}
            </h3>
            <p className="text-zinc-500 text-sm italic">
              {/* Note: This remains a "Software Terminal" technical string to maintain LTR aesthetic[cite: 2] */}
              Synchronizing neural visual deck...
            </p>
          </section>
        </div>

        {/* Right Column: Game Logs & Activity */}
        <div className="lg:col-span-4 space-y-6">
          <section className="game-status border border-white/10 p-6 rounded-[32px] bg-[#09090b]">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              {t.matchActivity}{" "}
              {/* Localized: System Data/ACTIVITÉ DU MATCH/SPIELAKTIVITÄT/گزارش بازی[cite: 2] */}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-zinc-400">
                {/* Localized "Action" label for phase context[cite: 2] */}
                {t.action}:{" "}
                <span className="text-white uppercase tracking-tighter">
                  {roomData.gameBoard.phase}
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
