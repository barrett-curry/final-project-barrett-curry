# Changelog

Both packages follow [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`,
where MAJOR means a change that can break an existing caller, MINOR means new
functionality that does not, and PATCH means a fix that does neither.

The version numbers below are argued rather than assumed — the interesting part
of SemVer is deciding *which* number moves, and that decision is about what a
consumer of the thing would notice.

---

## `express-app` 2.0.0 → **3.0.0**

**MAJOR**, for one removal and one changed response shape.

- **BREAKING** — `GET /bug` is gone. It returned a hardcoded string about
  Venomoth and had no caller. It survived the refactor only because a test
  guarded it, which is a test doing the opposite of its job: pinning dead code
  in place. Removing a public route breaks anyone who called it, so it gets its
  own commit and its own major bump rather than being smuggled into a cleanup.
- **BREAKING** — `strongestPokemon`, `averagePower`, and `ace` can now be
  `null`. See the bug fix below; a client that assumed those were always objects
  needs to check.
- **BREAKING** — `GET /` changed shape. `endpoints` was a flat object of
  `"GET /pokemon": "description"` strings; it is now grouped by resource, with
  each entry `{ method, path }`, plus a `count`. It had to change because it is
  now generated rather than written, and a generated list has no descriptions to
  invent.
- `MINOR` — `GET /archive` takes `?search=` and `?team=`, and responses carry
  `total` alongside `count`.
- `MINOR` — `GET /health` reports which hero store answered.
- `MINOR` — allies and enemies are now `{ name, id }` rather than bare strings.

### Bugs fixed

- **`?search=` and `?team=` together dropped every text match.**
  `?search=Gotham&team=Justice League` returned 0 instead of 78. The two filters
  compose as an OR nested inside an AND — rows on this team where the term
  appears in the note, the city, *or* the hero's name — and collapsing that into
  a single hero-id filter excluded any row whose city matched but whose hero's
  name did not.
- **The two hero stores disagreed about what a search means.** The in-memory
  store matched hero names; the Supabase store did not. Tests ran on the first
  and production on the second, so the suite was green against semantics nobody
  shipped. Search now means "this table's own text columns" in both, and name
  matching is the service's job.
- **A trainer with no Pokémon crashed the server.** `reduce` on an empty array
  with no initial value throws, surfacing as a 500 with a `TypeError` in the
  log. Unreachable with the seeded data — both trainers have full teams — which
  is exactly why it lasted. A team naming Pokémon that no longer exist hits the
  same path.
- **Five allies navigated to the wrong hero.** Fixed in 2.0.0's client, caused
  by a hardcoded lookup table that is now derived from the roster.

## `express-app` 1.0.0 → **2.0.0**

**MAJOR**, and it comes down to two changes. Most of what I did this session was
additive, and on its own would have been a MINOR release. Two things were not:

1. **Malformed ids now answer `400` where they used to answer `404`.**
   `/pokemon/abc` previously returned "Pokémon not found"; it now returns
   "'id' must be a positive whole number". This is a *better* answer, but any
   client branching on the status code sees different behavior for the same
   request, which is the definition of a breaking change.
2. **Unknown routes now return JSON instead of Express's default HTML page.**
   A client that was parsing that HTML — or just checking `content-type` — sees
   something different.

This is worth stating plainly because the temptation is to reason "everything I
did was an improvement, so it must be MINOR." SemVer does not grade on whether a
change is good, only on whether it can break someone. Both of these can.

Everything else in the release was correctly additive and did **not** on its own
force the major bump:

- `MINOR` — new `/heroes` resource (5 endpoints)
- `MINOR` — every error response gained a machine-readable `code` field; the
  existing `error` key is untouched, so old clients keep working
- `MINOR` — CORS headers, so browser clients can call the API at all
- `PATCH` — internal refactor into data/domain/route layers, no behavior change
- `PATCH` — `console.log` replaced with a level-aware logger

**A deliberate non-change.** `app.js` still re-exports every name it did before,
now pointing at the new layers. Dropping them would have been a third breaking
change, and an internal reorganization should not be the reason someone's import
stops resolving.

## `expo-app` 1.0.0 → **2.0.0**

**MAJOR.** The app no longer ships its own copy of the hero roster — it fetches
from the API. Anyone who runs it now needs the API running too, or points
`EXPO_PUBLIC_API_URL` at a deployed one. Nothing about the code is incompatible,
but the thing you have to do to make it work changed, and that counts.

- `MINOR` — loading, error, and retry states on the directory screen
- `PATCH` — hero data deduplicated (it existed twice, in two shapes)
