"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { translations, Language, toPersianDigits } from "@/lib/translations";
import DixitCard from "./DixitCard";

const BACK_COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#c026d3",
  "#db2777",
  "#e11d48",
  "#ea580c",
  "#d97706",
  "#ca8a04",
  "#65a30d",
  "#16a34a",
  "#0891b2",
  "#0284c7",
];

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

  const board = room?.gameBoard;
  const isLobby = room.status === "LOBBY";
  const isFA = lang === "fa";

  const isStoryteller = room.turnOrder?.[room.currentTurnIndex] === player._id;
  const hasSubmitted = board?.submittedCards?.some(
    (c: any) => c.playerId === player._id,
  );
  const hasVoted = board?.votes?.some((v: any) => v.voterId === player._id);

  const handleAction = async () => {
    if (!selectedCard || isLobby) return;

    let type = "";
    if (board.phase === "CLUE") type = "SUBMIT_CLUE";
    else if (board.phase === "SUBMITTING") type = "SUBMIT_CARD";
    else if (board.phase === "VOTING") type = "SUBMIT_VOTE";

    await submitAction({
      playerId: player._id,
      actionType: type,
      cardId: selectedCard,
      clue: clue || undefined,
    });

    setSelectedCard(null);
    setClue("");
  };

  const displayCards =
    player.gameHand && player.gameHand.length > 0
      ? board?.phase === "VOTING" && !isStoryteller
        ? board.submittedCards
        : player.gameHand
      : ["BACK", "BACK", "BACK", "BACK", "BACK", "BACK"];

  return (
    <div
      className="flex flex-col min-h-screen bg-zinc-950 text-white font-black overflow-hidden"
      dir={isFA ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen p-2 sm:p-6">
        {/* HEADER: flex-row-reverse for Persian ensures Name is Left and Score is Right */}
        <div
          className={`flex items-center justify-between mb-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 shadow-inner mt-2 ${isFA ? "flex-row-reverse" : "flex-row"}`}
        >
          <div className="flex flex-col">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mb-1">
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
                className={`px-3 py-1 rounded-lg text-[9px] font-black transition-colors ${lang === l.toLowerCase() ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div
            className={`flex flex-col ${isFA ? "items-start" : "items-end"}`}
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mb-1">
              {t.dixit_score}
            </p>
            <p className="text-2xl text-teal-500">
              {isFA
                ? toPersianDigits(player.state?.score || 0)
                : player.state?.score || 0}{" "}
            </p>
          </div>
        </div>

        {/* STATUS SECTION */}
        <div className="mb-4 text-center px-4">
          <h2 className="text-teal-500 uppercase tracking-tighter text-xl leading-tight">
            {isLobby ? (
              t.waitingPlayers
            ) : (
              <>
                {board?.phase === "CLUE" &&
                  (isStoryteller
                    ? t.dixit_phase_clue
                    : t.dixit_wait_storyteller)}
                {board?.phase === "SUBMITTING" &&
                  (hasSubmitted ? t.dixit_wait_others : t.dixit_phase_submit)}
                {board?.phase === "VOTING" &&
                  (isStoryteller
                    ? t.dixit_wait_others
                    : hasVoted
                      ? t.dixit_wait_others
                      : t.dixit_guess_card)}
              </>
            )}
          </h2>
          {board?.currentClue && !isLobby && (
            <p className="bg-white text-black mt-2 py-1.5 px-5 rounded-full inline-block italic text-sm shadow-xl font-bold">
              "{board.currentClue}"
            </p>
          )}
        </div>

        {/* CARD GRID */}
        <div className="flex-1 grid grid-cols-3 gap-3 sm:gap-5 overflow-y-auto no-scrollbar pb-36 px-1">
          {displayCards.map((item: any, i: number) => {
            const cardId = typeof item === "string" ? item : item.cardId;

            return (
              <DixitCard
                key={i}
                cardId={cardId}
                isLobby={isLobby}
                backColor={BACK_COLORS[i % BACK_COLORS.length]}
                selected={selectedCard === cardId}
                selectable={!isLobby && !hasSubmitted && !hasVoted}
                onClick={() => setSelectedCard(cardId)}
                isRevealed={!isLobby && cardId !== "BACK"}
                disabled={
                  isLobby ||
                  hasSubmitted ||
                  hasVoted ||
                  (board?.phase === "VOTING" && isStoryteller)
                }
              />
            );
          })}
        </div>

        {/* ACTION PANEL */}
        {!isLobby && (
          <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent z-20">
            <div className="max-w-2xl mx-auto w-full">
              {board?.phase === "CLUE" && isStoryteller && selectedCard && (
                <input
                  autoFocus
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  placeholder={t.dixit_clue_placeholder}
                  className="w-full mb-4 p-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-white text-lg outline-none focus:border-teal-500 shadow-2xl transition-all"
                />
              )}

              <button
                onClick={handleAction}
                disabled={!selectedCard || (board?.phase === "CLUE" && !clue)}
                className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase text-xl shadow-[0_15px_35px_rgba(255,255,255,0.2)] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
              >
                {t.action}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
