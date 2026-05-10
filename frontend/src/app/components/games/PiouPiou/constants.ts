export const PIOU_PIOU_BASE_CONFIG = {
  BASE_PLAYERS: 5,
  TOTAL_CARDS_BASE: 47,
};

export const PIOU_PIOU_DECK_SPEC = {
  CHICKEN: {
    baseCount: 11,
    img: "/assets/games/pioupiou/cards/chicken.png",
    type: "unit",
  },
  ROOSTER: {
    baseCount: 11,
    img: "/assets/games/pioupiou/cards/rooster.png",
    type: "unit",
  },
  NEST: { baseCount: 11, img: "/assets/games/pioupiou/cards/nest.png", type: "unit" },
  FOX: { baseCount: 6, img: "/assets/games/pioupiou/cards/fox.png", type: "action" },

};

/**
 * Returns a deck specification scaled for 6, 7, or 8 players.
 * For 5 or fewer, it returns the base counts.
 */
export const getScaledDeck = (playerCount: number) => {
  // If 5 or fewer, use multiplier 1.0.
  // For 6+, we increase the deck size by 20% per extra player.
  const multiplier = playerCount <= 5 ? 1 : 1 + (playerCount - 5) * 0.2;

  return Object.entries(PIOU_PIOU_DECK_SPEC).reduce((acc, [key, config]) => {
    acc[key] = {
      ...config,
      // Math.ceil ensures we always have enough cards
      count: Math.ceil(config.baseCount * multiplier),
    };
    return acc;
  }, {} as any);
};
