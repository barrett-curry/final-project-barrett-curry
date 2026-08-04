// The hero connector, now with two implementations behind one interface.
//
// Both stores expose the same six async functions. Everything above this file
// calls them without knowing or caring which one it got — that is the whole
// point of having had a connector boundary before the database existed.
//
// Why two:
//
//   supabase  — the real one. Used whenever SUPABASE_URL and SUPABASE_ANON_KEY
//               are set, which is what `npm start` uses.
//   memory    — the same data from the seed file, served from arrays. Used by
//               the tests, and as a fallback when nothing is configured.
//
// The tests use the memory store deliberately, not out of laziness. A test that
// needs the network is slow, needs credentials in CI, and fails for reasons
// that have nothing to do with the code under test. What the hero *service*
// does with rows is worth testing on every commit; whether Supabase can return
// rows is not.
//
// Note the shape of the functions: they are `async` in both implementations,
// including the in-memory one that has nothing to await. If the memory store
// were synchronous, the tests would pass against an interface the production
// code never uses, and the first real call would be the one that discovered the
// difference.
import { archiveEntries, heroes as seedHeroes } from "./heroSeed.js";
import * as logger from "../logger.js";

const SUMMARY_FIELDS = "id, name, real_name, team";

/** Postgres uses snake_case; the API's JSON has always been camelCase. */
const toHero = (row) => ({
  id: row.id,
  name: row.name,
  realName: row.real_name,
  team: row.team,
  origin: row.origin ?? undefined,
  firstAppearance: row.first_appearance ?? undefined,
  creator: row.creator ?? undefined,
  location: row.location ?? undefined,
  quote: row.quote ?? undefined,
});

// --- In-memory ------------------------------------------------------------

function createMemoryStore() {
  const summary = ({ id, name, realName, powers, team }) => ({
    id,
    name,
    realName,
    powers,
    team,
  });

  return {
    kind: "memory",

    async allHeroes() {
      return seedHeroes.map(summary);
    },

    async findHeroById(id) {
      return seedHeroes.find((hero) => hero.id === id) ?? null;
    },

    async findHeroesByName(query) {
      const needle = query.toLowerCase();
      return seedHeroes
        .filter(
          (hero) =>
            hero.name.toLowerCase().includes(needle) ||
            hero.realName.toLowerCase().includes(needle),
        )
        .map(summary);
    },

    async findHeroesByTeam(team) {
      return seedHeroes
        .filter((hero) => hero.team.toLowerCase() === team.toLowerCase())
        .map(summary);
    },

    async countByTeam() {
      const counts = seedHeroes.reduce((totals, hero) => {
        totals[hero.team] = (totals[hero.team] || 0) + 1;
        return totals;
      }, {});
      return Object.entries(counts).map(([team, count]) => ({ team, count }));
    },

    async findArchiveByHero(heroId, { limit = 50 } = {}) {
      return archiveEntries
        .filter((entry) => entry.hero_id === heroId)
        .slice(0, limit)
        .map(({ hero_id, ...rest }) => rest);
    },

    async findArchive({ limit = 1400, search, heroIds } = {}) {
      // The seed dropped the redundant hero name and team when it normalized;
      // this puts them back by joining, which is what the database does too.
      const byId = new Map(seedHeroes.map((hero) => [hero.id, hero]));
      const needle = search?.toLowerCase();

      const matches = archiveEntries.filter((entry) => {
        if (heroIds && !heroIds.includes(entry.hero_id)) return false;
        if (!needle) return true;
        const hero = byId.get(entry.hero_id);
        return (
          entry.note.toLowerCase().includes(needle) ||
          entry.location.toLowerCase().includes(needle) ||
          hero.name.toLowerCase().includes(needle)
        );
      });

      return {
        total: matches.length,
        rows: matches.slice(0, limit).map((entry) => ({
          ...entry,
          heroes: {
            name: byId.get(entry.hero_id).name,
            team: byId.get(entry.hero_id).team,
          },
        })),
      };
    },
  };
}

// --- Supabase -------------------------------------------------------------

