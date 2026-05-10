/**
 * Standard Fisher-Yates Shuffle for client-side randomization.
 * Explicitly typed to avoid TSX generic ambiguity.
 */
export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Calculates rank based on score and all scores.
 * Uses standard competition ranking (1224).
 */
export function calculateRank(score: number, allScores: number[]): number {
  return allScores.filter((s) => s > score).length + 1;
}

/**
 * Returns the ordinal suffix for a number (English).
 */
export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
