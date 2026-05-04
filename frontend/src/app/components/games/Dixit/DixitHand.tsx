"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { translations, Language, toPersianDigits } from "@/lib/translations";
import DixitCard from "./DixitCard";

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export default function DixitHand({
  room,
  player,
  initialLang,
}: {
  room: any;
  player: any;
  initialLang: Language;
}) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [clue, setClue] = useState("");

  const t = translations[lang];
  const submitAction = useMutation((api as any).games.dixit.handleAction);
  const isFA = lang === "fa";

  const board = room?.gameBoard;
  const isLobby = room.status === "LOBBY";
  const storytellerId = room.turnOrder?.[room.currentTurnIndex];
  const isST = storytellerId === player._id;
  const storytellerName =
    room.players.find((p: any) => p._id === storytellerId)?.name || "...";

  const hasSubmitted = board?.submittedCards?.some(
    (c: any) => c.playerId === player._id,
  );
  const hasVoted = board?.votes?.some((v: any) => v.voterId === player._id);
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
      const seed = `${room._id}${board.currentClue || ""}`;
      return [...(board.submittedCards || [])]
        .filter((c: any) => c.playerId !== player._id)
        .sort((a: any, b: any) => {
          const hashA = hashString(a.cardId + seed);
          const hashB = hashString(b.cardId + seed);
          return hashA - hashB;
        });
    }
    return player.gameHand;
  }, [
    isLobby,
    player.gameHand,
    board?.phase,
    board?.submittedCards,
    isST,
    player._id,
    room._id,
    board?.currentClue,
  ]);

  const pointReasons = useMemo(() => {
    if (board?.phase !== "RESULTS" || !board.roundResults) return null;
    const results = board.roundResults;
    const myPoints = results.pointsEarned?.[player._id] || 0;
    const myCard = board.submittedCards?.find(
      (c: any) => c.playerId === player._id,
    )?.cardId;
    const votesForMe =
      board.votes?.filter(
        (v: any) => v.cardId === myCard && v.voterId !== player._id,
      ).length || 0;
    const votedCorrect = board.votes?.some(
      (v: any) =>
        v.voterId === player._id && v.cardId === results.storytellerCard,
    );

    const reasons = [];
    if (isST) {
      if (myPoints === 3) reasons.push(t.dixit_st_bonus || "STORYTELLER BONUS");
      else if (myPoints === 0) reasons.push(t.dixit_st_fail || "0 PTS");
    } else {
      if (votedCorrect) reasons.push(`${t.dixit_found_original} (+3)`);
      if (votesForMe > 0)
        reasons.push(`${votesForMe} ${t.dixit_others_fooled} (+${votesForMe})`);
      if (myPoints === 2 && !votedCorrect)
        reasons.push(`${t.dixit_all_or_none} (+2)`);
    }
    return reasons;
  }, [
    board?.phase,
    board.roundResults,
    player._id,
    isST,
    board.submittedCards,
    board.votes,
    t,
  ]);

  const handleAction = async () => {
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
    <div
      className="flex flex-col min-h-screen bg-zinc-950 text-white font-black overflow-hidden"
      dir={isFA ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen p-2 sm:p-6">
        <header className="flex justify-between items-center mb-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 mt-2">
          <div className="flex flex-col">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
              {t.players}
            </p>
            <p className="text-lg italic truncate max-w-[120px]">
              {player.name}
            </p>
          </div>
          <div className="flex gap-1 items-center px-2" dir="ltr">
            {["EN", "FR", "DE", "FA"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l.toLowerCase() as Language)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black transition-colors ${lang === l.toLowerCase() ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
              {t.dixit_score}
            </p>
            <p className="text-2xl text-teal-500">
              {isFA
                ? toPersianDigits(player.state?.score || 0)
                : player.state?.score || 0}{" "}
              PTS
            </p>
          </div>
        </header>

        <div className="mb-4 text-center px-4 min-h-[100px] flex flex-col justify-center">
          {board?.phase === "RESULTS" ? (
            <div className="animate-in zoom-in duration-500 space-y-2">
              <h2 className="text-teal-500 uppercase text-4xl">
                +{isFA ? toPersianDigits(roundPoints) : roundPoints} PTS
              </h2>
              <div className="flex flex-col gap-1">
                {pointReasons?.map((reason, idx) => (
                  <p
                    key={idx}
                    className="text-zinc-400 text-[9px] font-black uppercase tracking-tighter"
                  >
                    • {reason}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-teal-500 uppercase text-xl">
                {isST
                  ? `⚡ ${t.yourTurn} ⚡`
                  : `${t.waiting} ${storytellerName}`}
              </h2>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">
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
            </>
          )}
        </div>

        <div className="flex-1 grid grid-cols-3 gap-3 overflow-y-auto no-scrollbar pb-36 px-1">
          {displayCards.map((item: any, i: number) => {
            const cardId = typeof item === "string" ? item : item.cardId;
            return (
              <DixitCard
                key={i}
                cardId={cardId}
                isLobby={isLobby}
                selected={selectedCard === cardId}
                selectable={
                  !isLobby && !isWaitingPhase && board.phase !== "RESULTS"
                }
                onClick={() => setSelectedCard(cardId)}
                isRevealed={!isLobby && cardId !== "BACK"}
                disabled={
                  isLobby ||
                  (board.phase === "VOTING" && isST) ||
                  isWaitingPhase ||
                  board.phase === "RESULTS"
                }
              />
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 to-transparent z-20">
          <div className="max-w-2xl mx-auto">
            {board?.phase === "CLUE" && isST && selectedCard && (
              <input
                autoFocus
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                placeholder={t.dixit_clue_placeholder}
                className="w-full mb-4 p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-white outline-none focus:border-teal-500"
              />
            )}
            <button
              onClick={handleAction}
              disabled={
                board.phase === "RESULTS"
                  ? !isST
                  : !selectedCard ||
                    (board.phase === "CLUE" && !clue) ||
                    isWaitingPhase
              }
              className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase text-xl disabled:opacity-20 transition-all"
            >
              {board.phase === "RESULTS"
                ? isST
                  ? t.startMatch
                  : t.waiting
                : isWaitingPhase
                  ? t.dixit_wait_others
                  : t.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
