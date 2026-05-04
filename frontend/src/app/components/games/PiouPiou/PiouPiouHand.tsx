"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Card from "./PiouPiouCard";
import ComboHints from "./ComboHints";
import { translations, Language, toPersianDigits } from "@/lib/translations";

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

  const chicks = player.state?.chicks || 0;
  const eggs = player.state?.eggs || 0;
  const isWinningSoon = chicks === 2 && eggs >= 1;

  const isGameOver = room.status === "FINISHED";
  const iWon = isGameOver && room.gameBoard?.winner === player.name;

  const selectedCards = selectedIndices.map((i) => player.gameHand[i]);
  const isFoxSelected =
    selectedCards.length === 1 && selectedCards[0] === "FOX";

  // Check for defense capability
  const roostersInHand = player.gameHand.filter((c: string) => c === "ROOSTER");
  const canDefend = roostersInHand.length >= 2;

  const handleAction = async (type: string, customIndices?: number[]) => {
    const indices = customIndices ?? selectedIndices;
    try {
      await playAction({
        playerId: player._id,
        indices: indices,
        cards: indices.map((i) => player.gameHand[i]),
        targetPlayerId: targetId || undefined,
        actionType: type,
      });
      setSelectedIndices([]);
      setTargetId(null);
    } catch (e) {
      console.error("Action failed:", e);
    }
  };

  const getButtonLabel = () => {
    if (!isMyTurn) return "...";
    if (pending) return t.waiting;
    if (selectedIndices.length === 0) return t.action;

    if (isFoxSelected) {
      return targetId ? t.attack : t.targetPlayer;
    }

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

  const isButtonEnabled =
    !isGameOver &&
    isMyTurn &&
    selectedIndices.length > 0 &&
    getButtonLabel() !== t.invalidCombo &&
    (!isFoxSelected || targetId);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-black overflow-hidden relative">
      {/* --- DYNAMIC TURN GLOW --- */}
      {isMyTurn && !isGameOver && (
        <div className="absolute inset-0 bg-teal-500/5 pointer-events-none animate-pulse z-0" />
      )}

      {/* --- TOP WINNER BANNER --- */}
      {isGameOver && (
        <div className="fixed top-0 left-0 w-full z-[200] animate-in slide-in-from-top">
          <div
            className={`p-4 border-b-4 border-black flex items-center justify-between ${iWon ? "bg-yellow-400" : "bg-zinc-800"}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{iWon ? "👑" : "🐥"}</span>
              <p
                className={`font-black uppercase italic tracking-tighter ${iWon ? "text-black" : "text-zinc-100"}`}
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

      {/* --- DEFENSE OVERLAY --- */}
      {isBeingAttacked && !isGameOver && (
        <div className="fixed inset-0 z-[300] bg-black/80 p-8 flex flex-col items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-red-600 border-4 border-black p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-5xl italic mb-4 uppercase tracking-tighter text-white drop-shadow-md">
              {t.attack}!
            </h2>

            {!canDefend && (
              <p className="text-xs bg-black/20 py-2 px-4 rounded-full mb-6 text-white/90 uppercase tracking-widest font-black">
                ⚠️ {t.noRoosters}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 w-full">
              <button
                disabled={!canDefend}
                onClick={() => {
                  const roosters = player.gameHand
                    .map((c: string, i: number) => (c === "ROOSTER" ? i : -1))
                    .filter((i: number) => i !== -1)
                    .slice(0, 2);
                  handleAction("DEFEND", roosters);
                }}
                className={`py-6 rounded-3xl font-black uppercase shadow-2xl text-xl transition-all ${
                  canDefend
                    ? "bg-white text-black active:scale-95"
                    : "bg-zinc-800/50 text-zinc-500 opacity-50 cursor-not-allowed"
                }`}
              >
                {t.defend} (2 🐓)
              </button>
              <button
                onClick={() => handleAction("ACCEPT", [])}
                className="py-4 bg-zinc-800 border-2 border-zinc-700 rounded-2xl font-black uppercase text-zinc-100 text-sm active:scale-95 transition-transform"
              >
                {t.accept}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div
        className={`p-4 flex justify-between items-center bg-zinc-900/80 border-b border-zinc-800 relative z-10 ${isGameOver ? "mt-16" : ""}`}
      >
        <div
          className={`text-[11px] tracking-widest uppercase font-black transition-colors ${isMyTurn ? "text-teal-400" : "text-zinc-100"}`}
        >
          {isGameOver ? t.gameOver : isMyTurn ? t.activeTurn : t.waiting}
        </div>
        <div className="flex gap-1">
          {["en", "fr", "de", "fa"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l as Language)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black transition-colors ${lang === l ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5 flex-1 flex flex-col relative z-10 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 py-5 rounded-[2rem] text-center shadow-inner">
            <p className="text-[10px] text-zinc-200 font-black mb-1 uppercase tracking-widest">
              {t.eggs}
            </p>
            <span className="text-4xl italic text-white">
              🥚 {lang === "fa" ? toPersianDigits(eggs) : eggs}
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 py-5 rounded-[2rem] text-center shadow-inner">
            <p className="text-[10px] text-zinc-200 font-black mb-1 uppercase tracking-widest">
              {t.chicks}
            </p>
            <span className="text-4xl italic text-teal-400">
              🐣 {lang === "fa" ? toPersianDigits(chicks) : chicks}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center">
          {!isGameOver && isWinningSoon && (
            <div
              className="bg-yellow-400 border-4 border-black p-3 rounded-2xl animate-bounce text-center shadow-xl w-full"
              dir={lang === "fa" ? "rtl" : "ltr"}
            >
              <p className="text-black font-black uppercase italic leading-tight text-sm">
                {t.nearlyWinning}
              </p>
            </div>
          )}
          {!isGameOver && isMyTurn && !pending && !isBeingAttacked && (
            <div
              className="bg-teal-500 border-4 border-black p-3 rounded-2xl animate-in slide-in-from-top-2 duration-500 text-center shadow-[0_0_40px_rgba(20,184,166,0.3)] w-full"
              dir={lang === "fa" ? "rtl" : "ltr"}
            >
              <p className="text-black font-black uppercase italic tracking-tighter text-base">
                ⚡ {t.yourTurn} ⚡
              </p>
            </div>
          )}
        </div>

        <ComboHints
          hand={player.gameHand || []}
          eggs={eggs}
          lang={lang}
          otherPlayers={room.players.filter((p: any) => p._id !== player._id)}
        />

        <div className="flex-1 flex items-center justify-center gap-3 py-4">
          {player.gameHand.map((type: string, i: number) => (
            <div
              key={i}
              className="relative transition-transform active:scale-95"
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
                <div className="absolute -top-3 -right-3 bg-teal-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-xs border-4 border-black font-black animate-in zoom-in">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 pb-10 flex flex-col gap-4 z-20">
        {isFoxSelected && isMyTurn && !isGameOver && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-zinc-100 p-4 rounded-[2rem] border-4 border-teal-500 shadow-2xl">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                  <span className="text-xl">🦊</span> {t.targetPlayer}
                </span>
                <button
                  onClick={() => handleAction("DISCARD")}
                  className="text-[10px] font-black bg-zinc-300 text-zinc-600 px-4 py-1.5 rounded-full uppercase hover:bg-zinc-400 transition-colors"
                >
                  {t.discard}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {room.players
                  .filter(
                    (p: any) =>
                      p._id !== player._id && (p.state?.eggs || 0) > 0,
                  )
                  .map((p: any) => (
                    <button
                      key={p._id}
                      onClick={() => setTargetId(p._id)}
                      className={`px-8 py-3 rounded-2xl border-2 font-black text-sm transition-all duration-200 ${
                        targetId === p._id
                          ? "bg-black text-white border-black scale-105 shadow-xl"
                          : "bg-white text-zinc-900 border-zinc-200 hover:border-black"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                {room.players.filter(
                  (p: any) => p._id !== player._id && (p.state?.eggs || 0) > 0,
                ).length === 0 && (
                  <p className="w-full text-center py-2 text-zinc-500 text-[10px] font-black uppercase italic">
                    {t.noEggsToSteal}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => handleAction(isFoxSelected ? "ATTACK" : "PLAY")}
          disabled={!isButtonEnabled}
          className={`w-full py-7 rounded-[2.5rem] text-3xl font-black uppercase transition-all ${isButtonEnabled ? "bg-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.2)]" : "bg-zinc-900 text-zinc-700 opacity-40 scale-95"}`}
        >
          {isGameOver ? t.gameOver : getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
