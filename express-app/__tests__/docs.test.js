// Tests for the documentation page.
//
// The important one is the first: descriptions live in their own file rather
// than next to the routes they describe, which means they can drift. This
// asserts the two sides are exactly one-to-one, so adding a route without
// documenting it — or documenting one that no longer exists — fails the build.
//
// That is what makes the trade-off acceptable. Without this test, a separate
// descriptions file is just a second hand-maintained list, which is the exact
// thing the generated catalog was built to eliminate.
import request from "supertest";

import app, { mounts } from "../app.js";
import { buildCatalog } from "../src/routes/catalog.js";
import { descriptions } from "../src/routes/descriptions.js";

describe("API documentation", () => {
  const catalog = buildCatalog(mounts);
  const routeKeys = catalog.map((entry) => `${entry.method} ${entry.path}`);

  it("documents every route the API serves", () => {
    const undocumented = routeKeys.filter((key) => !descriptions[key]);

    expect(undocumented).toEqual([]);
  });

  it("documents no route the API does not serve", () => {
    const orphaned = Object.keys(descriptions).filter((key) => !routeKeys.includes(key));

    expect(orphaned).toEqual([]);
  });

  it("gives every documented endpoint a summary", () => {
    const missing = Object.entries(descriptions)
      .filter(([, meta]) => !meta.summary)
      .map(([key]) => key);

    expect(missing).toEqual([]);
  });

  it("only offers examples that actually work", async () => {
    // A Try it button that 404s teaches the reader the wrong thing about the
    // API, so every example is requested here and has to succeed.
    const broken = [];

    for (const [key, meta] of Object.entries(descriptions)) {
      if (!meta.example) continue;
      const response = await request(app).get(meta.example);
      if (response.status !== 200) broken.push(`${key} -> ${meta.example} (${response.status})`);
    }

    expect(broken).toEqual([]);
  });

  it("serves the page with every endpoint on it", async () => {
    const response = await request(app).get("/docs");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/html/);
    // Spot-check across three different routers rather than counting markup.
    expect(response.text).toContain("/heroes/:id/archive");
    expect(response.text).toContain("/pokemon/compare/:firstId/:secondId");
    expect(response.text).toContain("/trainers/battle/:firstId/:secondId");
  });

  it("escapes description text rather than injecting it raw", async () => {
    // The descriptions are ours today. Being consistent about escaping is what
    // makes it safe the day one comes from somewhere else.
    const response = await request(app).get("/docs");

    const body = response.text.split("<script>")[0];
    expect(body).not.toMatch(/<(script|img|iframe)\b/i);
  });

  it("keeps the docs page out of the JSON API's own endpoint list", async () => {
    // /docs is a human-facing HTML page, not part of the API surface.
    const response = await request(app).get("/");

    const paths = Object.values(response.body.endpoints).flat().map((e) => e.path);
    expect(paths).not.toContain("/docs");
  });
});
