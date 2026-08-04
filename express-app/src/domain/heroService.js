// The domain layer for heroes.
//
// Every function here is async now, because the data comes from Postgres over
// the network. That change stopped at this layer's edges: the rules themselves
// — what a power score is, that an unknown hero is a 404 — did not change at
// all, only how the rows arrive.
//
// The store is fetched rather than imported directly so this file works
// identically against Postgres and against the in-memory seed. See heroStore.js.
import { heroStore } from "../data/heroStore.js";
import { notFound } from "../errors.js";

/**
 * A hero's overall power, derived from their six stat bars.
 *
 * Returns null rather than 0 for the ten heroes with no stat block. Zero would
 * sort them below a genuinely weak hero and imply we know something we do not;
 * null says "unknown", which is the truth.
 */
export function powerScore(hero) {
  if (!hero?.stats) return null;
  return Object.values(hero.stats).reduce((total, value) => total + value, 0);
}

export async function listHeroes() {
  const store = await heroStore();
  return store.allHeroes();
}

export async function getHero(id) {
  const store = await heroStore();
  const hero = await store.findHeroById(id);
  if (!hero) throw notFound("Hero not found", { code: "HERO_NOT_FOUND" });
  return { ...hero, powerScore: powerScore(hero) };
}

export async function searchHeroes(query) {
  const store = await heroStore();
  return store.findHeroesByName(query);
}

export async function listByTeam(team) {
  const store = await heroStore();
  const matches = await store.findHeroesByTeam(team);
  if (matches.length === 0) {
    throw notFound(`No heroes found on team: ${team}`, { code: "TEAM_NOT_FOUND" });
  }
  return matches;
}

/**
 * Roster split by team.
 *
 * The Expo app was recomputing this on every render. It is a property of the
 * roster, not of the screen, so it belongs where the roster lives.
 */
export async function teamBreakdown() {
  const store = await heroStore();
  const teams = await store.countByTeam();

  return {
    totalHeroes: teams.reduce((total, entry) => total + entry.count, 0),
    teams: teams.sort((left, right) => right.count - left.count),
  };
}

/**
 * A hero's archive entries.
 *
 * `limit` is capped rather than trusted. Without a ceiling, `?limit=999999` is
 * a free way for anyone to make the server do the most expensive thing it can
 * do, which is the sort of endpoint that is fine until the day it is not.
 */
export async function heroArchive(id, { limit = 50 } = {}) {
  const hero = await getHero(id);
  const store = await heroStore();
  const entries = await store.findArchiveByHero(id, { limit: Math.min(limit, 200) });

  return {
    hero: { id: hero.id, name: hero.name, team: hero.team },
    count: entries.length,
    entries,
  };
}
