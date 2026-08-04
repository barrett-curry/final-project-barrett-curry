// Health check.
//
// Two jobs. Render (and most hosts) needs a cheap endpoint to poll to decide
// whether an instance is alive — hitting `/` works but does real work on every
// probe.
//
// The second job is the useful one. The hero store falls back to the in-memory
// seed when Supabase is not configured, and that fallback is deliberately
// silent so the app still runs for anyone who just cloned it. But silence cuts
// both ways: a typo in SUPABASE_URL looks identical to success, because the API
// keeps answering with the same data. This endpoint says which store actually
// answered, so "is it really talking to Postgres" is a question with an answer
// rather than a guess.
import { Router } from "express";

import { heroStore } from "../data/heroStore.js";

const router = Router();

router.get("/", async (req, res) => {
  const store = await heroStore();

  // Round-trips the database rather than just reporting which client was
  // built. Configured-but-broken is the failure this is here to catch, and
  // only a real query can tell the difference.
  let heroes = null;
  let error = null;
  try {
    heroes = (await store.allHeroes()).length;
  } catch (err) {
    error = err instanceof Error ? err.message : "unknown error";
  }

  const healthy = error === null;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    heroSource: store.kind, // "supabase" or "memory"
    heroCount: heroes,
    ...(error ? { error } : {}),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

export default router;
