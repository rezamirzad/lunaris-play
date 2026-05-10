"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, getLocalizedGameTitle } from "@/lib/translations";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface Game {
  _id: string;
  slug: string;
  title: string;
  title_fr?: string;
  title_de?: string;
  title_fa?: string;
  description: string;
  description_fr?: string;
  description_de?: string;
  description_fa?: string;
  thumbnail?: string;
  minPlayers: number;
  suggestedMax: number;
  absoluteMax: number;
  available?: string;
}

const tileVariants: Variants = {
  hidden: { x: 50, opacity: 0, rotate: 2 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    rotate: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  }),
};

export default function GameCatalog({
  onHost,
}: {
  onHost: (slug: string) => void;
}) {
  const games = useQuery(api.engine.listGames);
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  if (!games)
    return (
      <div className="grid grid-cols-1 gap-10 opacity-20" dir="ltr">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-[320px] bg-zinc-900 rounded-[2.5rem] animate-pulse"
          />
        ))}
      </div>
    );

  const getLocalizedContent = (game: Game) => {
    const title = getLocalizedGameTitle(
      game.slug,
      lang,
      t,
      game.title,
      game.title_fr,
      game.title_de,
      game.title_fa,
    );

    // 1. Try to get description from database specific language fields
    let desc = game.description;

    if (lang === "fr") desc = game.description_fr || desc;
    else if (lang === "de") desc = game.description_de || desc;
    else if (lang === "fa") desc = game.description_fa || desc;

    // 2. Try translation file key (slug_desc)
    const tDesc = (t as any)[`${game.slug.toLowerCase()}_desc`];

    return {
      displayTitle: title,
      displayDescription: tDesc || desc,
    };
  };

  return (
    /* Forced LTR for the entire catalog to maintain terminal aesthetic */
    <div className="grid grid-cols-1 gap-8 text-left" dir="ltr">
      <AnimatePresence>
        {games.map((game: any, i: number) => {
          const { displayTitle, displayDescription } = getLocalizedContent(
            game as Game,
          );

          return (
            <motion.div
              key={game._id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={tileVariants}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 0 50px -20px rgba(45,212,191,0.2)",
              }}
              whileTap={{ scale: 0.99 }}
              /* min-h ensures card can expand if description is long, while maintaining alignment */
              className="group relative overflow-hidden bg-zinc-950/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 hover:border-teal-400/40 transition-all duration-500 cursor-pointer flex flex-col lg:flex-row shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)] min-h-[320px] h-auto game-tile-atmosphere"
              onClick={() => onHost(game.slug)}
            >
              {/* SQUARE THUMBNAIL HOLDER - Fixed size on large screens to anchor layout */}
              <div className="w-full lg:w-[320px] lg:min-w-[320px] aspect-square relative overflow-hidden bg-black/40 flex items-center justify-center p-8">
                {game.thumbnail ? (
                  <img
                    src={game.thumbnail}
                    alt={displayTitle}
                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-1000 game-thumbnail-mask"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                    {game.slug === "pioupiou" ? "🐣" : "🖼️"}
                  </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* CONTENT AREA - p-10 provides breathing room for text wrapping */}
              <div className="flex-1 p-10 flex flex-col justify-between font-mono relative">
                <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] tracking-[0.4em] text-teal-400/50 uppercase font-black">
                        GAME_NODE_{i + 1}
                      </span>
                      <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                        {displayTitle}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-teal-400 font-black text-2xl whitespace-nowrap leading-none tabular-nums">
                        {isFA
                          ? toPersianDigits(game.minPlayers)
                          : game.minPlayers}
                        -
                        {isFA
                          ? toPersianDigits(game.suggestedMax)
                          : game.suggestedMax}
                      </span>
                      <span className="text-zinc-600 font-bold text-[9px] uppercase tracking-[0.2em] mt-2 whitespace-nowrap">
                        {t.players} // CAPACITY:{" "}
                        {isFA
                          ? toPersianDigits(game.absoluteMax)
                          : game.absoluteMax}
                      </span>
                    </div>
                  </div>

                  {/* Polish: line-clamp-4 allows more content than previous pass while preventing total layout explosion */}
                  <p className="text-zinc-400 text-base leading-relaxed max-w-2xl font-medium line-clamp-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    {displayDescription}
                  </p>
                </div>

                {/* Fixed position button area using justify-end in a column flex */}
                <div className="mt-8 flex justify-end items-center gap-6">
                  <div className="hidden lg:flex flex-col items-end opacity-20 group-hover:opacity-40 transition-opacity">
                    <span className="text-[7px] font-black uppercase tracking-widest">
                      READY_FOR_DEPLOYMENT
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-teal-400">
                      LATENCY: 24MS
                    </span>
                  </div>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 30px rgba(45,212,191,0.6)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-12 py-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all hover:bg-teal-400 active:scale-95 shadow-2xl relative z-10"
                  >
                    {t.host}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
