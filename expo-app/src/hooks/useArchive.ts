// Loading state for the archive briefings.
//
// The filters are arguments rather than something the caller applies to the
// result, because the database is what does the filtering now. The screen says
// what it wants; this fetches exactly that.
import { useEffect, useRef, useState } from "react";

import { fetchArchive, type ArchiveEntry } from "../api/heroes";

type Status = "loading" | "ready" | "error";

/** How long to wait after the last keystroke before asking the server. */
const DEBOUNCE_MS = 250;

export function useArchive({ search = "", team = "All" } = {}) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>("loading");

  // Every render of the panel would otherwise fire a request per keystroke.
  // Debouncing means typing "Aquaman" is one request instead of seven, and the
  // cleanup cancels the pending timer so an abandoned prefix never fires.
  const latest = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      const requestId = ++latest.current;
      setStatus("loading");

      fetchArchive({ search, team })
        .then((page) => {
          // Responses can arrive out of order — a slow request for "Aqua" can
          // land after a fast one for "Aquaman" and overwrite it with stale
          // results. Only the most recent request is allowed to set state.
          if (cancelled || requestId !== latest.current) return;
          setEntries(page.entries);
          setTotal(page.total);
          setStatus("ready");
        })
        .catch(() => {
          if (cancelled || requestId !== latest.current) return;
          // The archive is a secondary panel on a screen that works without it,
          // so a failure shows an empty archive rather than taking the whole
          // directory down.
          setEntries([]);
          setTotal(0);
          setStatus("error");
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, team]);

  return { entries, total, status };
}
