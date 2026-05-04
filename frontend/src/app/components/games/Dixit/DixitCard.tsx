"use client";

interface DixitCardProps {
  cardId: string;
  isRevealed?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  votes?: number;
  ownerName?: string;
  isLobby?: boolean;
}

export default function DixitCard({
  cardId,
  isRevealed = false,
  selectable = false,
  selected = false,
  disabled = false,
  onClick,
  votes = 0,
  ownerName,
  isLobby = false,
}: DixitCardProps) {
  const isBack = cardId === "BACK" || !isRevealed;

  const imageSrc = isBack
    ? "/assets/games/dixit/card_back.png"
    : `/assets/games/dixit/${cardId}.png`;

  return (
    <div
      onClick={() => !disabled && onClick?.()}
      className={`
        relative aspect-[2/3] w-full rounded-2xl overflow-hidden transition-all duration-500 border-2
        ${selectable && !disabled ? "cursor-pointer hover:brightness-110 active:scale-95" : ""}
        ${selected ? "border-teal-500 ring-2 ring-teal-500/50 scale-105 z-10 shadow-[0_0_20px_rgba(20,184,166,0.5)]" : "border-zinc-800 shadow-xl"}
        /* Grayscale only applied during play if disabled, never in lobby */
        ${disabled && !isLobby ? "opacity-30 grayscale cursor-not-allowed" : ""}
        ${isLobby ? "opacity-100 grayscale-0 cursor-default" : ""}
        bg-zinc-950
      `}
    >
      <img
        src={imageSrc}
        alt={isBack ? "Card Back" : cardId}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {isRevealed && cardId !== "BACK" && (
        <>
          {ownerName && (
            <div className="absolute top-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-1 text-center border-b border-white/10">
              <p className="text-[8px] font-black uppercase text-teal-400 truncate tracking-tighter">
                {ownerName}
              </p>
            </div>
          )}

          {votes > 0 && (
            <div className="absolute bottom-1 right-1 flex flex-wrap justify-end gap-0.5 max-w-[90%]">
              {Array.from({ length: votes }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full bg-teal-500 border border-black shadow-lg flex items-center justify-center"
                >
                  <span className="text-[7px] text-black font-bold">✓</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
