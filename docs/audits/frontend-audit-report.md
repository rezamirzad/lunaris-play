# Frontend Architectural Audit: Lunaris Play UI

**Date:** May 8, 2026  
**Auditor:** Cypher (Refactoring Strategist)  
**Status:** ⚠️ **Significant Type Debt Detected**

---

## 1. Executive Summary

While the backend has been successfully hardened with strict discriminated unions, the frontend is currently a "Type-Safe Mirage." The UI relies heavily on `any` casting and manual state derivation that bypasses the new backend integrity. The routing logic is fragmented, and shared components are "Opaque Shells" that provide little architectural value beyond layout. A UI/UX overhaul in this state will be prone to regression and "ghost bugs."

---

## 2. Type Debt Analysis

### 🚨 Critical: The `any` Leak
**Files:** `frontend/src/hooks/useGame.ts`, `frontend/src/app/components/shared/PlayerController.tsx`, and all game containers.
- **Issue:** The `useGame` hook casts the API to `any`. Component props like `roomData` and `player` are consistently typed as `any`.
- **Impact:** The backend's strict discriminated unions (`gameType: "pioupiou" | "dixit"`) are effectively ignored by the compiler. If a field name changes in the schema, the frontend will not show a build error, leading to runtime crashes.

### 🚨 Brittle State Assumptions
**Files:** `PiouPiouContainer.tsx`, `DixitContainer.tsx`
- **Issue:** Containers manually narrow the game state using logic like `roomData.gameBoard.gameType === "pioupiou"`.
- **Impact:** This logic is duplicated in every container. There is no centralized "State Narrower" or "Domain Model" on the frontend.

---

## 3. Routing & Modularity Evaluation

### 🚨 Anti-pattern: Registry Bypassing
**File:** `frontend/src/app/room/[roomId]/page.tsx`
- **Observation:** A `GAME_REGISTRY` exists in `registry.tsx`, but `page.tsx` ignores it, using hardcoded static imports and a manual `switch/case` to render `DixitBoard` vs `PiouPiouBoard`.
- **Impact:** Adding a new game requires updating both the registry AND the room page. This violates the **Open/Closed Principle** we just established on the backend.

### 🚨 Technical Debt: Static Game Logic in Pages
- **Observation:** The `RoomPage` manages loading states and session validation, but then it manually decides which "PlayerView" or "BoardView" to render.
- **Recommendation:** `RoomPage` should be a thin wrapper that asks the `GAME_REGISTRY` for the correct component based on the `gameType` literal.

---

## 4. Shared Components Audit (`PlayerController`)

- **Status:** **Coupled & Opaque**
- **Issue:** `PlayerController` acts as a pure layout shell but requires `player: any` and `roomData: any` despite not using most of those fields itself.
- **Logic Leak:** Logic for "Is it my turn?" or "Am I the victim?" is recalculated in every game-specific container. This should be part of a unified `useGame` hook or a shared "Context" provider.

---

## 5. Redesign Readiness (Aura's UX Handoff)

**Current Impediments:**
1.  **Tailwind Spaghetti**: Utility classes are heavily nested in logic-heavy files, making it hard for a designer to isolate "Theme" from "Rules."
2.  **Lack of Design Tokens**: Hardcoded hex codes (`#09090b`, `#000000`) and arbitrary spacing are scattered throughout the codebase.
3.  **Type Safety Blockers**: Aura cannot safely refactor a component's structure because the lack of types makes it unclear which props are required vs. optional.

---

## 6. Strategic Recommendations

1.  **Eliminate `any`**: Synchronize Convex type generation and use `Doc<"rooms">` and `Doc<"players">` (or narrowed versions) across all props.
2.  **Centralize the Registry**: Refactor `RoomPage` to use `GAME_REGISTRY` as the single source of truth for component resolution.
3.  **Implement a Game Provider**: Move turn derivation and win logic into a `GameProvider` that components can subscribe to, rather than passing `roomData` as an opaque blob.
4.  **Extract Design Tokens**: Move colors and typography into a centralized `tailwind.config.js` or CSS variable set before Aura begins the redesign.

---

**Cypher's Verdict:** The frontend architecture is "Functional but Brittle." It is a legacy UI built on top of a modern backend. Before Aura starts the redesign, we must "Flush the any" and unify the registry logic, or the UI overhaul will drown in technical debt.
