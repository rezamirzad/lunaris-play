"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface AdminContextType {
  isAdmin: boolean;
  adminPassword?: string;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false });

export const useAdmin = () => useContext(AdminContext);

const ADMIN_STORAGE_KEY = "lunaris_admin_auth";

export default function AdminGateway({
  children,
}: {
  children: React.ReactNode;
}) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Check storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) setSavedPassword(saved);
  }, []);

  // Verify the saved password against the backend
  const isAdminQuery = useQuery(
    api.engine.verifyAdminPassword,
    savedPassword ? { password: savedPassword } : "skip"
  );

  const isAdmin = isAdminQuery === true;
  const isPending = savedPassword !== null && isAdminQuery === undefined;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsSubmitting(true);
    setError(null);

    // We can't call the query manually like a mutation, 
    // so we set the savedPassword state which triggers the useQuery above.
    setSavedPassword(password);
    setIsSubmitting(false);
  };

  // If the query returns false after we tried a password, it's invalid
  useEffect(() => {
    if (isAdminQuery === false && savedPassword) {
      setError("Access Denied: Invalid Security Key");
      setSavedPassword(null);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } else if (isAdminQuery === true && savedPassword) {
      localStorage.setItem(ADMIN_STORAGE_KEY, savedPassword);
    }
  }, [isAdminQuery, savedPassword]);

  if (!mounted) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-app flex flex-col items-center justify-center p-6 z-[100]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card max-w-md w-full p-12 text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-brand-accent/20"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-[0.6em] text-zinc-500 uppercase">
              System Access
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">
              LUNARIS GATEWAY
            </h1>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Enter Security Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-accent outline-none transition-all text-center tracking-[0.5em]"
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
              disabled={isSubmitting || isPending}
              className="w-full py-4 bg-white text-black font-black uppercase rounded-xl tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-xl disabled:opacity-50 mt-4"
            >
              {isSubmitting || isPending ? "Syncing..." : "Establish Uplink"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ isAdmin: true, adminPassword: savedPassword || undefined }}>
      {pathname === "/admin" && (
        <div className="fixed top-6 right-6 z-[200]">
          <button
            onClick={() => {
              localStorage.removeItem(ADMIN_STORAGE_KEY);
              window.location.reload();
            }}
            className="px-4 py-2 bg-zinc-900/80 border border-white/10 rounded-xl text-[9px] font-black text-zinc-500 hover:text-rose-400 transition-all uppercase tracking-widest backdrop-blur-md"
          >
            Terminate Link
          </button>
        </div>
      )}
      {children}
    </AdminContext.Provider>
  );
}
