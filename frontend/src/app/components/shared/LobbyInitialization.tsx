"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
import { useTranslation } from "@/hooks/useTranslation";
import { toPersianDigits } from "@/lib/translations";
import PlayerCard from "./PlayerCard";
import { useState, useEffect } from "react";
import { useAdmin } from "../../admin/AdminGateway";
import { QRCodeSVG } from "qrcode.react";

interface LobbyInitializationProps {
  room: Doc<"rooms">;
  players: Doc<"players">[];
  me?: Doc<"players">;
  isBoardView?: boolean;
  localizedGameTitle?: string;
}

/**
 * LobbyInitialization: Ultra-premium 'Top Class' boot-up sequence.
 * Features: Node-link SVG animations and real-time fluid scaling telemetry.
 */
export default function LobbyInitialization({
  room,
  players,
  me,
  isBoardView = false,
  localizedGameTitle,
}: LobbyInitializationProps) {
  const { t, lang } = useTranslation();
  const isFA = lang === "fa";
  const { isAdmin, adminPassword } = useAdmin();

  const toggleReady = useMutation(api.engine.toggleReady);
  const startGame = useMutation(api.engine.startGame);
  const addBot = useMutation(api.engine.addBot);
  const removePlayer = useMutation(api.engine.removePlayer);
  const setBotConfig = useMutation(api.engine.setBotConfig);
  const startJustOneMatch = useMutation(api.justone.startJustOneMatch);
  const dixitAction = useMutation(api.dixit.handleAction);
  const updateFlip7Rules = useMutation(api.flip7.updateFlip7HouseRules);

  const [activeTooltipRule, setActiveTooltipRule] = useState<string | null>(null);

  const HOUSE_RULE_TOOLTIPS: Record<string, { title: string; desc: string }> = {
    bustPenalty: {
      title: "💥 Bust Penalty",
      desc: "Off: Standard rules (0 points lost). -10 Pts: Deducts 10 banked points when busting. -50% Hand: Deducts 50% of hand score from banked points.",
    },
    minHitThreshold: {
      title: "🛑 Min 10 Pts to Stay",
      desc: "Players must collect at least 10 round points before they are allowed to Stay.",
    },
    allowDoubleDown: {
      title: "🎲 Double Down (5+ Unique)",
      desc: "When holding 5+ unique numbers, players can double their round score risk.",
    },
    targetStayed: {
      title: "🎯 Target Stayed Players",
      desc: "Action cards (Freeze / Flip Three) can target players who have already Stayed for the round.",
    },
    shieldReflect: {
      title: "🛡️ Shield Reflect",
      desc: "Targeted action cards bounce back to the sender if target player has a Second Chance shield.",
    },
    zeroHero: {
      title: "🦸 Zero Hero (0 Card Shield)",
      desc: "Holding a 0 card acts as a single-use shield against low duplicates (1, 2, or 3).",
    },
    megaFlipBonus: {
      title: "🌟 Mega Flip Bonus",
      desc: "Collecting 8 unique numbers awards +25 bonus pts; 9+ unique numbers awards +40 bonus pts.",
    },
  };

  const handleToggleFlip7Rule = async (ruleKey: string, currentValue: any) => {
    let newValue: any;
    if (ruleKey === "bustPenalty") {
      const cycle = ["NONE", "FLAT_10", "HALF_HAND"];
      const idx = cycle.indexOf(currentValue || "NONE");
      newValue = cycle[(idx + 1) % cycle.length];
    } else {
      newValue = !currentValue;
    }
    try {
      await updateFlip7Rules({ roomId: room._id, ruleKey, ruleValue: newValue });
    } catch (e) {
      console.error("Failed to update Flip7 rule:", e);
    }
  };

  const handleToggleBotMaturity = async (playerId: string, currentMaturity?: string) => {
    if (!isAdmin || !adminPassword) return;
    const nextMaturity = currentMaturity === "CHILD" ? "ADULT" : "CHILD";
    try {
      await setBotConfig({ playerId: playerId as any, maturity: nextMaturity, adminPassword });
    } catch (e) {
      console.error("Toggle bot maturity failed", e);
    }
  };

  const handleToggleBotPersona = async (playerId: string, currentPersona?: string) => {
    if (!isAdmin || !adminPassword) return;
    const personas = ["balanced", "cautious", "aggressive"];
    const currIdx = personas.indexOf(currentPersona || "balanced");
    const nextPersona = personas[(currIdx + 1) % personas.length];
    try {
      await setBotConfig({ playerId: playerId as any, persona: nextPersona, adminPassword });
    } catch (e) {
      console.error("Toggle bot persona failed", e);
    }
  };

  const [justoneLang, setJustOneLang] = useState<"en" | "fr" | "de" | "fa">(
    "en",
  );

  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.origin);
      url.searchParams.set("join", room.roomCode);
      setJoinUrl(url.toString());
    }
  }, [room.roomCode]);

  const readyCount = players.filter((p) => p.isReady).length;
  const totalCount = players.length;
  const isAllReady = readyCount === totalCount && totalCount >= 2;

  const handleToggleReady = async () => {
    if (me) {
      await toggleReady({ playerId: me._id });
    }
  };

  const handleStartGame = async () => {
    if (!isAdmin || !adminPassword) return;
    if (room.currentGame === "justone") {
      await startJustOneMatch({
        roomId: room._id,
        language: justoneLang,
        adminPassword,
      });
    } else {
      await startGame({ roomId: room._id, adminPassword });
    }
  };

  const handleAddBot = async () => {
    if (!isAdmin || !adminPassword) return;
    try {
      await addBot({ roomCode: room.roomCode, adminPassword });
    } catch (e) {
      console.error("Add bot failed", e);
    }
  };

  const handleKick = async (playerId: string) => {
    if (!isAdmin || !adminPassword) return;
    try {
      await removePlayer({ playerId: playerId as any, adminPassword });
    } catch (e) {
      console.error("Kick failed", e);
    }
  };

  const handleToggleRuleset = async () => {
    if (!isAdmin || room.currentGame !== "dixit" || !me) return;
    const currentRuleset = (room.gameBoard as any).ruleset || (players.length > 6 ? "ODYSSEY" : "CLASSIC");
    const nextRuleset = currentRuleset === "CLASSIC" ? "ODYSSEY" : "CLASSIC";
    
    try {
      await dixitAction({
        playerId: me._id,
        actionType: "SET_RULESET",
        ruleset: nextRuleset,
        adminPin: adminPassword,
      });
    } catch (e) {
      console.error("Ruleset toggle failed", e);
    }
  };

  const renderLanguageSelector = () => {
    const langs: { id: "en" | "fr" | "de" | "fa"; label: string }[] = [
      { id: "en", label: "English" },
      { id: "fr", label: "Français" },
      { id: "de", label: "Deutsch" },
      { id: "fa", label: "Farsi" },
    ];

    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {langs.map((l) => (
          <button
            key={l.id}
            onClick={() => setJustOneLang(l.id)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${justoneLang === l.id ? "bg-white text-black shadow-lg" : "bg-white/5 text-zinc-500 hover:bg-white/10"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  };

  const dixitRuleset = (room.gameBoard as any).ruleset || (players.length > 6 ? "ODYSSEY" : "CLASSIC");

  return (
    <div className="flex flex-col items-center gap-12 w-full transition-all duration-300">
      {/* 📡 TERMINAL DEPLOYMENT HEADER */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-[2vh] relative z-10 w-full"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 md:w-20 bg-teal-400/20" />
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 bg-teal-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(45,212,191,1)]" />
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-[10px] sm:text-xs tracking-[0.4em] text-teal-400 font-black uppercase ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.lobbyInitiation}
            </span>
          </div>
          <div className="h-[1px] w-12 md:w-20 bg-teal-400/20" />
        </div>

        <h2 className="text-4xl md:text-6xl lg:text-[4.5vw] font-black italic tracking-tighter uppercase text-white leading-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          {localizedGameTitle || room.currentGame}
        </h2>

        {/* ⚙️ RULESET TOGGLE (DIXIT ONLY) */}
        {isAdmin && room.currentGame === "dixit" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-col items-center gap-2">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Active Ruleset</span>
            <button 
                onClick={handleToggleRuleset}
                className="group flex items-center gap-4 bg-black/40 border border-white/10 px-6 py-2 rounded-2xl hover:border-blue-500/50 transition-all"
            >
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${dixitRuleset !== 'ODYSSEY' ? 'text-blue-400' : 'text-zinc-600'}`}>Classic (3-6)</span>
                <div className="w-10 h-5 bg-zinc-800 rounded-full p-1 relative">
                    <motion.div 
                        animate={{ x: dixitRuleset === 'ODYSSEY' ? 20 : 0 }}
                        className="w-3 h-3 bg-white rounded-full shadow-lg"
                    />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${dixitRuleset === 'ODYSSEY' ? 'text-blue-400' : 'text-zinc-600'}`}>Odyssey (7-12)</span>
            </button>
          </motion.div>
        )}

        {/* 🎰 HOUSE RULES TOGGLE PANEL (FLIP 7 ONLY) */}
        {room.currentGame === "flip7" && (() => {
          const f7Rules = (room.gameBoard as any).flip7Rules || {
            bustPenalty: "NONE",
            minHitThreshold: false,
            allowDoubleDown: false,
            targetStayed: false,
            shieldReflect: false,
            zeroHero: false,
            megaFlipBonus: false,
          };
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 max-w-xl mx-auto flex flex-col items-center gap-3 bg-zinc-950/80 border border-amber-500/30 p-4 rounded-3xl backdrop-blur-xl shadow-2xl w-full select-none">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎰</span>
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-300">
                  Flip 7 Optional House Rules
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-left font-mono text-[10px]">
                {/* Bust Penalty */}
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => handleToggleFlip7Rule("bustPenalty", f7Rules.bustPenalty)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                      f7Rules.bustPenalty !== "NONE"
                        ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-black">💥 Bust Penalty</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipRule(activeTooltipRule === "bustPenalty" ? null : "bustPenalty");
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title={HOUSE_RULE_TOOLTIPS.bustPenalty.desc}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className="font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-[9px]">
                      {f7Rules.bustPenalty === "FLAT_10"
                        ? "-10 Pts"
                        : f7Rules.bustPenalty === "HALF_HAND"
                          ? "-50% Hand"
                          : "Off (0)"}
                    </span>
                  </div>
                  {activeTooltipRule === "bustPenalty" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-950/95 border border-amber-400/50 p-2.5 rounded-xl text-[9.5px] text-amber-200 leading-snug shadow-xl backdrop-blur-md">
                      <div className="font-bold text-amber-300 mb-0.5">{HOUSE_RULE_TOOLTIPS.bustPenalty.title}</div>
                      <div>{HOUSE_RULE_TOOLTIPS.bustPenalty.desc}</div>
                    </motion.div>
                  )}
                </div>

                {/* Min Hit Threshold */}
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => handleToggleFlip7Rule("minHitThreshold", f7Rules.minHitThreshold)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                      f7Rules.minHitThreshold
                        ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-black">🛑 Min 10 Pts to Stay</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipRule(activeTooltipRule === "minHitThreshold" ? null : "minHitThreshold");
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title={HOUSE_RULE_TOOLTIPS.minHitThreshold.desc}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className="font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-[9px]">
                      {f7Rules.minHitThreshold ? "Active" : "Off"}
                    </span>
                  </div>
                  {activeTooltipRule === "minHitThreshold" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-950/95 border border-amber-400/50 p-2.5 rounded-xl text-[9.5px] text-amber-200 leading-snug shadow-xl backdrop-blur-md">
                      <div className="font-bold text-amber-300 mb-0.5">{HOUSE_RULE_TOOLTIPS.minHitThreshold.title}</div>
                      <div>{HOUSE_RULE_TOOLTIPS.minHitThreshold.desc}</div>
                    </motion.div>
                  )}
                </div>

                {/* Double Down */}
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => handleToggleFlip7Rule("allowDoubleDown", f7Rules.allowDoubleDown)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                      f7Rules.allowDoubleDown
                        ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-black">🎲 Double Down (5+ Unique)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipRule(activeTooltipRule === "allowDoubleDown" ? null : "allowDoubleDown");
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title={HOUSE_RULE_TOOLTIPS.allowDoubleDown.desc}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className="font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-[9px]">
                      {f7Rules.allowDoubleDown ? "Active" : "Off"}
                    </span>
                  </div>
                  {activeTooltipRule === "allowDoubleDown" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-950/95 border border-amber-400/50 p-2.5 rounded-xl text-[9.5px] text-amber-200 leading-snug shadow-xl backdrop-blur-md">
                      <div className="font-bold text-amber-300 mb-0.5">{HOUSE_RULE_TOOLTIPS.allowDoubleDown.title}</div>
                      <div>{HOUSE_RULE_TOOLTIPS.allowDoubleDown.desc}</div>
                    </motion.div>
                  )}
                </div>

                {/* Target Stayed Players */}
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => handleToggleFlip7Rule("targetStayed", f7Rules.targetStayed)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                      f7Rules.targetStayed
                        ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-black">🎯 Target Stayed Players</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipRule(activeTooltipRule === "targetStayed" ? null : "targetStayed");
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title={HOUSE_RULE_TOOLTIPS.targetStayed.desc}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className="font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-[9px]">
                      {f7Rules.targetStayed ? "Active" : "Off"}
                    </span>
                  </div>
                  {activeTooltipRule === "targetStayed" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-950/95 border border-amber-400/50 p-2.5 rounded-xl text-[9.5px] text-amber-200 leading-snug shadow-xl backdrop-blur-md">
                      <div className="font-bold text-amber-300 mb-0.5">{HOUSE_RULE_TOOLTIPS.targetStayed.title}</div>
                      <div>{HOUSE_RULE_TOOLTIPS.targetStayed.desc}</div>
                    </motion.div>
                  )}
                </div>

                {/* Shield Reflect */}
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => handleToggleFlip7Rule("shieldReflect", f7Rules.shieldReflect)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                      f7Rules.shieldReflect
                        ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-black">🛡️ Shield Reflect</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipRule(activeTooltipRule === "shieldReflect" ? null : "shieldReflect");
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title={HOUSE_RULE_TOOLTIPS.shieldReflect.desc}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className="font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-[9px]">
                      {f7Rules.shieldReflect ? "Active" : "Off"}
                    </span>
                  </div>
                  {activeTooltipRule === "shieldReflect" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-950/95 border border-amber-400/50 p-2.5 rounded-xl text-[9.5px] text-amber-200 leading-snug shadow-xl backdrop-blur-md">
                      <div className="font-bold text-amber-300 mb-0.5">{HOUSE_RULE_TOOLTIPS.shieldReflect.title}</div>
                      <div>{HOUSE_RULE_TOOLTIPS.shieldReflect.desc}</div>
                    </motion.div>
                  )}
                </div>

                {/* Zero Hero */}
                <div className="flex flex-col gap-1">
                  <div
                    onClick={() => handleToggleFlip7Rule("zeroHero", f7Rules.zeroHero)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                      f7Rules.zeroHero
                        ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-black">🦸 Zero Hero (0 Card Shield)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipRule(activeTooltipRule === "zeroHero" ? null : "zeroHero");
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title={HOUSE_RULE_TOOLTIPS.zeroHero.desc}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className="font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-[9px]">
                      {f7Rules.zeroHero ? "Active" : "Off"}
                    </span>
                  </div>
                  {activeTooltipRule === "zeroHero" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-950/95 border border-amber-400/50 p-2.5 rounded-xl text-[9.5px] text-amber-200 leading-snug shadow-xl backdrop-blur-md">
                      <div className="font-bold text-amber-300 mb-0.5">{HOUSE_RULE_TOOLTIPS.zeroHero.title}</div>
                      <div>{HOUSE_RULE_TOOLTIPS.zeroHero.desc}</div>
                    </motion.div>
                  )}
                </div>

                {/* Mega Flip Bonus */}
                <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                  <div
                    onClick={() => handleToggleFlip7Rule("megaFlipBonus", f7Rules.megaFlipBonus)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                      f7Rules.megaFlipBonus
                        ? "bg-amber-950/70 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-black">🌟 Mega Flip (8+ Unique Numbers Bonus)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltipRule(activeTooltipRule === "megaFlipBonus" ? null : "megaFlipBonus");
                        }}
                        className="text-[11px] text-amber-400/80 hover:text-amber-300 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                        title={HOUSE_RULE_TOOLTIPS.megaFlipBonus.desc}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className="font-bold uppercase bg-black/40 px-2 py-0.5 rounded text-[9px]">
                      {f7Rules.megaFlipBonus ? "Active" : "Off"}
                    </span>
                  </div>
                  {activeTooltipRule === "megaFlipBonus" && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-950/95 border border-amber-400/50 p-2.5 rounded-xl text-[9.5px] text-amber-200 leading-snug shadow-xl backdrop-blur-md">
                      <div className="font-bold text-amber-300 mb-0.5">{HOUSE_RULE_TOOLTIPS.megaFlipBonus.title}</div>
                      <div>{HOUSE_RULE_TOOLTIPS.megaFlipBonus.desc}</div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}

        {isBoardView && joinUrl && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-6 pt-8"
          >
            {/* 💎 PROMINENT ROOM CODE */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mb-1">
                Room Access Link
              </span>
              <div className="bg-white/5 border border-white/10 px-12 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl group hover:border-teal-400/50 transition-all">
                <h3 className="text-7xl font-black tracking-[0.2em] text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:text-teal-400 transition-colors">
                  {room.roomCode}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] group hover:scale-105 transition-transform duration-500">
              <QRCodeSVG
                value={joinUrl}
                size={260}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[18px] font-black tracking-[0.2em] text-teal-400 uppercase animate-pulse">
                {t.step2}
              </span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                {joinUrl}
              </span>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-[4vw] pt-[2vh]">
          <div className="flex flex-col items-center group">
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-xs md:text-sm mb-1.5 font-black tracking-widest text-zinc-500 group-hover:text-teal-400/50 transition-colors ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.connectedPlayers}
            </span>
            <div className="bg-zinc-900/50 border border-white/5 px-4 py-1 rounded-xl flex items-center gap-3">
              <span className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                {isFA ? toPersianDigits(totalCount) : totalCount}
              </span>
              {isAdmin && (
                <button
                  onClick={handleAddBot}
                  className="p-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-400 text-[10px] font-black uppercase transition-all"
                >
                  + BOT
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center group">
            <span
              dir={isFA ? "rtl" : "ltr"}
              className={`text-xs md:text-sm mb-1.5 font-black tracking-widest text-zinc-500 group-hover:text-teal-400/50 transition-colors ${isFA ? "fa-text-fix" : ""}`}
            >
              {t.readyPlayers}
            </span>
            <div className="bg-zinc-900/50 border border-white/5 px-4 py-1 rounded-xl">
              <span className="text-xl md:text-3xl font-black text-white tabular-nums tracking-tighter">
                {isFA ? toPersianDigits(readyCount) : readyCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pt-4">
          {room.currentGame === "justone" && isAdmin && renderLanguageSelector()}

          {isBoardView ? (
            <motion.button
              disabled={!isAllReady || !isAdmin}
              whileHover={isAllReady && isAdmin ? { scale: 1.05 } : {}}
              whileTap={isAllReady && isAdmin ? { scale: 0.95 } : {}}
              onClick={handleStartGame}
              className={`px-12 py-4 rounded-[2rem] font-black uppercase text-lg tracking-[0.3em] transition-all ${isAllReady && isAdmin ? "bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:bg-teal-400 hover:text-white" : "bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed"}`}
            >
              {t.matchInitiation}
            </motion.button>
          ) : me && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleReady}
              className={`px-12 py-5 rounded-[2rem] font-black uppercase text-lg tracking-[0.3em] transition-all shadow-2xl ${
                me.isReady 
                  ? "bg-teal-500 text-white shadow-[0_0_40px_rgba(45,212,191,0.3)]" 
                  : "bg-white text-black hover:bg-teal-400 hover:text-white"
              }`}
            >
              {me.isReady ? t.ready : "Mark Ready"}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* 👤 PARTICIPANT GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl relative z-10">
        <AnimatePresence mode="popLayout">
          {players.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
            >
              <PlayerCard
                name={player.name}
                isReady={player.isReady}
                isCurrentTurn={false}
                statusOverride={
                  player.isBot
                    ? "BOT 🤖"
                    : player.isReady
                      ? t.ready
                      : t.waiting
                }
                className={
                  player.isReady
                    ? "border-teal-400/30 bg-teal-500/[0.02]"
                    : "border-zinc-800 bg-zinc-950/40"
                }
              >
                <div className="flex flex-col gap-2 mt-3">
                  {player.isBot && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {room.currentGame === "dixit" && (
                        <button
                          disabled={!isAdmin}
                          onClick={() => handleToggleBotMaturity(player._id, player.maturity)}
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all ${
                            player.maturity === "CHILD"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30"
                          } ${!isAdmin ? "cursor-default" : "cursor-pointer"}`}
                          title={isAdmin ? "Click to toggle Age Range" : "Age Range"}
                        >
                          {player.maturity === "CHILD" ? "👶 AGE 7–12" : "👤 AGE 18+"}
                        </button>
                      )}

                      <button
                        disabled={!isAdmin}
                        onClick={() => handleToggleBotPersona(player._id, player.persona)}
                        className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                          player.persona === "aggressive" || player.persona === "wild"
                            ? "bg-purple-950/80 text-purple-300 border-purple-500/40 hover:bg-purple-900/80"
                            : player.persona === "cautious"
                              ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/80"
                              : "bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/80"
                        } ${!isAdmin ? "cursor-default" : "cursor-pointer"}`}
                        title={isAdmin ? "Click to toggle Persona" : "Persona"}
                      >
                        <span>
                          {player.persona === "aggressive" || player.persona === "wild"
                            ? "🎩 The Mad Hatter"
                            : player.persona === "cautious"
                              ? "🦉 The Wise Owl"
                              : "✨ The Dreamer"}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden relative mr-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: player.isReady ? "100%" : "0%" }}
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ${player.isReady ? "bg-teal-400" : "bg-zinc-800"}`}
                      />
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleKick(player._id)}
                        className="p-1 hover:bg-rose-500/20 text-rose-500 rounded transition-colors"
                        title="Kick Player"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </PlayerCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
