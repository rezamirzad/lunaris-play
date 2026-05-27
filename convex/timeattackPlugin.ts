import { GamePlugin } from "./types";

export const ROUNDS_CONFIG: Record<
  number,
  {
    name: string;
    description: string;
    targetRange?: [number, number]; // [min, max]
    targetMs: number; // Default if not randomized
    interaction: "TAP" | "PRESS_RELEASE";
    scoring: "PRECISION" | "COOP" | "SURVIVAL";
    visuals: "FULL" | "BLIND" | "DISTRACTED";
  }
> = {
  1: {
    name: "The Warmup",
    description: "GOAL: Record a duration of exactly 5.00 seconds.\nHOW: Tap START to begin your personal clock. Tap STOP when you think 5 seconds have passed. A guide timer will appear on the TV for 2 seconds to help you calibrate.",
    targetMs: 5000,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  2: {
    name: "Micro-Fraction",
    description: "GOAL: Record a duration within the target range.\nHOW: Tap START then STOP. NO TIMER will be shown on the TV. Rely purely on your internal rhythm.",
    targetRange: [1000, 3000],
    targetMs: 1630,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  3: {
    name: "The Metronome",
    description: "GOAL: Match the rhythm.\nHOW: Tap START then STOP. The TV will show distracting visual artifacts. Don't let them break your concentration!",
    targetRange: [400, 800],
    targetMs: 500,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  4: {
    name: "Reaction Flash",
    description: "GOAL: Record a duration as fast as possible.\nHOW: This is a test of speed. Tap START then STOP as fast as physically possible. A flash on the TV will signal when to begin.",
    targetMs: 100,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "FULL",
  },
  5: { 
    name: "The Perfect Third",
    description: "GOAL: Record exactly 3.33 seconds (a perfect third of 10s).\nHOW: No guide timer. This round requires extreme precision to the single millisecond. The target is non-standard to challenge your internal rhythm.",
    targetMs: 3330, 
    interaction: "TAP", 
    scoring: "PRECISION", 
    visuals: "BLIND" 
  },
  6: {
    name: "The Long Shot",
    description: "GOAL: Record a long-form duration.\nHOW: Tap START then STOP. The TV will glitch and distort. Focus intensely on your internal count.",
    targetRange: [10000, 15000],
    targetMs: 12500,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  7: {
    name: "Time Bomb",
    description: "GOAL: Hold for exactly the target time.\nHOW: PRESS AND HOLD to start the fuse. RELEASE at the target time. WARNING: If you release AFTER the target, the bomb EXPLODES and you lose 20% of your total game score!",
    targetRange: [4000, 7000],
    targetMs: 5000,
    interaction: "PRESS_RELEASE",
    scoring: "SURVIVAL",
    visuals: "BLIND",
  },
  8: {
    name: "The Heartbeat",
    description: "GOAL: Match a slow pulse of 0.75 seconds.\nHOW: Tap START then STOP. The TV will flicker rapidly to disrupt your visual perception of time.",
    targetMs: 750,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  9: {
    name: "Binary Pulse",
    description: "GOAL: Record exactly 1.01 seconds.\nHOW: A simple 1-second challenge, but with a high-precision offset. No guide timer. Rely purely on muscle memory.",
    targetMs: 1010,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  10: {
    name: "Meltdown",
    description: "GOAL: FINAL CHALLENGE. Hold for exactly 4.04 seconds.\nHOW: PRESS AND HOLD. The TV will glitch violently. If you release LATE, you lose 30% of your total score. Make it count!",
    targetMs: 4040,
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
