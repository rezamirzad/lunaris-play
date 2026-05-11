"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import {
  toPersianDigits,
  getLocalizedGameTitle,
  TranslationSet,
} from "@/lib/translations";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { GAME_REGISTRY } from "./games/registry";
import Image from "next/image";

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
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  }),
};

export type GameCatalogMode = "standard" | "admin";

export default function GameCatalog({
  onHost,
  mode = "standard",
}: {
  onHost?: (slug: string) => void;
  mode?: GameCatalogMode;
}) {
  const games = useQuery(api.engine.listGames);
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";

  if (!games)
    return (
      <div
        className={`grid gap-8 opacity-20 ${mode === "admin" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
        dir="ltr"
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`bg-zinc-900 rounded-[2.5rem] animate-pulse ${mode === "admin" ? "h-24" : "aspect-[4/3] sm:aspect-auto sm:h-[500px]"}`}
          />
        ))}
      </div>
    );

  return (
    <div
      className={`grid gap-6 sm:gap-8 lg:gap-10 text-left items-stretch ${mode === "admin" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
      dir="ltr"
    >
      <AnimatePresence>
        {games.map((game: any, i: number) => {
          const displayTitle = getLocalizedGameTitle(
            game.slug,
            lang,
            t,
            game.title,
            game.title_fr,
            game.title_de,
            game.title_fa,
          );

          if (mode === "admin") {
            return (
              <motion.div
                key={game._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-6 bg-zinc-950/40 backdrop-blur-3xl rounded-3xl border border-white/5 hover:border-teal-400/40 transition-all group"
              >
                <div className="flex flex-col">
                  <h3 className="text-xl font-black italic uppercase text-white leading-none group-hover:text-teal-400 transition-colors">
                    {displayTitle}
                  </h3>
                </div>
                <button
                  onClick={() => onHost?.(game.slug)}
                  className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                >
                  {t.host}
                </button>
              </motion.div>
            );
          }

          // Standardized dynamic description lookup[cite: 2]
          const descriptionKey =
            `${game.slug.toLowerCase()}_desc` as keyof TranslationSet;
          const displayDescription = t[descriptionKey] || game.description;

          return (
            <motion.div
              key={game._id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={tileVariants}
              whileHover={{
                y: -5,
                boxShadow: "0 20px 40px -20px rgba(45,212,191,0.25)",
              }}
              className="group relative flex flex-col h-full overflow-hidden bg-zinc-950/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 hover:border-teal-400/40 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)] game-tile-atmosphere"
            >
              {/* VISUAL ANCHOR (THUMBNAIL) */}
              <div className="w-full aspect-[4/3] relative overflow-hidden bg-black/40 flex items-center justify-center p-6">
                {game.thumbnail ? (
                  <Image
                    src={game.thumbnail}
                    alt={displayTitle}
                    fill
                    className="object-contain p-6 group-hover:scale-110 transition-transform duration-1000 game-thumbnail-mask"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                    {GAME_REGISTRY[game.slug]?.visuals.emoji || "🖼️"}
                  </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* INFORMATION MATRIX (CONTENT AREA) */}
              <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between font-mono relative">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-end items-center">
                      <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-0.5 rounded border border-white/5">
                        <span className="text-teal-400 font-black text-[10px] tabular-nums">
                          {isFA
                            ? toPersianDigits(game.minPlayers)
                            : game.minPlayers}
                          -
                          {isFA
                            ? toPersianDigits(game.suggestedMax)
                            : game.suggestedMax}
                        </span>
                        <span className="text-zinc-50 font-black text-[10px] tracking-tighter">
                          {t.players}
                        </span>
                      </div>
                      <span className="text-zinc-50 font-black text-[10px] tracking-tighter">
                        (up to{" "}
                        {isFA
                          ? toPersianDigits(game.absoluteMax)
                          : game.absoluteMax}
                        )
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black italic uppercase  text-white leading-none group-hover:text-teal-400 transition-colors">
                      {displayTitle}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-sm font-black italic tracking-tighter text-white leading-none group-hover:text-teal-400 transition-colors">
                    {displayDescription}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
