"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import RoomHeader from "../../components/shared/RoomHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { getLocalizedGameTitle } from "@/lib/translations";
import LobbyInitialization from "../../components/shared/LobbyInitialization";
import MatchBootupSequence from "../../components/shared/MatchBootupSequence";
import { GAME_REGISTRY } from "../../components/games/registry";
import { useGame } from "@/hooks/useGame";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const { t, lang } = useTranslation();
  const roomCode = String(roomId).toUpperCase();
  const isBoardView = searchParams.get("view") === "board";

  const { room, players, me, isLoading, gameMetadata } = useGame(roomCode);
  const [isBooting, setIsBooting] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (room?.status === "PLAYING" && prevStatusRef.current === "LOBBY") {
      setIsBooting(true);
    }
    if (room?.status) {
      prevStatusRef.current = room.status;
    }
  }, [room?.status]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020203] text-blue-400 font-mono text-[10px] animate-pulse tracking-[0.2em]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-24 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[loading_2s_infinite]" />
          </div>
          {t.authenticating}...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020203] p-6 font-mono">
        <div className="border border-red-500/30 bg-red-500/5 p-8 rounded-[2.5rem] text-center glass-card">
          <h2 className="text-red-500 font-black mb-4 uppercase tracking-tighter text-4xl">
            {t.invalidSession}
          </h2>
          <p className="text-zinc-500 text-[10px] tracking-[0.5em] uppercase">
            {t.room}_ID: {roomCode}
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="mt-8 px-8 py-3 bg-white text-black font-black uppercase rounded-xl hover:bg-red-500 transition-all"
          >
            {t.exit}
          </button>
        </div>
      </div>
    );
  }

  const localizedGameTitle = getLocalizedGameTitle(
    room.currentGame,
    lang,
    t,
    gameMetadata?.title,
    gameMetadata?.title_fr,
    gameMetadata?.title_de,
    gameMetadata?.title_fa
  );

  const renderContent = () => {
    // 1. Boot Sequence: Only once when moving LOBBY -> PLAYING
    if (isBooting) {
      return (
        <MatchBootupSequence 
          gameTitle={localizedGameTitle} 
          gameSlug={room.currentGame}
          onComplete={() => setIsBooting(false)} 
        />
      );
    }

    // 2. Lobby Phase: Cinematic Ready-Up
    if (room.status === "LOBBY") {
      return (
        <LobbyInitialization 
          room={room} 
          players={players as any} 
          me={me as any} 
          isBoardView={isBoardView}
          localizedGameTitle={localizedGameTitle}
        />
      );
    }

    // 3. Gameplay Phase: Dynamic Game Resolution
    const game = GAME_REGISTRY[room.currentGame.toLowerCase()];
    if (!game) return null;

    const Component = isBoardView ? game.Board : game.Player;

    return (
      <Component 
        roomId={room._id} 
        roomData={room as any} 
        player={me as any} 
        isMyTurn={String(room.turnOrder[room.currentTurnIndex]) === String(me?._id)} 
      />
    );
  };

  return (
    <main className="min-h-screen bg-app relative overflow-x-hidden">
      {/* Dynamic Header */}
      <RoomHeader 
        gameTitle={localizedGameTitle} 
        roomCode={room.roomCode} 
        status={room.status}
      />

      <div className={`relative z-10 mx-auto px-4 py-12 ${isBoardView ? "max-w-[1800px]" : "container"}`}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </main>
  );
}
