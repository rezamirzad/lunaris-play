import { Id } from "../_generated/dataModel";
import { GenericMutationCtx } from "convex/server";
import { DataModel } from "../_generated/dataModel";

export type GameMutationCtx = GenericMutationCtx<DataModel>;

export interface GamePlugin {
  gameType: "dixit" | "pioupiou" | "sushinode";
  
  // Defines the initial state for the room's gameBoard when created in LOBBY
  getInitialBoard(): any;
  
  // Defines the initial state for a player when joining
  getInitialPlayerState(status: string, room: any): {
    initialHand: string[];
    initialState: any;
  };
  
  // Handles the transition from LOBBY to PLAYING
  onStart(ctx: GameMutationCtx, roomId: Id<"rooms">, players: any[]): Promise<void>;
}
