"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import GameCatalog from "./components/GameCatalog";
import { translations, Language } from "@/lib/translations";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const router = useRouter();
  const createRoom = useMutation(api.engine.createRoom);
  const join = useMutation(api.engine.joinRoom);
  const rooms = useQuery(api.engine.getOngoingRooms) || [];
  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem("playerName");
    if (savedName) setName(savedName);
  }, []);

  const handleHost = async (gameSlug: string) => {
    const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    await createRoom({ roomCode: newCode, gameSlug: gameSlug });
    router.push(`/room/${newCode}?view=board&game=${gameSlug}`);
  };

  const handleFormJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setIsJoining(true);
    try {
      const upperCode = code.toUpperCase().trim();
      await join({ roomCode: upperCode, playerName: name.trim() });
      localStorage.setItem("playerName", name.trim());
      router.push(`/room/${upperCode}?view=hand`);
    } catch (err) {
      console.error(err);
      setIsJoining(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter">
            {t.title}
          </h1>
          <p className="text-teal-500 font-bold tracking-[0.4em] text-[10px] uppercase">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {(Object.keys(translations) as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l as Language)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === l ? "bg-white text-black" : "text-zinc-500"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase">
              {t.enterLobby}
            </h2>
            <form onSubmit={handleFormJoin} className="space-y-4">
              <input
                placeholder={t.namePlaceholder}
                className="w-full bg-black/40 p-4 rounded-xl border border-zinc-800 focus:border-teal-500 font-bold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder={t.roomPlaceholder}
                className="w-full bg-black/40 p-4 rounded-xl border border-zinc-800 focus:border-teal-500 text-center text-xl font-black"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={4}
              />
              <button
                disabled={isJoining}
                className="w-full py-4 bg-teal-500 text-black font-black rounded-xl uppercase tracking-widest disabled:opacity-50"
              >
                {isJoining ? "..." : t.enterLobby}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-500 uppercase">
              {t.ongoingGames}
            </h2>
            <div className="space-y-2">
              {rooms.map((room: any) => (
                <div
                  key={room.roomCode}
                  onClick={() => setCode(room.roomCode)}
                  className="group bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:border-teal-500/50"
                >
                  <span className="text-white group-hover:text-teal-500 font-black tracking-widest">
                    {room.roomCode}
                  </span>
                  <span className="text-[10px] text-teal-500 font-black uppercase tracking-widest">
                    JOIN
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase border-b border-zinc-900 pb-4">
            {t.arcade}
          </h2>
          <GameCatalog lang={lang} onHost={handleHost} />
        </div>
      </div>
    </main>
  );
}
