import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { Doc } from "convex/_generated/dataModel";

// Define the interface for Board Views
export interface BoardProps {
  roomId: string;
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
  history?: any[];
  submissions?: any[];
}

// Define the interface for Player Views
export interface PlayerProps {
  player: Doc<"players">;
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
  isMyTurn: boolean;
  history?: any[];
  submissions?: any[];
}

export interface GameModule {
  Board: ComponentType<BoardProps>;
  Player: ComponentType<PlayerProps>;
  visuals: {
    emoji: string;
    assets?: Record<string, any>;
  };
}

// Lazy load containers
const DixitBoard = dynamic(() => import("./Dixit/DixitContainer"));
const DixitPlayer = dynamic(() => import("./Dixit/PlayerViewContainer"));

const PiouPiouBoard = dynamic(() => import("./PiouPiou/PiouPiouContainer"));
const PiouPiouPlayer = dynamic(() => import("./PiouPiou/PlayerViewContainer"));

const TheMindBoard = dynamic(() => import("./TheMind/TheMindContainer"));
const TheMindPlayer = dynamic(() => import("./TheMind/PlayerViewContainer"));

const JustOneBoard = dynamic(() => import("./JustOne/JustOneContainer"));
const JustOnePlayer = dynamic(() => import("./JustOne/JustOnePlayerView"));

const TimeAttackBoard = dynamic(() => import("./TimeAttack/TimeAttackContainer"));
const TimeAttackPlayer = dynamic(() => import("./TimeAttack/PlayerViewContainer"));

const IncanGoldBoard = dynamic(() => import("./IncanGold/IncanGoldContainer"));
const IncanGoldPlayer = dynamic(() => import("./IncanGold/PlayerViewContainer"));

const Flip7Board = dynamic(() => import("./Flip7/Flip7Container"));
const Flip7Player = dynamic(() => import("./Flip7/PlayerViewContainer"));

export const GAME_REGISTRY: Record<string, GameModule> = {
  dixit: {
    Board: DixitBoard as ComponentType<BoardProps>,
    Player: DixitPlayer as ComponentType<PlayerProps>,
    visuals: {
      emoji: "🖼️",
      assets: {
        cardBack: "/assets/games/dixit/card_back.png",
        cardsPath: "/assets/games/dixit/cards/",
      },
    },
  },
  pioupiou: {
    Board: PiouPiouBoard as ComponentType<BoardProps>,
    Player: PiouPiouPlayer as ComponentType<PlayerProps>,
    visuals: {
      emoji: "🐣",
      assets: {
        cards: {
          chicken: "/assets/games/pioupiou/cards/chicken.png",
          rooster: "/assets/games/pioupiou/cards/rooster.png",
          fox: "/assets/games/pioupiou/cards/fox.png",
          nest: "/assets/games/pioupiou/cards/nest.png",
          back: "/assets/games/pioupiou/cards/card-back.png",
        },
      },
    },
  },
  themind: {
    Board: TheMindBoard as ComponentType<BoardProps>,
    Player: TheMindPlayer as ComponentType<PlayerProps>,
    visuals: {
      emoji: "🧠",
    },
  },
  justone: {
    Board: JustOneBoard as ComponentType<BoardProps>,
    Player: JustOnePlayer as ComponentType<PlayerProps>,
    visuals: {
      emoji: "📡",
    },
  },
  timeattack: {
    Board: TimeAttackBoard as ComponentType<BoardProps>,
    Player: TimeAttackPlayer as ComponentType<PlayerProps>,
    visuals: {
      emoji: "⏱️",
    },
  },
  incangold: {
    Board: IncanGoldBoard as ComponentType<BoardProps>,
    Player: IncanGoldPlayer as ComponentType<PlayerProps>,
    visuals: {
      emoji: "💎",
    },
  },
  flip7: {
    Board: Flip7Board as ComponentType<BoardProps>,
    Player: Flip7Player as ComponentType<PlayerProps>,
    visuals: {
      emoji: "🎰",
      assets: {
        cover: "/assets/games/flip7/box_scan.jpg.webp",
        cardsPath: "/assets/games/flip7/cards/",
        audioPath: "/assets/games/flip7/audio/",
      },
    },
  },
};
