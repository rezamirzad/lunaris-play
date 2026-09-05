import { GamePlugin } from "./types";

export const ROUNDS_CONFIG: Record<
  number,
  {
    nameKey: string;
    descKey: string;
    targetRange?: [number, number]; // [min, max]
    targetMs: number; // Default if not randomized
    interaction: "TAP" | "PRESS_RELEASE";
    scoring: "PRECISION" | "SURVIVAL";
    visuals: "FULL" | "BLIND" | "DISTRACTED";
  }
> = {
  1: {
    nameKey: "timeattack_round_1_name",
    descKey: "timeattack_round_1_desc",
    targetMs: 5000,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "FULL",
  },
  2: {
    nameKey: "timeattack_round_2_name",
    descKey: "timeattack_round_2_desc",
    targetMs: 1500,
    interaction: "PRESS_RELEASE",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  3: {
    nameKey: "timeattack_round_3_name",
    descKey: "timeattack_round_3_desc",
    targetMs: 3333,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  4: {
    nameKey: "timeattack_round_4_name",
    descKey: "timeattack_round_4_desc",
    targetMs: 750,
    interaction: "PRESS_RELEASE",
    scoring: "PRECISION",
    visuals: "FULL",
  },
  5: {
    nameKey: "timeattack_round_5_name",
    descKey: "timeattack_round_5_desc",
    targetRange: [6000, 9000],
    targetMs: 7500,
    interaction: "TAP",
    scoring: "SURVIVAL",
    visuals: "BLIND",
  },
  6: {
    nameKey: "timeattack_round_6_name",
    descKey: "timeattack_round_6_desc",
    targetMs: 10000,
    interaction: "PRESS_RELEASE",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  7: {
    nameKey: "timeattack_round_7_name",
    descKey: "timeattack_round_7_desc",
    targetMs: 2500,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  8: {
    nameKey: "timeattack_round_8_name",
    descKey: "timeattack_round_8_desc",
    targetMs: 1200,
    interaction: "PRESS_RELEASE",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  9: {
    nameKey: "timeattack_round_9_name",
    descKey: "timeattack_round_9_desc",
    targetMs: 4000,
    interaction: "TAP",
    scoring: "SURVIVAL",
    visuals: "DISTRACTED",
  },
  10: {
    nameKey: "timeattack_round_10_name",
    descKey: "timeattack_round_10_desc",
    targetRange: [7770, 12340],
    targetMs: 9990,
    interaction: "PRESS_RELEASE",
    scoring: "SURVIVAL",
    visuals: "DISTRACTED",
  },
};

export function getRandomTarget(range: [number, number]): number {
    // Generate a random target, rounded to nearest 10ms for "human" feel
    const raw = Math.random() * (range[1] - range[0]) + range[0];
    return Math.floor(raw / 10) * 10;
}

export const timeattackPlugin: GamePlugin = {
  gameType: "timeattack",

  getInitialBoard() {
    const config = ROUNDS_CONFIG[1];
    let target = config.targetMs;
    if (config.targetRange) {
        target = Math.floor((Math.random() * (config.targetRange[1] - config.targetRange[0]) + config.targetRange[0]) / 10) * 10;
    }
    return {
      gameType: "timeattack",
      phase: "ROUND_INTRO",
      currentRound: 1,
      targetMs: target,
      visuals: config.visuals,
      interaction: config.interaction,
      serverStartTime: 0,
      submissions: {},
    };
  },

  getInitialPlayerState(status, room) {
    return {
      initialHand: [],
      initialState: {
        gameType: "timeattack",
        score: 0,
      },
    };
  },

  async onStart(ctx, roomId, players) {
    // Initialization logic if needed
  },
};
