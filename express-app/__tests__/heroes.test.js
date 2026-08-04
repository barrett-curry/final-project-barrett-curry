// Tests for the hero resource.
//
// Kept in its own file rather than appended to app.test.js: a test file should
// fail for one reason, and mixing two resources in one suite means a hero
// regression and a Pokédex regression look identical in CI output.
//
// Each test below covers one distinct behavior. There is deliberately no second
// "returns a hero by id" case with a different id — that would exercise the
// same code path and only slow the suite down.
import request from "supertest";

import app from "../app.js";

describe("Hero API", () => {
  it("returns the full roster with summary fields only", async () => {
    const response = await request(app).get("/heroes");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(18);
    // The list endpoint should not ship detail payloads it does not need.
    expect(response.body.heroes[0]).toEqual({
      id: 1,
      name: "Spider-Man",
      realName: "Peter Parker",
      powers: expect.any(Array),
      team: "Avengers",
    });
  });

  it("returns a single hero with their detail fields and power score", async () => {
    const response = await request(app).get("/heroes/1");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Spider-Man");
    expect(response.body.quote).toBe("With great power comes great responsibility");
    // 8 + 7 + 9 + 6 + 4 + 8
    expect(response.body.powerScore).toBe(42);
  });

  it("returns a null power score for heroes with no stat block", async () => {
    // Only the first eight heroes have detail records; the rest must still
    // resolve rather than 404, and must not claim a power score of zero.
    const response = await request(app).get("/heroes/18");

    expect(response.status).toBe(200);
    expect(response.body.powerScore).toBeNull();
  });

  it("returns 404 for a hero that does not exist", async () => {
    const response = await request(app).get("/heroes/999");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("HERO_NOT_FOUND");
  });

  it("returns 400 for an id that is not a number", async () => {
    // The distinction that matters: this is a malformed request, not a missing
    // resource. Before validation it answered 404 and sent the caller looking
    // for the wrong problem.
    const response = await request(app).get("/heroes/batman");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_ID");
  });

  it("searches across both hero name and real name", async () => {
    const response = await request(app).get("/heroes/search?name=wayne");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.heroes[0].name).toBe("Batman");
  });

  it("returns 400 when the search query is missing", async () => {
    const response = await request(app).get("/heroes/search");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("MISSING_QUERY_PARAM");
  });

  it("filters heroes by team", async () => {
    const response = await request(app).get("/heroes/team/Avengers");

    expect(response.status).toBe(200);
    expect(response.body.heroes.every((hero) => hero.team === "Avengers")).toBe(true);
  });

  it("returns the team breakdown the app used to compute client-side", async () => {
    const response = await request(app).get("/heroes/teams");

    expect(response.status).toBe(200);
    expect(response.body.totalHeroes).toBe(18);
    expect(response.body.teams.map((entry) => entry.team).sort()).toEqual([
      "Avengers",
      "Justice League",
    ]);
  });
});

describe("API-wide behavior", () => {
  it("answers unknown routes with JSON rather than Express's HTML page", async () => {
    const response = await request(app).get("/nope");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROUTE_NOT_FOUND");
  });

  it("sends CORS headers so a browser client can call the API", async () => {
    const response = await request(app).get("/heroes").set("Origin", "http://localhost:8081");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });

  it("answers the CORS preflight a browser sends before a cross-origin request", async () => {
    const response = await request(app)
      .options("/heroes")
      .set("Origin", "http://localhost:8081")
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBeLessThan(300);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });
});
