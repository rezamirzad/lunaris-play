"use client";

import { useMemo } from "react";

interface NodeGlyphProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * NodeGlyph: Generates a unique, deterministic digital avatar for a player.
 * Uses the name to seed color and initials.
 */
export default function NodeGlyph({ name, className = "", size = "md" }: NodeGlyphProps) {
  const initials = useMemo(() => {
    return name.substring(0, 2).toUpperCase();
  }, [name]);

  const colorConfig = useMemo(() => {
    const colors = [
      "from-blue-500 to-blue-700 shadow-blue-500/40",
      "from-teal-400 to-teal-600 shadow-teal-500/40",
      "from-purple-500 to-purple-700 shadow-purple-500/40",
      "from-orange-400 to-orange-600 shadow-orange-500/40",
      "from-pink-500 to-pink-700 shadow-pink-500/40",
      "from-indigo-500 to-indigo-700 shadow-indigo-500/40",
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  const sizeClasses = {
    sm: "w-6 h-6 text-[8px]",
    md: "w-10 h-10 text-[10px]",
    lg: "w-16 h-16 text-[14px]",
  };

  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      {/* Glow Layer */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorConfig} opacity-40 blur-lg`} />
      
      {/* Surface Layer */}
      <div className={`relative h-full w-full rounded-xl bg-gradient-to-br ${colorConfig} border border-white/20 flex items-center justify-center font-black italic tracking-tighter text-white shadow-lg`}>
        {initials}
      </div>
      
      {/* Decorative Bit */}
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-zinc-950 border border-white/10 rounded-full flex items-center justify-center">
        <div className="w-0.5 h-0.5 bg-white rounded-full" />
      </div>
    </div>
  );
}
