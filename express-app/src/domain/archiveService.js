// The archive domain.
//
// Its one real job is translating between how the data is *stored* and how it
// is *used*. Postgres holds `hero_id`, `location`, and `year`, with the hero's
// name and team reachable through a join. The client renders `hero`, `city`,
// and `era`. Neither side should have to know the other's vocabulary, so the
// translation happens once, here.
import { heroStore } from "../data/heroStore.js";

/** How many rows one request may ever return, no matter what is asked for. */
const MAX_LIMIT = 2000;

export async function listArchive({ limit = 1400 } = {}) {
  const store = await heroStore();

  // Capped rather than trusted. `?limit=99999999` is otherwise a free way for
  // anyone to make the server do the most expensive thing it can do.
  const rows = await store.findArchive({ limit: Math.min(limit, MAX_LIMIT) });

  return rows.map((row) => ({
    index: row.id,
    hero: row.heroes.name,
    note: row.note,
    city: row.location,
    // `era` is a string on the client because that is what splitting the old
    // pipe-delimited seed produced, and its sort is a string comparison. The
    // column is a real integer in Postgres — which is what makes "everything
    // before 1950" a query rather than a scan — and it is converted back at the
    // boundary so the existing screen keeps working untouched.
    era: String(row.year),
    team: row.heroes.team,
  }));
}
