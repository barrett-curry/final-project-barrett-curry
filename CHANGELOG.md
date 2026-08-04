# Changelog

Both packages follow [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`,
where MAJOR means a change that can break an existing caller, MINOR means new
functionality that does not, and PATCH means a fix that does neither.

The version numbers below are argued rather than assumed — the interesting part
of SemVer is deciding *which* number moves, and that decision is about what a
consumer of the thing would notice.

---

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
