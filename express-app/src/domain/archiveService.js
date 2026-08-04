// The archive domain.
//
// Two jobs. The first is translating between how the data is *stored* and how
// it is *used*: Postgres holds `hero_id`, `location`, and `year`, with the
// hero's name and team reachable through a join, while the client renders
// `hero`, `city`, and `era`. Neither side should have to learn the other's
// vocabulary, so the translation happens once, here.
//
// The second is deciding what a search means. That is a rule, not storage, and
// it is the part that was wrong: a search has to match a hero's *name* as well
// as a note or a city, and those live in different tables.
import { heroStore } from "../data/heroStore.js";

/** How many rows one request may ever return, no matter what is asked for. */
const MAX_LIMIT = 2000;

/**
 * Archive briefings, filtered by the database.
 *
 * The two filters compose differently, which is the whole subtlety here:
 *
 *   team    is a restriction. Only these heroes, full stop.
 *   search  is a union. Match the note, OR the city, OR the hero's name.
 *
 * So `?search=Gotham&team=Justice League` means "rows on the Justice League
 * where Gotham appears in the note, the city, or the hero's name" — an OR
 * nested inside an AND. Collapsing that into a single filter is what broke it:
 * resolving the search against hero names and passing only those ids meant a
 * row whose *city* matched was excluded because its hero's name did not.
 */
export async function listArchive({ limit = 1400, search, team } = {}) {
  const store = await heroStore();

  // Capped rather than trusted. `?limit=99999999` is otherwise a free way for
  // anyone to make the server do the most expensive thing it can do.
  const safeLimit = Math.min(limit, MAX_LIMIT);

  // The roster is eighteen rows, so matching against it costs nothing. The
  // archive is 1,400 rows, which is why what it receives is an indexed
  // `hero_id IN (...)` lookup rather than a text comparison across a join.
  const roster = await store.allHeroes();

  const teamHeroIds = team
    ? roster
        .filter((hero) => hero.team.toLowerCase() === team.toLowerCase())
        .map((hero) => hero.id)
    : null;

  if (!search) {
    const { total, rows } = await store.findArchive({
      limit: safeLimit,
      heroIds: teamHeroIds,
    });
    return { total, entries: rows.map(toEntry) };
  }

  // Heroes whose *name* matches, narrowed to the team if one was given.
  const needle = search.toLowerCase();
  const nameMatchIds = roster
    .filter((hero) => hero.name.toLowerCase().includes(needle))
    .filter((hero) => !teamHeroIds || teamHeroIds.includes(hero.id))
    .map((hero) => hero.id);

  // Two queries because the union spans two tables. The first is the text
  // search over the archive's own columns; the second picks up rows belonging
  // to a hero whose name matched. Both are already restricted to the team.
  const [byText, byHero] = await Promise.all([
    store.findArchive({ limit: safeLimit, heroIds: teamHeroIds, search }),
    nameMatchIds.length
      ? store.findArchive({ limit: safeLimit, heroIds: nameMatchIds })
      : { total: 0, rows: [] },
  ]);

  // Merged on id, because a row can satisfy both halves and must appear once.
  const merged = new Map();
  for (const row of [...byText.rows, ...byHero.rows]) merged.set(row.id, row);
  const rows = [...merged.values()].sort((left, right) => left.id - right.id);

  return { total: rows.length, entries: rows.slice(0, safeLimit).map(toEntry) };
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
