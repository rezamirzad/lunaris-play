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
        {/* --- FULL SCREEN WINNER POP-UP --- */}
        {isGameOver && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-zinc-900 border-4 border-teal-500 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(20,184,166,0.4)] text-center max-w-xl w-full relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-500 text-black px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm">
                {lang === "fa" ? "قهرمان" : "CHAMPION"}
              </div>

              <span className="text-8xl mb-6 block animate-bounce">🏆</span>
              <h2 className="text-teal-500 font-black uppercase tracking-[0.4em] mb-2 text-xs">
                {lang === "fa" ? "پایان بازی" : "MATCH FINISHED"}
              </h2>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-8 leading-none">
                {winnerName} <br />
                <span className="text-teal-500">
                  {lang === "fa" ? "برنده شد!" : "WINS!"}
                </span>
              </h1>

              <button
                onClick={() => router.push("/")}
                className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase tracking-widest hover:bg-teal-500 transition-all active:scale-95 shadow-lg"
              >
                {lang === "fa" ? "بازگشت به آرکید" : "EXIT TO ARCADE"}
              </button>
            </div>
          </div>
        )}

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
                onClick={() => setLanguage(l)}
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

            {room.status === "LOBBY" && (
              <button
                onClick={() => startMatch({ roomId: room._id })}
                className="w-full py-6 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xl hover:bg-teal-500 transition-all shadow-xl active:scale-95"
              >
                {t.startMatch}
              </button>
            )}
          </div>

          {/* RIGHT: PLAYER CARDS */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase border-b border-zinc-900 pb-4">
              {t.players}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {room.players.map((p: any) => {
                const isTurn =
                  room.turnOrder?.[room.currentTurnIndex] === p._id;
                const pState = p.state || {};
                const isWinningSoon = pState.chicks === 2 && pState.eggs >= 1;

                return (
                  <div
                    key={p._id}
                    className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                      isTurn
                        ? "bg-zinc-900 border-teal-500 scale-[1.02]"
                        : "bg-zinc-900/20 border-zinc-800 opacity-60"
                    }`}
                  >
                    {isWinningSoon && (
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
                          {isTurn ? t.activeTurn : ""}
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
                            className={`text-xl font-black ${isWinningSoon ? "text-yellow-400" : "text-white"}`}
                          >
                            {pState.chicks || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SHOW PLAYER HAND ON BOARD FOR SPECTATORS */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-zinc-800/50">
                      {p.gameHand?.map((cardType: string, idx: number) => (
                        <div
                          key={idx}
                          className="w-10 h-14 bg-black/40 border border-zinc-800 rounded-lg flex items-center justify-center text-xl shrink-0"
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

  // --- HAND VIEW LOGIC ---
  const storedName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : "";
  const currentPlayer = room.players.find((p: any) => p.name === storedName);

  return currentPlayer ? (
    <PiouPiouHand room={room} player={currentPlayer} initialLang={lang} />
  ) : null;
}
