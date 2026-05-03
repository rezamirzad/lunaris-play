// /frontend/src/app/components/games/PiuPiu/constants.ts

export const PIU_PIU_BASE_CONFIG = {
  BASE_PLAYERS: 5,
  TOTAL_CARDS_BASE: 47,
};

export const PIU_PIU_DECK_SPEC = {
  CHICKEN: {
    baseCount: 15,
    img: "/assets/games/piupiu/chicken.png",
    type: "unit",
  },
  ROOSTER: {
    baseCount: 15,
    img: "/assets/games/piupiu/rooster.png",
    type: "unit",
  },
  NEST: { baseCount: 11, img: "/assets/games/piupiu/nest.png", type: "unit" },
  FOX: { baseCount: 6, img: "/assets/games/piupiu/fox.png", type: "action" },
};

/**
 * Returns a deck specification scaled for 6, 7, or 8 players.
 * For 5 or fewer, it returns the base counts.
 */
export const getScaledDeck = (playerCount: number) => {
  // If 5 or fewer, use multiplier 1.0.
  // For 6+, we increase the deck size by 20% per extra player.
  const multiplier = playerCount <= 5 ? 1 : 1 + (playerCount - 5) * 0.2;

  return Object.entries(PIU_PIU_DECK_SPEC).reduce((acc, [key, config]) => {
    acc[key] = {
      ...config,
      // Math.ceil ensures we always have enough cards
      count: Math.ceil(config.baseCount * multiplier),
    };
    return acc;
  }, {} as any);
};
