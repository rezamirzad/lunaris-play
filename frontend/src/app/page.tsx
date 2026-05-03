"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import GameCatalog from "./components/GameCatalog";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const router = useRouter();
  const join = useMutation(api.engine.joinRoom);

  // Prevent hydration mismatch errors by waiting for mount
  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem("playerName");
    if (savedName) setName(savedName);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    setIsJoining(true);
    try {
      const upperCode = code.toUpperCase().trim();
      await join({ roomCode: upperCode, playerName: name.trim() });

      // Save name for next time
      localStorage.setItem("playerName", name.trim());

      // Redirect to the player's hand view
      router.push(`/room/${upperCode}?view=hand`);
    } catch (err) {
      console.error("Join failed:", err);
      setIsJoining(false);
    }
  };

  // Only render the UI once the client is ready
  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row items-center justify-center p-8 lg:p-24 gap-16 lg:gap-32">
      {/* LEFT COLUMN: JOIN FORM */}
      <div className="w-full max-w-sm space-y-12">
        <header className="space-y-2">
          <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
            Lunaris
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 bg-teal-500"></span>
            <p className="text-teal-500 font-black uppercase tracking-[0.3em] text-[10px]">
              Mobile Controller
            </p>
          </div>
        </header>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">
              Your Identity
            </label>
            <input
              type="text"
              placeholder="ENTER NAME"
              required
              autoComplete="off"
              className="w-full bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 focus:border-teal-500 focus:outline-none transition-all placeholder:text-zinc-700 font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">
              Room Entrance
            </label>
            <input
              type="text"
              placeholder="ROOM CODE"
              required
              maxLength={4}
              autoComplete="off"
              className="w-full bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 focus:border-teal-500 focus:outline-none transition-all text-center text-2xl font-black tracking-[0.2em] placeholder:text-zinc-700"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <button
            disabled={isJoining}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-teal-500/10 
              ${
                isJoining
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-black hover:bg-teal-500 active:scale-95"
              }`}
          >
            {isJoining ? "Connecting..." : "Enter Lobby"}
          </button>
        </form>

        <footer className="pt-8 border-t border-zinc-900">
          <p className="text-zinc-600 text-[10px] leading-relaxed uppercase font-medium">
            Connect your phone to play. <br />
            Select a game from the arcade to host.
          </p>
        </footer>
      </div>

      {/* RIGHT COLUMN: GAME CATALOG */}
      <div className="flex-1 w-full max-w-3xl">
        <div className="mb-8 flex items-end justify-between border-b border-zinc-900 pb-4">
          <h2 className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.5em]">
            The Arcade
          </h2>
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
            V1.0.4 - DEV
          </span>
        </div>

        <GameCatalog />
      </div>
    </main>
  );
}
