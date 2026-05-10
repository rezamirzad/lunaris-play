"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import GameCatalog from "./components/GameCatalog";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "./UserProvider";
import OngoingRooms from "./components/OngoingRooms";
import Leaderboard from "./components/Leaderboard";
import { motion, Variants } from "framer-motion";

const titleVariants: Variants = {
  hidden: { skewX: 20, opacity: 0, scale: 0.9 },
  visible: {
    skewX: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playerName, setPlayerName } = useUser();
  const [lang, setLang] = useState<Language>("en");
  const [nameInput, setNameInput] = useState(playerName);
  const [roomCode, setRoomCode] = useState("");

  const ongoingRooms = useQuery(api.engine.getOngoingRooms);
  const createRoom = useMutation(api.engine.createRoom);
  const joinRoom = useMutation(api.engine.joinRoom);
  const getOrCreateUser = useMutation(api.engine.getOrCreateUser);

  useEffect(() => {
    const l = searchParams.get("lang") as Language;
    if (l && ["en", "fr", "de", "fa"].includes(l)) {
      setLang(l);
    }
  }, [searchParams]);

  useEffect(() => {
    setNameInput(playerName);
  }, [playerName]);

  const t = translations[lang];
  const isRTL = lang === "fa";

  const updateLang = (newLang: Language) => {
    setLang(newLang);
    const params = new URLSearchParams(searchParams);
    params.set("lang", newLang);
    router.replace(`/?${params.toString()}`);
  };

  const handleJoin = async () => {
    if (!nameInput || !roomCode) return;
    const cleanCode = roomCode.toUpperCase();
    try {
      await getOrCreateUser({ name: nameInput });
      await joinRoom({ roomCode: cleanCode, playerName: nameInput });
      setPlayerName(nameInput);
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
      if (nameInput) {
        await getOrCreateUser({ name: nameInput });
        setPlayerName(nameInput);
      }
      await createRoom({ roomCode: code, gameSlug: slug });
      router.push(`/room/${code}?lang=${lang}&game=${slug}&view=board`);
    } catch (e) {
      console.error("Host failed", e);
    }
  };

  return (
    <main
      className={`min-h-screen bg-[#020203] text-white p-4 sm:p-8 md:p-12 transition-all duration-500 relative overflow-hidden `}
      //dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Cinematic Background FX */}
      <div className="neuro-grid" />
      <div className="scanline" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(45,212,191,0.05),transparent)] pointer-events-none" />

      <header className="max-w-6xl mx-auto w-full flex flex-col items-center gap-8 mb-20 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={titleVariants}
          className="text-center space-y-4"
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-[0.6em] text-zinc-500 mb-2 opacity-50">
              SYSTEM_AUTH: ACTIVE
            </span>
            <h1 className="text-7xl sm:text-9xl font-black italic tracking-tighter text-white leading-none uppercase logo-glow">
              LUNARIS
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-teal-400/20" />
            <p className="text-teal-400 font-bold tracking-[0.5em] text-[10px] uppercase">
              {t.subtitle}
            </p>
            <div className="h-[1px] w-12 bg-teal-400/20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex bg-zinc-900/40 backdrop-blur-md p-1 rounded-2xl border border-white/5 shadow-2xl"
        >
          {(["en", "fr", "de", "fa"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => updateLang(l)}
              className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-300 ${lang === l ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </motion.div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative z-10">
        <div className="lg:col-span-4 space-y-10">
          <div className="flex items-end border-b border-zinc-900 pb-4 h-[25px]">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-zinc-600 uppercase">
              COMMAND_INTERFACE
            </h2>
          </div>

          <motion.section
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="glass-card p-8 shadow-2xl space-y-8"
          >
            <h2 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              {t.enterLobby}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-black/80 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-zinc-800 text-white shadow-inner"
              />
              <input
                type="text"
                placeholder={t.roomPlaceholder}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-black/80 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all text-center tracking-[0.2em] text-white shadow-inner"
              />
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 30px rgba(45,212,191,0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                className="w-full bg-white hover:bg-teal-400 text-black font-black py-5 rounded-2xl text-xl uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              >
                {t.enterLobby}
              </motion.button>
            </div>
            <div className="pt-4 flex justify-between items-center opacity-30">
              <span className="text-[8px] font-bold">NODE_STABILITY: 100%</span>
              <span className="text-[8px] font-bold text-teal-400">
                ENCRYPTED
              </span>
            </div>
          </motion.section>

          <motion.section
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              delay: 0.7,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="space-y-6"
          >
            <h2 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase px-4 flex justify-between items-center">
              <span>{t.ongoingGames}</span>
              <span className="text-teal-400/50 tabular-nums">
                00{ongoingRooms?.length || 0}
              </span>
            </h2>
            <OngoingRooms
              rooms={ongoingRooms}
              onJoin={selectRoomForJoining}
              onViewBoard={handleViewBoard}
              t={t}
            />
          </motion.section>

          <Leaderboard />
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            delay: 0.8,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="lg:col-span-8 space-y-6"
        >
          <div className="flex justify-between items-end border-b border-zinc-900 pb-4 h-[25px]">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-zinc-600 uppercase">
              {t.arcade}
            </h2>
          </div>
          <GameCatalog onHost={handleHost} />
        </motion.div>
      </div>

      <footer className="max-w-6xl mx-auto w-full mt-32 pb-12 text-center opacity-20 relative z-10">
        <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">
          LUNARIS_CORE v2.0.0 // DESIGN_BY_AURA
        </p>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020203]" />}>
      <HomeContent />
    </Suspense>
  );
}
