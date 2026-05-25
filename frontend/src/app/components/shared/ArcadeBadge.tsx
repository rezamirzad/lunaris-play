"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import Image from "next/image";

export type BadgeVariant =
  | "ai"
  | "winner"
  | "nearly-winning"
  | "status"
  | "custom";

interface ArcadeBadgeProps extends HTMLMotionProps<"div"> {
  variant: BadgeVariant;
  label?: string;
  icon?: string | React.ReactNode;
  pulse?: boolean;
}

/**
 * ArcadeBadge: A unified, modular badge system for the Modern Arcade aesthetic.
 * Automatically positions itself at the top-right of its relative parent.
 */
export default function ArcadeBadge({
  variant,
  label,
  icon,
  pulse = false,
  className = "",
  ...props
}: ArcadeBadgeProps) {
  // Style Mapping based on Variant
  const variants: Record<
    BadgeVariant,
    { bg: string; border: string; text: string; shadow: string }
  > = {
    ai: {
      bg: "bg-black",
      border: "border-white/20",
      text: "text-white",
      shadow: "shadow-[0_0_20px_rgba(255,255,255,0.2)]",
    },
    winner: {
      bg: "bg-amber-500",
      border: "border-amber-200/50",
      text: "text-black",
      shadow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]",
    },
    "nearly-winning": {
      bg: "bg-teal-500",
      border: "border-teal-200/50",
      text: "text-white",
      shadow: "shadow-[0_0_15px_rgba(45,212,191,0.4)]",
    },
    status: {
      bg: "bg-zinc-900/80",
      border: "border-white/10",
      text: "text-zinc-400",
      shadow: "shadow-lg",
    },
    custom: {
      bg: "bg-transparent",
      border: "border-white/10",
      text: "text-inherit",
      shadow: "",
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      initial={{ scale: 0, x: 20, y: -20 }}
      animate={{ scale: 1, x: 12, y: -12 }}
      className={`absolute top-0 right-0 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-black uppercase tracking-tighter text-[9px] backdrop-blur-md 
        ${style.bg} ${style.border} ${style.text} ${style.shadow} ${pulse ? "animate-pulse" : ""} ${className}`}
      {...props}
    >
      {variant === "ai" ? (
        <div className="relative w-8 h-7 overflow-hidden border border-white/10">
          <Image
            src="/assets/general/artificial-intelligence-design-png.webp"
            alt="AI"
            fill
            className="object-cover"
          />
        </div>
      ) : typeof icon === "string" ? (
        <span className="text-xs">{icon}</span>
      ) : (
        icon
      )}

      {label && <span>{label}</span>}
    </motion.div>
  );
}
