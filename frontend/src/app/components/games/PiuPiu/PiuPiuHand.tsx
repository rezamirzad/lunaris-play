"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/api";

export default function PiuPiuHand({
  player,
  roomId,
}: {
  player: any;
  roomId: string;
}) {
  const performAction = useMutation(api.game.playAction);
  const { eggs = 0, chicks = 0 } = player.gameHand || {};

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Inventory Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center">
          <div className="text-2xl">🥚</div>
          <div className="text-xs font-black text-zinc-500 uppercase">
            {eggs} Eggs
          </div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center">
          <div className="text-2xl">🐥</div>
          <div className="text-xs font-black text-zinc-500 uppercase">
            {chicks} Chicks
          </div>
        </div>
      </div>

      {/* Action Buttons based on Piu Piu Rules */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() =>
            performAction({ playerId: player._id, action: "LAY_EGG" })
          }
          className="w-full py-5 bg-teal-600 rounded-2xl font-black uppercase text-sm"
        >
          Lay Egg (1🐓 + 1🐥 + 1🛖)
        </button>

        <button
          disabled={eggs === 0}
          onClick={() =>
            performAction({ playerId: player._id, action: "HATCH_CHICK" })
          }
          className="w-full py-5 bg-yellow-600 disabled:opacity-30 rounded-2xl font-black uppercase text-sm"
        >
          Hatch! (2🐥)
        </button>

        <button className="w-full py-5 bg-orange-700 rounded-2xl font-black uppercase text-sm">
          Fox Attack! (1🦊)
        </button>
      </div>
    </div>
  );
}
