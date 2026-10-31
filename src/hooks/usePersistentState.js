"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const CHANGE_EVENT = "pathme:local-storage";

function subscribe(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parse(raw, fallback) {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * localStorage-backed state that is safe for SSR: the server (and first client
 * render) use `initial`, then the stored value takes over without a hydration mismatch.
 * TODO(backend): replace with API calls once a persistence layer exists.
 */
export function usePersistentState(key, initial) {
  const raw = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key),
    () => null,
  );

  const value = useMemo(() => parse(raw, initial), [raw, initial]);

  const setValue = useCallback(
    (update) => {
      const prev = parse(window.localStorage.getItem(key), initial);
      const next = typeof update === "function" ? update(prev) : update;
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key, initial],
  );

  return [value, setValue];
}
