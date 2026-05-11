"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="bg-app-card border-b border-border-subtle p-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-content-strong text-lg font-black tracking-tighter italic">
          LUNARIS<span className="text-brand-accent"> TECH</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-12 h-6 bg-zinc-800 dark:bg-zinc-700 rounded-full relative p-1 transition-colors"
            aria-label="Toggle Theme"
          >
            <motion.div
              animate={{ x: theme === "dark" ? 24 : 0 }}
              className="w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
