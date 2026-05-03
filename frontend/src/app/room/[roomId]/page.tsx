"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
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

  if (searchParams.get("view") === "board") {
    const warning = room.gameBoard?.lastWarning;

    return (
      <main
        className={`min-h-screen bg-black text-white p-6 lg:p-12 space-y-12 max-w-7xl mx-auto ${lang === "fa" ? "font-serif" : ""}`}
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        {/* HEADER: MATCHES MAIN PAGE STYLE */}
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

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN: ACTIVITY LOG */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase">
                  {t.matchActivity}
                </h2>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-hidden relative">
                {/* Added ?. and ?? [] to guarantee an array */}
                {(room.gameBoard?.history ?? []).length > 0 ? (
                  room.gameBoard?.history?.map((entry: any, i: number) => (
                    <div
                      key={i}
                      className={`transition-all duration-700 ${i === 0 ? "opacity-100 scale-100" : "opacity-30 scale-95"}`}
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
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
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

          {/* RIGHT COLUMN: PLAYER CARDS */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase border-b border-zinc-900 pb-4">
              {t.players}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {room.players.map((p: any) => {
                const isTurn =
                  room.turnOrder?.[room.currentTurnIndex] === p._id;
                const pState = p.state || {};
                return (
                  <div
                    key={p._id}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex justify-between items-center ${
                      isTurn
                        ? "bg-zinc-900 border-teal-500 shadow-[0_0_40px_rgba(20,184,166,0.1)] scale-[1.02]"
                        : "bg-zinc-900/20 border-zinc-800 opacity-60"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-black text-teal-500 tracking-widest uppercase">
                        {isTurn ? t.activeTurn : ""}
                      </p>
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter truncate max-w-[180px]">
                        {p.name}
                      </h3>
                    </div>

                    <div className="flex gap-6 items-center">
                      <div className="text-center">
                        <span className="text-3xl block">🥚</span>
                        <span className="text-sm font-black text-zinc-500">
                          {pState.eggs || 0}
                        </span>
                      </div>
                      <div className="w-px h-10 bg-zinc-800" />
                      <div className="text-center">
                        <span className="text-3xl block">🐣</span>
                        <span className="text-2xl font-black text-white">
                          {pState.chicks || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DYNAMIC WARNING OVERLAY */}
        {room.gameBoard?.lastWarning && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-8 py-3 rounded-full font-black uppercase italic tracking-widest animate-bounce shadow-2xl">
            ⚠️{" "}
            {formatLog(
              translations[lang][
                room.gameBoard.lastWarning.key as keyof TranslationSet
              ] as string,
              room.gameBoard.lastWarning.data || {},
            )}
          </div>
        )}
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
