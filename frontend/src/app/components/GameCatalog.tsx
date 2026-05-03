"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/api";
import { useRouter } from "next/navigation";

export default function GameCatalog() {
  const games = useQuery(api.engine.listGames);
  const router = useRouter();

  const handleHost = (gameSlug: string) => {
    const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/room/${newCode}?view=board&game=${gameSlug}`);
  };

  if (games === undefined)
    return (
      <div className="text-teal-500 animate-pulse font-black text-xs tracking-[0.3em]">
        INITIALIZING ARCADE...
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {games.map((game) => (
        <div
          key={game.slug}
          onClick={() => handleHost(game.slug)}
          className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2.5rem] cursor-pointer hover:border-teal-400 hover:bg-zinc-900 transition-all duration-300 active:scale-95"
        >
          {/* Thumbnail Container */}
          <div className="w-full aspect-square mb-6 overflow-hidden rounded-[2rem] bg-black border border-zinc-800 flex items-center justify-center p-6 shadow-inner">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(20,184,166,0.2)]"
            />
          </div>

          {/* Text Content - Brightened Up */}
          <h3 className="text-2xl font-black uppercase text-white group-hover:text-teal-400 transition-colors tracking-tight">
            {game.title}
          </h3>

          <p className="text-zinc-300 text-sm mt-3 line-clamp-2 leading-relaxed font-medium">
            {game.description}
          </p>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                Capacity
              </span>
              <span className="text-xs font-bold text-teal-500 uppercase italic tracking-tighter">
                {game.minPlayers}—{game.suggestedMax} Players
              </span>
            </div>

            <div className="bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700 group-hover:border-teal-900 transition-colors">
              <span className="text-[10px] text-zinc-100 font-black uppercase tracking-widest">
                MAX {game.absoluteMax}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
