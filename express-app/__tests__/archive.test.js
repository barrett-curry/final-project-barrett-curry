// Tests for the archive endpoints.
import request from "supertest";

import app from "../app.js";

describe("Archive API", () => {
  it("returns all 1,400 briefings in the shape the client renders", async () => {
    const response = await request(app).get("/archive");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1400);
    // The database stores hero_id / location / year; the client wants
    // hero / city / era. The translation is the point of this endpoint.
    expect(response.body.entries[0]).toEqual({
      index: 1,
      hero: "Spider-Man",
      note: "Archive note 0001",
      city: "New York",
      era: "1962",
      team: "Avengers",
    });
  });

  it("recovers the team through the join rather than storing it per row", async () => {
    // The seed repeated `team` on all 1,400 rows. The schema dropped it because
    // it belongs to the hero, so every row's team must now match its hero's.
    const response = await request(app).get("/archive?limit=200");

    const spiderMan = response.body.entries.filter((e) => e.hero === "Spider-Man");
    expect(spiderMan.length).toBeGreaterThan(0);
    expect(spiderMan.every((e) => e.team === "Avengers")).toBe(true);
  });

  it("honors a smaller limit", async () => {
    const response = await request(app).get("/archive?limit=5");

    expect(response.body.count).toBe(5);
  });

  it("caps an absurd limit instead of obeying it", async () => {
    // Without a ceiling this is a free way to make the server do its most
    // expensive work. The cap is above the real row count, so the answer is
    // simply everything rather than an error.
    const response = await request(app).get("/archive?limit=99999999");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1400);
  });

  it("rejects a non-numeric limit", async () => {
    const response = await request(app).get("/archive?limit=lots");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_ID");
  });

  it("filters by team in the database rather than shipping every row", async () => {
    const response = await request(app).get("/archive?team=Avengers");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(700);
    expect(response.body.entries.every((e) => e.team === "Avengers")).toBe(true);
  });

  it("searches hero name, note, and city as a union", async () => {
    // The three fields live in two tables, so this is the case most likely to
    // be quietly wrong — filtering by hero alone would drop rows whose note
    // matched but whose hero did not.
    const byHero = await request(app).get("/archive?search=Aquaman");
    expect(byHero.body.entries.every((e) => e.hero === "Aquaman")).toBe(true);
    expect(byHero.body.total).toBeGreaterThan(0);

    const byCity = await request(app).get("/archive?search=Gotham");
    expect(byCity.body.total).toBeGreaterThan(0);
    expect(byCity.body.entries.every((e) => e.city === "Gotham City")).toBe(true);

    const byNote = await request(app).get("/archive?search=note 0001");
    expect(byNote.body.entries[0].note).toBe("Archive note 0001");
  });

  it("intersects a search with a team filter instead of unioning them", async () => {
    // Atlantis is Aquaman's city and Aquaman is Justice League, so asking for
    // Atlantis on the Avengers must return nothing rather than everything.
    const response = await request(app).get("/archive?search=Atlantis&team=Avengers");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
  });

  it("reports total separately from the page it returned", async () => {
    // A client needs both to say "showing 5 of 700".
    const response = await request(app).get("/archive?team=Avengers&limit=5");

    expect(response.body.count).toBe(5);
    expect(response.body.total).toBe(700);
  });

  it("returns nothing for a search that matches nothing", async () => {
    const response = await request(app).get("/archive?search=Zatanna");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
    expect(response.body.entries).toEqual([]);
  });

  it("returns one hero's briefings", async () => {
    const response = await request(app).get("/heroes/1/archive?limit=3");

    expect(response.status).toBe(200);
    expect(response.body.hero.name).toBe("Spider-Man");
    expect(response.body.count).toBe(3);
    expect(response.body.entries[0]).not.toHaveProperty("hero_id");
  });

  it("404s the archive of a hero who does not exist", async () => {
    const response = await request(app).get("/heroes/999/archive");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("HERO_NOT_FOUND");
  });
});

describe("Health", () => {
  it("reports which store answered and round-trips it", async () => {
    // Configured-but-broken is the failure this endpoint exists to catch, so it
    // has to actually query rather than just report which client was built.
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(["memory", "supabase"]).toContain(response.body.heroSource);
    expect(response.body.heroCount).toBe(18);
  });
});
