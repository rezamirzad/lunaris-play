# High-Fidelity Design Spec: Lunaris Landing Page 2.0

**Date:** May 8, 2026  
**Designer:** Aura (UI Designer)  
**Theme:** Ultra-Premium Cyberpunk / Tactical Terminal  
**Vibe:** High-Impact, Glow-Driven, Haptic

---

## 🏗️ 1. Global Background FX

To achieve a "Top Class" feel, the background must not be a static color. We will implement a layered CSS system.

### A. The "Neuro-Grid" Overlay
Add a fixed overlay to the `main` tag with a repeated SVG grid.
```css
/* Neuro-Grid */
.neuro-grid {
  background-image: radial-gradient(circle at 1px 1px, rgba(45, 212, 191, 0.05) 1px, transparent 0);
  background-size: 40px 40px;
  mask-image: linear-gradient(to bottom, black, transparent);
}
```

### B. The "Scanline" Pulse
A subtle, slow-moving horizontal line that mimics a refreshing terminal screen.
```css
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
.scanline {
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(45, 212, 191, 0.1), transparent);
  animation: scanline 8s linear infinite;
}
```

---

## 🛸 2. Header Overhaul: "Cyberpunk Glow"

The title "LUNARIS" must be the focal point of the app's visual identity.

### A. Logo Styles
- **Text**: `text-7xl lg:text-9xl font-black italic tracking-tighter uppercase`
- **Effect**: Implement a "Dual-Glow" text-shadow.
```css
.logo-glow {
  color: white;
  text-shadow: 
    0 0 10px rgba(255, 255, 255, 0.5),
    0 0 40px rgba(45, 212, 191, 0.3);
}
```
- **Technical Subtitle**: `font-mono text-[10px] tracking-[0.5em] text-teal-400/80`
- **Metadata**: Add small "System Uptime" or "Node_ID" labels in `zinc-600` near the corners to reinforce the terminal aesthetic.

---

## 🎴 3. Game Tiles 2.0: "Top Class" Components

Sterling's tiles were a good start, but we need more depth and "Physicality."

### A. Surface Architecture
- **Backdrop**: `bg-zinc-950/40 backdrop-blur-3xl`
- **Border**: `border border-white/5 group-hover:border-teal-400/40`
- **Inner Glow**: Use `box-shadow: inset 0 0 20px rgba(45, 212, 191, 0.05)` to give the tile an internal atmosphere.

### B. Image Masking
The thumbnail should not just sit there. Use a CSS mask or a soft vignette.
```css
.game-thumbnail {
  mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.8));
}
```

### C. Magnetic Host Button
- **Default**: `bg-white text-black font-black uppercase rounded-2xl px-12 py-4`
- **Hover**: `bg-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.6)]`
- **Motion**: Use Framer Motion's `layoutId` for smooth hover states.

---

## ⚡ 4. Motion Keyframes: "The Digital Reveal"

Every element on the page must have a staged, intentional entrance.

### A. Title Entrance (Glitch)
```javascript
const titleVariants = {
  hidden: { skewX: 20, opacity: 0, scale: 0.9 },
  visible: { 
    skewX: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15 
    }
  }
};
```

### B. Staggered Tile Deployment
Use `AnimatePresence` and a staggered delay of `0.1s` per game tile.
- **Direction**: Slide in from the `bottom-right` with a slight rotation (`rotate: 2`).

---

## ♿ 5. Technical Specification (Tailwind)

| Element | Final Utility Class String |
| :--- | :--- |
| **Main Layout** | `min-h-screen bg-[#020203] relative neuro-grid` |
| **Game Tile** | `group bg-zinc-950/40 border-white/5 hover:shadow-[0_0_50px_-20px_rgba(45,212,191,0.2)]` |
| **Form Input** | `bg-black/80 border-zinc-800 focus:ring-2 focus:ring-teal-400/50 shadow-inner` |
| **Active Session** | `border-teal-400/20 bg-teal-400/5 shadow-[0_0_15px_rgba(45,212,191,0.05)]` |

---

**Aura's Verdict:** This spec moves the platform from "Clean" to "Cinematic." It prioritizes depth, haptics, and glowing visual hierarchy. 

**Next Steps for Sterling:**
1. Implement the `neuro-grid` and `scanline` globals.
2. Refactor the `logo-glow` CSS.
3. Update `GameCatalog` thumbnails with the radial masking and springy deployment.
