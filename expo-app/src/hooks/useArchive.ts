// Loading state for the archive briefings.
//
// Same three-state shape as useHeroes. Kept as its own hook rather than folded
// into that one because the archive is a different screen's data: the directory
// should not wait on 1,400 rows it is not going to show.
import { useEffect, useState } from "react";

import { fetchArchive, type ArchiveEntry } from "../api/heroes";

type Status = "loading" | "ready" | "error";

export function useArchive() {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    fetchArchive()
      .then((list) => {
        if (cancelled) return;
        setEntries(list);
        setStatus("ready");
      })
      .catch(() => {
        // The archive is a secondary panel on a screen that works without it,
        // so a failure here shows an empty archive rather than taking down the
        // whole directory.
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, status };
}
