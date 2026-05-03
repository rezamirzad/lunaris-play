"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import PiuPiuHand from "../../components/games/PiuPiu/PiuPiuHand";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const room = useQuery(api.engine.getRoomState, { roomCode: params.roomId });
  const startMatch = useMutation(api.engine.startGame);

  if (!room)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-teal-500 font-black animate-pulse uppercase tracking-[0.5em]">
        Loading Room...
      </div>
    );

  // --- BOARD VIEW (TV/HOST) ---
  if (view === "board") {
    return (
      <div className="min-h-screen bg-black text-white p-12 flex flex-col items-center justify-between">
        <div className="w-full flex justify-between">
          <h1 className="text-9xl font-black italic text-teal-500 tracking-tighter">
            {params.roomId}
          </h1>
          <div className="text-right uppercase font-black">
            <p className="text-zinc-500 text-xs tracking-widest">Game Mode</p>
            <h2 className="text-4xl italic">{room.currentGame || "PIUPIU"}</h2>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 w-full max-w-6xl">
          {room.players.map((p: any) => (
            <div
              key={p._id}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] text-center animate-in zoom-in"
            >
              <p className="text-3xl font-black mb-2">{p.name}</p>
              {room.status === "LOBBY" ? (
                <p className="text-teal-500 text-[10px] font-bold tracking-widest uppercase">
                  Connected
                </p>
              ) : (
                <p className="text-4xl font-black text-white">
                  🐣 {p.score || 0}
                </p>
              )}
            </div>
          ))}
        </div>

        {room.status === "LOBBY" && (
          <button
            onClick={() => startMatch({ roomId: room._id })}
            className="px-20 py-8 bg-white text-black rounded-3xl font-black text-3xl uppercase tracking-widest hover:bg-teal-500 transition-all shadow-2xl active:scale-95"
          >
            Start Match
          </button>
        )}
      </div>
    );
  }

  // --- SAFETY CHECK: Find the current player ---
  const storedName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : "";
  const currentPlayer = room.players.find((p: any) => p.name === storedName);

  // If match started but we can't find this player in the DB (e.g. they changed names)
  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-12 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-black italic text-red-500 mb-4 uppercase">
          Session Lost
        </h2>
        <p className="text-zinc-500 max-w-xs uppercase font-bold text-xs tracking-widest leading-loose">
          We couldn't find a player named{" "}
          <span className="text-white">"{storedName}"</span> in room{" "}
          {params.roomId}.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 px-8 py-4 bg-zinc-800 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  // --- HAND VIEW (Verified Player) ---
  return (
    <PiuPiuHand
      roomId={room._id}
      roomCode={params.roomId}
      player={currentPlayer}
      gameName={room.currentGame || "PIUPIU"}
      totalPlayers={room.players.length}
    />
  );
}
