// Derives the list of endpoints from the routers themselves.
//
// `GET /` used to carry a hand-written list of seven endpoints. There are
// twenty-eight. It did not mention /heroes, /archive, or /health at all — it
// went stale inside a single working session, which is what a hand-maintained
// list of anything does.
//
// Anything that documents the API has to be generated from the API, or it is
// only ever accurate on the day it was written.
//
// A note on why this is not pure introspection: Express 5 does not expose a
// mount's prefix on its layer (it replaced the readable `regexp` with internal
// matchers), so `/pokemon` cannot be recovered from `app.router.stack` alone.
// The prefixes therefore live in one table, which app.js also uses to mount
// them — so they are still declared exactly once, and the paths *within* each
// router are read from the router.

/** Joins a mount prefix to a route path without doubling or dropping slashes. */
function joinPath(prefix, path) {
  if (path === "/") return prefix === "/" ? "/" : prefix;
  return prefix === "/" ? path : `${prefix}${path}`;
}

/**
 * @param {{prefix: string, router: import("express").Router, resource: string}[]} mounts
 * @param {Record<string, object>} [descriptions] keyed by `METHOD /full/path`
 * @returns {{method: string, path: string, resource: string}[]}
 */
export function buildCatalog(mounts, descriptions = {}) {
  return mounts
    .flatMap(({ prefix, router, resource }) =>
      router.stack
        // Layers without a `route` are middleware, not endpoints.
        .filter((layer) => layer.route)
        .flatMap((layer) =>
          Object.keys(layer.route.methods).map((method) => {
            const path = joinPath(prefix, layer.route.path);
            return {
              method: method.toUpperCase(),
              path,
              resource,
              // Spread rather than nested, so an undocumented route simply has
              // no summary instead of an empty object pretending to be one.
              ...(descriptions[`${method.toUpperCase()} ${path}`] ?? {}),
            };
          }),
        ),
    )
    .sort((left, right) => left.path.localeCompare(right.path));
}

/** The catalog grouped by resource, which is how a docs page wants it. */
export function groupByResource(catalog) {
  return catalog.reduce((groups, entry) => {
    (groups[entry.resource] ??= []).push({ method: entry.method, path: entry.path });
    return groups;
  }, {});
}
