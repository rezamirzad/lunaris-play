"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import GameCatalog from "./components/GameCatalog";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Language>("en");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const ongoingRooms = useQuery((api as any).engine.getOngoingRooms);

  useEffect(() => {
    const l = searchParams.get("lang") as Language;
    if (l && ["en", "fr", "de", "fa"].includes(l)) {
      setLang(l);
    }
    const savedName = localStorage.getItem("playerName");
    if (savedName) setName(savedName);
  }, [searchParams]);

  const t = translations[lang];
  const isRTL = lang === "fa";

  const updateLang = (newLang: Language) => {
    setLang(newLang);
    const params = new URLSearchParams(searchParams);
    params.set("lang", newLang);
    router.replace(`/?${params.toString()}`);
  };

  const handleJoin = () => {
    if (!name || !roomCode) return;
    localStorage.setItem("playerName", name);
    router.push(`/room/${roomCode.toUpperCase()}?lang=${lang}`);
  };

  const handleHost = (slug: string) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/room/${code}?lang=${lang}&game=${slug}&view=board`);
  };

  return (
    <main
      className={`min-h-screen bg-black text-white p-4 sm:p-8 md:p-12 transition-all duration-500 ${isRTL ? "font-serif" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* HEADER SECTION - Constrained to 6xl for a tighter look */}
      <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-8 mb-12 sm:mb-16 px-2 sm:px-0">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-white leading-none uppercase">
            {t.title}
          </h1>
          <p className="text-teal-400 font-bold tracking-[0.3em] text-[10px] sm:text-xs mt-2 uppercase">
            {t.subtitle}
          </p>
        </div>

        {/* FLOATING LANGUAGE SELECTOR */}
        <div className="flex bg-zinc-900/80 backdrop-blur-md p-1 rounded-2xl border border-zinc-800 shadow-xl self-center sm:self-center">
          {(["en", "fr", "de", "fa"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => updateLang(l)}
              className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-300 ${
                lang === l
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* LEFT COLUMN: JOIN & SESSIONS */}
        <div className="lg:col-span-4 space-y-10">
          {/* JOIN ROOM CARD */}
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            <h2 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
              {t.enterLobby}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-teal-500 outline-none transition-all placeholder:text-zinc-800"
              />
              <input
                type="text"
                placeholder={t.roomPlaceholder}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-black/50 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-teal-500 outline-none transition-all text-center tracking-[0.2em] placeholder:tracking-normal placeholder:text-zinc-800"
              />
              <button
                onClick={handleJoin}
                className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black py-5 rounded-2xl text-xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_15px_30px_rgba(20,184,166,0.2)]"
              >
                {t.enterLobby}
              </button>
            </div>
          </section>

          {/* ONGOING SESSIONS */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase px-4">
              {t.ongoingGames}
            </h2>
            <div className="space-y-3">
              {!ongoingRooms || ongoingRooms.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-zinc-900 rounded-[2rem] text-center opacity-40">
                  <p className="text-zinc-600 font-bold uppercase text-[9px] tracking-[0.3em]">
                    {t.noOngoing}
                  </p>
                </div>
              ) : (
                ongoingRooms.map((room: any) => (
                  <div
                    key={room._id}
                    className="group bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2rem] flex justify-between items-center hover:border-teal-500/50 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-xl font-black italic text-white tracking-tighter">
                        {room.roomCode}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                        {room.currentGame}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/room/${room.roomCode}?lang=${lang}&view=board`,
                        )
                      }
                      className="bg-zinc-800 group-hover:bg-white group-hover:text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                      {t.lobby}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: CATALOG */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-zinc-600 uppercase">
              {t.arcade}
            </h2>
          </div>
          <GameCatalog lang={lang} onHost={handleHost} />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-20">
        <span className="text-[9px] font-black tracking-[0.4em] uppercase">
          {t.footer}
        </span>
        <div className="flex gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
        </div>
      </footer>
    </main>
  );
}
