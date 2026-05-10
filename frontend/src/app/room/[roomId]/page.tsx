"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import RoomHeader from "../../components/shared/RoomHeader";
import { useTranslation } from "@/hooks/useTranslation";
import { useGame } from "@/hooks/useGame";
import { getLocalizedGameTitle } from "@/lib/translations";
import { GAME_REGISTRY } from "../../components/games/registry";
import LobbyInitialization from "../../components/shared/LobbyInitialization";
import MatchBootupSequence from "../../components/shared/MatchBootupSequence";
import { AnimatePresence } from "framer-motion";

export default function RoomPage() {
  const { t, lang } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomCode = (params.roomId as string).toUpperCase();
  const isBoardView = searchParams.get("view") === "board";

  const { room, players, me, isMyTurn, isLoading, gameMetadata } = useGame(roomCode);
  const [isBooting, setIsBooting] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const localizedGameTitle = gameMetadata
    ? getLocalizedGameTitle(
        room?.currentGame || "",
        lang,
        t,
        gameMetadata.title,
        gameMetadata.title_fr,
        gameMetadata.title_de,
        gameMetadata.title_fa,
      )
    : room?.currentGame || "";

  // Monitor room status transitions for cinematic boot-up
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
          {t.statusLobby || "ESTABLISHING_LINK"}...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020203] p-6 font-mono">
        <div className="border border-red-500/30 bg-red-500/5 p-8 rounded-[2.5rem] text-center glass-card">
          <h2 className="text-red-500 font-black mb-4 uppercase tracking-tighter text-4xl">
            {t.invalidSession || "ERR_SESSION_INVALID"}
          </h2>
          <p className="text-zinc-500 text-[10px] tracking-[0.5em] uppercase">
            {t.room}_ID: {roomCode}
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="mt-8 px-8 py-3 bg-white text-black font-black uppercase rounded-xl hover:bg-red-500 transition-all"
          >
            RETURN_TO_ROOT
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // 1. Cinematic Boot-up Interceptor
    if (isBooting) {
      return (
        <MatchBootupSequence 
          gameTitle={localizedGameTitle} 
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

    // 3. Playing Phase: Resolve via Registry
    const gameSlug = room.currentGame.toLowerCase();
    const gameModule = GAME_REGISTRY[gameSlug];

    if (!gameModule) {
      return <div className="text-red-500 font-mono text-xs p-12 bg-red-500/5 border border-red-500/20 rounded-2xl">ERR_UNSUPPORTED_GAME_PROTOCOL: {gameSlug}</div>;
    }

    if (isBoardView) {
      const { Board } = gameModule;
      return <Board roomId={room._id} roomData={room} />;
    }

    if (!me) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 font-mono">
          <div className="h-2 w-2 bg-teal-400 rounded-full animate-ping" />
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em]">
            {t.authenticating || "NODE_AUTH_PENDING"}...
          </p>
        </div>
      );
    }

    const { Player } = gameModule;
    return <Player player={me} roomData={room} isMyTurn={isMyTurn} />;
  };

  return (
    <main
      className="relative min-h-screen bg-[#020203] overflow-hidden font-mono"
      dir="ltr"
    >
      {/* Background Terminal Effects */}
      <div className="neuro-grid opacity-20" />
      <div className="scanline opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.05),transparent_50%)] pointer-events-none" />

      <RoomHeader
        gameTitle={localizedGameTitle}
        roomCode={room.roomCode}
        status={room.status}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </main>
  );
}
