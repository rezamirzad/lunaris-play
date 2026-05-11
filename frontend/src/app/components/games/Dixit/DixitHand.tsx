"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { translations, Language, toPersianDigits } from "@/lib/translations";
import DixitCard from "./DixitCard";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import { shuffle } from "@/lib/utils";

export default function DixitHand({
  room,
  player,
  initialLang,
}: {
  room: Doc<"rooms"> & { players: Doc<"players">[] };
  player: Doc<"players">;
  initialLang: Language;
}) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [clue, setClue] = useState("");

  const t = translations[initialLang];
  const submitAction = useMutation(api.dixit.handleAction);
  const isFA = initialLang === "fa";

  const board = room.gameBoard.gameType === "dixit" ? room.gameBoard : null;
  const isLobby = room.status === "LOBBY";
  const storytellerId = room.turnOrder?.[room.currentTurnIndex];
  const isST = storytellerId === player._id;
  const storytellerName =
    room.players.find((p) => p._id === storytellerId)?.name || "...";

  const hasSubmitted = board?.submittedCards?.some(
    (c) => c.playerId === player._id,
  );
  const hasVoted = board?.votes?.some((v) => v.voterId === player._id);
  const roundPoints = board?.roundResults?.pointsEarned?.[player._id] || 0;

  const isWaitingPhase =
    (isST && (board?.phase === "SUBMITTING" || board?.phase === "VOTING")) ||
    (!isST && board?.phase === "SUBMITTING" && hasSubmitted) ||
    (!isST && board?.phase === "VOTING" && hasVoted);

  const displayCards = useMemo(() => {
    if (isLobby || !player.gameHand?.length || player.gameHand[0] === "BACK") {
      return ["BACK", "BACK", "BACK", "BACK", "BACK", "BACK"];
    }
    if (board?.phase === "VOTING" && !isST) {
      // Logic: Use the pre-shuffled cards from the board state to ensure relative consistency across nodes.
      // We filter out the player's own card before displaying.
      const cardsToDisplay = (board.shuffledBoardCards || board.submittedCards || [])
        .filter((c) => c.playerId !== player._id);
      return cardsToDisplay;
    }
    return player.gameHand;
  }, [
    isLobby,
    player.gameHand.length,
    board?.phase,
    board?.submittedCards.length,
    isST,
    player._id,
  ]);

  const pointReasons = useMemo(() => {
    if (board?.phase !== "RESULTS" || !board.roundResults) return null;
    const results = board.roundResults;
    const myCard = board.submittedCards?.find(
      (c) => c.playerId === player._id,
    )?.cardId;
    const votesForMe =
      board.votes?.filter(
        (v) => v.cardId === myCard && v.voterId !== player._id,
      ).length || 0;
    const votedCorrect = board.votes?.some(
      (v) =>
        v.voterId === player._id && v.cardId === results.storytellerCard,
    );

    // Dixit Scoring Rules for "All or None" edge case:
    const votesForStoryteller = board.votes?.filter(
      (v) => v.cardId === results.storytellerCard
    ).length || 0;
    const totalGuessers = room.players.length - 1;
    const everyoneGuessed = votesForStoryteller === totalGuessers;
    const noOneGuessed = votesForStoryteller === 0;
    const isAllOrNone = everyoneGuessed || noOneGuessed;

    const reasons = [];
    if (isST) {
      if (isAllOrNone) {
        if (everyoneGuessed) {
          reasons.push(`${t.dixit_st_fail_all} (0 pts)`);
        } else {
          reasons.push(`${t.dixit_st_fail_none} (0 pts)`);
        }
      } else {
        reasons.push(`${t.dixit_st_bonus} (+3)`);
      }
    } else {
      if (isAllOrNone) {
        if (everyoneGuessed) {
          reasons.push(`${t.dixit_found_original_all} (+2)`);
        } else {
          reasons.push(`${t.dixit_found_original_none} (+2)`);
        }
      } else {
        if (votedCorrect) {
          reasons.push(`${t.dixit_found_original} (+3)`);
        }
      }

      if (votesForMe > 0)
        reasons.push(`${votesForMe} ${t.dixit_others_fooled} (+${votesForMe})`);
    }
    return reasons;
  }, [
    board?.phase,
    board?.roundResults,
    board?.submittedCards,
    board?.votes,
    player._id,
    room.players.length,
    isST,
    t,
  ]);

  const handleAction = async () => {
    if (!board) return;
    if (board.phase === "RESULTS") {
      if (isST)
        await submitAction({ playerId: player._id, actionType: "NEXT_ROUND" });
      return;
    }
    if (!selectedCard || isLobby || isWaitingPhase) return;
    await submitAction({
      playerId: player._id,
      actionType:
        board.phase === "CLUE"
          ? "SUBMIT_CLUE"
          : board.phase === "SUBMITTING"
            ? "SUBMIT_CARD"
            : "SUBMIT_VOTE",
      cardId: selectedCard,
      clue: clue || undefined,
    });
    setSelectedCard(null);
    setClue("");
  };

  return (
    <div className="flex flex-col h-full font-mono p-4 lg:p-8">
      {/* PHASE HEADER */}
      <div className="mb-8 text-center min-h-[100px] flex flex-col justify-center bg-black/20 rounded-3xl p-6 border border-white/5">
        <AnimatePresence mode="wait">
          {board?.phase === "RESULTS" ? (
            <motion.div
              key="results"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-y-3"
            >
              <h2 className="text-blue-500 font-black uppercase text-4xl italic tracking-tighter">
                +{isFA ? toPersianDigits(roundPoints) : roundPoints} PTS
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {pointReasons?.map((reason, idx) => (
                  <span
                    key={idx}
                    className="text-zinc-500 text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active-phase"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
            >
              <h2
                className={`font-black uppercase text-xl italic tracking-tighter ${isST ? "text-blue-400" : "text-white"}`}
              >
                {isST
                  ? `⚡ NODE_STORYTELLER: YOUR_SEQUENCE ⚡`
                  : `WAITING_FOR_${storytellerName.toUpperCase()}`}
              </h2>

              {/* 🔍 CLUE READOUT FOR ALL NODES */}
              {board?.currentClue && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl inline-block relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[8px] text-blue-400 font-black tracking-[0.4em] mb-1 block">
                    STORY_CLUE_TRANSMISSION
                  </span>
                  <p className="text-xl font-black text-white italic tracking-tight [text-shadow:0_0_15px_rgba(59,130,246,0.3)] leading-none uppercase">
                    "{board.currentClue}"
                  </p>
                </motion.div>
              )}

              <p className="text-[9px] text-zinc-500 mt-4 uppercase tracking-[0.3em] font-black">
                {board?.phase === "CLUE"
                  ? isST
                    ? t.dixit_phase_clue
                    : t.dixit_wait_storyteller
                  : board?.phase === "SUBMITTING"
                    ? hasSubmitted
                      ? t.dixit_wait_others
                      : t.dixit_phase_submit
                    : hasVoted
                      ? t.dixit_wait_others
                      : t.dixit_guess_card}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CLUE INPUT (STORYTELLER ONLY) */}
      <AnimatePresence>
        {board?.phase === "CLUE" && isST && selectedCard && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6"
          >
            <input
              autoFocus
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder={t.dixit_clue_placeholder}
              className="w-full p-6 bg-black/60 border-2 border-zinc-800 rounded-2xl text-white font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-center uppercase tracking-widest shadow-inner placeholder:opacity-20 text-base"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD GRID */}
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto no-scrollbar pb-32" dir="ltr">
        {displayCards.map((item: string | { playerId: Doc<"players">["_id"]; cardId: string }, i: number) => {
          const cardId = typeof item === "string" ? item : item.cardId;
          const ownerName =
            typeof item === "object"
              ? room.players.find((p) => p._id === item.playerId)?.name
              : undefined;

          return (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.05,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <DixitCard
                cardId={cardId}
                isLobby={isLobby}
                selected={selectedCard === cardId}
                selectable={
                  !isLobby && !isWaitingPhase && board?.phase !== "RESULTS"
                }
                onClick={() => setSelectedCard(cardId)}
                isRevealed={!isLobby && cardId !== "BACK"}
                ownerName={board?.phase === "RESULTS" ? ownerName : undefined}
                disabled={
                  isLobby ||
                  (board?.phase === "VOTING" && isST) ||
                  isWaitingPhase ||
                  board?.phase === "RESULTS"
                }
              />
            </motion.div>
          );
        })}
      </div>

      {/* ACTION TRIGGER */}
      <div className="absolute bottom-8 left-0 right-0 px-8 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <motion.button
            whileHover={
              !(board?.phase === "RESULTS"
                ? !isST
                : !selectedCard ||
                  (board?.phase === "CLUE" && !clue) ||
                  isWaitingPhase)
                ? { scale: 1.02, boxShadow: "0 0 40px rgba(59,130,246,0.3)" }
                : {}
            }
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            disabled={
              board?.phase === "RESULTS"
                ? !isST
                : !selectedCard ||
                  (board?.phase === "CLUE" && !clue) ||
                  isWaitingPhase
            }
            className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-lg tracking-[0.2em] disabled:opacity-10 transition-all shadow-2xl relative overflow-hidden group touch-manipulation select-none"
          >
            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 group-hover:text-white transition-colors">
              {board?.phase === "RESULTS"
                ? isST
                  ? "INITIATE_NEXT_ROUND"
                  : "WAITING_FOR_ST_SYNC"
                : isWaitingPhase
                  ? "NODE_WAIT_STATE"
                  : "EXECUTE_SEQUENCE"}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
