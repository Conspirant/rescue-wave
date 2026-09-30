import { useEffect, useState } from "react";

/**
 * True only after the client has hydrated. Used to gate live, time-based
 * telemetry rendering so SSR output never disagrees with the browser.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
