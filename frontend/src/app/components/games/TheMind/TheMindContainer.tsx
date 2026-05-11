"use client";

import { BoardProps } from "../registry";
import TheMindBoard from "./TheMindBoard";

export default function TheMindContainer({ roomId, roomData }: BoardProps) {
  return <TheMindBoard roomId={roomId} roomData={roomData} />;
}
