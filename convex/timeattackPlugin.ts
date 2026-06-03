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
    name: "The Quantum Calibration",
    description: "GOAL: Synchronize with the 5.00s baseline.\n\nSYSTEM NOTE: A guide timer will appear for 2 seconds to help you find the rhythm. Precision is key for the initial uplink.",
    targetMs: 5000,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  2: {
    name: "Sub-Second Pulse",
    description: "GOAL: Record exactly 0.88s.\n\nHOW: Quick start, quick stop. High-frequency pulses are required for deep-core scanning.",
    targetMs: 880,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  3: {
    name: "Neural Metronome",
    description: "GOAL: Match the 0.50s frequency.\n\nWARNING: Visual interference detected. The system will attempt to break your focus with distracting artifacts. Maintain internal rhythm.",
    targetMs: 500,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  4: {
    name: "The Perfect Third",
    description: "GOAL: Record exactly 3.333s.\n\nHOW: A perfect mathematical third of 10s. This round measures your ability to hold non-standard rhythmic intervals.",
    targetMs: 3333,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  5: {
    name: "Void Echo",
    description: "GOAL: Record the randomized long-form duration.\n\nHOW: The TV will go dark. You are alone with the clock. Rely purely on muscle memory and internal counting.",
    targetRange: [7000, 12000],
    targetMs: 10000,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "BLIND",
  },
  6: {
    name: "Time Bomb: Fuse",
    description: "GOAL: Hold for exactly the target time.\n\nCRITICAL: PRESS AND HOLD to start the fuse. RELEASE at the target. Over-shooting the target triggers a 20% SCORE PENALTY!",
    targetRange: [4000, 6000],
    targetMs: 5000,
    interaction: "PRESS_RELEASE",
    scoring: "SURVIVAL",
    visuals: "BLIND",
  },
  7: {
    name: "The Binary Glitch",
    description: "GOAL: Record exactly 1.01s.\n\nSYSTEM STATUS: Heavy visual distortion. The simulation is destabilizing. Do not let the screen flicker alter your perception of time.",
    targetMs: 1010,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  8: {
    name: "Reaction Surge",
    description: "GOAL: Zero-latency response.\n\nHOW: Tap START then STOP as fast as physically possible. A solar flash will signal the beginning.",
    targetMs: 100,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "FULL",
  },
  9: {
    name: "Deep Space Sync",
    description: "GOAL: Match the 12.00s cycle.\n\nHOW: This is a test of long-term temporal stability. The TV will display confusing holographic data. Stay centered.",
    targetMs: 12000,
    interaction: "TAP",
    scoring: "PRECISION",
    visuals: "DISTRACTED",
  },
  10: {
    name: "SYSTEM MELTDOWN",
    description: "FINAL CHALLENGE: Hold for exactly 4.44s.\n\nULTIMATE RISK: PRESS AND HOLD. Visuals are failing. If you release LATE, 30% of your TOTAL SCORE is purged. MAKE IT COUNT.",
    targetMs: 4444,
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
