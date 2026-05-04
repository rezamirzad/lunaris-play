"use client";

interface DixitCardProps {
  cardId: string;
  selected?: boolean;
  onClick?: () => void;
  isRevealed?: boolean;
  ownerName?: string;
  votes?: number;
  disabled?: boolean;
}

export default function DixitCard({
  cardId,
  selected,
  onClick,
  isRevealed = true,
  ownerName,
  votes = 0,
  disabled = false,
}: DixitCardProps) {
  const getCardStyle = () => {
    if (!isRevealed) return "bg-zinc-950 border-zinc-800";
    if (selected) return "border-teal-500 bg-white";
    return "border-zinc-900 bg-zinc-50";
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`relative w-24 sm:w-28 md:w-32 aspect-[2/3] rounded-2xl border-[4px] transition-all duration-300 overflow-hidden flex flex-col items-center justify-between p-2 shadow-lg select-none cursor-pointer ${getCardStyle()} ${
        selected
          ? "-translate-y-4 scale-105 shadow-teal-500/30"
          : "active:scale-95"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <div
        className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${
          selected ? "text-teal-600" : "text-zinc-400"
        }`}
      >
        {isRevealed ? `CARD ${cardId}` : "???"}
      </div>

      <div className="w-full h-3/5 flex items-center justify-center relative">
        {isRevealed ? (
          <div className="text-4xl sm:text-5xl transition-transform group-hover:scale-110">
            🖼️
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-teal-500/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-teal-500 animate-pulse" />
          </div>
        )}

        {votes > 0 && (
          <div className="absolute -top-2 -right-2 bg-teal-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-black">
            {votes}
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center gap-1">
        {ownerName ? (
          <p className="text-[8px] font-bold text-zinc-500 uppercase truncate w-full text-center">
            {ownerName}
          </p>
        ) : (
          <div
            className={`w-2 h-2 rounded-full ${selected ? "bg-teal-500" : "bg-zinc-200"}`}
          />
        )}
      </div>

      {selected && (
        <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
      )}

      {!isRevealed && (
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:10px_10px]" />
      )}
    </div>
  );
}
