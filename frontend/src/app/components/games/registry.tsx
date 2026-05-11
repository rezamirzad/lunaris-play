import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { Doc } from "convex/_generated/dataModel";

// Define the interface for Board Views
export interface BoardProps {
  roomId: string;
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
}

// Define the interface for Player Views
export interface PlayerProps {
  player: Doc<"players">;
  roomData: Doc<"rooms"> & { players: Doc<"players">[] };
  isMyTurn: boolean;
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
};
