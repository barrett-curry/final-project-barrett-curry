// Prose for each endpoint.
//
// The route list itself is generated (see catalog.js) — this only supplies the
// things a machine cannot infer: what an endpoint is for, what its parameters
// mean, and a request that actually works.
//
// Ideally each description would sit next to the route it describes. It does
// not, and that is a real trade-off: a route file and this file can drift. What
// stops them is `__tests__/docs.test.js`, which asserts the two sides are
// exactly one-to-one — add a route without documenting it, or document one that
// does not exist, and the build fails. A test is a weaker guarantee than
// adjacency, but it is a guarantee, and it cost five minutes instead of
// rewriting six route files.
//
// Keys are `METHOD /full/path`, matching what catalog.js generates.

export const descriptions = {
  "GET /": {
    summary: "This index. Lists every endpoint the API serves.",
    notes: "Generated from the routers, so it cannot advertise a route that does not exist.",
    example: "/",
  },

  "GET /health": {
    summary: "Liveness check, and which data store answered.",
    notes:
      "Reports heroSource as 'supabase' or 'memory'. The in-memory fallback is silent by design, so this is how you tell a working database from a misconfigured one. Answers 503 if the store is configured but failing.",
    example: "/health",
  },

  // --- Pokémon ---

  "GET /pokemon": { summary: "Every Pokémon, with a count.", example: "/pokemon" },
  "GET /pokemon/:id": {
    summary: "One Pokémon by id.",
    params: { id: "Positive whole number. A non-numeric id is a 400, not a 404." },
    example: "/pokemon/25",
  },
  "GET /pokemon/random": { summary: "One Pokémon, chosen at random.", example: "/pokemon/random" },
  "GET /pokemon/library": {
    summary: "Every Pokémon name sorted alphabetically, with type counts.",
    example: "/pokemon/library",
  },
  "GET /pokemon/collection-summary": {
    summary: "Totals across the whole Pokédex: power, types, trainers.",
    example: "/pokemon/collection-summary",
  },
  "GET /pokemon/search": {
    summary: "Pokémon whose name contains a term.",
    query: { name: "Required. Case-insensitive substring. Missing it is a 400." },
    example: "/pokemon/search?name=char",
  },
  "GET /pokemon/type/:type": {
    summary: "Every Pokémon of a type.",
    params: { type: "Case-insensitive. A type nobody has is a 404." },
    example: "/pokemon/type/Water",
  },
  "GET /pokemon/type-summary/:type": {
    summary: "Averages and champions for one type.",
    params: { type: "Case-insensitive." },
    example: "/pokemon/type-summary/Fire",
  },
  "GET /pokemon/type-matchup/:id": {
    summary: "What a Pokémon is strong against and vulnerable to.",
    notes: "Derived from its types via a lookup table, so adding a type is a data change.",
    example: "/pokemon/type-matchup/6",
  },
  "GET /pokemon/evolution/:id": {
    summary: "The evolution chain from this Pokémon onward, itself included.",
    example: "/pokemon/evolution/1",
  },
  "GET /pokemon/top/:stat": {
    summary: "The highest Pokémon for one stat.",
    params: { stat: "hp, attack, defense, weight, or height. Anything else is a 400 listing the valid ones." },
    example: "/pokemon/top/attack",
  },
  "GET /pokemon/compare/:firstId/:secondId": {
    summary: "Two Pokémon head to head, decided on hp + attack + defense.",
    notes: "Equal power rating is a tie rather than an arbitrary winner.",
    example: "/pokemon/compare/6/25",
  },

  // --- Trainers ---

  "GET /trainers": {
    summary: "Every trainer, with their team expanded from ids to names.",
    example: "/trainers",
  },
  "GET /trainers/:id": { summary: "One trainer by id.", example: "/trainers/1" },
  "GET /trainers/lineup": {
    summary: "Trainers ranked by badge count — experience, not strength.",
    example: "/trainers/lineup",
  },
  "GET /trainers/rankings": {
    summary: "Trainers ranked by total team power, badges breaking ties.",
    example: "/trainers/rankings",
  },
  "GET /trainers/hometown/:city": {
    summary: "Trainers from a city.",
    params: { city: "Case-insensitive substring, so 'city' matches Cerulean City." },
    example: "/trainers/hometown/Pallet Town",
  },
  "GET /trainers/:id/ace": {
    summary: "A trainer's strongest Pokémon.",
    notes: "Null for a trainer with no team, rather than inventing one.",
    example: "/trainers/1/ace",
  },
  "GET /trainers/:id/team-summary": {
    summary: "Team size, total and average power, type coverage.",
    notes: "averagePower and strongestPokemon are null for an empty team, since 0/0 is not a number.",
    example: "/trainers/1/team-summary",
  },
  "GET /trainers/battle/:firstId/:secondId": {
    summary: "Two trainers head to head on total team power.",
    notes: "Badges break a tie; equal on both is a draw.",
    example: "/trainers/battle/1/2",
  },

  "GET /stats": {
    summary: "Aggregate statistics across the entire Pokédex and its trainers.",
    example: "/stats",
  },

  // --- Heroes (Supabase) ---

  "GET /heroes": {
    summary: "All 18 heroes, summary fields only.",
    notes: "Served from Postgres. Detail fields are deliberately not included — a list screen does not need them.",
    example: "/heroes",
  },
  "GET /heroes/:id": {
    summary: "One hero with everything known about them, plus a computed powerScore.",
    notes:
      "powerScore is null, not zero, for the ten heroes with no stat block. Zero would sort them below a genuinely weak hero and imply we know something we do not. Allies and enemies resolve to { name, id }, with id null for supporting characters who are not heroes.",
    example: "/heroes/1",
  },
  "GET /heroes/search": {
    summary: "Heroes matching a term in either their hero name or their real name.",
    query: { name: "Required." },
    example: "/heroes/search?name=wayne",
  },
  "GET /heroes/team/:team": { summary: "Heroes on one team.", example: "/heroes/team/Avengers" },
  "GET /heroes/teams": {
    summary: "Roster split by team, with counts.",
    notes: "Computed server-side because it is a property of the roster, not of any one screen.",
    example: "/heroes/teams",
  },
  "GET /heroes/:id/archive": {
    summary: "One hero's archive briefings.",
    query: { limit: "Optional, default 50." },
    example: "/heroes/1/archive?limit=3",
  },

  // --- Archive ---

  "GET /archive": {
    summary: "The 1,400 archive briefings, filtered by the database.",
    query: {
      search: "Optional. Matches the note, the city, OR the hero's name.",
      team: "Optional. Restricts to one team.",
      limit: "Optional, default 1400, capped at 2000.",
    },
    notes:
      "search and team compose as an OR nested inside an AND: rows on this team where the term appears in any of the three fields. Responses carry both count (rows returned) and total (rows matched), which differ when a limit truncates.",
    example: "/archive?search=Gotham&team=Justice League&limit=5",
  },
};
