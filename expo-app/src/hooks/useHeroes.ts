// Loading state for the hero roster.
//
// Pulled out of the screen because "am I loading, did it fail, can I retry" is
// the same three-state problem on every screen that fetches, and a component
// that owns both its network state and its rendering is hard to test as either.
import { useCallback, useEffect, useState } from "react";

import { fetchHeroes, type HeroSummary } from "../api/heroes";

type Status = "loading" | "ready" | "error";

export function useHeroes() {
  const [heroes, setHeroes] = useState<HeroSummary[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Guards against setting state after the screen has gone away, which is
    // what produces the "update on an unmounted component" warning.
    let cancelled = false;
    setStatus("loading");

    fetchHeroes()
      .then((list) => {
        if (cancelled) return;
        setHeroes(list);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load heroes.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Bumping a counter re-runs the effect. Simpler than duplicating the fetch.
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { heroes, status, error, reload };
}
