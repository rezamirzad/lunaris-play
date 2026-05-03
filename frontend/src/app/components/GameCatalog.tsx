"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/api";
import { useRouter } from "next/navigation";
import { Language, translations } from "@/lib/translations";

export default function GameCatalog({ lang }: { lang: Language }) {
  const games = useQuery(api.engine.listGames);
  const router = useRouter();
  const t = translations[lang];

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
      {games.map((game) => {
        const displayTitle = (game as any)[`title_${lang}`] || game.title;
        const displayDescription =
          (game as any)[`description_${lang}`] || game.description;

        return (
          <div
            key={game.slug}
            onClick={() => handleHost(game.slug)}
            className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2.5rem] cursor-pointer hover:border-teal-400 hover:bg-zinc-900 transition-all duration-300 active:scale-95"
          >
            <div className="w-full aspect-square mb-6 overflow-hidden rounded-[2rem] bg-black border border-zinc-800 flex items-center justify-center p-6 shadow-inner">
              <img
                src={game.thumbnail}
                alt={displayTitle}
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <h3 className="text-2xl font-black uppercase text-white group-hover:text-teal-400 transition-colors tracking-tight">
              {displayTitle}
            </h3>

            <p className="text-zinc-300 text-sm mt-3 line-clamp-3 leading-relaxed font-medium">
              {displayDescription}
            </p>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                  {t.capacityLabel}
                </span>
                <span className="text-xs font-bold text-teal-500 uppercase italic tracking-tighter">
                  {game.minPlayers} — {game.suggestedMax} {t.players}
                </span>
              </div>

              <div className="bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700">
                <span className="text-[10px] text-zinc-100 font-black uppercase tracking-widest">
                  {t.maxLabel} {game.absoluteMax}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
