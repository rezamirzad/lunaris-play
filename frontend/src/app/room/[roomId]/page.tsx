"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useEffect, useState, useMemo } from "react";
import { api } from "../../../../../convex/_generated/api";

import RoomHeader from "../../components/shared/RoomHeader";
import PiouPiouPlayerView from "../../components/games/PiouPiou/PlayerViewContainer";
import DixitPlayerView from "../../components/games/Dixit/PlayerViewContainer";
import PiouPiouBoard from "../../components/games/PiouPiou/PiouPiouContainer";
import DixitBoard from "../../components/games/Dixit/DixitContainer";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

export default function RoomPage() {
  const { t } = useTranslation(); // Destructured localization set
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = (params.roomId as string).toUpperCase();
  const isBoardView = searchParams.get("view") === "board";

  const room = useQuery(api.engine.getRoomState, { roomCode });
  const [localName, setLocalName] = useState<string | null>(null);

  useEffect(() => {
    setLocalName(localStorage.getItem("playerName"));
  }, []);

  const me = useMemo(() => {
    if (!room?.players || !localName) return null;
    return room.players.find((p: any) => p.name === localName);
  }, [room?.players, localName]);

  // --- 1. Technical Loading State ---
  if (room === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#000000] text-blue-400 font-mono text-[10px] animate-pulse tracking-[0.2em]">
        {/* Localized: INITIALIZING... / INITIALISATION... / آماده‌سازی... */}
        {t.statusLobby || "ESTABLISHING_LINK"}...
      </div>
    );
  }

  // --- 2. Invalid Session Handling[cite: 2] ---
  if (room === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#000000] p-6">
        <div className="border border-red-500/30 bg-red-500/5 p-8 rounded-2xl text-center font-mono">
          <h2 className="text-red-500 font-black mb-2 uppercase tracking-tighter">
            {t.invalidSession || "Invalid_Session"}
          </h2>
          <p className="text-zinc-500 text-[10px] tracking-widest uppercase">
            {t.room}: {roomCode}
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const gameType = room.currentGame?.toLowerCase();

    if (isBoardView) {
      return gameType === "dixit" ? (
        <DixitBoard roomId={room._id} roomData={room} />
      ) : (
        <PiouPiouBoard roomId={room._id} roomData={room} />
      );
    }

    // --- 3. Authentication Placeholder[cite: 2] ---
    if (!me) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 font-mono">
          <div className="h-2 w-2 bg-zinc-800 rounded-full animate-ping" />
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em]">
            {t.authenticating || "Authenticating_Node"}...
          </p>
        </div>
      );
    }

    const isMyTurn = room.turnOrder[room.currentTurnIndex] === me._id;

    return gameType === "dixit" ? (
      <DixitPlayerView player={me} roomData={room} isMyTurn={isMyTurn} />
    ) : (
      <PiouPiouPlayerView player={me} roomData={room} isMyTurn={isMyTurn} />
    );
  };

  return (
    <main
      className="relative min-h-screen bg-[#000000] overflow-hidden font-mono"
      dir="ltr"
    >
      {/* Brand-standard radial gradient for depth-of-field[cite: 2] */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <RoomHeader
        gameTitle={room.currentGame}
        roomCode={room.roomCode}
        status={room.status}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </main>
  );
}
