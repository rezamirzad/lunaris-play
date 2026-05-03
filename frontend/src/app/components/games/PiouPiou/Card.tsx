"use client";
import { PIOU_PIOU_DECK_SPEC } from "./constants";

interface CardProps {
  type: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function Card({ type, selected, onClick }: CardProps) {
  const config = (PIOU_PIOU_DECK_SPEC as any)[type];

  const getTypeColor = () => {
    switch (type) {
      case "FOX":
        return "bg-red-50";
      case "ROOSTER":
        return "bg-emerald-50";
      case "CHICKEN":
        return "bg-amber-50";
      case "NEST":
        return "bg-orange-50";
      default:
        return "bg-white";
    }
  };

  if (!config) return null;

  return (
    <div
      onClick={onClick}
      /* FIX: Changed w-full to a fixed responsive width (w-24 for mobile, w-32 for tablet)
         Reduced padding and border thickness for better fit on small screens
      */
      className={`relative w-24 sm:w-28 md:w-32 aspect-[2/3] rounded-2xl border-[4px] transition-all duration-200 overflow-hidden flex flex-col items-center justify-between p-2 sm:p-3 shadow-lg select-none ${
        selected
          ? "border-teal-500 -translate-y-4 scale-105 shadow-teal-500/30"
          : `border-zinc-900 ${getTypeColor()} active:scale-95`
      }`}
    >
      {/* Type Label - smaller text for smaller card */}
      <div
        className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${
          selected ? "text-teal-600" : "text-zinc-400"
        }`}
      >
        {type}
      </div>

      {/* Main Illustration */}
      <img
        src={config.img}
        alt={type}
        className={`w-full h-3/5 object-contain transition-transform ${selected ? "scale-110" : ""}`}
      />

      {/* Bottom Detail */}
      <div
        className={`w-2 h-2 rounded-full ${selected ? "bg-teal-500" : "bg-zinc-200"}`}
      />

      {selected && (
        <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
      )}
    </div>
  );
}
