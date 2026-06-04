"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
}

/**
 * RulesModal: Universal high-fidelity pop-up for game rules.
 * Uses existing translation keys based on gameType.
 */
export default function RulesModal({ isOpen, onClose, gameType }: RulesModalProps) {
  const { t } = useTranslation();

  // Mapping gameType to specific translation keys
  const getRules = () => {
    const slug = gameType.toLowerCase();
    return {
      title: t[`${slug}_title` as keyof typeof t] || gameType,
      goalTitle: t.rules_goal || "OBJECTIVE",
      goalDesc: t[`${slug}_goal_desc` as keyof typeof t] || "",
      howTitle: t.rules_how_to_play || "HOW TO PLAY",
      howDesc: t[`${slug}_how_to_play_desc` as keyof typeof t] || "",
      notesTitle: t.rules_notes || "TACTICAL NOTES",
      notesDesc: t[`${slug}_notes_desc` as keyof typeof t] || "",
    };
  };

  const rules = getRules();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-950 border-2 border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">
                  System Protocol
                </span>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                  {rules.title}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <span className="text-xl text-zinc-500">✕</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              {/* Objective */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {rules.goalTitle}
                </h3>
                <p className="text-xl text-slate-200 leading-relaxed font-medium">
                  {rules.goalDesc}
                </p>
              </div>

              {/* How to Play */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  {rules.howTitle}
                </h3>
                <div className="text-sm text-slate-400 leading-loose whitespace-pre-wrap pl-4 border-l-2 border-white/5">
                  {rules.howDesc}
                </div>
              </div>

              {/* Tactical Notes */}
              {rules.notesDesc && (
                <div className="space-y-4 bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">
                    {rules.notesTitle}
                  </h3>
                  <p className="text-xs text-blue-100/70 italic leading-relaxed">
                    {rules.notesDesc}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-black/40 border-t border-white/5 text-center">
               <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.5em]">
                  End of Briefing // Press anywhere to return
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
