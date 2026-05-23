"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import GameCatalog from "./components/GameCatalog";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "./UserProvider";
import OngoingRooms from "./components/OngoingRooms";
import LeaderboardTicker from "./components/LeaderboardTicker";
import Navbar from "./components/shared/Navbar";
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

import { useTranslation } from "@/hooks/useTranslation";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playerName, setPlayerName } = useUser();
  const { t, lang, setLanguage } = useTranslation();
  const [nameInput, setNameInput] = useState(playerName);
  const [roomCode, setRoomCode] = useState("");

  const ongoingRooms = useQuery(api.engine.getOngoingRooms);
  const availableGames = useQuery(api.engine.listGames);
  const joinRoom = useMutation(api.engine.joinRoom);
  const getOrCreateUser = useMutation(api.engine.getOrCreateUser);

  useEffect(() => {
    setNameInput(playerName);
  }, [playerName]);

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

  return (
    <main
      lang={lang}
      className={`min-h-[100dvh] bg-app text-content-base p-4 sm:p-8 md:p-12 transition-all duration-500 relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${lang === "fa" ? "fa-text-fix" : ""}`}
    >
      <div className="pt-10 sm:pt-14">
        <Navbar />
      </div>
      {/* Cinematic Background FX */}
      <div className="neuro-grid" />
      <div className="scanline" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,var(--accent-glow),transparent)] pointer-events-none" />

      <header className="max-w-6xl mx-auto w-full flex flex-col items-center gap-8 mb-20 relative z-10 pt-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={titleVariants}
          className="text-center space-y-4"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-4"></div>
            <h1 className="text-7xl sm:text-9xl font-black italic tracking-tighter text-content-strong leading-none uppercase logo-glow transition-all duration-300">
              LUNARIS
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-brand-accent/20" />
            <p
              className={`text-brand-accent font-bold text-[10px] uppercase ${lang === "fa" ? "tracking-normal" : "tracking-[0.5em]"}`}
            >
              {t.subtitle}
            </p>
            <div className="h-[1px] w-12 bg-brand-accent/20" />
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
              onClick={() => setLanguage(l)}
              className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-300 ${lang === l ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Repositioned Hall of Fame Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5 }}
          className="w-full"
        >
          <LeaderboardTicker />
        </motion.div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative z-10">
        <div className="lg:col-span-4 space-y-10">
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
            <h2 className="text-[10px] font-black tracking-widest text-zinc-100 uppercase flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
              {t.enterLobby}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-black/40 border border-border-subtle rounded-2xl px-6 py-4 text-xl font-bold focus:border-brand-accent outline-none transition-all placeholder:text-zinc-800 text-content-strong shadow-inner text-base"
              />
              <input
                type="text"
                placeholder={t.roomPlaceholder}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-black/40 border border-border-subtle rounded-2xl px-6 py-4 text-xl font-bold focus:border-brand-accent outline-none transition-all text-center tracking-[0.2em] text-content-strong shadow-inner text-base"
              />
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 30px var(--accent-glow)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                className="w-full bg-white hover:bg-brand-accent text-black font-black py-5 rounded-2xl text-xl uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(0,0,0,0.4)] touch-manipulation select-none"
              >
                {t.enterLobby}
              </motion.button>
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
            className="space-y-4"
          >
            <h2 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase px-4 flex justify-between items-center">
              <span>{t.ongoingGames}</span>
              <span className="text-brand-accent/50 tabular-nums">
                00{ongoingRooms?.length || 0}
              </span>
            </h2>
            <OngoingRooms
              rooms={ongoingRooms}
              onJoin={selectRoomForJoining}
              onViewBoard={handleViewBoard}
              t={t}
              lang={lang}
            />
          </motion.section>
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
          className="lg:col-span-8 flex flex-col space-y-6"
        >
          <div className="flex justify-between items-end border-b border-border-subtle pb-4 h-[25px]">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-zinc-600 uppercase flex justify-between w-full items-center">
              <span>{t.arcade}</span>
              <span className="text-brand-accent/50 tabular-nums">
                00{availableGames?.length || 0}
              </span>
            </h2>
          </div>
          <div className="max-h-[60vh] lg:max-h-[1100px] overflow-y-auto pr-2 custom-scrollbar">
            <GameCatalog mode="standard" />
          </div>
        </motion.div>
      </div>

      <footer className="max-w-6xl mx-auto w-full mt-32 pb-12 text-center opacity-60 relative z-10">
        <p className="text-[10px] font-black tracking-[0.6em] text-teal-400/80 uppercase">
          {t.madeBy} &copy; 2026
        </p>
      </footer>

      {/* Admin Portal Shortcut */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => router.push("/admin")}
        className="fixed bottom-6 left-6 z-[100] group flex items-center gap-3 bg-zinc-950/80 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/30 p-3 rounded-2xl backdrop-blur-xl transition-all duration-500"
      >
        <div className="w-10 h-10 rounded-xl bg-zinc-900 group-hover:bg-teal-500/20 flex items-center justify-center transition-colors">
          <span className="text-xl group-hover:scale-110 transition-transform">
            ⚙️
          </span>
        </div>
        <div className="flex flex-col items-start pr-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-teal-400/70 transition-colors">
            System
          </span>
          <span className="text-sm font-black uppercase italic tracking-tighter text-zinc-400 group-hover:text-white transition-colors border-b border-transparent group-hover:border-teal-500/50">
            ADMIN
          </span>
        </div>
      </motion.button>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-app" />}>
      <HomeContent />
    </Suspense>
  );
}
