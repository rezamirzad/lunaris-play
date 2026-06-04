"use client";

import React from "react";
import MatchActivity, { ActivityLog } from "./MatchActivity";

interface PlayerControllerProps {
  player: any;
  roomData: any;
  isMyTurn: boolean;
  statsSlot: React.ReactNode;
  actionsSlot: React.ReactNode;
  className?: string;
  history?: ActivityLog[];
  renderLog?: (log: ActivityLog) => React.ReactNode;
  gameType?: string;
}

export default function PlayerController({
  roomData,
  statsSlot,
  actionsSlot,
  history,
  renderLog,
  gameType = "none",
}: PlayerControllerProps) {
  return (
    <div className="game-container p-4 sm:p-6 animate-in fade-in duration-1000 flex-1 min-h-0 flex flex-col">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 font-mono text-white flex-1 min-h-0">
        {/* COMMAND STACK: Stats, Hints, and Execution Trigger */}
        <div className="flex-shrink-0 w-full lg:w-fit space-y-6 lg:space-y-10">{statsSlot}</div>

        {/* INTERACTIVE STAGE: Game-specific logic (e.g., PiouPiou Hand Grid) */}
        <div className="flex-1 min-h-0 flex flex-col">{actionsSlot}</div>

        {/* SYSTEM LOGS: Global activity feed */}
        {history && renderLog && (
          <div className="lg:w-80 space-y-6">
            <MatchActivity history={history} renderLog={renderLog} />
          </div>
        )}
      </div>
    </div>
  );
}
