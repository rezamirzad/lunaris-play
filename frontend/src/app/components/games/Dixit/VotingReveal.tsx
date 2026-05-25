"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import DixitCard from "./DixitCard";
import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import StorytellerBadge from "./StorytellerBadge";

interface VotingRevealProps {
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
  onCardClick?: (cardId: string) => void;
}

export default function VotingReveal({ roomData, onCardClick }: VotingRevealProps) {
  const { t } = useTranslation();
  const board =
    roomData.gameBoard.gameType === "dixit" ? roomData.gameBoard : null;

  // Logic: Use the pre-shuffled cards from the board state to ensure consistency across all clients.
  // If not available (SUBMITTING phase), use a stable sort by cardId to keep them randomized but consistent.
  const displayCards = useMemo(() => {
    if (!board) return [];
    const submittedCards = board.submittedCards || [];
    if (board.shuffledBoardCards) return board.shuffledBoardCards;

    // Stable "random" sort for SUBMITTING phase
    return [...submittedCards].sort((a, b) => a.cardId.localeCompare(b.cardId));
  }, [board]);

  if (!board) return null;

  const votes = board.votes || [];
  const isResults = board.phase === "RESULTS";
  const storytellerId = roomData.turnOrder[roomData.currentTurnIndex];

  // Smart Grid Balancing: e.g., 8 items = 4x2 grid
  const itemCount = displayCards.length;
  const optimalCols = itemCount > 6 ? Math.ceil(itemCount / 2) : itemCount;

  return (
    <div 
      className="w-full max-w-4xl mx-auto grid gap-6 pt-4 items-start content-start justify-center"
      style={{ gridTemplateColumns: `repeat(${optimalCols}, minmax(0, 1fr))` }}
    >
      <AnimatePresence mode="popLayout">
        {displayCards.map(
          (
            submission: { cardId: string; playerId: Doc<"players">["_id"] },
            index: number,
          ) => {
            const isRevealed = board.phase === "VOTING" || isResults;
            const cardVotes = votes.filter(
              (v) => v.cardId === submission.cardId,
            );
            const owner = roomData.players.find(
              (p) => p._id === submission.playerId,
            );
            const isSTCard = submission.playerId === storytellerId;

            // Get voter data for the cinematic tokens
            const voterPlayers = cardVotes
              .map((v) => roomData.players.find((p) => p._id === v.voterId))
              .filter(Boolean) as Doc<"players">[];

            return (
              <motion.div
                key={submission.cardId}
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="relative"
              >
                <DixitCard
                  cardId={isRevealed ? submission.cardId : "BACK"}
                  isRevealed={isRevealed}
                  ownerName={isResults ? owner?.name : undefined}
                  isOwnerBot={isResults && owner?.isBot}
                  isStorytellerCard={isResults && isSTCard}
                  voters={isResults ? voterPlayers : []}
                  disabled={board.phase === "SUBMITTING"}
                  selectable={isRevealed}
                  onClick={isRevealed ? () => onCardClick?.(submission.cardId) : undefined}
                />

                {/* Unified Storyteller Badge (Dark/Gold component) */}
                {isResults && isSTCard && <StorytellerBadge />}
              </motion.div>
            );
          },
        )}
      </AnimatePresence>
    </div>
  );
}
