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
}

// Lazy load containers
const DixitBoard = dynamic(() => import("./Dixit/DixitContainer"));
const DixitPlayer = dynamic(() => import("./Dixit/PlayerViewContainer"));

const PiouPiouBoard = dynamic(() => import("./PiouPiou/PiouPiouContainer"));
const PiouPiouPlayer = dynamic(() => import("./PiouPiou/PlayerViewContainer"));

export const GAME_REGISTRY: Record<string, GameModule> = {
  dixit: {
    Board: DixitBoard as ComponentType<BoardProps>,
    Player: DixitPlayer as ComponentType<PlayerProps>,
  },
  pioupiou: {
    Board: PiouPiouBoard as ComponentType<BoardProps>,
    Player: PiouPiouPlayer as ComponentType<PlayerProps>,
  },
};
