"use client";

import { Id } from "../../../../../convex/_generated/dataModel";
import PlayerCard from "../../shared/PlayerCard";
import PiouPiouPlayerStats from "./PiouPiouPlayerStats";
import StartMatchButton from "./LobbyStartButton";
import MatchActivity from "../../shared/MatchActivity";

interface PiouPiouContainerProps {
  roomId: Id<"rooms">;
  roomData: any;
}

export default function PiouPiouContainer({
  roomId,
  roomData,
}: PiouPiouContainerProps) {
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";
  const isGameEnd =
    roomData.status?.toUpperCase() === "FINISHED" ||
    roomData.status?.toUpperCase() === "ARCHIVED";

  return (
    <div className="game-container pioupiou-theme p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono">
        <div className="lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse" />
              <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-widest text-orange-400/60">
                Network_Nodes
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {roomData.players.map((player: any) => {
                const isWinner =
                  isGameEnd &&
                  (roomData.gameBoard?.winnerId
                    ? String(player._id) === String(roomData.gameBoard.winnerId)
                    : player.state?.chicks >= 3);

                // MATCHPOINT: 2 chicks = critical state
                const isMatchpoint =
                  !isGameEnd &&
                  player.state?.chicks === 2 &&
                  player.state?.eggs > 0;

                return (
                  <PlayerCard
                    key={player._id}
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
                  >
                    <PiouPiouPlayerStats state={player.state} />
                  </PlayerCard>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {isLobby && (
            <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
              <StartMatchButton room={roomData} players={roomData.players} />
            </div>
          )}
          <MatchActivity
            history={roomData.gameBoard.history || []}
            gameType="pioupiou"
          />
          {/* Status summaries and DB verification logic preserved[cite: 2] */}
          <section className="p-6 rounded-[32px] border border-white/5 bg-[#09090b] font-mono text-[10px]">
            <h3 className="text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4 text-orange-500/50">
              Session_Summary
            </h3>
            <div className="space-y-1 text-zinc-500">
              <p>
                Status:{" "}
                <span className="text-zinc-200 uppercase">
                  {roomData.status}
                </span>
              </p>
              <p>
                Method:{" "}
                <span className="text-blue-400">
                  {roomData.gameBoard?.winnerId
                    ? "DATABASE_ID"
                    : "LOGIC_DEDUCTION"}
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
