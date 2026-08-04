// Unit tests for the trainer rules.
//
// These call the domain directly rather than going through HTTP, because the
// cases they cover cannot be reached through the API at all: both seeded
// trainers have full teams, so no request can produce a trainer without one.
// That is exactly why the bug below survived — it was unreachable with the
// current data and would have appeared as a 500 the first time anyone added a
// trainer who had not caught anything yet.
//
// Being able to test a rule without a server is the payoff from moving the
// rules out of the route handlers.
import { acePokemon, teamSummary } from "../src/domain/trainerService.js";

const rookie = { id: 99, name: "Rookie", hometown: "Nowhere", badges: 0, team: [] };
// A team naming Pokémon that no longer exist. The lookup drops them, so this
// ends up empty too — the more likely way to hit this in a real system.
const ghosts = { id: 98, name: "Ghost", hometown: "Nowhere", badges: 0, team: [4242, 9999] };

describe("trainers with no Pokémon", () => {
  it("summarizes an empty team instead of throwing", () => {
    // Previously: TypeError, reduce of empty array with no initial value.
    const summary = teamSummary(rookie).summary;

    expect(summary.totalMembers).toBe(0);
    expect(summary.totalPower).toBe(0);
    expect(summary.typeCoverage).toEqual([]);
  });

  it("reports no average power rather than NaN", () => {
    // 0/0 is NaN, which JSON turns into null by accident. Saying null on
    // purpose means "there is no average", which is the truth.
    expect(teamSummary(rookie).summary.averagePower).toBeNull();
  });

  it("reports no strongest Pokémon rather than inventing one", () => {
    expect(teamSummary(rookie).summary.strongestPokemon).toBeNull();
  });

  it("reports no ace", () => {
    const result = acePokemon(rookie);

    expect(result.ace).toBeNull();
    expect(result.teamPower).toBe(0);
  });

  it("treats a team of ids that no longer resolve the same as an empty one", () => {
    expect(teamSummary(ghosts).summary.totalMembers).toBe(0);
    expect(acePokemon(ghosts).ace).toBeNull();
  });
});

describe("trainers with a team", () => {
  it("still computes a real summary", () => {
    // Guards the fix against the obvious over-correction of returning null
    // whenever anything is missing.
    const ash = { id: 1, name: "Ash Ketchum", hometown: "Pallet Town", badges: 8, team: [25, 1, 4] };

    const summary = teamSummary(ash).summary;

    expect(summary.totalMembers).toBe(3);
    expect(summary.totalPower).toBe(407);
    expect(summary.averagePower).toBe(135.7);
    expect(summary.strongestPokemon.name).toBe("Bulbasaur");
  });
});
