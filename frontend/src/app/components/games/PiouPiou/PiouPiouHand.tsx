"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import Card from "./PiouPiouCard";
import ComboHints from "./ComboHints";
import { translations, Language } from "@/lib/translations";

import { Doc } from "convex/_generated/dataModel";

export default function PiouPiouHand({
  room,
  player,
  initialLang,
}: {
  room: Doc<"rooms"> & { players: Doc<"players">[] };
  player: Doc<"players">;
  initialLang: Language;
}) {
  // Lang remains static within the session based on initialLang
  const [lang] = useState<Language>(initialLang);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const t = translations[lang] || translations.en; // Localized translation set[cite: 2]
  const playAction = useMutation(api.pioupiou.handleAction);

  // --- 1. CORE TURN LOGIC ---
  const isMyTurn = useMemo(() => {
    return (
      String(room.turnOrder?.[room.currentTurnIndex]) === String(player._id)
    );
  }, [room.turnOrder, room.currentTurnIndex, player._id]);

  // --- 2. UI HELPERS ---
  const getButtonLabel = () => {
    if (!isMyTurn) return t.waiting; // Localized: WAITING...[cite: 2]
    return t.action; // Localized: ACTION[cite: 2]
  };

  const handleAction = async (type: string, customIndices?: number[]) => {
    const indices = customIndices ?? selectedIndices;
    try {
      await playAction({
        playerId: player._id,
        indices: indices,
        cards: indices.map((i: number) => player.gameHand[i]),
        targetPlayerId: (targetId as Doc<"players">["_id"]) || undefined,
        actionType: type,
      });
      setSelectedIndices([]);
      setTargetId(null);
    } catch (e) {
      console.error("Action Protocol Failed", e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-black overflow-hidden relative">
      {/* Header synchronized with Digital Craftsmanship aesthetics */}
      <div className="p-4 flex justify-between items-center bg-zinc-900/80 border-b border-zinc-800">
        <div
          className={`text-[11px] tracking-widest uppercase ${isMyTurn ? "text-teal-400" : "text-zinc-500"}`}
        >
          {/* Localized Turn Status[cite: 2] */}
          {isMyTurn ? t.yourTurn : t.waiting}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <ComboHints
          hand={player.gameHand || []}
          eggs={player.state.gameType === "pioupiou" ? player.state.eggs || 0 : 0}
          lang={lang}
          otherPlayers={room.players.filter(
            (p) => String(p._id) !== String(player._id),
          )}
        />
        <div className="grid grid-cols-2 gap-4 py-8">
          {player.gameHand.map((type: string, i: number) => (
            <div
              key={i}
              onClick={() =>
                isMyTurn &&
                setSelectedIndices((prev) =>
                  prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
                )
              }
            >
              <Card
                cardKey={type}
                isSelected={selectedIndices.includes(i)}
                isInteractable={isMyTurn}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 pb-10">
        <button
          disabled={!isMyTurn || selectedIndices.length === 0}
          onClick={() => handleAction("PLAY")}
          className={`w-full py-7 rounded-[2.5rem] text-3xl font-black uppercase transition-all active:scale-95 touch-manipulation select-none ${
            isMyTurn
              ? "bg-white text-black shadow-xl"
              : "bg-zinc-900 text-zinc-700 opacity-40"
          }`}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
