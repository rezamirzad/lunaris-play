"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { translations, Language } from "@/lib/translations";
import DixitCard from "./DixitCard";

export default function DixitHand({
  room,
  player,
  initialLang,
}: {
  room: any;
  player: any;
  initialLang: Language;
}) {
  const [lang] = useState<Language>(initialLang);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [clue, setClue] = useState("");

  const t = translations[lang];
  const submitAction = useMutation((api as any).games.dixit.handleAction);

  const board = room?.gameBoard;

  // Early return if board data isn't initialized yet
  if (!board) return null;

  const isStoryteller = room.turnOrder[room.currentTurnIndex] === player._id;
  const hasSubmitted = board.submittedCards?.some(
    (c: any) => c.playerId === player._id,
  );
  const hasVoted = board.votes?.some((v: any) => v.voterId === player._id);

  const handleAction = async () => {
    if (!selectedCard) return;

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

  return (
    <div
      className="flex flex-col min-h-screen bg-zinc-950 text-white font-black p-6"
      dir={lang === "fa" ? "rtl" : "ltr"}
    >
      <div className="flex justify-between items-center mb-8 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            {t.players}
          </p>
          <p className="text-xl italic">{player.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            {t.dixit_score}
          </p>
          <p className="text-xl text-teal-500">
            {player.state?.score || 0} pts
          </p>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-teal-500 uppercase tracking-tighter text-2xl">
          {board.phase === "CLUE" &&
            (isStoryteller ? t.dixit_phase_clue : t.dixit_wait_storyteller)}
          {board.phase === "SUBMITTING" &&
            (hasSubmitted ? t.dixit_wait_others : t.dixit_phase_submit)}
          {board.phase === "VOTING" &&
            (isStoryteller
              ? t.dixit_wait_others
              : hasVoted
                ? t.dixit_wait_others
                : t.dixit_guess_card)}
        </h2>
        {board.currentClue && (
          <p className="bg-white text-black mt-2 py-1 px-4 rounded-full inline-block italic font-serif">
            "{board.currentClue}"
          </p>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pb-24 no-scrollbar">
        {(board.phase === "VOTING" && !isStoryteller
          ? board.submittedCards
          : player.gameHand
        ).map((item: any, i: number) => {
          const cardId = typeof item === "string" ? item : item.cardId;
          const isMyOwnCard =
            board.submittedCards?.find((sc: any) => sc.playerId === player._id)
              ?.cardId === cardId;

          return (
            <DixitCard
              key={i}
              cardId={cardId}
              selected={selectedCard === cardId}
              onClick={() => setSelectedCard(cardId)}
              isRevealed={true}
              disabled={
                isMyOwnCard ||
                hasSubmitted ||
                hasVoted ||
                (board.phase === "VOTING" && isStoryteller)
              }
            />
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
        {board.phase === "CLUE" && isStoryteller && selectedCard && (
          <input
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            placeholder={t.dixit_clue_placeholder}
            className="w-full mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:border-teal-500"
          />
        )}

        <button
          onClick={handleAction}
          disabled={!selectedCard || (board.phase === "CLUE" && !clue)}
          className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xl shadow-2xl active:scale-95 transition-all disabled:opacity-20"
        >
          {t.startMatch}
        </button>
      </div>
    </div>
  );
}
