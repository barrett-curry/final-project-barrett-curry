// Loading state for a single hero.
//
// The detail screen used to read from a hardcoded object with eight entries
// while the directory listed eighteen, so tapping any of the other ten showed
// "Hero not found" for a hero that plainly existed on the previous screen. That
// is the failure mode two copies of one dataset always eventually produces —
// they drift, and the drift shows up as a bug that looks like missing data.
import { useEffect, useState } from "react";

import { fetchHero, type HeroDetail } from "../api/heroes";

type Status = "loading" | "ready" | "error";

export function useHero(id: number) {
  const [hero, setHero] = useState<HeroDetail | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchHero(id)
      .then((result) => {
        if (cancelled) return;
        setHero(result);
        setStatus("ready");
      })
      .catch(() => {
        // A 404 and a dead network both mean "cannot show this hero". The
        // screen has one not-found state for both, so they collapse here.
        if (!cancelled) {
          setHero(null);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { hero, status };
}
