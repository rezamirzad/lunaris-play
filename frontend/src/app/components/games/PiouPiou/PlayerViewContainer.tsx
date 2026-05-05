"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import PlayerController from "../../shared/PlayerController";
import PlayerCard from "../../shared/PlayerCard";
import PiouPiouPlayerStats from "./PiouPiouPlayerStats";
import ComboHints from "./ComboHints";
import PiouPiouHandGrid from "./PiouPiouHandGrid";

export default function PiouPiouPlayerView({ player, roomData }: any) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const playAction = useMutation((api as any).games.pioupiou.handleAction);

  const isGameFinished = roomData.status?.toUpperCase() === "FINISHED";
  const winnerName = roomData.gameBoard?.winner;
  const amIWinner = String(roomData.gameBoard?.winnerId) === String(player._id);

  const isMatchpoint =
    !isGameFinished && player.state?.chicks === 2 && player.state?.eggs > 0;

  // --- 1. DERIVED ATTACK STATES ---
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
    // If an attack is active, only the victim can act (to Defend/Accept)
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
    // If we pass "PLAY", the backend treats it as a standard hand-cycling discard
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

      // Reset local state to maintain technical transparency
      setSelectedCards([]);
      setTargetId(null);
    } catch (error) {
      console.error("Protocol Execution Failed", error);
    }
  };

  const isTargetRequired = protocol === "STEAL_EGG";
  const canExecute = isMyTurn && protocol && (!isTargetRequired || targetId);
  const otherPlayers = roomData.players.filter(
    (p: any) => String(p._id) !== String(player._id),
  );

  // 1. Audit the hand for Defensive Resources
  const roosterCount = useMemo(() => {
    return (
      player.gameHand?.filter(
        (card: string) => card.toUpperCase() === "ROOSTER",
      ).length || 0
    );
  }, [player.gameHand]);

  const canDefend = roosterCount >= 2;

  return (
    <div className="relative min-h-screen bg-black">
      {/* --- 🏆 WINNER OVERLAY: Dark Mode 2.0 Aesthetic[cite: 2] --- */}
      {isGameFinished && (
        <div className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-1000">
          <div className="relative bg-black rounded-full p-8 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <span className="text-6xl">🏆</span>
          </div>
          <h2 className="mt-8 text-5xl font-black italic text-white uppercase tracking-tighter text-center">
            {amIWinner ? "Victory Achieved" : "Match Concluded"}
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500 uppercase tracking-[0.4em]">
            {winnerName} has secured the Grand Duchy
          </p>
          <button
            onClick={() => {
              // 1. Technical Transparency: Dynamic routing back to the board
              const roomCode = roomData.roomCode;
              const lang = "en"; // Or derive from current URL/state
              const gameType = "pioupiou";

              // 2. High-Performance Redirect
              window.location.href = `/room/${roomCode}?lang=${lang}&game=${gameType}&view=board`;
            }}
            className="mt-12 px-8 py-4 bg-white text-black font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Return to Main Room
          </button>
        </div>
      )}

      {/* --- 2. VICTIM DEFENSE OVERLAY (Dark Mode 2.0 Aesthetic) --- */}
      {isVictim && (
        <div className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-2">
              <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter">
                Under Attack
              </h2>
              <p className="text-red-400 font-mono text-xs uppercase tracking-[0.3em]">
                {attackerName} is raiding your nest
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* DEFEND BUTTON: Gated by resource check[cite: 2] */}
              <div className="space-y-2">
                <button
                  disabled={!canDefend}
                  onClick={() => handleProtocolExecution("DEFEND")}
                  className={`w-full py-4 font-black uppercase rounded-xl transition-all ${
                    canDefend
                      ? "bg-white text-black hover:scale-105 active:scale-95"
                      : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5"
                  }`}
                >
                  Defend (2 Roosters)
                </button>

                {!canDefend && (
                  <p className="text-[9px] font-mono text-orange-500/80 uppercase tracking-widest animate-pulse">
                    Insufficient Roosters to block Fox
                  </p>
                )}
              </div>

              <button
                onClick={() => handleProtocolExecution("ACCEPT")}
                className="w-full py-4 border border-white/20 text-white font-black uppercase rounded-xl hover:bg-white/5 active:scale-95 transition-all"
              >
                Give Egg
              </button>
            </div>
          </div>
        </div>
      )}

      <PlayerController
        player={player}
        roomData={roomData}
        isMyTurn={isMyTurn}
        statsSlot={
          <div className="flex flex-col gap-6 w-fit animate-in slide-in-from-left duration-700">
            <PlayerCard
              name={player.name}
              isReady={player.isReady}
              isCurrentTurn={isMyTurn}
              statusOverride={
                isVictim
                  ? "DEFEND!"
                  : isAttacker
                    ? "WAITING FOR RESPONSE..."
                    : isMyTurn
                      ? "YOUR TURN"
                      : "WAITING"
              }
            >
              <PiouPiouPlayerStats state={player.state} />
            </PlayerCard>

            <div className="bg-[#09090b]/80 border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent opacity-50" />
              <ComboHints
                hand={player.gameHand || []}
                eggs={player.state?.eggs || 0}
                otherPlayers={otherPlayers}
                lang="en"
              />
            </div>

            {/* Target Selection UI: Enhanced Resource Visualization */}
            {isTargetRequired && isMyTurn && !isAttackActive && (
              <div className="flex flex-col gap-2 p-4 bg-zinc-900/50 border border-white/5 rounded-xl animate-in zoom-in duration-300">
                <p className="text-[8px] text-zinc-500 uppercase tracking-widest mb-2">
                  Select Target_Node
                </p>
                {otherPlayers.map((opp: any) => {
                  const eggCount = opp.state?.eggs || 0;
                  const chickCount = opp.state?.chicks || 0;
                  const hasEggs = eggCount > 0;

                  return (
                    <button
                      key={opp._id}
                      disabled={!hasEggs}
                      onClick={() => setTargetId(String(opp._id))}
                      className={`py-3 px-4 rounded-lg text-[10px] uppercase font-mono border transition-all flex justify-between items-center ${
                        targetId === String(opp._id)
                          ? "border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                          : hasEggs
                            ? "border-white/5 text-zinc-400 hover:border-white/20"
                            : "opacity-20 cursor-not-allowed grayscale border-white/5 text-zinc-600"
                      }`}
                    >
                      <span>{opp.name}</span>

                      <div className="flex gap-3 items-center">
                        {/* Visualizing specialized business tools: Eggs & Chicks */}
                        <span className="flex items-center gap-1">
                          {eggCount} <span className="text-[12px]">🥚</span>
                        </span>
                        <span className="flex items-center gap-1">
                          {chickCount} <span className="text-[12px]">🐥</span>
                        </span>
                        {!hasEggs && (
                          <span className="text-[8px] text-orange-600 font-black ml-1">
                            [EMPTY]
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              {/* PRIMARY ACTION: Attack (Only active if target is selected) */}
              <button
                disabled={!canExecute}
                onClick={() => handleProtocolExecution()}
                className={`w-full py-4 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all active:scale-95 ${
                  canExecute
                    ? "border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.15)]"
                    : "opacity-20 cursor-not-allowed border-white/10 text-zinc-500"
                }`}
              >
                {isTargetRequired && !targetId
                  ? "CHOOSE TARGET"
                  : protocol || "SELECT CARDS"}
              </button>

              {/* SECONDARY ACTION: The Discard Option */}
              {/* This button appears ONLY when a Fox is selected and it's your turn */}
              {protocol === "STEAL_EGG" && isMyTurn && (
                <button
                  onClick={() => handleProtocolExecution("PLAY")}
                  className="w-full py-3 rounded-xl border border-white/5 bg-zinc-900/50 text-zinc-500 text-[9px] uppercase font-bold tracking-[0.2em] hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
                >
                  Discard Fox (Hand Cycle)
                </button>
              )}
            </div>
          </div>
        }
        actionsSlot={
          <PiouPiouHandGrid
            hand={player.gameHand || []}
            isMyTurn={isMyTurn}
            selectedCards={selectedCards}
            onCardSelect={(key) =>
              isMyTurn &&
              setSelectedCards((prev) =>
                prev.includes(key)
                  ? prev.filter((k) => k !== key)
                  : [...prev, key],
              )
            }
          />
        }
      />
    </div>
  );
}
