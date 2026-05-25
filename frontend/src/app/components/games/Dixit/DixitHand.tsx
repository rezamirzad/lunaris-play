"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useState, useMemo, useEffect } from "react";
import { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import DixitCard from "./DixitCard";
import { fixPersianPunctuation } from "@/lib/translations";

interface DixitHandProps {
  room: Doc<"rooms"> & { players: Doc<"players">[] };
  player: Doc<"players">;
}

export default function DixitHand({ room, player }: DixitHandProps) {
  const { t, lang: initialLang } = useTranslation();
  const handleActionMutation = useMutation(api.dixit.handleAction);

  const board = room.gameBoard.gameType === "dixit" ? room.gameBoard : null;
  const storytellerId = room.turnOrder[room.currentTurnIndex];
  const isST = player._id === storytellerId;
  const isOdyssey = board?.ruleset === "ODYSSEY";

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [clue, setClue] = useState("");

  // Auto-sync selection from board state (crucial for reconnects)
  useEffect(() => {
    if (board?.phase === "VOTING" && !isST) {
      const myVotes =
        board.votes
          ?.filter((v) => v.voterId === player._id)
          .map((v) => v.cardId) || [];
      if (isOdyssey) {
        setSelectedCards(myVotes);
      } else if (myVotes.length > 0) {
        setSelectedCard(myVotes[0]);
      }
    }
  }, [board?.phase, board?.votes, isST, player._id, isOdyssey]);

  const hasSubmitted = board?.submittedCards?.some(
    (c: any) => c.playerId === player._id,
  );
  const hasVoted = board?.votes?.some((v: any) => v.voterId === player._id);

  const isWaitingPhase =
    (board?.phase === "SUBMITTING" && hasSubmitted) ||
    (board?.phase === "VOTING" && (hasVoted || isST));

  const isLobby = room.status.toUpperCase() === "LOBBY";

  const displayCards = useMemo(() => {
    if (isLobby) return player.gameHand || [];
    const phase = board?.phase as string;
    if (
      phase === "VOTING" ||
      phase === "RESULTS" ||
      phase === "VOTING_REVEAL"
    ) {
      const cardsToDisplay = (board?.shuffledBoardCards || [])
        .map((item: any) => {
          const cardId = typeof item === "string" ? item : item.cardId;
          const submission = board?.submittedCards?.find(
            (c: any) => c.cardId === cardId,
          );
          return submission
            ? { playerId: submission.playerId, cardId }
            : cardId;
        })
        .filter((c: any) => {
          const cardId = typeof c === "string" ? c : c.cardId;
          // Filter out own card during voting phase (cannot vote for yourself)
          if (board?.phase === "VOTING") {
            const submission = board?.submittedCards?.find(
              (s: any) => s.cardId === cardId,
            );
            return submission?.playerId !== player._id;
          }
          return true;
        });
      return cardsToDisplay;
    }
    return player.gameHand || [];
  }, [
    isLobby,
    player.gameHand,
    board?.phase,
    board?.shuffledBoardCards,
    board?.submittedCards,
    player._id,
  ]);

  const storytellerName =
    room.players.find((p) => p._id === storytellerId)?.name || "Storyteller";

  // Localized clue logic for the player's device
  const activeClue = board?.currentClues
    ? (board.currentClues as any)[initialLang] || board.currentClue
    : board?.currentClue;

  const myRoundResults = useMemo(() => {
    if ((board?.phase as string) !== "RESULTS" || !board?.roundResults)
      return null;
    const results = board.roundResults;
    const pointsEarned = results.pointsEarned[player._id] || 0;

    const breakdown = [];
    const myVotes = board.votes?.filter((v) => v.voterId === player._id) || [];
    const myCard = board.submittedCards?.find(
      (c) => c.playerId === player._id,
    )?.cardId;
    const votesForMe =
      board.votes?.filter((v) => v.cardId === myCard && v.voterId !== storytellerId)
        .length || 0;
    const votesForST =
      board.votes?.filter((v) => v.cardId === results.storytellerCard).length || 0;
    const totalGuessers = room.players.length - 1;
    const isAllOrNone = votesForST === totalGuessers || votesForST === 0;

    if (isST) {
      if (!isAllOrNone) breakdown.push({ label: "Success", pts: 3 });
      else breakdown.push({ label: "Failed", pts: 0 });
    } else {
      if (isAllOrNone) {
        breakdown.push({ label: "Safe", pts: 2 });
      } else {
        const votedCorrect = myVotes.some(
          (v) => v.cardId === results.storytellerCard,
        );
        if (votedCorrect) {
          if (isOdyssey && myVotes.length === 1)
            breakdown.push({ label: "Risk Bonus", pts: 4 });
          else breakdown.push({ label: "Guess", pts: 3 });
        }
      }
      if (votesForMe > 0) {
        const trapPts = isOdyssey ? Math.min(3, votesForMe) : votesForMe;
        breakdown.push({ label: "Traps", pts: trapPts });
      }
    }

    return { total: pointsEarned, breakdown };
  }, [
    board?.phase,
    board?.roundResults,
    board?.votes,
    board?.submittedCards,
    player._id,
    isST,
    storytellerId,
    isOdyssey,
    room.players.length,
  ]);

  const handleCardClick = (cardId: string) => {
    if (isLobby || isWaitingPhase || board?.phase === "RESULTS") return;

    if (board?.phase === "VOTING" && isOdyssey && !isST) {
      setSelectedCards((prev) => {
        if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
        if (prev.length < 2) return [...prev, cardId];
        return [prev[1], cardId]; // Keep the last one
      });
    } else {
      setSelectedCard(cardId);
    }
  };

  const handleAction = async () => {
    if (board?.phase === "CLUE" && isST && selectedCard && clue) {
      await handleActionMutation({
        playerId: player._id,
        actionType: "SUBMIT_CLUE",
        cardId: selectedCard,
        clue,
      });
      setClue("");
      setSelectedCard(null);
    } else if (board?.phase === "SUBMITTING" && !isST && selectedCard) {
      await handleActionMutation({
        playerId: player._id,
        actionType: "SUBMIT_CARD",
        cardId: selectedCard,
      });
      setSelectedCard(null);
    } else if (board?.phase === "VOTING" && !isST) {
      if (isOdyssey) {
        if (selectedCards.length === 0) return;
        await handleActionMutation({
          playerId: player._id,
          actionType: "SUBMIT_VOTE",
          voteIds: selectedCards,
        });
      } else if (selectedCard) {
        await handleActionMutation({
          playerId: player._id,
          actionType: "SUBMIT_VOTE",
          cardId: selectedCard,
        });
      }
      setSelectedCard(null);
      setSelectedCards([]);
    } else if (board?.phase === "RESULTS" && isST) {
      await handleActionMutation({
        playerId: player._id,
        actionType: "NEXT_ROUND",
      });
    }
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 bg-[#020203] text-white font-mono select-none min-h-0">
      {/* HUD SECTION */}
      <div className="mb-4 relative shrink-0">
        <AnimatePresence mode="wait">
          {(board?.phase as string) === "RESULTS" && myRoundResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-[2rem] text-center shadow-[0_0_50px_rgba(16,185,129,0.1)]"
            >
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.4em] block mb-2">
                Round Summary
              </span>
              <div className="flex flex-col gap-3">
                <div className="text-4xl font-black italic text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  +{myRoundResults.total}{" "}
                  <span className="text-xs uppercase tracking-widest text-emerald-400/60 not-italic">
                    Pts
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {myRoundResults.breakdown.map((b, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 px-3 py-1 rounded-lg border border-white/5 flex items-center gap-1.5"
                    >
                      <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">
                        {b.label}
                      </span>
                      <span className="text-[10px] font-black text-white">
                        +{b.pts}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : isWaitingPhase ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center p-6 sm:p-8 bg-zinc-900/40 border border-white/5 rounded-3xl text-center"
            >
              <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 flex items-center justify-center mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-zinc-500 uppercase tracking-widest">
                {t.waiting}
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-600 mt-1">
                {t.dixit_wait_others_action}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <h2
                className={`font-black uppercase text-lg sm:text-xl italic tracking-tighter ${isST ? "text-blue-400" : "text-white"}`}
              >
                {isST
                  ? t.storyteller
                  : `${t.waiting} ${storytellerName.toUpperCase()}`}
              </h2>

              {activeClue && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-2 p-3 sm:p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl inline-block relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[7px] sm:text-[8px] text-blue-400 font-black tracking-[0.4em] mb-0.5 sm:mb-1 block uppercase">
                    {t.dixit_clue_received}
                  </span>
                  <p
                    className={`text-lg sm:text-xl font-black text-white italic tracking-tight [text-shadow:0_0_15px_rgba(59,130,246,0.3)] leading-none uppercase`}
                    dir={initialLang === "fa" ? "rtl" : "ltr"}
                  >
                    {fixPersianPunctuation(activeClue || "", initialLang)}
                  </p>
                </motion.div>
              )}

              <p className="text-[8px] sm:text-[9px] text-zinc-500 mt-3 sm:mt-4 uppercase tracking-[0.3em] font-black">
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
                      : isOdyssey
                        ? "SELECT UP TO 2 CARDS"
                        : t.dixit_guess_card}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ENHANCED Odyssey Risk Bonus Warning */}
        {board?.phase === "VOTING" &&
          isOdyssey &&
          !isST &&
          !hasVoted &&
          selectedCards.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute -top-12 left-0 right-0 flex justify-center z-50 pointer-events-none"
            >
              <div className="bg-amber-400 text-black text-[10px] font-black px-6 py-2 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.6)] border-2 border-amber-200 uppercase tracking-wider animate-bounce flex items-center gap-2">
                <span className="text-sm">✨</span>
                RISK BONUS: +1 PT IF CORRECT!
              </div>
            </motion.div>
          )}
      </div>

      {/* CLUE INPUT (STORYTELLER ONLY) */}
      <AnimatePresence>
        {board?.phase === "CLUE" && isST && selectedCard && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 shrink-0"
          >
            <input
              autoFocus
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder={t.dixit_clue_placeholder}
              className="w-full p-4 sm:p-6 bg-black/60 border-2 border-zinc-800 rounded-2xl text-white font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-center uppercase tracking-widest shadow-inner placeholder:opacity-20 text-sm sm:text-base"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTION TRIGGER - RE-ALIGNED ABOVE CARDS */}
      <div className="mb-4 shrink-0">
        <motion.button
          whileHover={
            !(board?.phase === "RESULTS"
              ? !isST
              : isOdyssey && board?.phase === "VOTING" && !isST
                ? selectedCards.length === 0
                : !selectedCard ||
                  (board?.phase === "CLUE" && !clue) ||
                  isWaitingPhase)
              ? { scale: 1.02, boxShadow: "0 0 40px rgba(59,130,246,0.3)" }
              : {}
          }
          whileTap={{ scale: 0.98 }}
          onTap={handleAction}
          disabled={
            board?.phase === "RESULTS"
              ? !isST
              : isOdyssey && board?.phase === "VOTING" && !isST
                ? selectedCards.length === 0
                : !selectedCard ||
                  (board?.phase === "CLUE" && !clue) ||
                  isWaitingPhase
          }
          className="w-full py-4 sm:py-5 bg-white text-black rounded-2xl font-black uppercase text-sm sm:text-base tracking-[0.2em] disabled:opacity-10 transition-all shadow-2xl relative overflow-hidden group touch-manipulation select-none"
        >
          <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 group-hover:text-white transition-colors">
            {board?.phase === "RESULTS"
              ? isST
                ? "NEXT ROUND →"
                : "WAITING FOR STORYTELLER..."
              : isWaitingPhase
                ? "WAITING FOR OTHERS..."
                : board?.phase === "CLUE"
                  ? "SEND CLUE"
                  : board?.phase === "SUBMITTING"
                    ? "SUBMIT CARD"
                    : "CONFIRM VOTE"}
          </span>
        </motion.button>
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 pb-12" dir="ltr">
        {displayCards.map(
          (
            item: string | { playerId: Doc<"players">["_id"]; cardId: string },
            i: number,
          ) => {
            const cardId = typeof item === "string" ? item : item.cardId;
            const ownerName =
              typeof item === "object"
                ? room.players.find((p) => p._id === item.playerId)?.name
                : undefined;

            const isSelected =
              isOdyssey && !isST && board?.phase === "VOTING"
                ? selectedCards.includes(cardId)
                : selectedCard === cardId;

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
                  selected={isSelected}
                  selectable={
                    !isLobby && !isWaitingPhase && board?.phase !== "RESULTS"
                  }
                  onClick={() => handleCardClick(cardId)}
                  isRevealed={!isLobby && cardId !== "BACK"}
                  ownerName={board?.phase === "RESULTS" ? ownerName : undefined}
                  disabled={
                    isLobby ||
                    (board?.phase === "VOTING" && isST) ||
                    isWaitingPhase ||
                    board?.phase === "RESULTS" ||
                    (board?.phase === "VOTING" &&
                      isOdyssey &&
                      !isST &&
                      !selectedCards.includes(cardId) &&
                      selectedCards.length >= 2)
                  }
                />
              </motion.div>
            );
          },
        )}
      </div>
    </div>
  );
}
