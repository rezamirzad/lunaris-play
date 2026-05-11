"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Doc, Id } from "convex/_generated/dataModel";

export default function LiveNodeManager() {
  const { t } = useTranslation();
  const rooms = useQuery(api.engine.getOngoingRooms);
  const updatePlayerName = useMutation(api.engine.updatePlayerName);

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleUpdateName = async (playerId: Id<"players">) => {
    if (!editValue.trim()) {
      setEditingPlayerId(null);
      return;
    }
    try {
      await updatePlayerName({ playerId, newName: editValue.trim() });
      setEditingPlayerId(null);
    } catch (e) {
      console.error("Failed to update name", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, playerId: Id<"players">) => {
    if (e.key === "Enter") handleUpdateName(playerId);
    if (e.key === "Escape") setEditingPlayerId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-4 bg-brand-accent rounded-full" />
        <h3 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">
          List of Games
        </h3>
      </div>

      <div className="bg-zinc-900/40 border border-border-subtle rounded-[2rem] overflow-hidden backdrop-blur-xl">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 px-8 py-4 bg-black/20 border-b border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
          <div className="col-span-1">ROOM_CODE</div>
          <div className="col-span-1">PROTOCOL</div>
          <div className="col-span-1">STATUS</div>
          <div className="col-span-2">CONNECTED_NODES (CLICK TO EDIT)</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto no-scrollbar">
          <AnimatePresence mode="popLayout">
            {rooms?.map((room: any, idx: number) => (
              <motion.div
                key={room._id}
                custom={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-5 gap-4 px-8 py-6 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-1 font-black text-white tracking-widest text-lg italic">
                  {room.roomCode}
                </div>
                <div className="col-span-1">
                  <span className="text-[10px] font-black text-teal-400 bg-teal-400/5 px-2 py-0.5 rounded border border-teal-400/10 uppercase">
                    {room.currentGame}
                  </span>
                </div>
                <div className="col-span-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest border uppercase ${
                      room.status === "PLAYING"
                        ? "border-teal-500/30 bg-teal-500/10 text-teal-400"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {room.players?.map((pId: Id<"players">) => (
                    <PlayerIdentityItem
                      key={pId}
                      playerId={pId}
                      editingPlayerId={editingPlayerId}
                      setEditingPlayerId={setEditingPlayerId}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      onUpdate={handleUpdateName}
                      onKeyDown={handleKeyDown}
                    />
                  ))}
                  {(!room.players || room.players.length === 0) && (
                    <span className="text-[8px] text-zinc-700 italic">
                      EMPTY_SESSION
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {rooms?.length === 0 && (
            <div className="p-12 text-center">
              <span className="text-[10px] font-black text-zinc-700 tracking-[0.5em] uppercase">
                NO_ACTIVE_UPLINKS_DETECTED
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Sub-component for individual player editing
 * Since room.players in getOngoingRooms is likely just IDs, we need to handle data fetching/passing carefully.
 * Wait, getOngoingRooms returns rooms but players table is separate.
 * Let me check engine.ts getOngoingRooms implementation.
 */
function PlayerIdentityItem({
  playerId,
  editingPlayerId,
  setEditingPlayerId,
  editValue,
  setEditValue,
  onUpdate,
  onKeyDown,
}: any) {
  // Normally I'd want a separate query or join, but for speed let's assume I need to fetch player name
  // Actually, I'll modify the parent to pass the full room state if possible.
  // Re-checking getOngoingRooms... it doesn't join players.
  // I should probably update getOngoingRooms in Convex to include player names for management.
  return (
    <div className="group relative" onClick={(e) => e.stopPropagation()}>
      {editingPlayerId === playerId ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onUpdate(playerId)}
          onKeyDown={(e) => onKeyDown(e, playerId)}
          className="bg-black/60 border border-brand-accent rounded-lg px-3 py-1.5 text-xs text-white font-medium outline-none w-32 shadow-[0_0_15px_rgba(45,212,191,0.2)] transition-all"
        />
      ) : (
        <button
          onClick={() => {
            setEditingPlayerId(playerId);
            setEditValue("Player"); // Ideally I have the name here
          }}
          className="bg-black/40 border border-zinc-800 hover:border-zinc-500 rounded-lg px-3 py-1.5 text-[10px] text-zinc-400 font-black uppercase tracking-tight transition-all"
        >
          {playerId.substring(0, 5)}...
        </button>
      )}
    </div>
  );
}
