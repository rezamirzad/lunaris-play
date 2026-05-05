"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook

export default function LobbyStartButton({
  room,
  players,
}: {
  room: any;
  players: any[];
}) {
  const { t } = useTranslation(); // Destructured localized translation set

  // Temporary 'any' cast to bypass the TypeScript sync lock
  const startMatch = useMutation((api as any).games.pioupiou.startMatch);

  const handleStartMatch = async () => {
    try {
      console.log("Initiating Match Protocol...");
      await startMatch({ roomId: room._id });
    } catch (error) {
      console.error("Match Initiation Failed", error);
    }
  };

  const canExecute = players.length >= 2;

  return (
    <div className="space-y-3 w-full max-w-xs mx-auto">
      <button
        disabled={!canExecute}
        onClick={handleStartMatch}
        className={`w-full py-4 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all active:scale-95 ${
          canExecute
            ? "border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.15)]"
            : "opacity-20 cursor-not-allowed border-white/10 text-zinc-500"
        }`}
      >
        {/* Refactored to use localized t.startMatch and t.waitingPlayers[cite: 2] */}
        {canExecute ? t.startMatch : t.waitingPlayers}
      </button>
    </div>
  );
}
