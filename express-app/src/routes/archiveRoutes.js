// The archive briefings — 1,400 rows that used to be a string literal inside a
// React component, re-parsed on every render.
import { Router } from "express";

import { listArchive } from "../domain/archiveService.js";
import { numericParam } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res) => {
  const limit = req.query.limit ? numericParam(req.query.limit, "limit") : undefined;

  // `search` and `team` are optional. Passing them means the database does the
  // filtering and only the matches cross the wire; without them the client
  // would receive all 1,400 rows and throw most of them away.
  const { total, entries } = await listArchive({
    limit,
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    team: typeof req.query.team === "string" ? req.query.team : undefined,
  });

  // `count` is what came back, `total` is how many matched. They differ when a
  // limit truncates, and a client needs both to say "showing 50 of 700".
  res.json({ count: entries.length, total, entries });
});

export default router;
