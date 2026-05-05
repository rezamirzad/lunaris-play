"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import PlayerController from "../../shared/PlayerController";
import PlayerCard from "../../shared/PlayerCard";
import PiouPiouPlayerStats from "./PiouPiouPlayerStats";
import ComboHints from "./ComboHints";
import PiouPiouHandGrid from "./PiouPiouHandGrid";
import PiouPiouMatchActivity from "./MatchActivity";
import { useTranslation } from "@/hooks/useTranslation"; // Integrated translation hook
import { toPersianDigits } from "@/lib/translations"; // Numerical localization

export default function PiouPiouPlayerView({ player, roomData }: any) {
  const { t, lang } = useTranslation(); // Destructured localization set
  const isFA = lang === "fa";

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const playAction = useMutation((api as any).games.pioupiou.handleAction);

  // --- 1. GLOBAL & ATTACK STATE DERIVATION ---
  const isGameFinished = roomData.status?.toUpperCase() === "FINISHED";
  const winnerName = roomData.gameBoard?.winner;
  const amIWinner = String(roomData.gameBoard?.winnerId) === String(player._id);

  const isMatchpoint =
    !isGameFinished && player.state?.chicks === 2 && player.state?.eggs > 0;

  const pendingAttack = roomData.gameBoard?.pendingAttack;
  const isVictim = pendingAttack?.victimId === player._id;
  const isAttacker = pendingAttack?.attackerId === player._id;
  const isAttackActive = !!pendingAttack;

  const attackerId = roomData.gameBoard?.pendingAttack?.attackerId;
  const attackerPlayer = roomData.players.find(
    (p: any) => String(p._id) === String(attackerId),
  );
  const attackerName = attackerPlayer?.name || "An Unknown Predator";

  const isMyTurn = useMemo(() => {
    if (isAttackActive) return isVictim;
    return (
      String(roomData.turnOrder?.[roomData.currentTurnIndex]) ===
      String(player._id)
    );
  }, [
    roomData.turnOrder,
    roomData.currentTurnIndex,
    player._id,
    isAttackActive,
    isVictim,
  ]);

  const protocol = useMemo(() => {
    const keys = selectedCards.map((k) => k.split("-")[0].toLowerCase());
    const counts = keys.reduce((acc: any, key: string) => {
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    if (keys.length === 1 && counts.fox === 1) return "STEAL_EGG";
    if (
      keys.length === 3 &&
      counts.chicken === 1 &&
      counts.rooster === 1 &&
      counts.nest === 1
    )
      return "LAY_EGG";
    if (keys.length === 2 && counts.chicken === 2) return "HATCH";
    if (keys.length === 1) return "DISCARD";

    return null;
  }, [selectedCards]);

  const handleProtocolExecution = async (forcedAction?: string) => {
    const isAttackInitiation = protocol === "STEAL_EGG" && !forcedAction;
    const actionType = forcedAction || (isAttackInitiation ? "ATTACK" : "PLAY");

    try {
      const indices = selectedCards.map((k) => parseInt(k.split("-")[1]));
      const cards = selectedCards.map((k) => k.split("-")[0].toUpperCase());

      await playAction({
        playerId: player._id,
        indices,
        cards,
        actionType,
        targetPlayerId: isAttackInitiation ? targetId : undefined,
      });

      setSelectedCards([]);
      setTargetId(null);
    } catch (error) {
      console.error("[LUMZ_CRITICAL]: Protocol Execution Failed", error);
    }
  };

  const isTargetRequired = protocol === "STEAL_EGG";
  const canExecute =
    isMyTurn && protocol && (!isTargetRequired || targetId) && !isGameFinished;
  const otherPlayers = roomData.players.filter(
    (p: any) => String(p._id) !== String(player._id),
  );

  // --- 2. DEFENSIVE RESOURCE AUDIT ---
  const roosterCount = useMemo(() => {
    return (
      player.gameHand?.filter(
        (card: string) => card.toUpperCase() === "ROOSTER",
      ).length || 0
    );
  }, [player.gameHand]);

  const canDefend = roosterCount >= 2;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col pt-2 lg:pt-8">
      {/* --- 🏆 WINNER OVERLAY --- */}
      {isGameFinished && (
        <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-700 text-center">
          <div className="relative bg-black rounded-full p-6 border border-white/10 shadow-2xl">
            <span className="text-5xl">🏆</span>
          </div>
          <h2 className="mt-6 text-4xl font-black italic text-white uppercase tracking-tighter">
            {amIWinner ? t.victory : t.gameOver}
          </h2>
          <p className="mt-2 font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em]">
            {winnerName} {t.victory.toLowerCase()}
          </p>
          <button
            onClick={() =>
              (window.location.href = `/room/${roomData.roomCode}?lang=${lang}&game=pioupiou&view=board`)
            }
            className="mt-8 px-8 py-3 bg-white text-black font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            {t.exit}
          </button>
        </div>
      )}

      {/* --- 🦊 VICTIM DEFENSE OVERLAY --- */}
      {isVictim && (
        <div className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-1">
              <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">
                {t.attack}
              </h2>
              <p className="text-red-400 font-mono text-[10px] uppercase tracking-[0.2em]">
                {attackerName} {t.attack.toLowerCase()}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <button
                  disabled={!canDefend}
                  onClick={() => handleProtocolExecution("DEFEND")}
                  className={`w-full py-4 font-black uppercase rounded-xl transition-all ${
                    canDefend
                      ? "bg-white text-black"
                      : "bg-zinc-900 text-zinc-700 border border-white/5"
                  }`}
                >
                  {t.defend}
                </button>
                {!canDefend && (
                  <p className="text-[8px] font-mono text-orange-500 uppercase tracking-widest animate-pulse">
                    {t.noRoosters}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleProtocolExecution("ACCEPT")}
                className="w-full py-4 border border-white/20 text-white font-black uppercase rounded-xl"
              >
                {t.accept}
              </button>
            </div>
          </div>
        </div>
      )}

      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isMyTurn && !isGameFinished}
        className="p-2 lg:p-6"
        history={roomData.gameBoard?.history || []}
        renderLog={(log) => <PiouPiouMatchActivity log={log} />}
        statsSlot={
          <div className="flex flex-col gap-2 w-full lg:w-fit animate-in slide-in-from-left duration-500">
            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
              <PlayerCard
                name={player.name}
                isReady={player.isReady}
                isCurrentTurn={isMyTurn && !isGameFinished}
                isWinner={amIWinner && isGameFinished}
                isMatchpoint={isMatchpoint}
                statusOverride={
                  isGameFinished
                    ? t.gameOver
                    : isVictim
                      ? t.defend.toUpperCase()
                      : undefined
                }
                className="h-full p-3"
              >
                <PiouPiouPlayerStats state={player.state} />
              </PlayerCard>

              <div className="bg-[#09090b]/80 border border-white/10 p-2 rounded-xl relative overflow-hidden flex items-center justify-center h-full">
                <ComboHints
                  hand={player.gameHand || []}
                  eggs={player.state?.eggs || 0}
                  otherPlayers={otherPlayers}
                  lang={lang}
                />
              </div>
            </div>

            {/* TARGET SELECTION */}
            {isTargetRequired && isMyTurn && !isAttackActive && (
              <div className="flex gap-2 p-2 bg-zinc-900/50 border border-white/5 rounded-xl overflow-x-auto no-scrollbar">
                {otherPlayers.map((opp: any) => {
                  const eggCount = opp.state?.eggs || 0;
                  const hasEggs = eggCount > 0;
                  return (
                    <button
                      key={opp._id}
                      disabled={!hasEggs}
                      onClick={() => setTargetId(String(opp._id))}
                      className={`flex-shrink-0 py-2 px-3 rounded-lg text-[9px] uppercase font-mono border transition-all ${
                        targetId === String(opp._id)
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-white/5 text-zinc-500"
                      }`}
                    >
                      {opp.name} 🥚{isFA ? toPersianDigits(eggCount) : eggCount}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ACTION STACK */}
            <div className="space-y-2 mt-1">
              <button
                disabled={!canExecute}
                onClick={() => handleProtocolExecution()}
                className={`w-full py-3 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all ${
                  canExecute
                    ? "border-teal-500 bg-teal-500/10 text-teal-400"
                    : "opacity-20 border-white/10 text-zinc-500"
                }`}
              >
                {isTargetRequired && !targetId
                  ? t.targetPlayer
                  : protocol
                    ? t[
                        `hint${protocol
                          .split("_")
                          .map(
                            (word: string) =>
                              word.charAt(0) + word.slice(1).toLowerCase(),
                          )
                          .join("")}` as keyof typeof t
                      ] || protocol
                    : t.yourTurn}
              </button>

              {protocol === "STEAL_EGG" && isMyTurn && (
                <button
                  onClick={() => handleProtocolExecution("PLAY")}
                  className="w-full py-2 bg-zinc-900/50 text-zinc-500 text-[8px] uppercase font-bold rounded-lg border border-white/5"
                >
                  {t.discard} {t.fox}
                </button>
              )}
            </div>
          </div>
        }
        actionsSlot={
          <div className="mt-[-40px] lg:mt-0 pb-2 flex-grow overflow-visible">
            <PiouPiouHandGrid
              hand={player.gameHand || []}
              isMyTurn={isMyTurn && !isGameFinished}
              selectedCards={selectedCards}
              onCardSelect={(key) =>
                !isGameFinished &&
                isMyTurn &&
                setSelectedCards((prev) =>
                  prev.includes(key)
                    ? prev.filter((k) => k !== key)
                    : [...prev, key],
                )
              }
            />
          </div>
        }
      />
    </div>
  );
}
