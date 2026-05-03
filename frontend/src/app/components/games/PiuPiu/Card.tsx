"use client";
import { PIU_PIU_DECK_SPEC } from "./constants";

interface CardProps {
  type: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function Card({ type, selected, onClick }: CardProps) {
  // Access the constants from your deck spec file
  const config = (PIU_PIU_DECK_SPEC as any)[type];

  // Colors based on card type for quick visual recognition
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
      className={`relative w-full aspect-[2/3] rounded-3xl border-[6px] transition-all duration-200 overflow-hidden flex flex-col items-center justify-between p-4 shadow-xl select-none ${
        selected
          ? "border-teal-500 -translate-y-6 scale-105 shadow-teal-500/30"
          : `border-zinc-900 ${getTypeColor()} active:scale-95`
      }`}
    >
      {/* Type Label */}
      <div
        className={`text-[10px] font-black uppercase tracking-widest ${
          selected ? "text-teal-600" : "text-zinc-300"
        }`}
      >
        {type}
      </div>

      {/* Main Illustration */}
      <img
        src={config.img}
        alt={type}
        className={`w-4/5 h-4/5 object-contain transition-transform ${selected ? "scale-110" : ""}`}
      />

      {/* Bottom Detail */}
      <div
        className={`w-3 h-3 rounded-full ${selected ? "bg-teal-500" : "bg-zinc-200"}`}
      />

      {/* Selection Overlay */}
      {selected && (
        <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
      )}
    </div>
  );
}
