"use client";

interface DixitCardProps {
  cardId: string;
  isRevealed?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  votes?: number; // New: Show how many players picked this
  ownerName?: string; // New: Show who submitted this card
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
}: DixitCardProps) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative aspect-[2/3] w-40 sm:w-48 rounded-2xl overflow-hidden transition-all duration-500
        ${selectable && !disabled ? "cursor-pointer hover:scale-105 active:scale-95" : ""}
        ${selected ? "ring-4 ring-teal-500 scale-105 shadow-[0_0_20px_rgba(20,184,166,0.5)]" : "shadow-xl"}
        ${disabled ? "opacity-50 grayscale cursor-not-allowed" : ""}
        ${!isRevealed ? "bg-zinc-800" : "bg-zinc-900"}
      `}
    >
      {isRevealed ? (
        <>
          {/* Card Art (Placeholder for now) */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
            <span className="text-4xl">🎨</span>
            <span className="absolute bottom-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              {cardId}
            </span>
          </div>

          {/* Reveal Overlay (Owner Name) */}
          {ownerName && (
            <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center border-b border-white/10 animate-in slide-in-from-top duration-500">
              <p className="text-[10px] font-black uppercase text-teal-400 truncate">
                {ownerName}
              </p>
            </div>
          )}

          {/* Vote Counter */}
          {votes > 0 && (
            <div className="absolute bottom-3 right-3 flex gap-1 animate-in zoom-in duration-300">
              {Array.from({ length: votes }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-teal-500 border-2 border-black shadow-lg"
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Card Back */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 border-4 border-zinc-800">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800 flex items-center justify-center">
            <span className="text-2xl font-black italic text-zinc-800">L</span>
          </div>
          <div className="mt-4 flex gap-1">
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
}
