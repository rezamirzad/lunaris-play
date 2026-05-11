"use client";

import { BoardProps } from "../registry";
import JustOneBoard from "./JustOneBoard";

export default function JustOneContainer({ roomId, roomData }: BoardProps) {
  return <JustOneBoard roomId={roomId} roomData={roomData} />;
}
