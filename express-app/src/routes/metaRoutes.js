// Routes about the API itself rather than about a resource.
import { Router } from "express";

import { buildCatalog, groupByResource } from "./catalog.js";

/**
 * Built as a factory rather than exported directly, because it needs the mount
 * table and the mount table needs it. Passing it in breaks the cycle that
 * importing it would create.
 */
export function createMetaRoutes(mounts) {
  const router = Router();

  // A self-describing index, generated from the routers rather than typed out.
  // The previous hand-written version listed 7 of 28 endpoints.
  router.get("/", (req, res) => {
    const catalog = buildCatalog(mounts);

    res.json({
      message: "Welcome to the Pokédex API!",
      count: catalog.length,
      endpoints: groupByResource(catalog),
    });
  });

  return router;
}
