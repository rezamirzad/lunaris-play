"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import GameCatalog from "./components/GameCatalog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Language>("en");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const ongoingRooms = useQuery((api as any).engine.getOngoingRooms);
  const createRoom = useMutation((api as any).engine.createRoom);
  const joinRoom = useMutation((api as any).engine.joinRoom);

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

  const handleJoin = async () => {
    if (!name || !roomCode) return;
    const cleanCode = roomCode.toUpperCase();
    try {
      // 1. Actually join in the database
      await joinRoom({ roomCode: cleanCode, playerName: name });
      // 2. Persist name for the room page check
      localStorage.setItem("playerName", name);
      // 3. Navigate to player view (no board param)
      router.push(`/room/${cleanCode}?lang=${lang}`);
    } catch (error) {
      console.error("Join failed:", error);
    }
  };

  const selectRoomForJoining = (code: string) => {
    setRoomCode(code.toUpperCase());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewBoard = (code: string) => {
    router.push(`/room/${code.toUpperCase()}?lang=${lang}&view=board`);
  };

  const handleHost = async (slug: string) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    try {
      await createRoom({ roomCode: code, gameSlug: slug });
      router.push(`/room/${code}?lang=${lang}&game=${slug}&view=board`);
    } catch (e) {
      console.error("Host failed", e);
    }
  };

  return (
    <main
      className={`min-h-screen bg-black text-white p-4 sm:p-8 md:p-12 transition-all duration-500 ${isRTL ? "font-serif" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-8 mb-12 sm:mb-16">
        <div className="text-center sm:text-left">
          <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-white leading-none uppercase">
            {t.title}
          </h1>
          <p className="text-teal-400 font-bold tracking-[0.3em] text-[10px] sm:text-xs mt-2 uppercase">
            {t.subtitle}
          </p>
        </div>
        <div className="flex bg-zinc-900/80 backdrop-blur-md p-1 rounded-2xl border border-zinc-800 shadow-xl">
          {(["en", "fr", "de", "fa"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => updateLang(l)}
              className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-300 ${lang === l ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8 sticky top-8 z-10">
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
                className="w-full bg-black/50 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-teal-500 outline-none transition-all text-center tracking-[0.2em]"
              />
              <button
                onClick={handleJoin}
                className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black py-5 rounded-2xl text-xl uppercase tracking-widest transition-all active:scale-95 shadow-[0_15px_30px_rgba(20,184,166,0.2)]"
              >
                {t.enterLobby}
              </button>
            </div>
          </section>

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
                ongoingRooms.map((room: any) => {
                  const isFinished = room.status === "FINISHED";
                  const winnerName = room.gameBoard?.winner;
                  return (
                    <div
                      key={room._id}
                      className={`group bg-zinc-900/30 border p-6 rounded-[2rem] space-y-4 transition-all ${isFinished ? "border-zinc-800/50 opacity-80" : "border-zinc-800 hover:border-teal-500/50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black italic text-white tracking-tighter">
                              {room.roomCode}
                            </span>
                            {isFinished && winnerName && (
                              <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-lg shrink-0">
                                <span className="text-[10px]">🏆</span>
                                <span className="text-[10px] font-black italic text-teal-500 uppercase truncate max-w-[80px]">
                                  {winnerName}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">
                            {room.currentGame?.toUpperCase()}
                          </span>
                        </div>
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 transition-all duration-500 ${isFinished ? "bg-zinc-800" : "bg-teal-500 animate-pulse shadow-[0_0_12px_rgba(20,184,166,0.6)]"}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewBoard(room.roomCode)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-xl text-[9px] font-black uppercase transition-all"
                        >
                          Board
                        </button>
                        <button
                          onClick={() =>
                            !isFinished && selectRoomForJoining(room.roomCode)
                          }
                          disabled={isFinished}
                          className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all ${isFinished ? "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800/30" : "bg-teal-500/10 border border-teal-500/20 text-teal-500 hover:bg-teal-500 hover:text-black"}`}
                        >
                          {isFinished ? "Ended" : "Player"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-zinc-600 uppercase">
              {t.arcade}
            </h2>
          </div>
          <GameCatalog lang={lang} onHost={handleHost} />
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}
