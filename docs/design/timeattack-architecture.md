# ADR-002: Time Attack Architecture & Latency Strategy

## Status
Accepted

## Context
"Time Attack" requires millisecond-level precision for game inputs across multiple players. Network latency (jitter) between the mobile clients (Phones) and the server (Convex) can cause inaccurate timings if we rely solely on server-side timestamps. We must ensure fairness and precision for all players.

## Decision
1. **Timestamp Strategy**: The authoritative timestamp for a player's action will be captured *client-side* using `Date.now()` combined with `performance.now()` for sub-millisecond precision relative to page load. We will use an NTP-style offset sync during the `LOBBY` phase to calculate the delta between the client's clock and the Convex server's clock.
   - **Formula**: `serverTime = clientTime + serverTimeOffset`
2. **Mutation Throttling**: The Convex server will apply a strict concurrency window (e.g., a 200ms grace period after a phase ends) to accept late-arriving packets, verifying their `clientTimestamp`.
3. **Scoring Logic**: $Points = \max(0, 1000 - \Delta ms)$. For "early" clicks, the delta is still absolute distance from target. For "Fake Flashes", any click results in 0 points for that sub-round.

## The 7-Round State Machine
- **Phase 1: Warmup**
  - **Round 1 (Standard Stop)**: 5.00s target. Timer visible for 2s.
  - **Round 2 (Micro-Fraction)**: Fast target (e.g., 1.63s). No timer.
- **Phase 2: Gauntlet**
  - **Round 3 (Broken Metronome)**: 8 inputs at 120 BPM. Distractions mid-round.
  - **Round 4 (100ms Dash)**: 3 Quick-draw intervals with Fake Flash checks.
  - **Round 5 (Pressure Cooker)**: Coop counting 1-20. 50ms collision window.
- **Phase 3: Sudden Death**
  - **Round 6 (Long Shot)**: Extended target (12.50s) with heavy distraction.
  - **Round 7 (Time Bomb)**: Hold-and-release mechanic (4-6s fuse).

## Consequences
- **Easier**: True representation of player reflexes, independent of standard network jitter.
- **Harder**: Requires complex clock synchronization logic on component mount. Client-side timestamps can be spoofed, requiring basic server-side validation (e.g., rejecting timestamps that are in the future or impossibly fast).

---
*Signed, Software Architect*
