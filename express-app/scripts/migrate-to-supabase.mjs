#!/usr/bin/env node
//
// Loads the seed data into Supabase. Run once, after applying db/schema.sql in
// the Supabase SQL editor:
//
//   npm run migrate
//
// Reads credentials from the environment, never from a file in the repo. The
// service-role key is required rather than the anon key: the schema's row-level
// security policies grant public SELECT only, so an anon key can read but not
// write — which is exactly what you want for an API and exactly wrong for a
// migration.
//
// Safe to re-run. Every write is an upsert keyed on the primary key, so this
// converges on the seed rather than duplicating it.
import { createClient } from "@supabase/supabase-js";

import { archiveEntries, heroes } from "../src/data/heroSeed.js";

// Supabase renamed its keys: `service_role` became `secret`. Both names are
// accepted so the project works whether you are on a new dashboard or an older
// one, with the current name preferred.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing credentials.\n" +
      "  Set these in express-app/.env (see .env.example):\n" +
      "    SUPABASE_URL           https://<project-ref>.supabase.co\n" +
      "    SUPABASE_SECRET_KEY    sb_secret_...  (or SUPABASE_SERVICE_ROLE_KEY)\n" +
      "  Both are in your Supabase project under Settings -> API Keys.\n\n" +
      `  Currently set: SUPABASE_URL=${url ? "yes" : "no"}, key=${key ? "yes" : "no"}`,
  );
  process.exit(1);
}

const db = createClient(url, key);

/** Supabase reports failures in a field rather than throwing. */
function check(label, { error }) {
  if (error) {
    console.error(`✗ ${label}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

// Postgres rejects a child row whose parent does not exist yet, so heroes go
// first and everything that references them follows.
check(
  `heroes (${heroes.length})`,
  await db.from("heroes").upsert(
    heroes.map((hero) => ({
      id: hero.id,
      name: hero.name,
      real_name: hero.realName,
      team: hero.team,
      origin: hero.origin ?? null,
      first_appearance: hero.firstAppearance ?? null,
      creator: hero.creator ?? null,
      location: hero.location ?? null,
      quote: hero.quote ?? null,
    })),
  ),
);

const powers = heroes.flatMap((hero) =>
  (hero.powers ?? []).map((power) => ({ hero_id: hero.id, power })),
);
check(`hero_powers (${powers.length})`, await db.from("hero_powers").upsert(powers));

// Only the eight heroes with a detail record have stats.
const stats = heroes
  .filter((hero) => hero.stats)
  .map((hero) => ({ hero_id: hero.id, ...hero.stats }));
check(`hero_stats (${stats.length})`, await db.from("hero_stats").upsert(stats));

const relationships = heroes.flatMap((hero) => [
  ...(hero.allies ?? []).map((related_name) => ({ hero_id: hero.id, related_name, kind: "ally" })),
  ...(hero.enemies ?? []).map((related_name) => ({ hero_id: hero.id, related_name, kind: "enemy" })),
]);
check(
  `hero_relationships (${relationships.length})`,
  await db.from("hero_relationships").upsert(relationships),
);

// 1,400 rows is past the point where one request is a good idea — a single
// oversized insert is slower, more likely to time out, and tells you nothing
// about where it failed. Chunking gives progress and a smaller retry.
const CHUNK = 500;
for (let i = 0; i < archiveEntries.length; i += CHUNK) {
  const batch = archiveEntries.slice(i, i + CHUNK);
  check(
    `archive_entries ${i + 1}-${i + batch.length} of ${archiveEntries.length}`,
    await db.from("archive_entries").upsert(batch),
  );
}

console.log("\nMigration complete.");
