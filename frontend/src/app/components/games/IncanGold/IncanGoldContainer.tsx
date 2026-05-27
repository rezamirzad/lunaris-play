"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardProps } from "../registry";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { formatLog } from "@/lib/translations";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadeStatusPanel from "../../arcade/ArcadeStatusPanel";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";
import MissionBriefing from "../../arcade/MissionBriefing";
import { useAdmin } from "@/app/admin/AdminGateway";

const IncanGoldBoard: React.FC<BoardProps> = ({ roomId, roomData, history = [] }) => {
  const { t } = useTranslation();
  const { isAdmin, pin: adminPin } = useAdmin();
  const incanApi = (api as any).incangold;

  const drawCard = useMutation(incanApi.drawCard);
  const nextRound = useMutation(incanApi.nextRound);
  const startDecision = useMutation(incanApi.startDecision);
  const finishVoteReveal = useMutation(incanApi.finishVoteReveal);
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);

  const [showRules, setShowRules] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);

  const board = roomData.gameBoard;
  if (board.gameType !== "incangold") return null;

  const isLobby = roomData.status?.toUpperCase() === "LOBBY";
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.incangold_title}
        subtitle={t.lobbyInitiation}
        briefingTitle={t.incangold_goal_title}
        briefingDesc={t.incangold_desc}
        loadingText={t.incangold_exploring}
        accentColor="amber"
        room={roomData}
        players={roomData.players}
      />
    );
  }

  const isFinished = roomData.status?.toUpperCase() === "FINISHED" || roomData.status?.toUpperCase() === "ARCHIVED";

  const inTempleCount = roomData.players.filter(p => p.state.gameType === "incangold" && p.state.status === "IN_TEMPLE").length;
  const totalPathGems = Object.values(board.cardGems || {}).reduce((a: any, b: any) => a + b, 0);

  if (board.phase === "FINAL_LEADERBOARD" || isFinished) {
    const sortedPlayers = [...roomData.players].sort((a, b) => {
      const sA = (a.state as any).bankedScore || 0;
      const sB = (b.state as any).bankedScore || 0;
      if (sA !== sB) return sB - sA;
      return ((b.state as any).artifacts || 0) - ((a.state as any).artifacts || 0);
    });

    let totalGemsFound = 0;
    let totalGemsLost = 0;
    board.roundHistory?.forEach(rh => {
        totalGemsFound += rh.gemsFound || 0;
        totalGemsLost += rh.gemsLost || 0;
    });

    return (
      <div className="flex flex-col h-full w-full bg-[#050300] text-amber-50 p-12 overflow-hidden relative font-mono">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#4a2c00_0%,_transparent_70%)]" />
        <div className="z-10 flex flex-col h-full gap-8">
          <header className="text-center">
            <h1 className="text-6xl font-black text-amber-400 tracking-tighter uppercase italic drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              {t.incangold_expedition_complete}
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] mt-2 italic text-xs">
              {t.incangold_hall_of_riches}
            </p>
          </header>

          <div className="grid grid-cols-4 gap-8">
             <div className="col-span-1 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center">
                <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest block mb-1">Total Found</span>
                <div className="text-4xl font-black text-emerald-400">{totalGemsFound} 💎</div>
             </div>
             <div className="col-span-1 bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center">
                <span className="text-[8px] font-black text-red-500/50 uppercase tracking-widest block mb-1">Lost to Cave</span>
                <div className="text-4xl font-black text-red-400">{totalGemsLost} 💀</div>
             </div>
             <div className="col-span-2 bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl text-center flex items-center justify-center gap-6">
                <span className="text-6xl">👑</span>
                <div className="text-left">
                    <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest block mb-1">Grand Champion</span>
                    <div className="text-4xl font-black text-amber-400">{sortedPlayers[0]?.name}</div>
                </div>
             </div>
          </div>

          <div className="flex-1 bg-black/60 rounded-[3rem] border border-white/5 overflow-hidden flex flex-col">
            <div className="grid grid-cols-9 gap-4 px-8 py-6 bg-white/5 border-b border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest items-center">
              <div className="col-span-2">ADVENTURER</div>
              <div className="text-center">C1</div>
              <div className="text-center">C2</div>
              <div className="text-center">C3</div>
              <div className="text-center">C4</div>
              <div className="text-center">C5</div>
              <div className="text-center text-amber-400">ARTS</div>
              <div className="text-right text-emerald-400">TOTAL</div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {sortedPlayers.map((p, idx) => (
                <div key={p._id} className={`grid grid-cols-9 gap-4 px-8 py-6 border-b border-white/5 items-center ${idx === 0 ? "bg-amber-500/5" : ""}`}>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${idx === 0 ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-zinc-800 text-zinc-500"}`}>
                        {idx + 1}
                    </div>
                    <span className={`font-black text-xl ${idx === 0 ? "text-amber-400" : "text-zinc-300"}`}>{p.name}</span>
                  </div>
                  {[1, 2, 3, 4, 5].map(r => {
                    const res = board.roundHistory?.find(rh => rh.round === r)?.playerResults?.[p._id];
                    return (
                        <div key={r} className="text-center">
                            {res?.status === "CRASHED" ? (
                                <span className="text-xl">💀</span>
                            ) : (
                                <span className="font-black text-zinc-400">{res?.gained || 0}</span>
                            )}
                        </div>
                    );
                  })}
                  <div className="text-center text-xl font-black text-amber-200">{(p.state as any).artifacts}</div>
                  <div className="text-right text-3xl font-black text-emerald-400">{(p.state as any).bankedScore}</div>
                </div>
              ))}
            </div>
          </div>
          
          <button onClick={() => window.location.href = "/"} className="w-full py-6 bg-white text-black font-black uppercase italic rounded-3xl hover:bg-amber-500 transition-all text-2xl shadow-2xl">
            {t.exit}
          </button>
        </div>
      </div>
    );
  }

  const handleAction = async (fn: any) => {
    if (pendingAction) return;
    setPendingAction(true);
    try { await fn({ roomId: roomId as Id<"rooms"> }); } 
    catch (e) { console.error(e); } 
    finally { setPendingAction(false); }
  };

  const getHazardEmoji = (id: string) => {
    if (id.includes("Serpent")) return "🐍";
    if (id.includes("Scorpion")) return "🦂";
    if (id.includes("Rockfall")) return "🪨";
    if (id.includes("Gas")) return "💨";
    if (id.includes("Explosion")) return "💥";
    return "⚠️";
  };

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#050300] text-amber-50 font-mono"
      background={<div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#4a2c00_0%,_transparent_70%)]" />}
      header={
        <ArcadeHUD
          title={t.incangold_title_alt}
          statusLabel={formatLog(t.incangold_round, { round: board.currentRound })}
          badgeContent={board.phase === "DECISION_PHASE" ? "VOTING ACTIVE" : t.statusLive}
          accentColor="amber"
          onHaltToggle={isAdmin ? () => toggleHaltMutation({ roomId: roomId as any, adminPin }) : undefined}
          isHalted={roomData.botsHalted}
        />
      }
      main={
        <div className="grid grid-cols-12 gap-8 h-full">
          {/* LEFT: THREAT MONITOR */}
          <div className="col-span-3 space-y-6">
            <div className="bg-black/60 border border-amber-900/30 rounded-[2rem] p-6 shadow-2xl">
              <h3 className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.4em] mb-6 text-center italic">
                {t.incangold_threat_level}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {["Serpent", "Scorpion", "Rockfall", "Gas", "Explosion"].map(type => {
                  const count = board.path.filter((id: string) => id.includes(type)).length;
                  return (
                    <div key={type} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${count > 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/5 opacity-30"}`}>
                      <span className="text-2xl">{getHazardEmoji(type)}</span>
                      <div className="flex-1">
                        <div className="text-[8px] font-black uppercase text-zinc-500">{type}</div>
                        <div className="flex gap-1 mt-1">
                          {[1, 2].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${count >= i ? "bg-red-500" : "bg-zinc-800"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 rounded-[2rem] p-6 text-center">
                <span className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest block mb-2">{t.incangold_path_gems}</span>
                <div className="text-6xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    {totalPathGems}<span className="text-2xl ml-2">💎</span>
                </div>
            </div>
          </div>

          {/* CENTER: THE EXPEDITION PATH */}
          <div className="col-span-6 relative flex flex-col items-center justify-center bg-black/40 rounded-[3rem] border border-white/5 shadow-inner overflow-hidden">
            <div className="absolute inset-0 neuro-grid opacity-10" />
            
            <div className="absolute top-8 left-8 right-8 flex justify-between z-20">
                <div className="flex items-center gap-3 bg-black/80 px-6 py-3 rounded-2xl border border-white/10">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-black uppercase tracking-widest">{inTempleCount} {t.incangold_in_temple}</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {board.phase === "ROUND_RESULTS" ? (
                    <motion.button key="next" whileHover={{ scale: 1.05 }} onClick={() => handleAction(nextRound)} className="bg-emerald-500 text-black px-8 py-3 rounded-2xl font-black uppercase italic shadow-lg">{t.incangold_next_cave}</motion.button>
                  ) : board.phase === "REVEAL_PHASE" ? (
                    <motion.button key="decide" whileHover={{ scale: 1.05 }} onClick={() => handleAction(startDecision)} className="bg-amber-500 text-black px-8 py-3 rounded-2xl font-black uppercase italic shadow-lg">{t.incangold_time_to_decide}</motion.button>
                  ) : board.phase === "VOTE_REVEAL" ? (
                    <motion.button key="continue" whileHover={{ scale: 1.05 }} onClick={() => handleAction(finishVoteReveal)} className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase italic shadow-lg">{t.incangold_continue_exploration}</motion.button>
                  ) : (
                    <motion.button key="draw" whileHover={{ scale: 1.05 }} onClick={() => handleAction(drawCard)} disabled={board.phase !== "EXPEDITION_PHASE" && board.phase !== "ROUND_INTRO"} className="bg-white text-black px-12 py-4 rounded-2xl font-black uppercase italic shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-30">
                        {board.phase === "ROUND_INTRO" ? t.incangold_enter_cave : t.incangold_venture_deeper}
                    </motion.button>
                  )}
                </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 p-12 max-h-full overflow-y-auto no-scrollbar pt-24 pb-32">
                <AnimatePresence>
                    {board.path.map((cardId: string, idx: number) => {
                        const isHazard = cardId.startsWith("H_");
                        const isArtifact = cardId.startsWith("A_");
                        const val = cardId.split("_")[1];
                        return (
                            <motion.div
                                key={`${cardId}-${idx}`}
                                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`w-36 aspect-[2/3] rounded-2xl border-4 flex flex-col items-center justify-between p-4 shadow-2xl relative overflow-hidden ${isHazard ? "bg-red-950/40 border-red-500/50" : isArtifact ? "bg-amber-500/10 border-amber-400" : "bg-blue-950/40 border-blue-500/50"}`}
                            >
                                <div className="text-[8px] font-black uppercase opacity-40">{isHazard ? "Danger" : isArtifact ? "Artifact" : "Treasure"}</div>
                                <div className="text-6xl my-2">
                                    {isHazard ? getHazardEmoji(cardId) : isArtifact ? "🏺" : "💎"}
                                </div>
                                <div className="text-xl font-black tracking-tighter">
                                    {!isHazard && !isArtifact && val}
                                    {isHazard && <span className="text-[10px] text-red-500 uppercase">{val}</span>}
                                </div>
                                {board.cardGems[idx] > 0 && (
                                    <div className="absolute top-2 right-2 bg-amber-400 text-black text-[10px] px-2 py-0.5 rounded-full font-black">
                                        {board.cardGems[idx]}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: ROUND STATUS */}
          <div className="col-span-3 flex flex-col gap-6">
            <ArcadeStatusPanel
              title={t.results}
              protocolLabel="ENCRYPTION"
              protocolValue="ACTIVE"
              accentColor="amber"
              rows={[
                { label: "PROTOCOL", value: board.phase },
                { label: "EXPLORERS", value: String(inTempleCount), valueColor: "text-amber-400" },
              ]}
            />
            {board.artifactsOnPath.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-[2rem] text-center animate-pulse">
                    <div className="text-[4rem] mb-2">🏺</div>
                    <div className="text-[10px] font-black uppercase text-amber-500">
                        {formatLog(t.incangold_on_path_bonus, { n: board.artifactsOnPath.length })}
                    </div>
                </div>
            )}
          </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={roomData.players}
          accentColor="amber"
          isGameEnd={isFinished}
          renderStats={(p) => {
            const s = p.state as any;
            const isInCave = s.status === "IN_TEMPLE";
            const res = board.roundHistory?.[board.roundHistory.length - 1]?.playerResults?.[p._id];
            const crashed = res?.status === "CRASHED" && board.phase === "ROUND_RESULTS";
            const choice = board.decisions[p._id];
            const revealed = board.phase === "VOTE_REVEAL" || board.phase === "ROUND_RESULTS";

            return (
              <div className="space-y-2 mt-4 relative">
                {/* Status Badge */}
                <div className={`text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-3 rounded-xl border flex items-center justify-center gap-2 mb-3 shadow-sm ${isInCave ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
                  <div className={`w-2 h-2 rounded-full ${isInCave ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-600"}`} />
                  {isInCave ? t.incangold_in_temple : t.incangold_at_camp}
                </div>

                <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5">
                    <span className="text-[7px] font-black text-zinc-500 uppercase italic">On Hand</span>
                    <span className={`text-sm font-black ${crashed ? "text-red-500 line-through" : "text-amber-400"}`}>{s.gemsThisRound} 💎</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5">
                    <span className="text-[7px] font-black text-zinc-500 uppercase italic">Banked</span>
                    <span className="text-sm font-black text-emerald-400">{s.bankedScore} 🏕️</span>
                </div>
                {revealed && s.status === "IN_TEMPLE" && (
                    <div className={`text-[10px] font-black uppercase text-center p-1 rounded-lg ${choice === "LEAVE" ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"}`}>
                        {choice === "LEAVE" ? "Leaving" : "Staying"}
                    </div>
                )}
                {crashed && (
                    <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                        <span className="text-3xl">💀</span>
                        <span className="text-[8px] font-black uppercase">Crashed</span>
                    </div>
                )}
              </div>
            );
          }}
        />
      }
    />
  );
};

export default IncanGoldBoard;
