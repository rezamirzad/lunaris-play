"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { BoardProps } from "../registry";
import DixitPlayerStats from "./DixitPlayerStats";
import SharedArcadeLayout from "../../shared/SharedArcadeLayout";
import VotingReveal from "./VotingReveal";
import RoundResultsPanel from "./RoundResultsPanel";
import MissionBriefing from "../../arcade/MissionBriefing";
import ArcadeVictoryOverlay from "../../arcade/ArcadeVictoryOverlay";
import AITelemetryLog from "../../arcade/AITelemetryLog";
import RulesModal from "../../shared/RulesModal";
import ArcadeHUD from "../../arcade/ArcadeHUD";
import ArcadePlayerGrid from "../../arcade/ArcadePlayerGrid";
import ArcadeBadge from "../../shared/ArcadeBadge";
import StorytellerBadge from "./StorytellerBadge";
import DixitCard from "./DixitCard";
import { calculateRank } from "@/lib/utils";
import { useAdmin } from "@/app/admin/AdminGateway";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import Image from "next/image";
import { fixPersianPunctuation } from "@/lib/translations";

export default function DixitContainer({ roomId, roomData, history = [], submissions = [] }: BoardProps) {
  const { t, lang } = useTranslation();
  const { isAdmin, } = useAdmin();
  const handleActionMutation = useMutation(api.dixit.handleAction);
  const toggleHaltMutation = useMutation(api.engine.toggleBotsHalt);

  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;
  const players = roomData.players;
  const isLobby = roomData.status?.toUpperCase() === "LOBBY";

  const allScores = useMemo(
    () =>
      players.map((p) =>
        (p.state as any).gameType === "dixit" ? (p.state as any).score || 0 : 0,
      ),
    [players],
  );

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const scoreA =
        (a.state as any).gameType === "dixit" ? (a.state as any).score || 0 : 0;
      const scoreB =
        (b.state as any).gameType === "dixit" ? (b.state as any).score || 0 : 0;
      return scoreB - scoreA;
    });
  }, [players]);

  const zoomedCardVoters = useMemo(() => {
    if (!zoomedCardId || !board) return [];
    return (
      board.votes
        ?.filter((v: any) => v.cardId === zoomedCardId)
        .map((v: any) => players.find((p) => p._id === v.voterId))
        .filter(Boolean) || []
    );
  }, [zoomedCardId, board, players]);

  const zoomedCardOwner = useMemo(() => {
    if (!zoomedCardId || !board) return null;
    const submission = board.submittedCards?.find(
      (s: any) => s.cardId === zoomedCardId,
    );
    if (!submission) return null;
    return players.find((p) => p._id === submission.playerId);
  }, [zoomedCardId, board, players]);

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
        room={roomData}
        players={players}
      />
    );
  }

  if (!board) return null;

  const storytellerId = roomData.turnOrder[roomData.currentTurnIndex];
  const stPlayer = players.find((p) => p._id === storytellerId);
  const isFinished =
    roomData.status?.toUpperCase() === "FINISHED" ||
    roomData.status?.toUpperCase() === "ARCHIVED";

  const showResults =
    board.phase === "RESULTS" || (board.phase as string) === "VOTING_REVEAL";

  const renderClueBar = () => {
    const flagMap: Record<string, string> = {
      en: "england.webp",
      fr: "france.webp",
      de: "germany.webp",
      fa: "iran.svg.png",
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-4 shrink-0 font-mono text-left">
        {board.currentClues ? (
          Object.entries(board.currentClues)
            .sort(([a], [b]) => {
              const order = ["en", "fr", "de", "fa"];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([clueLang, clue]) => (
              <div
                key={clueLang}
                dir={clueLang === "fa" ? "rtl" : "ltr"}
                className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-[2rem] backdrop-blur-md relative overflow-hidden shadow-xl"
              >
                <div
                  dir="ltr"
                  className="absolute top-3 right-4 flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-2xl z-20"
                >
                  <div className="relative w-7 h-4 rounded-sm overflow-hidden border border-white/10">
                    <Image
                      src={`/assets/general/flags/${flagMap[clueLang]}`}
                      alt={clueLang}
                      fill
                      className="object-cover"
                      sizes="28px"
                      priority
                    />
                  </div>
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] font-mono leading-none">
                    {clueLang}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight mt-6">
                  {fixPersianPunctuation(clue, clueLang as any)}
                </h3>
              </div>
            ))
        ) : (
          <div
            className="col-span-2 bg-blue-500/10 border border-blue-500/30 p-6 rounded-[2.5rem] backdrop-blur-xl shadow-2xl"
            dir={lang === "fa" ? "rtl" : "ltr"}
          >
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-1">
              {t.dixit_clue_received}
            </span>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              {fixPersianPunctuation(board.currentClue || "", lang)}
            </h2>
          </div>
        )}
      </div>
    );
  };

  return (
    <SharedArcadeLayout
      containerClassName="bg-[#05030a] text-blue-100 font-mono !max-w-none w-full h-full"
      background={
        <>
          <div className="neuro-grid opacity-20" />
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </>
      }

      header={
        <ArcadeHUD
          title={t.dixit_title}
          statusLabel={`${t.dixit_match_live} • ${t[`dixit_phase_${board.phase.toLowerCase()}` as keyof typeof t] || board.phase}`}
          badgeContent={
            stPlayer
              ? `${t.storyteller}: ${stPlayer.name}`
              : t.dixit_awaiting_st
          }
          accentColor="blue"
          onHaltToggle={isAdmin ? () => toggleHaltMutation({ roomId: roomId as any }) : undefined}
          isHalted={roomData.botsHalted}
          onRulesClick={() => setShowRules(true)}
          />
          }

      main={
        <div className="flex flex-col h-full gap-4 min-h-0 font-mono">
          <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 w-full overflow-hidden mb-8">
            {/* 🌊 MAIN PLAY AREA (LEFT - 75%) */}
            <div className="flex-1 flex flex-col items-center justify-start p-6 bg-blue-500/5 rounded-[4rem] border border-blue-500/10 shadow-2xl relative transition-all duration-1000 overflow-hidden min-h-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_70%)] opacity-[0.03]" />
              {/* MANUAL NEXT ROUND OVERRIDE (ADMIN ONLY) */}
              {board.phase === "RESULTS" && isAdmin && (
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() =>
                    handleActionMutation({
                      playerId: roomData.turnOrder[roomData.currentTurnIndex],
                      actionType: "NEXT_ROUND",
                    })
                  }
                  className="absolute top-6 right-8 z-[60] bg-emerald-500 text-black px-6 py-2 rounded-2xl font-black uppercase italic shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-all text-xs"
                >
                  {(t as any).nextRound || "Next Round"} →
                </motion.button>
              )}
              <AnimatePresence mode="wait">
                {board.phase === "CLUE" ? (
                  <motion.div
                    key="clue"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center my-auto"
                  >
                    <div className="w-24 h-32 rounded-full border-2 border-blue-500/20 flex items-center justify-center relative mb-8">
                      <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" />
                      <span className="text-4xl filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        🔮
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-blue-400 tracking-[0.4em] uppercase italic">
                      {t.dixit_awaiting_st}
                    </h2>
                  </motion.div>
                ) : board.phase === "SUBMITTING" ? (
                  <motion.div
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center w-full h-full justify-center pt-4"
                  >
                    {renderClueBar()}

                    <div className="flex-1 w-full flex flex-col items-center justify-center gap-12 pb-12 overflow-hidden">
                      <div
                        className="w-full max-w-4xl mx-auto grid gap-6 items-center justify-center content-center"
                        style={{
                          gridTemplateColumns: `repeat(${players.length > 6 ? Math.ceil(players.length / 2) : players.length}, minmax(0, 1fr))`,
                          maxWidth: players.length > 6 ? "900px" : "700px",
                        }}
                      >
                        {players.map((_, idx) => {
                          const isSubmitted =
                            idx < (board.submittedCards?.length || 0);
                          return (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
                              animate={{
                                scale: isSubmitted ? 1 : 0.85,
                                opacity: isSubmitted ? 1 : 0.2,
                                rotateY: isSubmitted ? 0 : 180,
                                y: isSubmitted ? 0 : 40,
                              }}
                              transition={{
                                duration: 1,
                                type: "spring",
                                stiffness: 100,
                              }}
                              className="w-full"
                            >
                              <DixitCard
                                cardId="BACK"
                                isRevealed={false}
                                disabled={!isSubmitted}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] animate-pulse">
                          {board.submittedCards?.length === players.length
                            ? "SEQUENCING_REVEAL..."
                            : t.dixit_phase_incubation}
                        </span>
                        <div className="flex gap-2">
                          {players.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${idx < (board.submittedCards?.length || 0) ? "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-zinc-800"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : board.phase === "VOTING" || showResults ? (
                  <motion.div
                    key="stage-reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center w-full h-full justify-start pt-4 overflow-hidden"
                  >
                    {renderClueBar()}
                    <div className="w-full flex-none flex flex-col justify-start items-center overflow-hidden pb-12">
                      <VotingReveal
                        roomData={roomData}
                        onCardClick={setZoomedCardId}
                      />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {isFinished && (
                <ArcadeVictoryOverlay
                  winnerName={board.winner}
                  championLabel={t.dixit_champion_title}
                  accentColor="blue"
                />
              )}
            </div>

            {/* 📊 SYSTEM SIDEBAR (RIGHT - 25%) */}
            <div className="lg:w-96 flex flex-col h-full gap-6 overflow-hidden border-l border-white/5 pl-8 pt-8 pb-12 shrink-0">
              {showResults ? (
                <div className="flex flex-col h-full gap-6 overflow-hidden">
                  <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                    <RoundResultsPanel roomData={roomData} />
                  </div>

                  {/* REPOSITIONED NEXT ROUND BUTTON */}
                  {isAdmin && board.phase === "RESULTS" && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionMutation({
                          playerId:
                            roomData.turnOrder[roomData.currentTurnIndex],
                          actionType: "NEXT_ROUND",
                        })
                      }
                      className="w-full py-5 bg-emerald-500 text-black rounded-3xl font-black uppercase italic shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all text-sm tracking-widest border-2 border-emerald-400/50 shrink-0 mb-4"
                    >
                      {(t as any).nextRound || "Next Round"} →
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 flex flex-col justify-center text-center shadow-xl">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 italic">
                    Active Clue Link
                  </span>
                  <div className="text-2xl font-black text-blue-400 uppercase italic leading-tight">
                    {board.currentClue || "WAITING..."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="relative z-20 w-full px-4 shrink-0 pb-6 mt-[-2rem]">
          <ArcadePlayerGrid
            players={sortedPlayers}
            currentTurnId={storytellerId}
            winnerId={board.winnerId}
            winnerIds={board.winnerIds}
            isGameEnd={isFinished}
            accentColor="blue"
            hideTurnBadge={true}
            renderStats={(player) => {
              const hasSubmitted = board.submittedCards?.some(
                (sc) => sc.playerId === player._id,
              );
              const playerVotes =
                board.votes?.filter((v) => v.voterId === player._id) || [];
              const hasVoted = playerVotes.length > 0;
              const isST = player._id === storytellerId;
              const actionComplete =
                (board.phase === "SUBMITTING" && hasSubmitted) ||
                (board.phase === "VOTING" && (hasVoted || isST));
              const playerState =
                player.state.gameType === "dixit" ? player.state : null;
              const rank = calculateRank(
                (playerState as any)?.score || 0,
                allScores,
              );

              return (
                <div className="flex flex-col gap-1 font-mono">
                  <DixitPlayerStats
                    state={playerState as any}
                    rank={rank}
                    totalPlayers={players.length}
                    isST={isST}
                    isBot={player.isBot}
                    isGameEnd={isFinished}
                  />

                  {/* Vote Count Indicator (Odyssey) */}
                  {(board.phase === "VOTING" ||
                    (board.phase as string) === "VOTING_REVEAL" ||
                    board.phase === "RESULTS") &&
                    !isST && (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">
                          Tokens
                        </span>
                        <div className="flex gap-0.5">
                          {[1, 2].map((i) => (
                            <div
                              key={i}
                              className={`w-2.5 h-2.5 rounded-sm border transition-all ${i <= playerVotes.length ? "bg-blue-500 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-black/40 border-white/10 opacity-30"}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {board.phase !== "RESULTS" && board.phase !== "CLUE" && (
                    <div className="mt-1 space-y-0.5">
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: actionComplete ? "100%" : "20%" }}
                          className={`absolute inset-y-0 left-0 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700 ${actionComplete ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
            renderBadge={(player) => {
              const hasSubmitted = board.submittedCards?.some(
                (sc) => sc.playerId === player._id,
              );
              const hasVoted = board.votes?.some(
                (v) => v.voterId === player._id,
              );
              const isST = player._id === storytellerId;

              if (isST && !isFinished) return <StorytellerBadge />;
              if (board.phase === "SUBMITTING" && hasSubmitted && !isST)
                return (
                  <ArcadeBadge
                    variant="nearly-winning"
                    label="SUBMITTED"
                    icon="✓"
                    className="!bg-blue-500"
                  />
                );
              if (board.phase === "VOTING" && hasVoted)
                return (
                  <ArcadeBadge
                    variant="nearly-winning"
                    label="VOTED"
                    icon="✓"
                    className="!bg-emerald-500"
                  />
                );

              return null;
            }}
          />
        </div>
      }
      extra={
        <AnimatePresence>
          {zoomedCardId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedCardId(null)}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-12 cursor-zoom-out"
            >
              <motion.div
                layoutId={`card-${zoomedCardId}`}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative h-[500px] aspect-[2/3] rounded-[3rem] overflow-hidden border-8 border-white/20 shadow-[0_0_120px_rgba(59,130,246,0.6)]"
              >
                <Image
                  src={`/assets/games/dixit/cards/${zoomedCardId}.png`}
                  alt="ZOOMED_CARD"
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5 pointer-events-none" />

                {/* Zoomed Card Metadata (Voters & Owner) */}
                {(board.phase === "RESULTS" ||
                  (board.phase as string) === "VOTING_REVEAL") && (
                  <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 bg-black/20 pointer-events-none font-mono">
                    {zoomedCardOwner && (
                      <div className="bg-zinc-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 self-start shadow-2xl">
                        <p className="text-xs font-black uppercase text-blue-400 tracking-[0.2em]">
                          {zoomedCardOwner.name}
                          {zoomedCardOwner.isBot && (
                            <Image
                              src="/assets/general/artificial-intelligence-design-png.webp"
                              alt="AI"
                              width={12}
                              height={12}
                              className="inline-block ml-2 opacity-80"
                            />
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-2 w-full absolute bottom-0 left-0 pb-6 px-4">
                      {zoomedCardVoters.map((voter: any) => (
                        <div
                          key={voter._id}
                          className="bg-gray-900/90 text-white px-3 py-1.5 rounded-xl border-l-4 border-blue-500 shadow-2xl flex items-center gap-2 backdrop-blur-md"
                        >
                          <span className="text-xs font-black uppercase tracking-wide">
                            {voter.name}
                          </span>
                          {voter.isBot && (
                            <Image
                              src="/assets/general/artificial-intelligence-design-png.webp"
                              alt="AI"
                              width={12}
                              height={12}
                              className="inline-block opacity-80"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      }
    />
  );
}
