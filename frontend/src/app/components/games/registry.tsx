import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Define the interface used by all game containers
export interface GameProps {
  roomId: string;
  roomData: any;
}

// Ensure the paths match your folder structure exactly
const DixitGame = dynamic(
  () => import("./Dixit/DixitContainer"),
) as ComponentType<GameProps>;
const PiouPiouGame = dynamic(
  () => import("./PiouPiou/PiouPiouContainer"),
) as ComponentType<GameProps>;

export const GAME_REGISTRY: Record<string, ComponentType<GameProps>> = {
  dixit: DixitGame,
  pioupiou: PiouPiouGame,
};
