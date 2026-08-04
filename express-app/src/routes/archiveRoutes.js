// The archive briefings — 1,400 rows that used to be a string literal inside a
// React component, re-parsed on every render.
import { Router } from "express";

import { listArchive } from "../domain/archiveService.js";
import { numericParam } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res) => {
  const limit = req.query.limit ? numericParam(req.query.limit, "limit") : undefined;
  const entries = await listArchive({ limit });
  res.json({ count: entries.length, entries });
});

export default router;
