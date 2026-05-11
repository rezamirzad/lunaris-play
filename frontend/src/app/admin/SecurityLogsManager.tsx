"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityLogsManager() {
  const logs = useQuery(api.engine.getSecurityLogs);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-4 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
        <h3 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">
          Security Protocols
        </h3>
      </div>

      <div className="bg-zinc-900/40 border border-border-subtle rounded-[2rem] overflow-hidden backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-4 px-8 py-4 bg-black/20 border-b border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
          <div className="col-span-1">TIMESTAMP</div>
          <div className="col-span-1">EVENT</div>
          <div className="col-span-2">DETAILS</div>
        </div>

        <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto no-scrollbar">
          <AnimatePresence mode="popLayout">
            {logs?.map((log: any, idx: number) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-4 gap-4 px-8 py-4 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-1 text-[10px] text-zinc-500 tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div className="col-span-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${
                      log.event === "ADMIN_ACCESS_GRANTED"
                        ? "text-teal-400 bg-teal-400/10 border border-teal-400/20"
                        : "text-rose-500 bg-rose-500/10 border border-rose-500/20"
                    }`}
                  >
                    {log.event.replace("ADMIN_ACCESS_", "")}
                  </span>
                </div>
                <div className="col-span-2 text-[10px] text-zinc-400 truncate font-mono">
                  {JSON.stringify(log.details)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {(!logs || logs.length === 0) && (
            <div className="p-8 text-center">
              <span className="text-[8px] font-black text-zinc-700 tracking-[0.5em] uppercase">
                NO_SECURITY_EVENTS_RECORDED
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
