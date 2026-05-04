"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import PiouPiouHand from "../../components/games/PiouPiou/PiouPiouHand";
import {
  translations,
  Language,
  formatLog,
  TranslationSet,
} from "@/lib/translations";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lang = (searchParams.get("lang") as Language) || "en";
  const t = translations[lang];

  const room = useQuery(api.engine.getRoomState, { roomCode: params.roomId });
  const startMatch = useMutation(api.engine.startGame);

  const setLanguage = (newLang: Language) => {
    const p = new URLSearchParams(searchParams);
    p.set("lang", newLang);
    router.replace(`${pathname}?${p.toString()}`);
  };

  if (!room) return <div className="min-h-screen bg-black" />;

  // --- BOARD VIEW LOGIC ---
  if (searchParams.get("view") === "board") {
    const isGameOver = room.status === "FINISHED";
    const winnerName = room.gameBoard?.winner;

    return (
      <main
        className={`min-h-screen bg-black text-white p-6 lg:p-12 space-y-12 max-w-7xl mx-auto ${lang === "fa" ? "font-serif" : ""}`}
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter text-teal-500 uppercase">
              {params.roomId}
            </h1>
            <p className="text-zinc-500 font-bold tracking-[0.4em] text-[10px] uppercase">
              {room.currentGame || "PIOU PIOU"} • {t.title}
            </p>
          </div>
          <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
            {(["en", "fr", "de", "fa"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l as Language)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === l ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: ACTIVITY LOG */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase">
                  {t.matchActivity}
                </h2>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-hidden relative">
                {(room.gameBoard?.history ?? []).length > 0 ? (
                  room.gameBoard?.history?.map((entry: any, i: number) => (
                    <div
                      key={i}
                      className={`transition-all duration-700 ${i === 0 ? "opacity-100" : "opacity-30"}`}
                    >
                      <p className="text-lg font-black italic uppercase leading-tight tracking-tight">
                        {formatLog(
                          translations[lang][
                            entry.key as keyof TranslationSet
                          ] as string,
                          entry.data || {},
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-700 italic font-bold uppercase text-xs">
                    {t.noOngoing}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: PLAYER CARDS */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
              <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase">
                {t.players}
              </h2>

              {/* --- MATCH FINISHED ALERT --- */}
              {isGameOver && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <div className="bg-teal-500 text-black px-4 py-1 rounded-full flex items-center gap-2 shadow-[4px_4px_0_0_#000] border-2 border-black">
                    <span className="text-sm">🏆</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t.gameOver}, {t.winner}: {winnerName}
                    </span>
                    <button
                      onClick={() => router.push("/")}
                      className="ml-2 bg-black text-white px-2 py-0.5 rounded-md text-[8px] font-black hover:bg-zinc-800 transition-colors"
                    >
                      {t.exit}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {room.players.map((p: any) => {
                const isTurn =
                  room.turnOrder?.[room.currentTurnIndex] === p._id;
                const pState = p.state || {};
                const isWinningSoon = pState.chicks === 2 && pState.eggs >= 1;
                const isWinner = winnerName === p.name && isGameOver;

                return (
                  <div
                    key={p._id}
                    className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                      isWinner
                        ? "bg-teal-500/10 border-teal-500 shadow-[0_0_40px_rgba(20,184,166,0.2)]"
                        : isTurn && !isGameOver
                          ? "bg-zinc-900 border-teal-500 scale-[1.02]"
                          : "bg-zinc-900/20 border-zinc-800 opacity-60"
                    }`}
                  >
                    {/* --- WINNER BADGE --- */}
                    {isWinner && (
                      <div className="absolute -top-4 left-6 bg-teal-500 text-black px-4 py-1 rounded-full border-2 border-black shadow-[2px_2px_0_0_#000] z-20 flex items-center gap-2">
                        <span className="text-xs">👑</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                          {t.winner}
                        </span>
                      </div>
                    )}

                    {isWinningSoon && !isGameOver && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0_0_#000] animate-bounce z-10">
                        <p className="text-[10px] text-black font-black uppercase whitespace-nowrap">
                          {lang === "fa"
                            ? "⚠️ در آستانه پیروزی"
                            : "⚠️ WINNING SOON"}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-teal-500 tracking-widest uppercase">
                          {isWinner
                            ? t.winner
                            : isTurn && !isGameOver
                              ? t.activeTurn
                              : ""}
                        </p>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter truncate max-w-[180px]">
                          {p.name}
                        </h3>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-center">
                          <span className="text-2xl block">🥚</span>
                          <span className="text-sm font-black text-zinc-500">
                            {pState.eggs || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-2xl block">🐣</span>
                          <span
                            className={`text-xl font-black ${isWinner ? "text-teal-400" : isWinningSoon ? "text-yellow-400" : "text-white"}`}
                          >
                            {pState.chicks || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-zinc-800/50">
                      {p.gameHand?.map((cardType: string, idx: number) => (
                        <div
                          key={idx}
                          className={`w-10 h-14 border rounded-lg flex items-center justify-center text-xl shrink-0 ${
                            isWinner
                              ? "bg-teal-500/20 border-teal-500/40"
                              : "bg-black/40 border-zinc-800"
                          }`}
                        >
                          {cardType === "ROOSTER" && "🐓"}
                          {cardType === "CHICKEN" && "🐔"}
                          {cardType === "NEST" && "🪺"}
                          {cardType === "FOX" && "🦊"}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const storedName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : "";
  const currentPlayer = room.players.find((p: any) => p.name === storedName);
  return currentPlayer ? (
    <PiouPiouHand room={room} player={currentPlayer} initialLang={lang} />
  ) : null;
}
