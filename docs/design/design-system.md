# Lunaris Play: Modern Arcade Design System

**Date:** May 8, 2026  
**Designer:** Aura (UI Designer)  
**Vibe:** Midnight Tech / Cyberpunk / Tactile Arcade

---

## 🎨 1. Design Foundations

### Midnight Tech Palette
The color system is built on a high-contrast dark foundation with neon "functional" accents.

| Role | Color Name | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Void** | `zinc-950` | `#09090b` | Global background, base elevation |
| **Obsidian** | `zinc-900` | `#18181b` | Primary card background, input fields |
| **Circuit** | `zinc-800` | `#27272a` | Borders, subtle dividers |
| **Neon Teal** | `teal-400` | `#2dd4bf` | Success, actions, active player state |
| **Amber Warn**| `orange-500`| `#f59e0b` | Critical alerts, pending attacks, matchpoint |
| **Glitch Red** | `red-500` | `#ef4444` | Errors, invalid sessions, defeat |
| **Ghost Zinc** | `zinc-500` | `#71717a` | Low-priority metadata, inactive states |

### Typography
- **Headlines**: `font-black italic uppercase tracking-tighter` (e.g., "DIXIT", "PIOU PIOU")
- **Interface**: `font-mono uppercase tracking-widest` (e.g., "NODE_STATUS", "ESTABLISHING_LINK")
- **Body**: `font-medium leading-snug` (e.g., Game descriptions)

---

## 🧱 2. Component Library (Tailwind Spec)

### A. Game Tiles (Landing Page)
**Structure**: `flex flex-col lg:flex-row h-auto lg:h-[280px]`  
**Surface**: 
```html
<div class="group relative overflow-hidden bg-zinc-950 rounded-[2.5rem] border border-zinc-800 hover:border-teal-400/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)]">
  <!-- Square Thumbnail Holder -->
  <div class="bg-black/40 flex items-center justify-center p-6 lg:min-w-[280px]">
    <!-- Image with deep shadow -->
    <img class="drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-700" />
  </div>
  
  <!-- Content Area -->
  <div class="p-8 flex flex-col justify-between font-mono bg-gradient-to-br from-zinc-900 to-zinc-950">
    <h3 class="text-4xl font-black italic uppercase tracking-tighter text-white">GAME_TITLE</h3>
    <!-- Action Trigger -->
    <button class="bg-white text-black px-8 py-3 rounded-xl font-black uppercase hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] active:scale-95 transition-all">HOST</button>
  </div>
</div>
```

### B. Player HUD (In-Game)
**Vibe**: Glassmorphism with tactical data readouts.
```html
<div class="bg-zinc-950/80 backdrop-blur-xl border border-white/5 p-4 rounded-3xl shadow-2xl">
  <div class="flex items-center gap-3">
    <div class="h-2 w-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-pulse"></div>
    <span class="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em]">NODE_ACTIVE</span>
  </div>
  <div class="mt-2 text-2xl font-black text-white italic tracking-tighter">PLAYER_NAME</div>
  <!-- Resource Monitor -->
  <div class="mt-4 flex gap-4 border-t border-white/5 pt-4">
    <div class="flex flex-col">
       <span class="text-[8px] text-zinc-600">CHICKS</span>
       <span class="text-xl font-bold text-teal-400">03</span>
    </div>
  </div>
</div>
```

### C. Cyberpunk Match Log
**Vibe**: Scrolling terminal feed.
```html
<section class="bg-black/50 border border-zinc-800 rounded-[2rem] p-6 font-mono overflow-hidden">
  <h2 class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4 border-b border-zinc-900 pb-2">SYSTEM_OUTPUT</h2>
  <div class="space-y-3 opacity-80">
    <!-- Log Entry -->
    <div class="flex gap-3 text-[10px] animate-in fade-in slide-in-from-left duration-300">
      <span class="text-teal-500/50">[12:44:01]</span>
      <span class="text-zinc-400 uppercase">LOG_FOX_BLOCKED: <span class="text-white font-bold">CYPHER</span></span>
    </div>
  </div>
</section>
```

---

## ⚡ 3. Tactile Motion Guidelines

We use **Framer Motion** to achieve a "Haptic" digital feel.

1.  **Springy Deals**: Cards entering the hand should use `type: "spring", stiffness: 260, damping: 20`.
2.  **Glow Hover**: Interactive elements expand by `1.02x` scale and increase `box-shadow` spread using the primary accent color.
3.  **Magnetic Buttons**: Buttons should have a slight "pull" towards the cursor (subtle translation) and a sharp `0.95x` scale on `active`.
4.  **Terminal Reveal**: Text content in loading states or headers should use a staggered letter-reveal animation or a "typewriter" effect.

---

## ♿ 4. Accessibility & Integrity

-   **Contrast**: All text against dark backgrounds must maintain a minimum 4.5:1 ratio (Neon Teal and Amber meet this on Black).
-   **Touch Targets**: Mobile action buttons must be `min-h-[48px]` and `min-w-[48px]`.
-   **Focus States**: Keyboard focus must be indicated by a `2px solid teal-400` ring with an `offset-2`.

---

**Status**: Ready for Implementation (Handoff to Sterling).
