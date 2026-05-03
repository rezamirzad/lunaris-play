"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import GameCatalog from "./components/GameCatalog";
import { translations, Language } from "@/lib/translations";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const router = useRouter();
  const join = useMutation(api.engine.joinRoom);

  const t = translations[lang];

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
      localStorage.setItem("playerName", name.trim());
      router.push(`/room/${upperCode}?view=hand`);
    } catch (err) {
      console.error("Join failed:", err);
      setIsJoining(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col lg:flex-row items-center justify-center p-8 lg:p-24 gap-16 lg:gap-32 transition-all duration-500">
      <div className="w-full max-w-sm space-y-10">
        {/* Language Picker */}
        <div className="flex gap-2 justify-center lg:justify-start bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 w-fit">
          {(Object.keys(translations) as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                lang === l
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <header className="space-y-2">
          <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
            {t.title}
          </h1>
          <div className={`flex items-center gap-2`}>
            <span className="h-1 w-8 bg-teal-500"></span>
            <p className="text-teal-500 font-black uppercase tracking-[0.3em] text-[10px]">
              {t.subtitle}
            </p>
          </div>
        </header>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder={t.namePlaceholder}
            className="w-full bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 focus:border-teal-400 focus:outline-none transition-all font-bold placeholder:text-zinc-700 text-start"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder={t.roomPlaceholder}
            maxLength={4}
            className="w-full bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 focus:border-teal-400 focus:outline-none transition-all text-center text-2xl font-black tracking-[0.2em] placeholder:text-zinc-700"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button
            disabled={isJoining}
            className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-teal-500 transition-all disabled:opacity-50"
          >
            {isJoining ? "..." : t.enterLobby}
          </button>
        </form>

        <footer className="pt-8 border-t border-zinc-900">
          <p className="text-zinc-500 text-[10px] leading-relaxed uppercase font-bold tracking-tight">
            {t.footer}
          </p>
        </footer>
      </div>

      <div className="flex-1 w-full max-w-3xl">
        <div className="mb-8 flex items-end justify-between border-b border-zinc-900 pb-4">
          <h2 className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.5em]">
            {t.arcade}
          </h2>
        </div>

        {/* CRITICAL: Passing lang prop here */}
        <GameCatalog lang={lang} />
      </div>
    </main>
  );
}
