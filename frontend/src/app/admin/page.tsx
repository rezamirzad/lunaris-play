"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import GameCatalog from "../components/GameCatalog";
import AdminGateway from "./AdminGateway";
import LiveNodeManager from "./LiveNodeManager";
import SecurityLogsManager from "./SecurityLogsManager";

function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const createRoom = useMutation(api.engine.createRoom);
  const getOrCreateUser = useMutation(api.engine.getOrCreateUser);

  const handleHost = async (slug: string) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    try {
      // Admin defaults for hosting
      await getOrCreateUser({ name: "ADMIN_NODE" });
      await createRoom({ roomCode: code, gameSlug: slug });
      // In a real app, we might want to stay on the dashboard
      // But for now let's follow the standard host flow
      router.push(`/room/${code}?lang=en&game=${slug}&view=board`);
    } catch (e) {
      console.error("Admin host failed", e);
    }
  };

  return (
    <main className="min-h-screen bg-app font-mono pb-20">
      {/* Background FX */}
      <div className="neuro-grid opacity-10" />

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40 p-6 mb-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">
              LUNARIS<span className="text-brand-accent"> (Admin)</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                SYSTEM_STATUS
              </span>
              <span className="text-[10px] font-black text-teal-400 uppercase">
                ENCRYPTED_UPLINK
              </span>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-1.5 border border-white/10 rounded-lg text-[9px] font-black text-zinc-500 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
            >
              TERMINATE_SESSION
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 p-6 relative z-10">
        {/* LEFT COLUMN: CATALOG CONTROL */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-brand-accent rounded-full" />
              <h3 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">
                Games
              </h3>
            </div>
            <div className="scale-90 origin-top-left">
              <GameCatalog mode="admin" onHost={handleHost} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE MANAGEMENT */}
        <div className="lg:col-span-8 space-y-12">
          <LiveNodeManager />
          <SecurityLogsManager />
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <AdminGateway>
      <AdminDashboard />
    </AdminGateway>
  );
}
