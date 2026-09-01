import { parseFlip7Card, calculateFlip7RoundScore } from "../flip7_deck";

export interface Flip7BotContext {
  myId: string;
  faceUpCards: string[];
  hasSecondChance: boolean;
  bankedScore: number;
  persona: "cautious" | "balanced" | "aggressive";
  board: any;
}

/**
 * Calculates exact bust probability for a given hand against remaining deck
 */
export function calculateBustProbability(faceUpCards: string[], deck: string[]): number {
  if (deck.length === 0) return 0;

  const existingNumbers = new Set(
    faceUpCards.map((cId) => parseFlip7Card(cId).numberValue).filter((n) => n !== undefined),
  );

  let duplicateCount = 0;
  deck.forEach((cardId) => {
    const parsed = parseFlip7Card(cardId);
    if (parsed.type === "NUMBER" && parsed.numberValue !== undefined) {
      if (existingNumbers.has(parsed.numberValue)) {
        duplicateCount++;
      }
    }
  });

  return duplicateCount / deck.length;
}

/**
 * Executes persona-based Flip 7 decision
 */
export function decideFlip7Action(ctx: Flip7BotContext): "HIT" | "FREEZE" {
  const { faceUpCards, hasSecondChance, persona, board } = ctx;

  // Mandatory Flip 3 sequence forces HIT
  if ((board.mustFlipCount || 0) > 0) return "HIT";

  // First card of round is always a HIT
  if (faceUpCards.length === 0) return "HIT";

  // WIN CONDITION CHECK: If current round score + banked score >= 200 (target score), FREEZE immediately to win!
  const scoreInfo = calculateFlip7RoundScore(faceUpCards);
  const targetScore = board.targetScore || 200;
  const projectedTotalScore = (ctx.bankedScore || 0) + scoreInfo.score;

  if (projectedTotalScore >= targetScore) {
    return "FREEZE";
  }

  // SHIELD NO-RISK RULE: An AI player holding a Second Chance shield NEVER STAYS (always HITs), since duplicates are absorbed risk-free!
  if (hasSecondChance) {
    return "HIT";
  }

  const existingNumbers = new Set(
    faceUpCards.map((cId) => parseFlip7Card(cId).numberValue).filter((n) => n !== undefined),
  );
  const uniqueCount = existingNumbers.size;

  // If player already achieved Flip 7 (7 unique numbers), they freeze automatically
  if (uniqueCount >= 7) return "FREEZE";

  const deck = board.deck || [];
  const bustProb = calculateBustProbability(faceUpCards, deck);

  // Persona strategy thresholds
  if (persona === "cautious") {
    // Cautious: Freezes at 3 or 4 unique numbers or if bust probability exceeds 20%
    if (hasSecondChance && bustProb < 0.35) return "HIT";
    if (uniqueCount >= 3 && bustProb > 0.18) return "FREEZE";
    if (uniqueCount >= 4) return "FREEZE";
    return "HIT";
  }

  if (persona === "aggressive") {
    // Aggressive: Pushes for Flip 7 bonus (7 unique numbers), hits unless bust prob > 40%
    if (hasSecondChance) return "HIT";
    if (uniqueCount >= 6 && bustProb > 0.35) return "FREEZE";
    if (bustProb > 0.45) return "FREEZE";
    return "HIT";
  }

  // Balanced (Default): Freezes at 5 unique numbers or if bust prob > 30%
  if (hasSecondChance && bustProb < 0.4) return "HIT";
  if (uniqueCount >= 5) return "FREEZE";
  if (uniqueCount >= 4 && bustProb > 0.28) return "FREEZE";
  return "HIT";
}
