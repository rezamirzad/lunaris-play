"use client";

import Card from "./Card";

interface PiuPiuHandProps {
  roomId: string; // Internal Convex ID
  roomCode: string; // The 4-letter code (e.g., XAJQ)
  player: any; // Current player object
  gameName: string; // E.g., "PiuPiu"
  totalPlayers: number;
}

export default function PiuPiuHand({
  roomCode,
  player,
  gameName,
  totalPlayers,
}: PiuPiuHandProps) {
  if (!player)
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-500 font-black animate-pulse">
        SYNCING HAND...
      </div>
    );

  const hand: string[] = player.gameHand || [];

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-950 text-white font-sans">
      {/* --- STATUS HEADER --- */}
      <div className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 p-4 shadow-2xl">
        <div className="flex justify-between items-center max-w-md mx-auto w-full">
          <div className="flex flex-col">
            <h2 className="text-teal-400 font-black text-xl tracking-tighter leading-none uppercase">
              {player.name}
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              {gameName} • ROOM{" "}
              <span className="text-zinc-300">{roomCode}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-zinc-300 uppercase whitespace-nowrap">
                {totalPlayers} PLAYERS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- GAME CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-md mx-auto w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] text-center">
            <span className="block text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">
              My Eggs
            </span>
            <span className="text-3xl">🥚 0</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] text-center">
            <span className="block text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">
              My Chicks
            </span>
            <span className="text-3xl">🐣 {player.score}</span>
          </div>
        </div>

        {/* Visual Hand */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] text-center">
            Your Cards
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {hand.length > 0 ? (
              hand.map((cardType, index) => (
                <Card
                  key={`${cardType}-${index}`}
                  type={cardType}
                  onClick={() => console.log(`Played ${cardType}`)}
                />
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center opacity-30">
                <p className="text-sm italic font-medium">Empty hand...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-6 text-center opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Tap a card to act
        </p>
      </div>
    </div>
  );
}
