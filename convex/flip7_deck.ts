export interface Flip7CardInfo {
  id: string;
  type: "NUMBER" | "MODIFIER" | "ACTION";
  numberValue?: number; // 0 to 12
  modifierValue?: number; // +2, +4, +6, +8, +10
  isMultiplier?: boolean; // x2 multiplier
  actionType?: "FREEZE" | "FLIP_THREE" | "SECOND_CHANCE";
  label: string;
}

/**
 * Generates the official 94-card Flip 7 deck:
 * - 79 Number Cards (0-12)
 * - 6 Modifier Cards (+2, +4, +6, +8, +10, x2)
 * - 9 Action Cards (3x FREEZE, 3x FLIP_THREE, 3x SECOND_CHANCE)
 */
/**
 * Generates the official Flip 7 deck:
 * - Standard 1 Deck (94 cards) for 1 to 18 players
 * - 2 Decks combined (188 cards) for 19+ players (per official Flip 7 rulebook)
 */
export function getFlip7Deck(playerCount: number = 1): string[] {
  const decksNeeded = playerCount > 18 ? Math.ceil(playerCount / 18) : 1;
  const fullDeck: string[] = [];

  for (let d = 1; d <= decksNeeded; d++) {
    const deckSuffix = decksNeeded > 1 ? `_d${d}` : "";

    // 1. Number Cards 0 to 12 (79 cards per deck)
    fullDeck.push(`N_0_1${deckSuffix}`);

    for (let num = 1; num <= 12; num++) {
      for (let copy = 1; copy <= num; copy++) {
        fullDeck.push(`N_${num}_${copy}${deckSuffix}`);
      }
    }

    // 2. Modifier Cards (6 cards per deck)
    fullDeck.push(`M_PLUS_2_1${deckSuffix}`);
    fullDeck.push(`M_PLUS_4_1${deckSuffix}`);
    fullDeck.push(`M_PLUS_6_1${deckSuffix}`);
    fullDeck.push(`M_PLUS_8_1${deckSuffix}`);
    fullDeck.push(`M_PLUS_10_1${deckSuffix}`);
    fullDeck.push(`M_MULT_2_1${deckSuffix}`);

    // 3. Action Cards (9 cards per deck)
    fullDeck.push(`ACT_SECOND_CHANCE_1${deckSuffix}`, `ACT_SECOND_CHANCE_2${deckSuffix}`, `ACT_SECOND_CHANCE_3${deckSuffix}`);
    fullDeck.push(`ACT_FREEZE_1${deckSuffix}`, `ACT_FREEZE_2${deckSuffix}`, `ACT_FREEZE_3${deckSuffix}`);
    fullDeck.push(`ACT_FLIP3_1${deckSuffix}`, `ACT_FLIP3_2${deckSuffix}`, `ACT_FLIP3_3${deckSuffix}`);
  }

  // Fisher-Yates Shuffle
  for (let i = fullDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
  }

  return fullDeck;
}

export function parseFlip7Card(cardId: string): Flip7CardInfo {
  if (cardId.startsWith("N_")) {
    const parts = cardId.split("_");
    const num = parseInt(parts[1], 10);
    return {
      id: cardId,
      type: "NUMBER",
      numberValue: num,
      label: String(num),
    };
  }

  if (cardId.startsWith("M_MULT_2")) {
    return {
      id: cardId,
      type: "MODIFIER",
      isMultiplier: true,
      label: "x2",
    };
  }

  if (cardId.startsWith("M_PLUS_")) {
    const parts = cardId.split("_");
    const val = parseInt(parts[2], 10);
    return {
      id: cardId,
      type: "MODIFIER",
      modifierValue: val,
      label: `+${val}`,
    };
  }

  if (cardId.startsWith("ACT_SECOND_CHANCE")) {
    return {
      id: cardId,
      type: "ACTION",
      actionType: "SECOND_CHANCE",
      label: "🛡️ Second Chance",
    };
  }

  if (cardId.startsWith("ACT_FREEZE")) {
    return {
      id: cardId,
      type: "ACTION",
      actionType: "FREEZE",
      label: "❄️ Freeze",
    };
  }

  if (cardId.startsWith("ACT_FLIP3")) {
    return {
      id: cardId,
      type: "ACTION",
      actionType: "FLIP_THREE",
      label: "⚡ Flip Three",
    };
  }

  return {
    id: cardId,
    type: "NUMBER",
    numberValue: 0,
    label: "0",
  };
}

/**
 * Calculates a player's round score according to official Flip 7 rules:
 * 1. Add up face value of all unique Number cards.
 * 2. Apply any x2 multiplier to the Number card total.
 * 3. Add any + modifier points (+2, +4, +6, +8, +10).
 * 4. Add +15 Flip 7 bonus if 7 unique numbers are collected.
 */
export function calculateFlip7RoundScore(faceUpCardIds: string[]): {
  score: number;
  uniqueNumbersCount: number;
  hasFlip7Bonus: boolean;
  hasMultiplier: boolean;
} {
  const numberValues = new Set<number>();
  let plusModifiers = 0;
  let hasMultiplier = false;

  faceUpCardIds.forEach((id) => {
    const card = parseFlip7Card(id);
    if (card.type === "NUMBER" && card.numberValue !== undefined) {
      numberValues.add(card.numberValue);
    } else if (card.type === "MODIFIER") {
      if (card.isMultiplier) {
        hasMultiplier = true;
      } else if (card.modifierValue !== undefined) {
        plusModifiers += card.modifierValue;
      }
    }
  });

  const sumNumbers = Array.from(numberValues).reduce((a, b) => a + b, 0);
  const multipliedNumbers = hasMultiplier ? sumNumbers * 2 : sumNumbers;
  const uniqueNumbersCount = numberValues.size;

  // Flip 7 Bonus: If a player collects 7 unique number cards, +15 bonus points!
  const hasFlip7Bonus = uniqueNumbersCount >= 7;
  const bonusPoints = hasFlip7Bonus ? 15 : 0;

  return {
    score: multipliedNumbers + plusModifiers + bonusPoints,
    uniqueNumbersCount,
    hasFlip7Bonus,
    hasMultiplier,
  };
}
