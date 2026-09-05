import { parseFlip7Card, calculateFlip7RoundScore } from "../flip7_deck";

export interface Flip7BotContext {
  myId: string;
  faceUpCards: string[];
  hasSecondChance: boolean;
  bankedScore: number;
  persona: "cautious" | "balanced" | "aggressive" | "intuitive" | "wild" | "storyteller" | "surrealist" | "cinephile";
  board: any;
}

/**
 * Calculates exact bust probability for a given hand against remaining deck
 */
export function calculateBustProbability(faceUpCards: string[], deck: string[]): number {
  if (!deck || deck.length === 0) return 0;

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
  const { faceUpCards, hasSecondChance, bankedScore, persona, board } = ctx;

  // 1. Mandatory Flip 3 sequence forces HIT
  if ((board.mustFlipCount || 0) > 0) return "HIT";

  // 2. First card of round is always a HIT
  if (faceUpCards.length === 0) return "HIT";

  // 3. Calculate current round score and projected total score
  const scoreInfo = calculateFlip7RoundScore(faceUpCards);
  const targetScore = board.targetScore || 200;
  const projectedTotalScore = (bankedScore || 0) + scoreInfo.score;

  // 4. SECOND CHANCE SHIELD NO-RISK RULE:
  // AI bots holding a Second Chance shield ALWAYS continue to flip (HIT),
  // because they do not risk losing points even if a duplicate is drawn!
  // (As per rule: "ai bots should continue to flip as long as they have an active second chance card because they do not risk to lose")
  if (hasSecondChance) {
    return "HIT";
  }

  // 5. TARGET SCORE 200+ CHECK:
  // If current active hand points + total previous points >= 200, consideration for staying (FREEZE)!
  // (unless they have a second chance card, which was checked above!)
  if (projectedTotalScore >= targetScore) {
    return "FREEZE";
  }

  const existingNumbers = new Set(
    faceUpCards.map((cId) => parseFlip7Card(cId).numberValue).filter((n) => n !== undefined),
  );
  const uniqueCount = existingNumbers.size;

  // 6. If player already achieved Flip 7 (7 unique numbers), they freeze automatically
  if (uniqueCount >= 7) return "FREEZE";

  // 7. NON-PROBABILISTIC / FEELING-BASED BOT PERSONAS:
  // Some bots do NOT have access to probabilities and base decisions purely on feeling/instinct.
  if (persona === "intuitive") {
    // "Intuitive" (The Mystic): Feels the room and hand size.
    // If round points are high (>= 22), feels a strong instinct to bank.
    if (scoreInfo.score >= 22) return "FREEZE";
    // With 4+ cards, feeling says stay 60% of the time.
    if (uniqueCount >= 4 && Math.random() < 0.6) return "FREEZE";
    // With 5+ cards, feeling says stay 85% of the time.
    if (uniqueCount >= 5 && Math.random() < 0.85) return "FREEZE";
    return "HIT";
  }

  if (persona === "wild") {
    // "Wild" (The Daredevil): High adrenaline, purely impulse-driven feeling!
    // Pushes hard for big hands, only freezes if round points >= 35 or 6 unique numbers!
    if (scoreInfo.score >= 35) return "FREEZE";
    if (uniqueCount >= 6 && Math.random() < 0.7) return "FREEZE";
    if (uniqueCount >= 5 && Math.random() < 0.3) return "FREEZE";
    return "HIT";
  }

  // 8. PROBABILISTIC BOT PERSONAS (Access to exact deck probabilities):
  const deck = board.deck || [];
  const bustProb = calculateBustProbability(faceUpCards, deck);

  if (persona === "cautious") {
    // Cautious (The Owl): Risk-averse. Freezes if bust probability > 18% or 4 unique numbers
    if (uniqueCount >= 3 && bustProb > 0.16) return "FREEZE";
    if (uniqueCount >= 4) return "FREEZE";
    return "HIT";
  }

  if (persona === "aggressive") {
    // Aggressive (The Mad Hatter): High risk tolerance, aims for bonus. Freezes only if bust probability > 42% or 6 unique numbers
    if (uniqueCount >= 6 && bustProb > 0.35) return "FREEZE";
    if (bustProb > 0.42) return "FREEZE";
    return "HIT";
  }

  // Balanced (The Dreamer): Standard probabilistic balance. Freezes at 5 unique numbers or bust prob > 28%
  if (uniqueCount >= 5) return "FREEZE";
  if (uniqueCount >= 4 && bustProb > 0.28) return "FREEZE";
  return "HIT";
}
