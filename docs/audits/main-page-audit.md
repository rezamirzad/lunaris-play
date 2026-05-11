# Architectural Audit: Main Landing Page (`page.tsx`)

**Date:** May 8, 2026  
**Auditor:** Cypher (Refactoring Strategist)  
**Status:** ⚠️ **Type Debt & Hardcoded Styling**

---

## 1. Session Management Audit

-   **Mechanism**: Uses `localStorage` with the key `"playerName"`.
-   **Consistency**: High. Both the Landing Page and the Room Page read from this key.
-   **Risk**: There is no server-side validation of the session. If the user clears local storage while in a room, the Room Page will show an "Authenticating..." state indefinitely (until they re-enter their name on the home page).
-   **Recommendation**: Implement a global `AuthContext` or `UserProvider` to manage this state consistently across the entire Next.js app, rather than relying on disparate `useEffect` hooks.

---

## 2. Action Logic & Backend Integration

-   **Type Debt**: The page uses `(api as any)` for `getOngoingRooms`, `createRoom`, and `joinRoom`. This bypasses the strict schema hardening we just performed on the backend.
-   **Engine Compliance**:
    -   `createRoom`: correctly passes `roomCode` and `gameSlug`.
    -   `joinRoom`: correctly passes `roomCode` and `playerName`.
-   **Flow Integrity**:
    -   Hosting: Transitions to `/room/[code]?view=board`.
    -   Joining: Transitions to `/room/[code]` (player view).
    -   This separation of concerns between "Board" and "Player" views via search params is functional but could be more robustly handled via the `useGame` hook.

---

## 3. UI Scalability (Game Registry)

-   **Registry Usage**: The landing page correctly uses a `GameCatalog` component that dynamically fetches games from the database (`api.engine.listGames`).
-   **Expansion Potential**: Adding a new game to the database will automatically list it here. This is a win for the **Open/Closed Principle**.
-   **Localization Leak**: The `GameCatalog` uses `(t as any)[game.slug]` to find translations. This is brittle. If a slug doesn't have a matching key in `translations.ts`, it falls back to the database title (which might not be localized).

---

## 4. Redesign Readiness (Handoff to Aura)

-   **Layout**: The page uses a standard Tailwind grid (`lg:grid-cols-12`). It is flexible enough for structural changes.
-   **Hardcoded Tokens**:
    -   Colors like `bg-zinc-900/50` and `text-teal-400` are hardcoded.
    -   Borders like `border-zinc-800` are hardcoded.
-   **Refactoring Need**: To enable Aura's "Modern Arcade" makeover without touching logic, we should extract these into a `theme` object or Tailwind variables.
-   **Redundancy**: The "Ongoing Games" list and "Enter Lobby" form are tightly coupled in one large component (`HomeContent`).

---

## 5. Strategic Recommendations

1.  **Flush the Any**: Refactor `page.tsx` and `GameCatalog.tsx` to use generated Convex types, removing `(api as any)`.
2.  **Extract User State**: Move `playerName` management into a `UserProvider` wrapped around the root layout.
3.  **Tokenize Styling**: Move hardcoded colors and spacing into the Tailwind config as "Arcade Theme" tokens.
4.  **Componentize**: Extract the "Ongoing Games" list into its own component (`OngoingRooms.tsx`) to simplify the main page.

---

**Cypher's Verdict:** The page is functional and scalable in terms of data, but structurally "Messy." It is the gateway to the app and requires type-safety sanitization before Aura begins the visual makeover.
