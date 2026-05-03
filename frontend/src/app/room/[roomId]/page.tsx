"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/api";
import { useParams, useSearchParams } from "next/navigation";

import PiuPiuHand from "@/app/components/games/PiuPiu/PiuPiuHand";

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
        // Switch between Lobby and Game for the Board
        gameState.status === "LOBBY" ? (
          <BoardLobby state={gameState} />
        ) : (
          <BoardView state={gameState} />
        )
      ) : // Switch between Lobby and Game for the Hand
      gameState.status === "LOBBY" ? (
        <HandView state={gameState} isLobby={true} />
      ) : (
        <HandView state={gameState} isLobby={false} />
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

function HandView({ state, isLobby }: { state: any; isLobby: boolean }) {
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

  return (
    <div className="flex flex-col h-[90vh] animate-in fade-in duration-500">
      {/* Shared Header for Hand */}
      <div className="text-center py-4 border-b border-zinc-900 mb-6">
        <div className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em]">
          {isLobby ? "Lobby" : state.currentGame} Controller
        </div>
        <div className="text-2xl font-black italic uppercase">
          {currentPlayer.name}
        </div>
      </div>

      <div className="flex-1">
        {isLobby ? (
          <LobbyHand player={currentPlayer} /> // Show Ready button
        ) : (
          <ActiveHandLogic state={state} currentPlayer={currentPlayer} /> // Show Game controls
        )}
      </div>
    </div>
  );
}

function ActiveHandLogic({
  state,
  currentPlayer,
}: {
  state: any;
  currentPlayer: any;
}) {
  const GameRegistry: Record<string, any> = { piupiu: PiuPiuHand };
  const ActiveHand = GameRegistry[state.currentGame];

  return ActiveHand ? (
    <ActiveHand player={currentPlayer} roomId={state._id} />
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
      Waiting for Game...
    </div>
  );
}

function LobbyHand({ player }: { player: any }) {
  const toggleReady = useMutation(api.engine.toggleReady);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
          player.isReady
            ? "border-teal-500 bg-teal-500/10"
            : "border-zinc-800 bg-zinc-900"
        }`}
      >
        <span className="text-4xl">{player.isReady ? "✅" : "⏳"}</span>
      </div>

      <button
        onClick={() => toggleReady({ playerId: player._id })}
        className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest transition-all ${
          player.isReady
            ? "bg-zinc-900 text-zinc-500 border border-zinc-800"
            : "bg-teal-500 text-black shadow-[0_0_30px_rgba(20,184,166,0.4)]"
        }`}
      >
        {player.isReady ? "I'm Ready!" : "Ready Up"}
      </button>
    </div>
  );
}

// Inside BoardView in frontend/src/app/room/[roomId]/page.tsx

function BoardLobby({ state }: { state: any }) {
  const start = useMutation(api.engine.startGame);
  const allReady =
    state.players.length > 0 && state.players.every((p: any) => p.isReady);

  return (
    <div className="flex flex-col items-center justify-between h-full w-full py-12">
      <div className="text-center">
        <h1 className="text-7xl font-black italic uppercase tracking-tighter mb-4">
          Lobby
        </h1>
        <p className="text-teal-500 font-bold uppercase tracking-[0.4em]">
          Waiting for Players
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6 w-full max-w-4xl">
        {state.players.map((p: any) => (
          <div
            key={p._id}
            className={`p-6 rounded-[2rem] border-2 transition-all ${
              p.isReady
                ? "border-teal-500 bg-teal-500/5 shadow-[0_0_20px_rgba(20,184,166,0.1)]"
                : "border-zinc-800 bg-zinc-900/50"
            }`}
          >
            <div className="text-center font-bold uppercase mb-2">{p.name}</div>
            <div className="text-center text-xs uppercase font-black text-zinc-500">
              {p.isReady ? "Ready" : "Waiting..."}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!allReady}
        onClick={() => start({ roomId: state._id, gameType: "piupiu" })}
        className={`px-16 py-6 rounded-full font-black uppercase text-xl transition-all ${
          allReady
            ? "bg-white text-black hover:scale-105 active:scale-95 cursor-pointer"
            : "bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed"
        }`}
      >
        Start Piu Piu
      </button>
    </div>
  );
}
