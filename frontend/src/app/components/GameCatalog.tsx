"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Language, translations } from "@/lib/translations";

interface Game {
  _id: string;
  slug: string;
  title: string; // English title from your DB
  title_fr?: string;
  title_de?: string;
  title_fa?: string;
  description: string; // THIS is the English field in your DB
  description_fr: string;
  description_de?: string;
  description_fa?: string;
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
  const games = useQuery(api.engine.listGames);
  const t = translations[lang];

  const isRTL = lang === "fa";

  if (!games)
    return (
      <div className="grid grid-cols-1 gap-10 opacity-20">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-[400px] bg-zinc-900 rounded-[3.5rem] animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div
      className={`grid grid-cols-1 gap-12 ${isRTL ? "text-right" : "text-left"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {games.map((game: Game) => {
        // Logic to pick the right title/description based on language
        const displayTitle =
          lang === "fr"
            ? game.title_fr || game.title
            : lang === "fa"
              ? game.title_fa || game.title
              : lang === "de"
                ? game.title_de || game.title
                : game.title;

        const displayDescription =
          lang === "fr"
            ? game.description_fr || game.description
            : lang === "fa"
              ? game.description_fa || game.description
              : lang === "de"
                ? game.description_de || game.description
                : game.description;

        return (
          <div
            key={game._id}
            className="group relative overflow-hidden bg-zinc-900 rounded-[3.5rem] border border-zinc-800 hover:border-teal-500 transition-all duration-500 cursor-pointer flex flex-col lg:flex-row shadow-2xl"
            onClick={() => onHost(game.slug)}
          >
            {/* THUMBNAIL */}
            <div className="w-full lg:w-[45%] h-72 lg:h-auto relative overflow-hidden bg-zinc-800">
              <img
                src={game.thumbnail || "/assets/placeholder-game.png"}
                alt={displayTitle}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-1000"
              />
              <div
                className={`absolute inset-0 hidden lg:block bg-gradient-to-${isRTL ? "l" : "r"} from-zinc-900 via-transparent to-transparent opacity-60`}
              />
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-12 flex flex-col justify-between bg-zinc-900">
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <h3
                    className={`text-6xl font-black italic uppercase tracking-tighter text-white ${isRTL ? "font-serif" : ""}`}
                  >
                    {displayTitle}
                  </h3>

                  <div
                    className={`flex flex-col ${isRTL ? "items-start" : "items-end"}`}
                  >
                    <span className="text-teal-400 font-black text-3xl whitespace-nowrap">
                      {game.minPlayers}-{game.suggestedMax} {t.players}
                    </span>
                    <span className="text-zinc-600 font-bold text-sm uppercase tracking-[0.2em] mt-1">
                      {isRTL ? "حداکثر" : "Max"}: {game.absoluteMax}
                    </span>
                  </div>
                </div>

                <p className="text-zinc-400 text-xl leading-relaxed max-w-3xl font-medium">
                  {displayDescription}
                </p>
              </div>

              <div
                className={`mt-10 flex ${isRTL ? "justify-start" : "justify-end"}`}
              >
                <button className="bg-white text-black px-14 py-5 rounded-[2rem] font-black text-2xl uppercase tracking-widest transition-all hover:bg-teal-500 active:scale-95">
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
