"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";

interface AITelemetryLogProps {
  players: Doc<"players">[];
}

/**
 * AITelemetryLog: Non-intrusive floating log for AI bot activity.
 * Appears when bots are 'thinking' or performing complex analysis.
 */
export default function AITelemetryLog({ players }: AITelemetryLogProps) {
  const { t } = useTranslation();
  const thinkingBots = players.filter(p => p.isBot && p.isThinking);

  if (thinkingBots.length === 0) return null;

  return (
    <div className="fixed bottom-32 left-8 z-[60] w-64 pointer-events-none">
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {thinkingBots.map((bot) => (
            <motion.div
              key={bot._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="bg-black/80 border border-amber-500/20 backdrop-blur-xl px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              <div className="relative">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-amber-500 rounded-full animate-ping opacity-40" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[7px] font-black text-amber-500/60 uppercase tracking-[0.2em] leading-none mb-1">
                  AI Uplink Active
                </span>
                <p className="text-[9px] font-bold text-zinc-300 truncate tracking-tight">
                  {bot.botStatus || `${bot.name} is analyzing...`}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
