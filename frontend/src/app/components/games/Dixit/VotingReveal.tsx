"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import DixitCard from "./DixitCard";
import { useMemo } from "react";
import { shuffle } from "@/lib/utils";

interface VotingRevealProps {
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
}

export default function VotingReveal({ roomData }: VotingRevealProps) {
  const board = roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;

  // Logic: Use the pre-shuffled cards from the board state to ensure consistency across all clients.
  const displayCards = useMemo(() => {
    if (!board) return [];
    const submittedCards = board.submittedCards || [];
    if (board.phase === "SUBMITTING") return submittedCards;
    return board.shuffledBoardCards || submittedCards;
  }, [board]);

  if (!board) return null;

  const votes = board.votes || [];
  const isResults = board.phase === "RESULTS";
  const storytellerId = roomData.turnOrder[roomData.currentTurnIndex];

  return (
    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-4">
      <AnimatePresence mode="popLayout">
        {displayCards.map((submission: { cardId: string; playerId: Doc<"players">["_id"] }, index: number) => {
          const isRevealed = board.phase === "VOTING" || isResults;
          const cardVotes = votes.filter((v) => v.cardId === submission.cardId);
          const owner = roomData.players.find((p) => p._id === submission.playerId);
          const isSTCard = submission.playerId === storytellerId;
          
          // Get voter data for the cinematic tokens
          const voterPlayers = cardVotes.map((v) => 
            roomData.players.find((p) => p._id === v.voterId)
          ).filter(Boolean) as Doc<"players">[];

          return (
            <motion.div
              key={submission.cardId}
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.15, 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              className="relative"
            >
              <DixitCard
                cardId={isRevealed ? submission.cardId : "BACK"}
                isRevealed={isRevealed}
                ownerName={isResults ? owner?.name : undefined}
                isStorytellerCard={isResults && isSTCard}
                voters={isResults ? voterPlayers : []}
                disabled={board.phase === "SUBMITTING"}
              />
              
              {/* Cinematic Entrance for the Storyteller Badge */}
              {isResults && isSTCard && (
                <motion.div
                  initial={{ scale: 0, rotate: -20, y: 10 }}
                  animate={{ scale: 1, rotate: 0, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 10 }}
                  className="absolute -top-4 -right-4 z-30 bg-blue-500 text-white px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.6)] border-2 border-white/40 flex flex-col items-center"
                >
                  <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-80 mb-0.5">ORIGINAL_NODE</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Storyteller</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
