"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import PiouPiouHand from "../../components/games/PiouPiou/PiouPiouHand";
import DixitHand from "../../components/games/Dixit/DixitHand";
import DixitCard from "../../components/games/Dixit/DixitCard";
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

  const room = useQuery((api as any).engine.getRoomState, {
    roomCode: params.roomId,
  });
  const startMatch = useMutation((api as any).engine.startGame);

  const setLanguage = (newLang: Language) => {
    const p = new URLSearchParams(searchParams);
    p.set("lang", newLang);
    router.replace(`${pathname}?${p.toString()}`);
  };

  if (!room) return <div className="min-h-screen bg-black" />;

  // Destructure with fallbacks for type safety
  const { gameBoard = {} } = room;

  if (searchParams.get("view") === "board") {
    const isGameOver = room.status === "FINISHED";
    const winnerName = gameBoard.winner;
    const isDixit = room.currentGame?.toLowerCase() === "dixit";
    const phase = gameBoard.phase;

    return (
      <main
        className={`min-h-screen bg-black text-white p-6 lg:p-12 space-y-12 max-w-7xl mx-auto ${lang === "fa" ? "font-serif" : ""}`}
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter text-teal-500 uppercase">
              {params.roomId}
            </h1>
            <p className="text-zinc-500 font-bold tracking-[0.4em] text-[10px] uppercase">
              {isDixit ? t.dixit_title : t.pioupiou_title} • {t.title}
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

        {isDixit && room.status === "PLAYING" && (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <section className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-[3rem] text-center space-y-6">
              <p className="text-xs font-black tracking-[0.5em] text-teal-500 uppercase">
                {phase === "CLUE" ? t.waiting : t.activeTurn}
              </p>
              <h2 className="text-7xl font-black italic uppercase tracking-tighter">
                {gameBoard.currentClue ? `"${gameBoard.currentClue}"` : "..."}
              </h2>
              <div className="w-12 h-1 bg-teal-500 mx-auto rounded-full" />
            </section>

            <div className="flex flex-wrap justify-center gap-6">
              {(gameBoard.submittedCards || []).map(
                (submission: any, i: number) => {
                  const votesForCard = (gameBoard.votes || []).filter(
                    (v: any) => v.cardId === submission.cardId,
                  ).length;
                  const owner = room.players.find(
                    (p: any) => p._id === submission.playerId,
                  );

                  return (
                    <DixitCard
                      key={i}
                      cardId={submission.cardId}
                      isRevealed={phase === "VOTING" || isGameOver}
                      ownerName={isGameOver ? owner?.name : undefined}
                      votes={isGameOver ? votesForCard : 0}
                    />
                  );
                },
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase">
                  {t.matchActivity}
                </h2>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-hidden relative">
                {(gameBoard.history ?? []).length > 0 ? (
                  gameBoard.history?.map((entry: any, i: number) => (
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

          <div className="lg:col-span-8 space-y-8">
            <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
              <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase">
                {t.players}
              </h2>

              {isGameOver && (
                <div className="animate-in fade-in slide-in-from-right duration-500">
                  <div className="bg-teal-500 text-black px-4 py-1 rounded-full flex items-center gap-2 shadow-[4px_4px_0_0_#000] border-2 border-black">
                    <span className="text-sm">🏆</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t.gameOver}: {winnerName}
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
                    {isWinner && (
                      <div className="absolute -top-4 left-6 bg-teal-500 text-black px-4 py-1 rounded-full border-2 border-black shadow-[2px_2px_0_0_#000] z-20 flex items-center gap-2">
                        <span className="text-xs">👑</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                          {t.winner}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-teal-500 tracking-widest uppercase">
                          {isWinner
                            ? t.champion
                            : isTurn && !isGameOver
                              ? t.activeTurn
                              : ""}
                        </p>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter truncate max-w-[180px]">
                          {p.name}
                        </h3>
                      </div>
                      <div className="flex gap-4 items-center">
                        {!isDixit ? (
                          <>
                            <div className="text-center">
                              <span className="text-2xl block">🥚</span>
                              <span className="text-sm font-black text-zinc-500">
                                {pState.eggs || 0}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-2xl block">🐣</span>
                              <span className="text-xl font-black">
                                {pState.chicks || 0}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] block font-black text-zinc-500 tracking-widest">
                              {t.dixit_score}
                            </span>
                            <span className="text-3xl font-black text-teal-500">
                              {pState.score || 0}
                            </span>
                          </div>
                        )}
                      </div>
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

  if (!currentPlayer) return null;

  return room.currentGame?.toLowerCase() === "dixit" ? (
    <DixitHand room={room} player={currentPlayer} initialLang={lang} />
  ) : (
    <PiouPiouHand room={room} player={currentPlayer} initialLang={lang} />
  );
}
