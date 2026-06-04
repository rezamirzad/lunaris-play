"use client";

import React, { createContext, useContext, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

interface AdminContextType {
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false });

export const useAdmin = () => useContext(AdminContext);

export default function AdminGateway({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const isAdmin = useQuery(api.engine.checkAdminStatus);
  const isCheckingAdmin = isAdmin === undefined;

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthLoading || isCheckingAdmin) {
    return (
      <div className="fixed inset-0 bg-app flex items-center justify-center z-[100]">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn("password", { email, password, flow });
    } catch (err: any) {
      console.error("Auth failed:", err);
      setError(flow === "signIn" ? "Invalid email or password" : "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-app flex flex-col items-center justify-center p-6 z-[100]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card max-w-md w-full p-12 text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-brand-accent/20"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-[0.6em] text-zinc-500 uppercase">
              Access Restricted
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">
              ADMIN {flow === "signIn" ? "LOGIN" : "SETUP"}
            </h1>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                placeholder="admin@lunaris.tech"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-[10px] font-black uppercase text-center animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white text-black font-black uppercase rounded-xl tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? "Uplinking..." : flow === "signIn" ? "Establish Link" : "Initialize Admin"}
            </button>

            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-xs font-black text-zinc-400 uppercase tracking-widest text-center hover:text-white transition-colors border-b border-white/10 pb-1 mt-2 mx-auto"
            >
              {flow === "signIn" ? "Need to create an account?" : "Already have an account?"}
            </button>
          </form>

          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            Secure biometric uplink required.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-app flex flex-col items-center justify-center p-6 z-[100]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card max-w-md w-full p-12 text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-rose-500/20"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-[0.6em] text-rose-500 uppercase animate-pulse">
              ACCESS_DENIED
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">
              INSUFFICIENT CLEARANCE
            </h1>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed italic opacity-80">
            &quot;Your profile does not have administrative privileges. If you just created this account, you must be promoted via the CLI.&quot;
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => signOut()}
              className="w-full py-4 bg-white text-black font-black uppercase rounded-xl tracking-widest hover:bg-brand-accent transition-all shadow-2xl"
            >
              LOGOUT & TRY AGAIN
            </button>
            
            <button
              onClick={() => (window.location.href = "/")}
              className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Return to Arcade
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ isAdmin: true }}>
      {children}
    </AdminContext.Provider>
  );
}