function createSupabaseStore(client) {
  // Supabase reports failures in a `error` field rather than throwing, so every
  // call has to check. Doing it here once keeps the check out of six places.
  const unwrap = ({ data, error }) => {
    if (error) {
      // Thrown, not returned: the error middleware turns an unrecognized throw
      // into a generic 500 and logs the detail. A Postgres error string is
      // exactly the kind of internal detail a client should never see.
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    return data;
  };

  return {
    kind: "supabase",

    async allHeroes() {
      const rows = unwrap(
        await client.from("heroes").select(`${SUMMARY_FIELDS}, hero_powers(power)`).order("id"),
      );
      return rows.map((row) => ({
        ...toHero(row),
        powers: row.hero_powers.map((entry) => entry.power),
        origin: undefined,
      })).map(({ id, name, realName, powers, team }) => ({ id, name, realName, powers, team }));
    },

    async findHeroById(id) {
      // One round trip for the hero and all four of its child tables. Fetching
      // them separately would be five queries to render one screen.
      const rows = unwrap(
        await client
          .from("heroes")
          .select("*, hero_powers(power), hero_stats(*), hero_relationships(related_name, kind)")
          .eq("id", id),
      );
      if (rows.length === 0) return null;

      const row = rows[0];
      const related = (kind) =>
        row.hero_relationships.filter((entry) => entry.kind === kind).map((e) => e.related_name);

      // hero_stats arrives with the join key attached; the API's shape is just
      // the six numbers.
      const { hero_id, ...stats } = row.hero_stats ?? {};

      return {
        ...toHero(row),
        powers: row.hero_powers.map((entry) => entry.power),
        allies: related("ally"),
        enemies: related("enemy"),
        stats: row.hero_stats ? stats : undefined,
      };
    },

    async findHeroesByName(query) {
      // ilike is Postgres's case-insensitive LIKE; `or` gives us the same
      // "name OR real name" match the client used to do in JavaScript, except
      // the database does it and only the matches cross the wire.
      const pattern = `%${query}%`;
      const rows = unwrap(
        await client
          .from("heroes")
          .select(`${SUMMARY_FIELDS}, hero_powers(power)`)
          .or(`name.ilike.${pattern},real_name.ilike.${pattern}`)
          .order("id"),
      );
      return rows.map((row) => ({
        ...toHero(row),
        powers: row.hero_powers.map((entry) => entry.power),
      })).map(({ id, name, realName, powers, team }) => ({ id, name, realName, powers, team }));
    },

    async findHeroesByTeam(team) {
      const rows = unwrap(
        await client
          .from("heroes")
          .select(`${SUMMARY_FIELDS}, hero_powers(power)`)
          .ilike("team", team)
          .order("id"),
      );
      return rows.map((row) => ({
        ...toHero(row),
        powers: row.hero_powers.map((entry) => entry.power),
      })).map(({ id, name, realName, powers, team: t }) => ({ id, name, realName, powers, team: t }));
    },

    async countByTeam() {
      const rows = unwrap(await client.from("heroes").select("team"));
      const counts = rows.reduce((totals, row) => {
        totals[row.team] = (totals[row.team] || 0) + 1;
        return totals;
      }, {});
      return Object.entries(counts).map(([team, count]) => ({ team, count }));
    },

    async findArchiveByHero(heroId, { limit = 50 } = {}) {
      // The whole reason this table is in Postgres: the client used to hold all
      // 1,400 rows and filter them in JavaScript. Now the database returns the
      // handful that matter and the rest never leaves the server.
      return unwrap(
        await client
          .from("archive_entries")
          .select("id, note, location, year")
          .eq("hero_id", heroId)
          .order("year")
          .limit(limit),
      );
    },

    async findArchive({ limit = 1400, search, heroIds } = {}) {
      // `heroes(name, team)` is the join. The schema dropped `team` from the
      // archive because it was duplicated on all 1,400 rows; this recovers it
      // through the foreign key, which is the whole reason to normalize —
      // stored once, joined on demand.
      //
      // `count: "exact"` asks Postgres for the total number of matches
      // alongside the page, so the UI can say "50 of 700" without fetching 700.
      let query = client
        .from("archive_entries")
        .select("id, note, location, year, heroes(name, team)", { count: "exact" });

      // Filtering by hero is an id lookup, which is what idx_archive_hero
      // exists for. The caller resolves names and teams to ids first — the
      // roster is eighteen rows, so matching against it is free, while the
      // 1,400-row table is the one that needs an index.
      if (heroIds) query = query.in("hero_id", heroIds);

      if (search) {
        const pattern = `%${search}%`;
        // Postgres does the text scan across both columns. Rows that do not
        // match never cross the network, which is the entire point — the
        // client used to receive all 1,400 and discard most of them.
        query = query.or(`note.ilike.${pattern},location.ilike.${pattern}`);
      }

      const { data, error, count } = await query.order("id").limit(limit);
      if (error) throw new Error(`Supabase query failed: ${error.message}`);

      return { total: count ?? data.length, rows: data };
    },
  };
}

// --- Selection ------------------------------------------------------------

/**
 * Builds the store. Exported so tests can pass a stub client and get the
 * Supabase code path without a network — the in-memory store is the default
 * rather than the only option.
 */
export function createHeroStore(client) {
  if (client) return createSupabaseStore(client);
  return createMemoryStore();
}

let store;

/** The app-wide store, built once on first use. */
export async function heroStore() {
  if (store) return store;

  // Supabase renamed `anon` to `publishable`. Accepting both means the project
  // works against a new dashboard or an old one without a code change.
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Not an error. Running without credentials is the normal case for tests
    // and for anyone who just cloned the repo, and the app should still work.
    logger.devLog("No Supabase credentials found — serving heroes from the in-memory seed.");
    store = createHeroStore(null);
    return store;
  }

  // Imported lazily so the dependency is not loaded at all when it is not used,
  // which keeps the test suite from paying for it.
  const { createClient } = await import("@supabase/supabase-js");
  logger.log("Serving heroes from Supabase.");
  store = createHeroStore(createClient(url, key));
  return store;
}
