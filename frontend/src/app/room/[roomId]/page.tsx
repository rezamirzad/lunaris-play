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
import AdminGateway from "../../admin/AdminGateway";

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const { t, lang } = useTranslation();
  const roomCode = String(roomId).toUpperCase();
  const isBoardView = searchParams.get("view") === "board";

  const { room, players, me, isLoading, gameMetadata } = useGame(roomCode);
  const [isBooting, setIsBooting] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  // Detect if I was kicked: I have a playerId in localStorage but 'me' is undefined while room exists
  const hasSessionId = typeof window !== "undefined" && !!localStorage.getItem("playerId");
  const isKicked = !isLoading && !!room && room.status === "LOBBY" && !me && hasSessionId;

  useEffect(() => {
    if (room?.status === "PLAYING" && prevStatusRef.current === "LOBBY") {
      // Dixit players skip the boot sequence for speed
      if (!isBoardView && room.currentGame === "dixit") {
          setIsBooting(false);
      } else {
          setIsBooting(true);
      }
    }
    if (room?.status) {
      prevStatusRef.current = room.status;
    }
  }, [room?.status, isBoardView, room?.currentGame]);

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

  if (isKicked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020203] p-6 font-mono">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="border border-rose-500/30 bg-rose-500/5 p-12 rounded-[3rem] text-center glass-card max-w-lg shadow-[0_0_100px_rgba(244,63,94,0.1)]"
        >
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-rose-500 font-black mb-4 uppercase tracking-tighter text-4xl italic">
            Access Revoked
          </h2>
          <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase leading-relaxed">
            You have been removed from this session by the administrator.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem("playerId");
              window.location.href = "/";
            }}
            className="mt-12 w-full py-4 bg-white text-black font-black uppercase rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-2xl tracking-widest"
          >
            Return to Arcade
          </button>
        </motion.div>
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
    // 1. Boot Sequence: Only once when moving LOBBY -> PLAYING (Board View Only for Dixit)
    if (isBooting && (isBoardView || room.currentGame !== "dixit")) {
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

  const content = (
    <main 
      lang={lang}
      className={`${isBoardView ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto no-scrollbar'} flex flex-col bg-app relative ${lang === 'fa' ? 'fa-text-fix' : ''}`}
    >
      {/* Dynamic Header */}
      <div className="shrink-0">
        <RoomHeader 
          gameTitle={localizedGameTitle} 
          roomCode={room.roomCode} 
          status={room.status}
        />
      </div>

      <div className={`relative z-10 mx-auto px-4 py-4 flex-1 min-h-0 w-full flex flex-col ${isBoardView ? "w-[96vw] max-w-[1920px]" : "container"}`}>

        <AnimatePresence mode="wait">
          <div className="flex-1 min-h-0 flex flex-col">
            {renderContent()}
          </div>
        </AnimatePresence>
      </div>
    </main>
  );

  if (isBoardView) {
    return <AdminGateway>{content}</AdminGateway>;
  }

  return content;
}
