// The archive domain.
//
// Two jobs. The first is translating between how the data is *stored* and how
// it is *used*: Postgres holds `hero_id`, `location`, and `year`, with the
// hero's name and team reachable through a join, while the client renders
// `hero`, `city`, and `era`. Neither side should have to learn the other's
// vocabulary, so the translation happens once, here.
//
// The second is deciding what a search means, which is a rule and not storage.
import { heroStore } from "../data/heroStore.js";

/** How many rows one request may ever return, no matter what is asked for. */
const MAX_LIMIT = 2000;

/**
 * Resolves a search term and a team name into the set of hero ids they select.
 *
 * The roster is eighteen rows, so matching names against it costs nothing. The
 * archive is 1,400 rows and growing, which is why the filter it receives is an
 * indexed `hero_id IN (...)` rather than a text comparison — that is what
 * idx_archive_hero is for.
 *
 * Returns null when no hero constraint applies, which the store reads as
 * "do not filter by hero at all". An empty array would mean the opposite:
 * match nothing.
 */
async function resolveHeroIds(store, { search, team }) {
  if (!search && !team) return null;

  const roster = await store.allHeroes();
  const needle = search?.toLowerCase();

  const matching = roster.filter((hero) => {
    if (team && hero.team.toLowerCase() !== team.toLowerCase()) return false;
    // With a team filter and no search, every hero on that team qualifies.
    if (!needle) return true;
    return hero.name.toLowerCase().includes(needle);
  });

  return matching.map((hero) => hero.id);
}

export async function listArchive({ limit = 1400, search, team } = {}) {
  const store = await heroStore();

  // Capped rather than trusted. `?limit=99999999` is otherwise a free way for
  // anyone to make the server do the most expensive thing it can do.
  const safeLimit = Math.min(limit, MAX_LIMIT);

  // A search has to match a hero's *name* as well as a note or a city, and
  // those live in different tables. Rather than force one clever cross-table
  // query, the hero half is resolved to ids first and the two halves are
  // combined below.
  const heroIds = await resolveHeroIds(store, { search, team });

  // A team filter is a hard restriction: only these heroes, full stop.
  if (team) {
    const { total, rows } = await store.findArchive({
      limit: safeLimit,
      heroIds,
      // Within a team, a search still has to match note or city text too.
      search: search ?? undefined,
    });
    return { total, entries: rows.map(toEntry) };
  }

  // A bare search is a union, not an intersection: match the note, the city,
  // *or* the hero's name. Asking the store for both and merging is what keeps
  // that honest — filtering by hero id alone would silently drop rows whose
  // note matched but whose hero did not.
  if (search) {
    const [byText, byHero] = await Promise.all([
      store.findArchive({ limit: safeLimit, search }),
      heroIds?.length ? store.findArchive({ limit: safeLimit, heroIds }) : { total: 0, rows: [] },
    ]);

    const merged = new Map();
    for (const row of [...byText.rows, ...byHero.rows]) merged.set(row.id, row);
    const rows = [...merged.values()].sort((left, right) => left.id - right.id);

    return { total: rows.length, entries: rows.slice(0, safeLimit).map(toEntry) };
  }

  const { total, rows } = await store.findArchive({ limit: safeLimit });
  return { total, entries: rows.map(toEntry) };
}

function toEntry(row) {
  return {
    index: row.id,
    hero: row.heroes.name,
    note: row.note,
    city: row.location,
    // `era` is a string on the client because that is what splitting the old
    // pipe-delimited seed produced, and its sort is a string comparison. The
    // column is a real integer in Postgres — which is what makes a year range a
    // query rather than a scan — and it is converted back at the boundary so
    // the existing screen keeps working untouched.
    era: String(row.year),
    team: row.heroes.team,
  };
}
