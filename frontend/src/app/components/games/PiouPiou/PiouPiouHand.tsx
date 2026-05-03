"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import Card from "./Card";
import ComboHints from "./ComboHints";
import { translations, Language } from "@/lib/translations";

export default function PiouPiouHand({
  room,
  player,
  initialLang,
}: {
  room: any;
  player: any;
  initialLang: Language;
}) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const t = translations[lang];
  const playAction = useMutation((api as any).games.pioupiou.handleAction);

  const isMyTurn = room.turnOrder?.[room.currentTurnIndex] === player._id;
  const pending = room.gameBoard?.pendingAttack;
  const isBeingAttacked = pending?.victimId === player._id;

  // --- LOGIC: WINNING SOON & GAME OVER ---
  const chicks = player.state?.chicks || 0;
  const eggs = player.state?.eggs || 0;
  const isWinningSoon = chicks === 2 && eggs >= 1;

  const isGameOver = room.status === "FINISHED";
  const iWon = isGameOver && room.gameBoard?.winner === player.name;

  const selectedCards = selectedIndices.map((i) => player.gameHand[i]);
  const isFoxSelected =
    selectedCards.length === 1 && selectedCards[0] === "FOX";

  const handleAction = async (type: string, customIndices?: number[]) => {
    const indices = customIndices ?? selectedIndices;
    await playAction({
      playerId: player._id,
      indices: indices,
      cards: indices.map((i) => player.gameHand[i]),
      targetPlayerId: targetId || undefined,
      actionType: type,
    });
    setSelectedIndices([]);
    setTargetId(null);
  };

  const getButtonLabel = () => {
    if (!isMyTurn) return "...";
    if (pending) return t.waiting;
    if (selectedIndices.length === 0) return t.startMatch;
    if (isFoxSelected) return t.attack;

    const hasRooster = selectedCards.includes("ROOSTER");
    const hasChicken = selectedCards.includes("CHICKEN");
    const hasNest = selectedCards.includes("NEST");
    const chickenCount = selectedCards.filter((c) => c === "CHICKEN").length;

    if (selectedIndices.length === 3 && hasRooster && hasChicken && hasNest)
      return t.hintLayEgg;
    if (selectedIndices.length === 2 && chickenCount === 2) return t.hintHatch;
    if (selectedIndices.length === 1) return t.discard;

    return t.invalidCombo;
  };

  return (
    <div
      className={`flex flex-col min-h-screen bg-black text-white font-black ${lang === "fa" ? "font-serif" : ""}`}
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      {/* --- FEATURE: GAME OVER OVERLAY --- */}
      {isGameOver && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="space-y-8 max-w-xs w-full">
            <div className="space-y-4">
              <span className="text-8xl block animate-bounce">
                {iWon ? "👑" : "🐥"}
              </span>
              <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">
                {iWon
                  ? lang === "fa"
                    ? "شما بردید!"
                    : "YOU WON!"
                  : lang === "fa"
                    ? "پایان بازی"
                    : "GAME OVER"}
              </h2>
              <p className="text-teal-500 font-black uppercase text-xs tracking-[0.2em]">
                {iWon
                  ? lang === "fa"
                    ? "تبریک! ۳ جوجه دارید"
                    : "CONGRATS! 3 CHICKS HATCHED"
                  : lang === "fa"
                    ? `${room.gameBoard?.winner} برنده شد`
                    : `${room.gameBoard?.winner} IS THE WINNER`}
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all"
            >
              {lang === "fa" ? "خروج از بازی" : "LEAVE MATCH"}
            </button>
          </div>
        </div>
      )}

      {/* --- FEATURE: WINNING SOON ALERT --- */}
      {!isGameOver && isWinningSoon && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm pointer-events-none">
          <div className="bg-yellow-400 border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0_0_#000] animate-bounce text-center">
            <p className="text-black font-black text-lg leading-tight uppercase italic">
              {lang === "fa" ? "یک قدم تا پیروزی!" : "NEARLY HATCHED!"}
            </p>
            <p className="text-black/70 font-bold text-[10px] uppercase">
              {lang === "fa" ? "جوجه سوم در راه است" : "ONE MORE EGG TO WIN"}
            </p>
          </div>
        </div>
      )}

      {/* ... rest of the existing UI (isBeingAttacked, Header, Stats, Cards) ... */}
      {isBeingAttacked && (
        <div className="fixed inset-0 z-[100] bg-red-600 p-10 flex flex-col items-center justify-center text-center animate-in fade-in">
          {/* Attack UI */}
          <h2 className="text-6xl italic mb-4 uppercase tracking-tighter">
            {t.attack}!
          </h2>
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm mt-10">
            <button
              onClick={() => {
                const roosters = player.gameHand
                  .map((c: string, i: number) => (c === "ROOSTER" ? i : -1))
                  .filter((i: number) => i !== -1)
                  .slice(0, 2);
                if (roosters.length === 2) handleAction("DEFEND", roosters);
                else alert("Not enough roosters!");
              }}
              className="py-6 bg-white text-black rounded-2xl font-black uppercase shadow-xl"
            >
              {t.defend} (2 🐓)
            </button>
            <button
              onClick={() => handleAction("ACCEPT", [])}
              className="py-6 bg-black/40 border border-white/20 rounded-2xl font-black uppercase"
            >
              {t.accept} 🥚
            </button>
          </div>
        </div>
      )}

      <div className="p-4 flex justify-between items-center bg-zinc-900/50 border-b border-zinc-800">
        <div className="text-[10px] uppercase text-zinc-500 tracking-widest">
          {isMyTurn ? t.activeTurn : t.waiting}
        </div>
        <div className="flex gap-1">
          {/* Language buttons */}
          {(["en", "fr", "de", "fa"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black ${lang === l ? "bg-white text-black" : "text-zinc-600"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Display */}
      <div className="p-6 space-y-6 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] text-center">
            <p className="text-[9px] text-zinc-600 font-black mb-1 uppercase tracking-widest">
              {t.eggs}
            </p>
            <span className="text-4xl italic">
              🥚 {player.state?.eggs || 0}
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] text-center">
            <p className="text-[9px] text-zinc-600 font-black mb-1 uppercase tracking-widest">
              {t.chicks}
            </p>
            <span className="text-4xl italic text-teal-500">
              🐣 {player.state?.chicks || 0}
            </span>
          </div>
        </div>

        {/* Card rendering and Action button continue as before... */}
        <ComboHints
          hand={player.gameHand || []}
          eggs={player.state?.eggs || 0}
          lang={lang}
        />

        <div className="flex-1 flex items-center justify-center gap-3">
          {player.gameHand.map((type: string, i: number) => (
            <div
              key={i}
              className="relative transition-transform active:scale-90"
              onClick={() =>
                !pending &&
                isMyTurn &&
                !isGameOver &&
                setSelectedIndices((prev) =>
                  prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
                )
              }
            >
              <Card type={type} selected={selectedIndices.includes(i)} />
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 pb-12">
        <button
          onClick={() =>
            isFoxSelected ? handleAction("ATTACK") : handleAction("PLAY")
          }
          disabled={
            !isMyTurn || selectedIndices.length === 0 || isGameOver || !!pending
          }
          className={`w-full py-8 rounded-[2rem] text-3xl font-black uppercase transition-all ${isMyTurn && !isGameOver && selectedIndices.length > 0 ? "bg-white text-black" : "bg-zinc-900 text-zinc-800 opacity-50"}`}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
