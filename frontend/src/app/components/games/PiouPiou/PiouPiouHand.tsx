"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import Card from "./PiouPiouCard";
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

  // --- WINNING & GAME OVER LOGIC ---
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

    // Discard logic for single cards (including Fox)
    if (selectedIndices.length === 1) return t.discard;

    return t.invalidCombo;
  };

  return (
    <div
      className={`flex flex-col min-h-screen bg-black text-white font-black ${lang === "fa" ? "font-serif" : ""}`}
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      {/* --- TOP WINNER BANNER --- */}
      {isGameOver && (
        <div className="fixed top-0 left-0 w-full z-[200] animate-in slide-in-from-top">
          <div
            className={`p-4 border-b-4 border-black flex items-center justify-between ${iWon ? "bg-yellow-400" : "bg-zinc-800"}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{iWon ? "👑" : "🐥"}</span>
              <p
                className={`font-black uppercase italic tracking-tighter ${iWon ? "text-black" : "text-white"}`}
              >
                {iWon ? t.victory : `${room.gameBoard?.winner} ${t.victory}`}
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-black text-white px-4 py-1.5 rounded-lg font-black uppercase text-[10px]"
            >
              {t.lobby}
            </button>
          </div>
        </div>
      )}

      {/* --- WINNING SOON BANNER --- */}
      {!isGameOver && isWinningSoon && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm pointer-events-none">
          <div className="bg-yellow-400 border-4 border-black p-4 rounded-2xl animate-bounce text-center shadow-xl">
            <p className="text-black font-black uppercase italic leading-tight">
              {lang === "fa" ? "یک قدم تا پیروزی!" : "NEARLY HATCHED!"}
            </p>
          </div>
        </div>
      )}

      {/* --- DEFENSE OVERLAY --- */}
      {isBeingAttacked && !isGameOver && (
        <div className="fixed inset-0 z-[100] bg-red-600 p-10 flex flex-col items-center justify-center text-center">
          <h2 className="text-6xl italic mb-4 uppercase tracking-tighter">
            {t.attack}!
          </h2>
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <button
              onClick={() => {
                const roosters = player.gameHand
                  .map((c: string, i: number) => (c === "ROOSTER" ? i : -1))
                  .filter((i: number) => i !== -1)
                  .slice(0, 2);
                if (roosters.length === 2) handleAction("DEFEND", roosters);
                else alert("Need 2 Roosters!");
              }}
              className="py-6 bg-white text-black rounded-2xl font-black uppercase shadow-xl"
            >
              {t.defend} (2 🐓)
            </button>
            <button
              onClick={() => handleAction("ACCEPT", [])}
              className="py-6 bg-black/40 border border-white/20 rounded-2xl font-black uppercase"
            >
              {t.accept}
            </button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div
        className={`p-4 flex justify-between items-center bg-zinc-900/50 border-b border-zinc-800 ${isGameOver ? "mt-16" : ""}`}
      >
        <div className="text-[10px] text-zinc-500 tracking-widest uppercase">
          {isGameOver ? t.gameOver : isMyTurn ? t.activeTurn : t.waiting}
        </div>
        <div className="flex gap-1">
          {["en", "fr", "de", "fa"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l as Language)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black ${lang === l ? "bg-white text-black" : "text-zinc-600"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] text-center">
            <p className="text-[9px] text-zinc-600 font-black mb-1 uppercase">
              {t.eggs}
            </p>
            <span className="text-4xl italic">
              🥚 {player.state?.eggs || 0}
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] text-center">
            <p className="text-[9px] text-zinc-600 font-black mb-1 uppercase">
              {t.chicks}
            </p>
            <span className="text-4xl italic text-teal-500">
              🐣 {player.state?.chicks || 0}
            </span>
          </div>
        </div>

        {isFoxSelected && isMyTurn && !isGameOver && (
          <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 flex flex-col gap-4">
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest text-center">
              {t.targetPlayer}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {room.players
                .filter(
                  (p: any) => p._id !== player._id && (p.state?.eggs || 0) > 0,
                )
                .map((p: any) => (
                  <button
                    key={p._id}
                    onClick={() => setTargetId(p._id)}
                    className={`px-4 py-2 rounded-xl border font-black text-xs ${targetId === p._id ? "bg-teal-500 text-black border-white" : "bg-black border-zinc-800 text-zinc-500"}`}
                  >
                    {p.name}
                  </button>
                ))}
            </div>
            <button
              onClick={() => handleAction("DISCARD")}
              className="text-[10px] text-zinc-600 font-black uppercase underline decoration-zinc-800 underline-offset-4"
            >
              {t.discard} FOX
            </button>
          </div>
        )}

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
                !isGameOver &&
                !pending &&
                isMyTurn &&
                setSelectedIndices((prev) =>
                  prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
                )
              }
            >
              <Card type={type} selected={selectedIndices.includes(i)} />
              {selectedIndices.includes(i) && (
                <div className="absolute -top-3 -right-3 bg-teal-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-xs border-4 border-black font-black">
                  ✓
                </div>
              )}
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
            !isMyTurn ||
            selectedIndices.length === 0 ||
            isGameOver ||
            !!pending ||
            (selectedIndices.length > 1 &&
              getButtonLabel() === t.invalidCombo) ||
            (isFoxSelected && !targetId)
          }
          className={`w-full py-8 rounded-[2rem] text-3xl font-black uppercase transition-all ${!isGameOver && isMyTurn && selectedIndices.length > 0 && getButtonLabel() !== t.invalidCombo && (!isFoxSelected || targetId) ? "bg-white text-black shadow-2xl" : "bg-zinc-900 text-zinc-800 opacity-50"}`}
        >
          {isGameOver ? t.gameOver : getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
