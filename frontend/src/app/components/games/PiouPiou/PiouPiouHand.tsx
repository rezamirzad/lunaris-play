"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
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

  // Helper to determine button text based on selection
  const getButtonText = () => {
    if (!isMyTurn) return "...";
    if (pending) return "WAITING";
    if (selectedIndices.length === 0) return t.arcade.split(" ")[0]; // fallback like "GAMES"

    if (isFoxSelected) return "ATTACK";

    // Using translation keys from your translations.ts
    if (selectedIndices.length === 1)
      return lang === "fa" ? "حذف کارت" : "DISCARD";
    if (selectedIndices.length === 2) return t.hintHatch;
    if (selectedIndices.length === 3) return t.hintLayEgg;

    return t.startMatch;
  };

  return (
    <div
      className={`flex flex-col min-h-screen bg-black text-white font-black ${lang === "fa" ? "font-serif" : ""}`}
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      {/* FOX ATTACK OVERLAY */}
      {isBeingAttacked && (
        <div className="fixed inset-0 z-[100] bg-red-600 p-10 flex flex-col items-center justify-center text-center animate-in fade-in">
          <h2 className="text-6xl italic mb-4 uppercase tracking-tighter">
            Fox Attack!
          </h2>
          <p className="mb-10 opacity-70 uppercase tracking-widest text-xs">
            Someone wants your egg. Defend or Accept?
          </p>
          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <button
              onClick={() => {
                const roosters = player.gameHand
                  .map((c: string, i: number) => (c === "ROOSTER" ? i : -1))
                  .filter((i: number) => i !== -1)
                  .slice(0, 2);
                if (roosters.length === 2) handleAction("DEFEND", roosters);
                else alert("Not enough roosters!");
              }}
              className="py-6 bg-white text-black rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all"
            >
              Defend (2 🐓)
            </button>
            <button
              onClick={() => handleAction("ACCEPT", [])}
              className="py-6 bg-black/40 border border-white/20 rounded-2xl font-black uppercase active:scale-95 transition-all"
            >
              Give Egg 🥚
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="p-4 flex justify-between items-center bg-zinc-900/50 border-b border-zinc-800">
        <div className="text-[10px] uppercase text-zinc-500 tracking-widest">
          {isMyTurn ? t.activeTurn : "WAITING"}
        </div>
        <div className="flex gap-1 bg-black p-1 rounded-xl border border-zinc-800">
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

      <div className="p-6 space-y-6 flex-1 flex flex-col">
        {/* STATS */}
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

        {/* TARGETING UI */}
        {isFoxSelected && isMyTurn && (
          <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 animate-in slide-in-from-top-2">
            <p className="text-[10px] text-zinc-500 mb-4 uppercase font-black tracking-widest">
              {t.targetPlayer}
            </p>
            <div className="flex flex-wrap gap-2">
              {room.players
                .filter(
                  (p: any) => p._id !== player._id && (p.state?.eggs || 0) > 0,
                )
                .map((p: any) => (
                  <button
                    key={p._id}
                    onClick={() => setTargetId(p._id)}
                    className={`px-4 py-2 rounded-xl border font-black text-xs transition-all ${targetId === p._id ? "bg-teal-500 border-white text-black scale-105" : "bg-black border-zinc-800 text-zinc-500"}`}
                  >
                    {p.name}
                  </button>
                ))}
              <button
                onClick={() => handleAction("DISCARD")}
                className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase ml-auto"
              >
                Just Discard
              </button>
            </div>
          </div>
        )}

        <ComboHints
          hand={player.gameHand || []}
          eggs={player.state?.eggs || 0}
          lang={lang}
        />

        {/* CARDS */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {player.gameHand.map((type: string, i: number) => (
            <div
              key={i}
              className="relative transition-transform active:scale-90"
              onClick={() =>
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

      {/* FOOTER ACTION */}
      <div className="p-8 pb-12">
        <button
          onClick={() =>
            isFoxSelected ? handleAction("ATTACK") : handleAction("PLAY")
          }
          disabled={
            !isMyTurn ||
            selectedIndices.length === 0 ||
            (isFoxSelected && !targetId) ||
            !!pending
          }
          className={`w-full py-8 rounded-[2rem] text-3xl font-black uppercase transition-all ${isMyTurn && selectedIndices.length > 0 && (!isFoxSelected || targetId) ? "bg-white text-black shadow-2xl active:scale-95" : "bg-zinc-900 text-zinc-800 opacity-50"}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}
