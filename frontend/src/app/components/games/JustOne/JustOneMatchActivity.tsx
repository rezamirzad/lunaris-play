"use client";

import { ActivityLog } from "../../shared/MatchActivity";

export default function JustOneLogMessage({ log }: { log: ActivityLog }) {
  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  switch (log.key) {
    case "LOG_GAME_STARTED":
      return (
        <div className="flex gap-2">
          <span className="text-teal-500 font-black">[{formatTime()}]</span>
          <span className="text-white font-black italic tracking-tight">JustOne Protocol Initialized</span>
        </div>
      );
    case "LOG_DISCARD":
      const isCorrect = log.data.card === "Correct";
      const isPass = log.data.card === "Passed";
      return (
        <div className="flex gap-2 items-center">
          <span className={`${isCorrect ? "text-teal-500" : isPass ? "text-zinc-500" : "text-rose-500"} font-black`}>[{formatTime()}]</span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isCorrect ? "bg-teal-500/10 text-teal-500" : isPass ? "bg-zinc-500/10 text-zinc-500" : "bg-rose-500/10 text-rose-500"}`}>
             {isCorrect ? "DECRYPTION_SUCCESS" : isPass ? "NODE_ABORTED" : "DECRYPTION_FAIL"}
          </span>
          <span className="text-zinc-300 font-bold">{log.data.player}</span>
        </div>
      );
    default:
      return (
        <div className="flex gap-2">
          <span className="text-zinc-600 font-black">[{formatTime()}]</span>
          <span className="text-zinc-500">{JSON.stringify(log.data)}</span>
        </div>
      );
  }
}
