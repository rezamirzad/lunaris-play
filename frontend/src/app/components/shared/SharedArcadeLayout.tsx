import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SharedArcadeLayoutProps {
  /** Thematic background elements (e.g., textures, gradients) */
  background?: React.ReactNode;
  /** The top bar (Title, Round, Rules button, Host Actions) */
  header: React.ReactNode;
  /** The main gameplay area (Flex-1, scrollable or centered) */
  main: React.ReactNode;
  /** The bottom bar (Player cards, action buttons, timeline) */
  footer?: React.ReactNode;
  /** Overall container background color/gradient classes */
  containerClassName?: string;
  /** Determines if the layout is bounded to screen height (mobile) or fluid (TV) */
  isMobile?: boolean;
  /** Extra full-screen elements (e.g., overlays, lightboxes) */
  extra?: React.ReactNode;
}

/**
 * SharedArcadeLayout
 *
 * Enforces the Vesper-approved `grid-rows-[auto,1fr,auto]` (or flex equivalent)
 * layout pattern to ensure UI consistency across all LUNARIS games.
 *
 * - Header is pinned to the top.
 * - Main content scales dynamically (`flex-1`).
 * - Footer is pinned to the bottom.
 * - Prevents vertical/horizontal bleeding.
 */
export default function SharedArcadeLayout({
  background,
  header,
  main,
  footer,
  containerClassName = "bg-[#0a0500] text-amber-50",
  isMobile = false,
  extra,
}: SharedArcadeLayoutProps) {
  return (
    <div
      className={`relative flex flex-col ${
        isMobile ? "min-h-[100dvh] p-3.5 overflow-y-auto no-scrollbar" : "h-full min-h-[80vh] p-6 overflow-hidden"
      } ${containerClassName} font-mono select-none`}
    >
      {/* 1. Base Layer: Thematic Backgrounds */}
      {background}

      {/* 2. Z-10 Layer: Structured Grid/Flex Hierarchy */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-full">
        {/* Header Anchor (Auto height) */}
        <div className={`shrink-0 ${isMobile ? "mb-2" : "mb-6"}`}>{header}</div>

        {/* Main Context Anchor (Grows to fill remaining space) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {main}
        </div>

        {/* Footer Anchor (Auto height, pinned to bottom) */}
        {footer && (
          <div className={`shrink-0 ${isMobile ? "mt-2" : "mt-6"}`}>
            {footer}
          </div>
        )}
      </div>

      {/* 3. Global Extra Layer (Overlays, Lightboxes) */}
      {extra}
    </div>
  );
}
