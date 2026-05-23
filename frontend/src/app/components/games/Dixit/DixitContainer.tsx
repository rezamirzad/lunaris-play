"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { BoardProps } from "../registry";
import PlayerCard from "../../shared/PlayerCard";
import DixitPlayerStats from "./DixitPlayerStats";
import MatchActivity from "../../shared/MatchActivity";
import DixitLogMessage from "./MatchActivity";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import VotingReveal from "./VotingReveal";
import RoundResultsPanel from "./RoundResultsPanel";
import MissionBriefing from "../../arcade/MissionBriefing";
import ArcadeVictoryOverlay from "../../arcade/ArcadeVictoryOverlay";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadeStatusPanel from "../../arcade/ArcadeStatusPanel";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";

export default function DixitContainer({ roomData }: BoardProps) {
  const { t } = useTranslation();
  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;
  const players = roomData.players;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  // 1. LOBBY MISSION BRIEFING
  if (isLobby) {
    return (
      <MissionBriefing
        title={t.dixit_title}
        subtitle={t.dixit_awaiting_st}
        briefingTitle={t.dixit_briefing_title}
        briefingDesc={t.dixit_briefing_desc}
        loadingText={t.dixit_wait_storyteller}
        accentColor="blue"
        background={
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_70%)]" />
        }
      />
    );
  }

  if (!board) return null;

  const storytellerId = roomData.turnOrder[roomData.currentTurnIndex];
  const stPlayer = players.find((p) => p._id === storytellerId);
  const isFinished = roomData.status?.toUpperCase() === "FINISHED" || roomData.status?.toUpperCase() === "ARCHIVED";

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#05030a] text-blue-100 font-mono"
      background={
        <>
          <div className="neuro-grid opacity-10" />
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
        </>
      }
      header={
        <ArcadeHUD
          title={t.dixit_title}
          statusLabel={`${t.dixit_match_live} • ${t.dixit_current_phase}: ${t[`dixit_phase_${board.phase.toLowerCase()}` as keyof typeof t] || board.phase}`}
          badgeContent={stPlayer ? `${t.storyteller}: ${stPlayer.name}` : t.dixit_awaiting_st}
          accentColor="blue"
        />
      }
      main={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full relative overflow-hidden">
          {/* LEFT: TACTICAL FEED */}
          <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
            <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 p-6 overflow-hidden flex flex-col shadow-2xl relative">
              <h3 className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.4em] mb-4 shrink-0">
                {t.matchActivity}
              </h3>
              <div className="flex-1 min-h-0">
                <MatchActivity
                  history={board.history}
                  renderLog={(log) => <DixitLogMessage log={log} />}
                />
              </div>
            </div>
          </div>

          {/* CENTER: PRIMARY CANVAS */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-blue-500/5 rounded-[3rem] border border-blue-500/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_70%)] opacity-[0.03]" />

            <AnimatePresence mode="wait">
              {board.phase === "CLUE" ? (
                <motion.div key="clue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                  <div className="w-48 h-48 rounded-full border-2 border-blue-500/20 flex items-center justify-center relative mb-12">
                    <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" />
                    <span className="text-7xl">🔮</span>
                  </div>
                  <h2 className="text-3xl font-black text-blue-400 tracking-[0.4em] uppercase italic">{t.dixit_awaiting_st}</h2>
                </motion.div>
              ) : board.phase === "SUBMITTING" ? (
                <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                   <div className="px-8 py-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-8">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-2">{t.dixit_clue_received}</span>
                      <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">&quot;{board.currentClue}&quot;</h2>
                   </div>
                   <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em]">{t.dixit_phase_incubation}...</span>
                </motion.div>
              ) : board.phase === "VOTING" ? (
                <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center w-full">
                   <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-12">
                      <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">&quot;{board.currentClue}&quot;</h2>
                   </div>
                   <VotingReveal roomData={roomData} />
                </motion.div>
              ) : board.phase === "RESULTS" ? (
                <motion.div key="results" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full flex justify-center">
                   <RoundResultsPanel roomData={roomData} />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {isFinished && (
              <ArcadeVictoryOverlay
                winnerName={board.winner}
                championLabel={t.champion}
                accentColor="blue"
              />
            )}
          </div>

          {/* RIGHT: SYSTEM STATUS */}
          <div className="lg:col-span-3 flex flex-col h-full gap-6">
            <ArcadeStatusPanel
              protocolLabel={t.dixit_integrity}
              protocolValue={`${Math.round((players.filter(p => board.phase === "SUBMITTING" ? board.submittedCards?.some(sc => sc.playerId === p._id) : board.votes?.find(v => v.voterId === p._id)).length / players.length) * 100)}%`}
              accentColor="blue"
              rows={[
                { label: t.shared_status, value: board.phase },
                { label: t.dixit_participants, value: `${players.length} / 12`, valueColor: "text-zinc-300" },
              ]}
              title=""
            />
          </div>
        </div>
      }
      footer={
        <ArcadePlayerGrid
          players={players}
          currentTurnId={storytellerId}
          winnerId={board.winnerId}
          isGameEnd={isFinished}
          accentColor="blue"
          renderStats={(player) => {
            const hasSubmitted = board.submittedCards?.some(sc => sc.playerId === player._id);
            const hasVoted = board.votes?.some((v) => v.voterId === player._id);
            const actionComplete = (board.phase === "SUBMITTING" && hasSubmitted) || (board.phase === "VOTING" && hasVoted);

            return (
              <>
                <DixitPlayerStats
                  state={player.state.gameType === "dixit" ? player.state : null}
                  rank={1}
                  totalPlayers={players.length}
                  isST={player._id === storytellerId}
                />
                {actionComplete && board.phase !== "RESULTS" && (
                   <span className="text-[8px] text-emerald-400 font-black animate-pulse uppercase tracking-tighter italic mt-2 block">{t.ready}</span>
                )}
              </>
            );
          }}
        />
      }
    />
  );
}
