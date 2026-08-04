// The client's one door to the API.
//
// Every fetch in the app goes through here rather than being written inline in
// a component. Two reasons: the base URL is configured in one place, and the
// error handling is written once instead of in every screen that loads
// something.

export interface HeroSummary {
  id: number;
  name: string;
  realName: string;
  powers: string[];
  team: string;
}

/**
 * An ally or enemy. `id` is null for supporting characters who are not heroes
 * in their own right (Alfred, Aunt May), which is how the screen decides what
 * to make a link and what to leave as plain text. The server resolves this
 * against the real roster — the client used to do it with a hardcoded table
 * that sent five names to the wrong hero.
 */
export interface RelatedCharacter {
  name: string;
  id: number | null;
}

export interface HeroDetail extends HeroSummary {
  origin?: string;
  firstAppearance?: string;
  creator?: string;
  location?: string;
  allies?: RelatedCharacter[];
  enemies?: RelatedCharacter[];
  quote?: string;
  stats?: Record<string, number>;
  /** Null when the hero has no stat block — see the note in heroService.js. */
  powerScore: number | null;
}

// Overridable so the app can point at a deployed API without a code change.
// Falls back to localhost, which is what `npm start` in express-app serves.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/** The API answers failures as { error, code }. Surface the server's message. */
async function fetchJson<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    // A network-level failure is worth distinguishing from a 4xx: the user can
    // do something about "the server is not running", but not about a 404.
    throw new Error(
      `Could not reach the API at ${API_BASE_URL}. Is it running? (cd express-app && npm start)`,
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchHeroes(): Promise<HeroSummary[]> {
  const body = await fetchJson<{ count: number; heroes: HeroSummary[] }>("/heroes");
  return body.heroes;
}

export const fetchHero = (id: number) => fetchJson<HeroDetail>(`/heroes/${id}`);

/** One archive briefing, in the shape the archive panel renders. */
export interface ArchiveEntry {
  index: number;
  hero: string;
  note: string;
  city: string;
  era: string;
  team: string;
}

export interface ArchivePage {
  /** How many rows came back. */
  count: number;
  /** How many matched in total, which is larger when a limit truncated. */
  total: number;
  entries: ArchiveEntry[];
}

/**
 * Archive briefings, filtered by the database.
 *
 * The filters are query parameters rather than something applied after the
 * fetch, so a search for one hero transfers a few dozen rows instead of all
 * 1,400 and then discarding 1,350 of them.
 */
export async function fetchArchive({
  search,
  team,
  limit,
}: { search?: string; team?: string; limit?: number } = {}): Promise<ArchivePage> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  // "All" is the screen's word for no filter; the API's word for it is absence.
  if (team && team !== "All") params.set("team", team);
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  return fetchJson<ArchivePage>(`/archive${query ? `?${query}` : ""}`);
}
