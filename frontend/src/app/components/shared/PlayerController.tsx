"use client";

import React from "react";
import MatchActivity from "./MatchActivity";

interface PlayerControllerProps {
  player: any;
  roomData: any;
  isMyTurn: boolean;
  statsSlot: React.ReactNode;
  actionsSlot: React.ReactNode;
  className?: string;
}

export default function PlayerController({
  roomData,
  statsSlot,
  actionsSlot,
}: PlayerControllerProps) {
  return (
    <div className="game-container p-6 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row gap-10 font-mono text-white">
        {/* COMMAND STACK: Stats, Hints, and Execution Trigger */}
        <div className="flex-shrink-0 w-fit space-y-10">{statsSlot}</div>

        {/* INTERACTIVE STAGE: Game-specific logic (e.g., PiouPiou Hand Grid) */}
        <div className="flex-1">{actionsSlot}</div>

        {/* SYSTEM LOGS: Global activity feed */}
        <div className="lg:w-80 space-y-6">
          <MatchActivity
            history={roomData.gameBoard?.history || []}
            gameType={roomData.currentGame?.toLowerCase()}
          />
        </div>
      </div>
    </div>
  );
}
