"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/api";
import { useParams, useSearchParams } from "next/navigation";

import PiuPiuHand from "@/components/games/PiuPiuHand";

export default function GameRoom() {
  const params = useParams();
  const searchParams = useSearchParams();

  // params.roomId matches the [roomId] folder name
  const roomId = params.roomId as string;
  const viewType = searchParams.get("view"); // "board" or "hand"

  // Fetch live state from Convex
  const gameState = useQuery(api.game.getRoomState, { roomCode: roomId });

  if (gameState === undefined)
    return <div className="bg-black text-white p-10">Loading...</div>;
  if (gameState === null)
    return (
      <div className="bg-black text-white p-10">Room {roomId} not found.</div>
    );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden p-6">
      {viewType === "board" ? (
        <BoardView state={gameState} />
      ) : (
        <HandView state={gameState} />
      )}
    </div>
  );
}

function BoardView({ state }: { state: any }) {
  return (
    <div className="flex flex-col items-center p-8 h-screen bg-black">
      <h1 className="text-5xl font-black text-teal-500 italic uppercase mb-12">
        Piu Piu Arena
      </h1>

      <div className="grid grid-cols-3 gap-8 w-full">
        {state.players?.map((p: any) => (
          <div
            key={p._id}
            className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2rem] text-center"
          >
            <h3 className="text-xl font-bold mb-4 uppercase">{p.name}</h3>
            <div className="flex justify-center gap-4">
              <div className="flex flex-col">
                <span className="text-3xl">🥚</span>
                <span className="font-black text-teal-500">
                  {p.gameHand?.eggs || 0}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl">🐥</span>
                <span className="font-black text-yellow-500">
                  {p.gameHand?.chicks || 0} / 3
                </span>
              </div>
            </div>
            {/* Victory condition: 3 Chicks */}
            {p.gameHand?.chicks >= 3 && (
              <div className="mt-4 text-teal-400 font-black animate-bounce">
                WINNER!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HandView({ state }: { state: any }) {
  const playerName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : null;
  const currentPlayer = state.players?.find((p: any) => p.name === playerName);

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 italic">
        Authenticating player...
      </div>
    );
  }

  // 1. Map game names to their respective components
  const GameRegistry: Record<string, any> = {
    piupiu: PiuPiuHand,
  };

  // 2. Identify the active component based on the database state
  const ActiveHand = GameRegistry[state.currentGame];

  return (
    <div className="flex flex-col h-[90vh] animate-in fade-in duration-500">
      <div className="text-center py-4 border-b border-zinc-900 mb-6">
        <div className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em]">
          {state.currentGame} Controller
        </div>
        <div className="text-2xl font-black italic uppercase">
          {currentPlayer.name}
        </div>
      </div>

      <div className="flex-1">
        {ActiveHand ? (
          <ActiveHand player={currentPlayer} roomId={state._id} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-8 border-2 border-dashed border-zinc-800 rounded-[3rem]">
            <p className="uppercase font-bold text-sm tracking-widest">
              Waiting for Game...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
