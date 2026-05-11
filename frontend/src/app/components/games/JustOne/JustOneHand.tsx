"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits, formatLog, Language } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import DataPacket from "./DataPacket";

export default function JustOneHand({
  room,
  player,
  initialLang,
}: {
  room: Doc<"rooms"> & { players: Doc<"players">[] };
  player: Doc<"players">;
  initialLang: Language;
}) {
  const { t } = useTranslation();
  const isFA = initialLang === "fa";

  const submitAction = useMutation(api.justone.handleAction);

  const [localClue, setLocalClue] = useState("");
  const [localGuess, setLocalGuess] = useState("");

  const board = room.gameBoard.gameType === "justone" ? room.gameBoard : null;
  if (!board) return null;

  const isInfiltrator = player._id === board.activePlayerId;
  const hasSubmittedClue = !!board.clues[player._id];
  const hasConfirmedValidation = board.confirmedPlayers?.includes(player._id);

  const handleClueSubmit = async () => {
    if (!localClue.trim()) return;
    await submitAction({
      playerId: player._id,
      actionType: "SUBMIT_CLUE",
      clue: localClue.trim(),
    });
    setLocalClue("");
  };

  const handleGuessSubmit = async (isPass: boolean = false) => {
    if (!isPass && !localGuess.trim()) return;
    await submitAction({
      playerId: player._id,
      actionType: "SUBMIT_GUESS",
      guess: isPass ? "" : localGuess.trim(),
      isPass,
    });
    setLocalGuess("");
  };

  const handleToggleCancel = async (targetPlayerId: string) => {
    await submitAction({
      playerId: player._id,
      actionType: "TOGGLE_CANCEL_CLUE",
      targetPlayerId: targetPlayerId as Doc<"players">["_id"],
    });
  };

  const handleLenientVote = async (isCorrect: boolean) => {
    await submitAction({
      playerId: player._id,
      actionType: "VOTE_LENIENT",
      isCorrect,
    });
  };

  const handleFinishValidation = async () => {
    await submitAction({
      playerId: player._id,
      actionType: "FINISH_VALIDATION",
    });
  };

  const handleNextRound = async () => {
    await submitAction({
      playerId: player._id,
      actionType: "NEXT_ROUND",
    });
  };

  // Get mystery word in local language
  const mysteryWordObj = board.mysteryWord as Record<string, string>;
  const localizedMysteryWord = mysteryWordObj[initialLang] || mysteryWordObj["en"];

  // 1. INFILTRATOR VIEW
  if (isInfiltrator) {
    return (
      <div className="flex flex-col h-full font-mono p-4 lg:p-8">
        <div className="mb-8 text-center bg-black/40 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-orange-500/5 scanline" />
          <h2 className="text-orange-400 font-black uppercase text-xl italic tracking-tighter relative z-10">
             NODE_STATUS: INFILTRATOR
          </h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <AnimatePresence mode="wait">
            {board.phase === "CLUE_INPUT" || board.phase === "VALIDATION" || board.phase === "LENIENT_VALIDATION" ? (
              <motion.div
                key="standby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 text-center"
              >
                 <div className="w-16 h-16 rounded-full border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                 <p className="text-zinc-500 uppercase tracking-[0.4em] font-black text-xs max-w-[250px]">
                    {board.phase === "LENIENT_VALIDATION" ? "UPLINK_PENDING: HACKERS VERIFYING GUESS..." : t.justone_standby}
                 </p>
              </motion.div>
            ) : board.phase === "GUESSING" ? (
              <motion.div
                key="guessing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8"
              >
                 <div className="w-full space-y-4">
                    <label className="text-[8px] font-black text-teal-500 uppercase tracking-[0.4em] px-2">DECRYPTION_INPUT</label>
                    <input
                      autoFocus
                      value={localGuess}
                      onChange={(e) => setLocalGuess(e.target.value)}
                      placeholder={t.justone_guess_placeholder}
                      className="w-full p-6 bg-black/60 border-2 border-zinc-800 rounded-2xl text-white font-black outline-none focus:border-teal-500 text-center uppercase tracking-widest text-base"
                    />
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGuessSubmit(false)}
                      className="w-full py-6 bg-white text-black font-black uppercase rounded-2xl tracking-[0.2em] touch-manipulation select-none"
                    >
                       EXECUTE_DECRYPTION
                    </motion.button>
                    <button
                      onClick={() => handleGuessSubmit(true)}
                      className="w-full py-4 text-zinc-500 font-black uppercase text-[10px] tracking-[0.4em] hover:text-rose-500 transition-colors touch-manipulation select-none"
                    >
                       {t.justone_pass}
                    </button>
                 </div>
              </motion.div>
            ) : board.phase === "ROUND_RESULTS" ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                 <div className="text-[10px] font-black tracking-[0.4em] text-zinc-600 uppercase">AWAITING_SYNC_ADVANCEMENT</div>
                 <div className="text-xs text-zinc-400 font-bold uppercase italic">The word was: {localizedMysteryWord}</div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 2. HACKER VIEW (Non-guesser)
  return (
    <div className="flex flex-col h-full font-mono p-4 lg:p-8">
       {/* HEADER */}
       <div className="mb-8 bg-black/40 rounded-3xl p-6 border border-white/5 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-teal-500/5 scanline" />
          <div className="relative z-10">
             <span className="text-[8px] font-black text-teal-500 uppercase tracking-[0.4em]">TARGET_NODE</span>
             <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                {localizedMysteryWord}
             </h2>
          </div>
          <div className="relative z-10 text-right">
             <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">ROLE</span>
             <div className="text-xs font-black text-zinc-400">DATA_HACKER</div>
          </div>
       </div>

       <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
             {board.phase === "CLUE_INPUT" ? (
               <motion.div
                 key="input"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="flex flex-col items-center justify-center flex-1 space-y-8 w-full max-w-md mx-auto"
               >
                  {hasSubmittedClue ? (
                    <div className="flex flex-col items-center gap-6 text-center">
                       <div className="text-4xl animate-pulse">🔒</div>
                       <p className="text-zinc-500 uppercase tracking-[0.4em] font-black text-[10px]">
                          DATA_PACKET_ENCRYPTED<br/>AWAITING_OTHER_HACKERS
                       </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-full space-y-4">
                         <label className="text-[8px] font-black text-teal-500 uppercase tracking-[0.4em] px-2">ENCRYPTION_KEY</label>
                         <input
                           autoFocus
                           value={localClue}
                           onChange={(e) => setLocalClue(e.target.value)}
                           placeholder={t.justone_clue_placeholder}
                           className="w-full p-6 bg-black/60 border-2 border-zinc-800 rounded-2xl text-white font-black outline-none focus:border-teal-500 text-center uppercase tracking-widest text-base"
                         />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClueSubmit}
                        className="w-full py-6 bg-teal-500 text-black font-black uppercase rounded-2xl tracking-[0.2em] shadow-lg shadow-teal-500/20 touch-manipulation select-none"
                      >
                         SUBMIT_PACKET
                      </motion.button>
                    </>
                  )}
               </motion.div>
             ) : board.phase === "VALIDATION" ? (
               <motion.div
                 key="validation"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col flex-1"
               >
                  <div className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6 text-center">
                     {t.justone_validation}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto no-scrollbar pb-32">
                     {Object.entries(board.clues).map(([pId, clue]) => (
                        <DataPacket
                          key={pId}
                          clue={clue}
                          isCanceled={board.canceledClues.includes(pId as Doc<"players">["_id"])}
                          isInteractable={true}
                          onClick={() => handleToggleCancel(pId)}
                        />
                     ))}
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                     <motion.button
                       whileHover={!hasConfirmedValidation ? { scale: 1.02, boxShadow: "0 0 30px rgba(45,212,191,0.3)" } : {}}
                       whileTap={!hasConfirmedValidation ? { scale: 0.98 } : {}}
                       onClick={handleFinishValidation}
                       disabled={hasConfirmedValidation}
                       className={`w-full py-6 font-black uppercase rounded-2xl tracking-[0.3em] shadow-2xl transition-all touch-manipulation select-none ${
                         hasConfirmedValidation 
                           ? "bg-teal-500/10 border-2 border-teal-500/40 text-teal-400" 
                           : "bg-white text-black"
                       }`}
                     >
                        {hasConfirmedValidation ? "WAITING_FOR_HACKERS" : t.justone_confirm_data}
                     </motion.button>
                  </div>
               </motion.div>
             ) : board.phase === "LENIENT_VALIDATION" ? (
               <motion.div
                 key="lenient"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center justify-center flex-1 space-y-10"
               >
                  <div className="text-center space-y-4">
                     <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">LENIENT_VALIDATION_PROTOCOL</span>
                     <div className="flex flex-col gap-2">
                        <div className="text-xs font-bold text-zinc-500 uppercase">INFILTRATOR GUESSED:</div>
                        <div className="text-3xl font-black text-white italic underline decoration-teal-500/50 underline-offset-8">{board.lastGuess}</div>
                     </div>
                     <div className="pt-4 flex flex-col gap-2">
                        <div className="text-xs font-bold text-zinc-500 uppercase">TARGET_NODE WAS:</div>
                        <div className="text-2xl font-black text-teal-400">{localizedMysteryWord}</div>
                     </div>
                  </div>

                  <div className="w-full max-w-md space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLenientVote(true)}
                          className={`py-6 rounded-2xl font-black uppercase text-sm tracking-widest border-2 transition-all touch-manipulation select-none ${
                            board.lenientVotes[player._id] === true 
                              ? "bg-teal-500/20 border-teal-500 text-teal-400" 
                              : "bg-white text-black border-transparent"
                          }`}
                        >
                           ACCEPT
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLenientVote(false)}
                          className={`py-6 rounded-2xl font-black uppercase text-sm tracking-widest border-2 transition-all touch-manipulation select-none ${
                            board.lenientVotes[player._id] === false 
                              ? "bg-rose-500/20 border-rose-500 text-rose-500" 
                              : "bg-zinc-800 text-white border-transparent"
                          }`}
                        >
                           REJECT
                        </motion.button>
                     </div>
                     <p className="text-[8px] text-center text-zinc-600 uppercase tracking-widest animate-pulse">UNANIMOUS_CONSENT_REQUIRED</p>
                  </div>
               </motion.div>
             ) : (
               <motion.div
                 key="playing"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center justify-center flex-1 gap-6 text-center"
               >
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-teal-500/20 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                     <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping" />
                  </div>
                  <p className="text-zinc-500 uppercase tracking-[0.4em] font-black text-[10px]">
                     UPLINK_BROADCASTING<br/>AWAITING_INFILTRATOR_DECISION
                  </p>

                  {board.phase === "ROUND_RESULTS" && (
                    <motion.button
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       onClick={handleNextRound}
                       className="mt-8 px-12 py-4 bg-zinc-800 text-white font-black uppercase text-xs rounded-xl tracking-widest hover:bg-teal-500 hover:text-black transition-all touch-manipulation select-none"
                    >
                       INITIATE_NEXT_CYCLE
                    </motion.button>
                  )}
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
