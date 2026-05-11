"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminGateway({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(false);

  const verifyPin = useMutation(api.engine.verifyAdminPin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isVerified = await verifyPin({ pin });
      if (isVerified) {
        setIsAuthorized(true);
        setError(false);
      } else {
        setError(true);
        setPin("");
        // Reset error after animation
        setTimeout(() => setError(false), 500);
      }
    } catch (err) {
      console.error("Verification failed", err);
      setError(true);
    }
  };

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-app flex flex-col items-center justify-center p-6 z-[100]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`glass-card max-w-md w-full p-12 text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-brand-accent/20 ${
          error ? "border-rose-500 animate-shake" : ""
        }`}
      >
        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-[0.6em] text-rose-500 uppercase animate-pulse">
            SECURITY_ENFORCED
          </span>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">
            ADMIN ACCESS
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-black/60 border-2 border-zinc-800 rounded-2xl p-6 text-center text-4xl font-black tracking-[0.5em] text-white focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all placeholder:opacity-10"
          />
          <button
            type="submit"
            className="w-full py-4 bg-white text-black font-black uppercase rounded-xl tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-2xl"
          >
            AUTHORIZE
          </button>
        </form>

        <p className="text-[10px] font-bold uppercase tracking-widest">
          Unauthorized access attempts are logged.
        </p>
      </motion.div>
    </div>
  );
}
