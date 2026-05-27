"use client";

import { useCallback } from "react";

/**
 * useTimeSync: Legacy hook for clock synchronization.
 * Now returns 0 as Time Attack uses pure local measurement (performance.now()).
 */
export function useTimeSync() {
  return {
    offset: 0,
    latency: 0,
    getSyncedTime: useCallback(() => Date.now(), []),
  };
}
