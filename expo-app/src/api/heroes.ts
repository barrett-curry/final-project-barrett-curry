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

export interface HeroDetail extends HeroSummary {
  origin?: string;
  firstAppearance?: string;
  creator?: string;
  location?: string;
  allies?: string[];
  enemies?: string[];
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
