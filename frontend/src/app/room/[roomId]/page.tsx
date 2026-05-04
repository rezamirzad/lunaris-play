"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import DixitHand from "../../components/games/Dixit/DixitHand";
import DixitCard from "../../components/games/Dixit/DixitCard";
import {
  translations,
  Language,
  formatLog,
  TranslationSet,
  toPersianDigits,
} from "@/lib/translations";

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lang = (searchParams.get("lang") as Language) || "en";
  const t = translations[lang];
  const isFA = lang === "fa";

  const room = useQuery((api as any).engine.getRoomState, {
    roomCode: params.roomId,
  });
  const games = useQuery((api as any).engine.listGames);
  const triggerAction = useMutation((api as any).games.dixit.handleAction);
  const startGame = useMutation((api as any).engine.startGame);

  const setLanguage = (newLang: Language) => {
    const p = new URLSearchParams(searchParams);
    p.set("lang", newLang);
    router.replace(`${pathname}?${p.toString()}`);
  };

  const shuffledCards = useMemo(() => {
    if (!room?.gameBoard?.submittedCards) return [];
    const cards = [...room.gameBoard.submittedCards];
    const seed = `${room._id}${room.gameBoard.currentClue || ""}`;

    return cards.sort((a, b) => {
      const hashA = hashString(a.cardId + seed);
      const hashB = hashString(b.cardId + seed);
      return hashA - hashB;
    });
  }, [
    room?._id,
    room?.gameBoard?.submittedCards,
    room?.gameBoard?.currentClue,
  ]);

  if (room === undefined || games === undefined)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-teal-500 font-black animate-pulse uppercase">
        LOADING...
      </div>
    );

  if (!room)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase">
        ROOM NOT FOUND
      </div>
    );

  const { gameBoard = {} } = room;
  const isBoardView = searchParams.get("view") === "board";

  if (isBoardView) {
    const isLobby = room.status === "LOBBY";
    const isPlaying = room.status === "PLAYING";
    const isGameOver = room.status === "FINISHED";
    const phase = gameBoard.phase;
    const storytellerId = room.turnOrder?.[room.currentTurnIndex];
    const nextStoryteller = room.players.find(
      (p: any) =>
        p._id ===
        room.turnOrder?.[(room.currentTurnIndex + 1) % room.turnOrder.length],
    );

    return (
      <main className="min-h-screen bg-black text-white p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter text-teal-500 uppercase">
              {params.roomId}
            </h1>
            <p className="text-zinc-500 font-bold tracking-[0.4em] text-[10px] uppercase">
              {t.dixit_title} • {t.title}
            </p>
          </div>
          <div className="flex items-center gap-6">
            {isLobby && room.players.length >= 2 && (
              <button
                onClick={() => startGame({ roomId: room._id })}
                className="bg-teal-500 text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all animate-pulse"
              >
                {t.startMatch}
              </button>
            )}
            {phase === "RESULTS" && !isGameOver && (
              <button
                onClick={() =>
                  triggerAction({
                    playerId: storytellerId,
                    actionType: "NEXT_ROUND",
                  })
                }
                className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-teal-500 transition-all animate-pulse"
              >
                {t.startMatch}
              </button>
            )}
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
          </div>
        </header>

        {isPlaying && (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <section className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[3rem] text-center space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-black tracking-[0.5em] text-teal-500 uppercase">
                  {phase === "RESULTS"
                    ? t.results
                    : phase === "VOTING"
                      ? t.dixit_guess_card
                      : t.activeTurn}
                </p>
                <h2 className="text-7xl font-black italic uppercase tracking-tighter">
                  {gameBoard.currentClue ? `"${gameBoard.currentClue}"` : "..."}
                </h2>
                {phase === "RESULTS" && (
                  <p className="text-zinc-400 font-black uppercase text-sm tracking-widest pt-2">
                    {t.waiting}{" "}
                    <span className="text-white">{nextStoryteller?.name}</span>
                  </p>
                )}
              </div>

              {(phase === "SUBMITTING" || phase === "VOTING") && (
                <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-white/5">
                  {room.players.map((p: any) => {
                    const isST = storytellerId === p._id;
                    const hasSub = (gameBoard.submittedCards || []).some(
                      (s: any) => s.playerId === p._id,
                    );
                    const hasVoted = (gameBoard.votes || []).some(
                      (v: any) => v.voterId === p._id,
                    );
                    const isReady =
                      phase === "SUBMITTING"
                        ? isST || hasSub
                        : isST || hasVoted;
                    return (
                      <div
                        key={p._id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isST ? "bg-teal-500/20 border-teal-500 text-teal-400" : isReady ? "bg-white border-white text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500 opacity-40"}`}
                      >
                        <span className="text-[9px] font-black uppercase tracking-tight">
                          {isST ? `⚡ ${p.name}` : p.name}
                        </span>
                        {!isST && (
                          <span className="text-[9px] font-black">
                            {isReady ? "✓" : "..."}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center items-start w-full px-4">
              {shuffledCards.map((submission: any, i: number) => {
                const voters = (gameBoard.votes || [])
                  .filter((v: any) => v.cardId === submission.cardId)
                  .map(
                    (v: any) =>
                      room.players.find((p: any) => p._id === v.voterId)?.name,
                  );
                const isSTCard = submission.playerId === storytellerId;
                const owner = room.players.find(
                  (p: any) => p._id === submission.playerId,
                );
                const roundPoints =
                  gameBoard.roundResults?.pointsEarned?.[submission.playerId] ||
                  0;
                const showImage = phase === "VOTING" || phase === "RESULTS";

                return (
                  <div
                    key={submission.cardId + i}
                    className="flex flex-col items-center gap-4 w-full max-w-[200px]"
                  >
                    <div className="h-6 flex items-center">
                      {phase === "RESULTS" && (
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest text-center ${isSTCard ? "text-teal-500" : "text-zinc-500"}`}
                        >
                          {isSTCard ? t.storyteller : owner?.name}
                        </span>
                      )}
                    </div>
                    <div
                      className={`relative w-full aspect-[2/3] transition-all duration-700 ${phase === "RESULTS" && isSTCard ? "ring-4 ring-teal-500 ring-offset-4 ring-offset-black rounded-2xl scale-105" : ""}`}
                    >
                      <DixitCard
                        cardId={submission.cardId}
                        isRevealed={showImage}
                      />
                    </div>
                    {phase === "RESULTS" && (
                      <div className="w-full flex flex-col gap-2 items-center animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex gap-1 flex-wrap justify-center">
                          {voters.map((vName: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-white text-black text-[8px] px-2 py-0.5 rounded font-black uppercase shadow-sm"
                            >
                              {vName}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-black text-teal-400">
                          +{isFA ? toPersianDigits(roundPoints) : roundPoints}{" "}
                          PTS
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
              <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase">
                {t.matchActivity}
              </h2>
              <div className="space-y-6 max-h-[50vh] overflow-hidden relative">
                {(gameBoard.history ?? []).map((entry: any, i: number) => (
                  <p
                    key={i}
                    className={`text-lg font-black italic uppercase leading-tight ${i === 0 ? "opacity-100" : "opacity-30"}`}
                  >
                    {formatLog(
                      translations[lang][
                        entry.key as keyof TranslationSet
                      ] as string,
                      entry.data || {},
                      lang,
                    )}
                  </p>
                ))}
              </div>
            </section>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase">
              {t.players}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {room.players.map((p: any) => {
                const isTurn = storytellerId === p._id;
                const pState = p.state || {};
                const earned =
                  gameBoard.roundResults?.pointsEarned?.[p._id] || 0;
                return (
                  <div
                    key={p._id}
                    className={`relative p-8 rounded-[2.5rem] border-2 transition-all ${isTurn && !isGameOver ? "bg-zinc-900 border-teal-500 scale-[1.02]" : "bg-zinc-900/20 border-zinc-800 opacity-60"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-teal-500 tracking-widest uppercase">
                          {isTurn && !isGameOver ? t.activeTurn : ""}
                        </p>
                        <h3 className="text-4xl font-black italic uppercase truncate max-w-[180px]">
                          {p.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block font-black text-zinc-500 tracking-widest">
                          {t.dixit_score}
                        </span>
                        <span className="text-3xl font-black text-teal-500">
                          {isFA
                            ? toPersianDigits(pState.score || 0)
                            : pState.score || 0}
                        </span>
                        {phase === "RESULTS" && earned > 0 && (
                          <span className="text-xs font-black block text-teal-400 animate-bounce mt-1">
                            +{isFA ? toPersianDigits(earned) : earned}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LEGEND PLACED AT THE BOTTOM */}
        {phase === "RESULTS" && (
          <footer className="flex flex-wrap justify-center gap-12 py-8 opacity-40 hover:opacity-100 transition-opacity border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                {t.storyteller}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 rounded bg-white text-black text-[8px] font-black uppercase">
                NAME
              </div>
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                {t.dixit_who_voted}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-teal-400 font-black text-[10px]">
                +3 PTS
              </span>
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">
                {t.dixit_score}
              </span>
            </div>
          </footer>
        )}
      </main>
    );
  }

  const storedName =
    typeof window !== "undefined" ? localStorage.getItem("playerName") : "";
  const currentPlayer = room.players.find((p: any) => p.name === storedName);
  if (!currentPlayer)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 uppercase font-black italic">
        <button
          onClick={() => router.push("/")}
          className="bg-teal-500 text-black px-8 py-3 rounded-2xl font-black"
        >
          {t.exit}
        </button>
      </div>
    );
  return <DixitHand room={room} player={currentPlayer} initialLang={lang} />;
}
