export interface Flip7CardInfo {
  id: string;
  type: "NUMBER" | "MODIFIER" | "ACTION";
  numberValue?: number; // 0 to 12
  modifierValue?: number; // +1, +2, +3
  actionType?: "FREEZE" | "FLIP_THREE" | "SECOND_CHANCE";
  label: string;
}

export function getFlip7Deck(): string[] {
  const deck: string[] = [];

  // Card 0 (1 copy)
  deck.push("N_0_1");

  // Number cards 1 to 12 (N copies of number N)
  for (let num = 1; num <= 12; num++) {
    for (let copy = 1; copy <= num; copy++) {
      deck.push(`N_${num}_${copy}`);
    }
  }

  // Modifiers: +1 (2 copies), +2 (2 copies), +3 (2 copies)
  deck.push("M_PLUS_1_1", "M_PLUS_1_2");
  deck.push("M_PLUS_2_1", "M_PLUS_2_2");
  deck.push("M_PLUS_3_1", "M_PLUS_3_2");

  // Action Cards:
  // SECOND_CHANCE (3 copies)
  deck.push("ACT_SECOND_CHANCE_1", "ACT_SECOND_CHANCE_2", "ACT_SECOND_CHANCE_3");
  // FREEZE (2 copies)
  deck.push("ACT_FREEZE_1", "ACT_FREEZE_2");
  // FLIP_THREE (2 copies)
  deck.push("ACT_FLIP3_1", "ACT_FLIP3_2");

  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
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

  if (cardId.startsWith("M_PLUS_")) {
    const val = cardId.includes("1") ? 1 : cardId.includes("2") ? 2 : 3;
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
 * Calculates a player's round score from face-up cards:
 * Sum of all unique numbers + modifiers.
 */
export function calculateFlip7RoundScore(faceUpCardIds: string[]): {
  score: number;
  uniqueNumbersCount: number;
  hasFlip7Bonus: boolean;
} {
  const numberValues = new Set<number>();
  let totalModifier = 0;

  faceUpCardIds.forEach((id) => {
    const card = parseFlip7Card(id);
    if (card.type === "NUMBER" && card.numberValue !== undefined) {
      numberValues.add(card.numberValue);
    } else if (card.type === "MODIFIER" && card.modifierValue !== undefined) {
      totalModifier += card.modifierValue;
    }
  });

  const sumNumbers = Array.from(numberValues).reduce((a, b) => a + b, 0);
  const uniqueNumbersCount = numberValues.size;

  // Flip 7 Bonus: If a player collects 7 unique number cards, they get +15 bonus points!
  const hasFlip7Bonus = uniqueNumbersCount >= 7;
  const bonusPoints = hasFlip7Bonus ? 15 : 0;

  return {
    score: sumNumbers + totalModifier + bonusPoints,
    uniqueNumbersCount,
    hasFlip7Bonus,
  };
}
