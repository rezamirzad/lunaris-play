"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Language, translations, TranslationSet } from "@/lib/translations";

interface Game {
  _id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  minPlayers: number;
  suggestedMax: number;
  absoluteMax: number;
}

export default function GameCatalog({
  lang,
  onHost,
}: {
  lang: Language;
  onHost: (slug: string) => void;
}) {
  const games = useQuery((api as any).engine.listGames);
  const t = translations[lang];

  const isRTL = lang === "fa";

  if (!games)
    return (
      <div className="grid grid-cols-1 gap-10 opacity-20">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-[280px] bg-zinc-900 rounded-[2.5rem] animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div
      className={`grid grid-cols-1 gap-6 ${isRTL ? "text-right" : "text-left"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {games.map((game: Game) => {
        const displayTitle = (t as any)[game.title] || game.title;
        const displayDescription =
          (t as any)[game.description] || game.description;

        return (
          <div
            key={game._id}
            className="group relative overflow-hidden bg-zinc-900 rounded-[2.5rem] border border-zinc-800 hover:border-teal-500 transition-all duration-500 cursor-pointer flex flex-col lg:flex-row shadow-2xl h-auto lg:h-[280px]"
            onClick={() => onHost(game.slug)}
          >
            {/* SQUARE THUMBNAIL HOLDER - Fixed to card height */}
            <div className="w-full lg:w-[280px] lg:min-w-[280px] aspect-square relative overflow-hidden bg-black/20 flex items-center justify-center p-6">
              {game.thumbnail ? (
                <img
                  src={game.thumbnail}
                  alt={displayTitle}
                  className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-1000 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    (e.target as any).style.display = "none";
                  }}
                />
              ) : null}

              {/* FALLBACK ICON */}
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                {game.slug === "pioupiou" ? "🐣" : "🖼️"}
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 p-8 flex flex-col justify-between bg-zinc-900">
              <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
                  <h3
                    className={`text-4xl font-black italic uppercase tracking-tighter text-white leading-none ${isRTL ? "font-serif" : ""}`}
                  >
                    {displayTitle}
                  </h3>

                  <div
                    className={`flex flex-col ${isRTL ? "items-start" : "items-end"}`}
                  >
                    <span className="text-teal-400 font-black text-xl whitespace-nowrap leading-none">
                      {game.minPlayers}-{game.suggestedMax} {t.players}
                    </span>
                    <span className="text-zinc-600 font-bold text-[9px] uppercase tracking-[0.2em] mt-1 whitespace-nowrap">
                      {t.maxLabel}: {game.absoluteMax}
                    </span>
                  </div>
                </div>

                <p className="text-zinc-400 text-base leading-snug max-w-2xl font-medium line-clamp-2 opacity-80">
                  {displayDescription}
                </p>
              </div>

              <div
                className={`mt-4 flex ${isRTL ? "justify-start" : "justify-end"}`}
              >
                <button className="bg-white text-black px-8 py-3 rounded-xl font-black text-lg uppercase tracking-widest transition-all hover:bg-teal-500 active:scale-95 shadow-lg">
                  {t.host}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
