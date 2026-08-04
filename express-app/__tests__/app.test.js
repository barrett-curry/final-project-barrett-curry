import app from "../app.js";
import { jest } from "@jest/globals";
import request from "supertest";

describe("Pokédex API", () => {
  it("returns the welcome payload on the root route", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Welcome to the Pokédex API!");
    expect(response.body.endpoints["GET /pokemon"]).toBe("Get all Pokémon");
  });

  it("returns a Pokémon by id", async () => {
    const response = await request(app).get("/pokemon/25");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Pikachu");
    expect(response.body.type).toEqual(["Electric"]);
  });

  it("returns a 404 for an unknown Pokémon id", async () => {
    const response = await request(app).get("/pokemon/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Pokémon not found");
  });

  it("returns a random Pokémon", async () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);

    const response = await request(app).get("/pokemon/random");

    expect(response.status).toBe(200);
    expect(response.body.pokemon.name).toBe("Bulbasaur");

    randomSpy.mockRestore();
  });

  it("returns the strongest Pokémon for a given stat", async () => {
    const response = await request(app).get("/pokemon/top/attack");

    expect(response.status).toBe(200);
    expect(response.body.stat).toBe("attack");
    expect(response.body.pokemon.name).toBe("Charizard");
    expect(response.body.pokemon.value).toBe(84);
  });

  it("returns a Pokémon matchup summary", async () => {
    const response = await request(app).get("/pokemon/type-matchup/6");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Charizard");
    expect(response.body.matchups.strongAgainst).toContain("Grass");
    expect(response.body.matchups.vulnerableTo).toContain("Water");
  });

  it("returns a 400 for an unsupported top-stat request", async () => {
    const response = await request(app).get("/pokemon/top/speed");

    expect(response.status).toBe(400);
    expect(response.body.supportedStats).toEqual([
      "hp",
      "attack",
      "defense",
      "weight",
      "height",
    ]);
  });

  it("returns matching Pokémon for a name search", async () => {
    const response = await request(app).get("/pokemon/search?name=char");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
    expect(response.body.pokemon.map((pokemon) => pokemon.name)).toEqual([
      "Charmander",
      "Charmeleon",
      "Charizard",
    ]);
  });

  it("returns a 400 when the search query is missing", async () => {
    const response = await request(app).get("/pokemon/search");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Please provide a 'name' query parameter");
  });

  it("returns Pokémon filtered by type", async () => {
    const response = await request(app).get("/pokemon/type/Water");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
    expect(
      response.body.pokemon.every((pokemon) => pokemon.type.includes("Water")),
    ).toBe(true);
  });

  it("returns a 404 for an unknown Pokémon type", async () => {
    const response = await request(app).get("/pokemon/type/Dragon");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No Pokémon found with type: Dragon");
  });

  it("compares two Pokémon and returns the winner", async () => {
    const response = await request(app).get("/pokemon/compare/6/25");

    expect(response.status).toBe(200);
    expect(response.body.first.name).toBe("Charizard");
    expect(response.body.second.name).toBe("Pikachu");
    expect(response.body.winner.name).toBe("Charizard");
  });

  it("returns a 404 when comparing unknown Pokémon", async () => {
    const response = await request(app).get("/pokemon/compare/6/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("One or both Pokémon were not found");
  });

  it("returns aggregate stats for the Pokédex", async () => {
    const response = await request(app).get("/stats");

    expect(response.status).toBe(200);
    expect(response.body.overview.totalPokemon).toBe(10);
    expect(response.body.champions.strongest.name).toBe("Charizard");
    expect(response.body.trainerStats.totalBadges).toBe(9);
    expect(response.body.physicalStats.heaviest.name).toBe("Venusaur");
  });

  it("returns the trainer roster with Pokémon names expanded", async () => {
    const response = await request(app).get("/trainers");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.trainers[0].team).toEqual([
      "Pikachu",
      "Bulbasaur",
      "Charmander",
    ]);
  });

  it("returns a single trainer by id", async () => {
    const response = await request(app).get("/trainers/1");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Ash Ketchum");
    expect(response.body.team).toContain("Pikachu");
  });

  it("returns a trainer team summary", async () => {
    const response = await request(app).get("/trainers/1/team-summary");

    expect(response.status).toBe(200);
    expect(response.body.trainer.name).toBe("Ash Ketchum");
    expect(response.body.summary.totalMembers).toBe(3);
    expect(response.body.summary.strongestPokemon.name).toBe("Bulbasaur");
    expect(response.body.summary.typeCoverage).toContain("Electric");
  });

  it("returns trainer rankings sorted by total power", async () => {
    const response = await request(app).get("/trainers/rankings");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.rankings[0].trainer.name).toBe("Misty");
    expect(response.body.rankings[0].summary.totalPower).toBeGreaterThan(
      response.body.rankings[1].summary.totalPower,
    );
  });

  it("returns a 404 for an unknown trainer", async () => {
    const response = await request(app).get("/trainers/99");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Trainer not found");
  });

  it("keeps the bug endpoint working without throwing", async () => {
    const response = await request(app).get("/bug");

    expect(response.status).toBe(200);
    expect(response.body.venomoth).toBe("a cool bug Pokémon");
  });

  it("returns a sorted Pokémon library", async () => {
    const response = await request(app).get("/pokemon/library");

    expect(response.status).toBe(200);
    expect(response.body.totalPokemon).toBe(10);
    expect(response.body.first).toBe("Blastoise");
    expect(response.body.last).toBe("Wartortle");
  });

  it("returns a collection summary", async () => {
    const response = await request(app).get("/pokemon/collection-summary");

    expect(response.status).toBe(200);
    expect(response.body.totalPokemon).toBe(10);
    expect(response.body.totalTrainers).toBe(2);
    expect(response.body.topType[0]).toBe("Grass");
    expect(response.body.topType[1]).toBe(3);
  });

  it("summarizes a Fire type roster", async () => {
    const response = await request(app).get("/pokemon/type-summary/Fire");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
    expect(response.body.champions.strongest.name).toBe("Charizard");
    expect(response.body.champions.weakest.name).toBe("Charmander");
  });

  it("summarizes a Water type roster", async () => {
    const response = await request(app).get("/pokemon/type-summary/Water");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
    expect(response.body.names).toEqual(["Squirtle", "Wartortle", "Blastoise"]);
  });

  it("returns a 404 for an unknown type summary", async () => {
    const response = await request(app).get("/pokemon/type-summary/Dragon");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No Pokémon found with type: Dragon");
  });

  it("returns the Bulbasaur evolution chain", async () => {
    const response = await request(app).get("/pokemon/evolution/1");

    expect(response.status).toBe(200);
    expect(response.body.starter).toBe("Bulbasaur");
    expect(response.body.length).toBe(3);
    expect(response.body.chain.map((entry) => entry.name)).toEqual([
      "Bulbasaur",
      "Ivysaur",
      "Venusaur",
    ]);
  });

  it("returns the Charmeleon evolution chain", async () => {
    const response = await request(app).get("/pokemon/evolution/5");

    expect(response.status).toBe(200);
    expect(response.body.starter).toBe("Charmeleon");
    expect(response.body.length).toBe(2);
  });

  it("returns the Pikachu evolution chain", async () => {
    const response = await request(app).get("/pokemon/evolution/25");

    expect(response.status).toBe(200);
    expect(response.body.starter).toBe("Pikachu");
    expect(response.body.length).toBe(1);
  });

  it("returns a 404 for an unknown evolution id", async () => {
    const response = await request(app).get("/pokemon/evolution/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Pokémon not found");
  });

  it("finds trainers from Pallet Town", async () => {
    const response = await request(app).get("/trainers/hometown/Pallet Town");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.trainers[0].name).toBe("Ash Ketchum");
  });

  it("finds trainers from Cerulean City", async () => {
    const response = await request(app).get("/trainers/hometown/Cerulean City");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.trainers[0].name).toBe("Misty");
  });

  it("returns a 404 for an unknown hometown", async () => {
    const response = await request(app).get("/trainers/hometown/Lavaridge");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No trainers found from Lavaridge");
  });

  it("returns Ash Ketchum's ace Pokémon", async () => {
    const response = await request(app).get("/trainers/1/ace");

    expect(response.status).toBe(200);
    expect(response.body.trainer.name).toBe("Ash Ketchum");
    expect(response.body.ace.name).toBe("Bulbasaur");
    expect(response.body.teamPower).toBeGreaterThan(0);
  });

  it("returns Misty's ace Pokémon", async () => {
    const response = await request(app).get("/trainers/2/ace");

    expect(response.status).toBe(200);
    expect(response.body.trainer.name).toBe("Misty");
    expect(response.body.ace.name).toBe("Blastoise");
  });

  it("returns a 404 for an unknown trainer ace lookup", async () => {
    const response = await request(app).get("/trainers/99/ace");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Trainer not found");
  });

  it("returns the trainer lineup sorted by badges", async () => {
    const response = await request(app).get("/trainers/lineup");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.lineup[0].trainer).toBe("Ash Ketchum");
    expect(response.body.lineup[1].trainer).toBe("Misty");
  });

  it("compares a Pokémon against itself as a tie", async () => {
    const response = await request(app).get("/pokemon/compare/1/1");

    expect(response.status).toBe(200);
    expect(response.body.winner.result).toBe("tie");
  });

  it("returns the Electric type matchup summary for Pikachu", async () => {
    const response = await request(app).get("/pokemon/type-matchup/25");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Pikachu");
    expect(response.body.matchups.vulnerableTo).toContain("Ground");
  });

  it("returns the full Pokémon list and count", async () => {
    const response = await request(app).get("/pokemon");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(10);
    expect(response.body.pokemon).toHaveLength(10);
  });

  it("includes Venusaur in the Pokémon list", async () => {
    const response = await request(app).get("/pokemon");

    expect(response.status).toBe(200);
    expect(response.body.pokemon.map((entry) => entry.name)).toContain(
      "Venusaur",
    );
  });

  it("returns the top HP Pokémon", async () => {
    const response = await request(app).get("/pokemon/top/hp");

    expect(response.status).toBe(200);
    expect(response.body.pokemon.name).toBe("Venusaur");
    expect(response.body.pokemon.value).toBe(80);
  });

  it("returns the top defense Pokémon", async () => {
    const response = await request(app).get("/pokemon/top/defense");

    expect(response.status).toBe(200);
    expect(response.body.pokemon.name).toBe("Blastoise");
    expect(response.body.pokemon.value).toBe(100);
  });

  it("returns the top weight Pokémon", async () => {
    const response = await request(app).get("/pokemon/top/weight");

    expect(response.status).toBe(200);
    expect(response.body.pokemon.name).toBe("Venusaur");
    expect(response.body.pokemon.value).toBe(100);
  });

  it("returns the top height Pokémon", async () => {
    const response = await request(app).get("/pokemon/top/height");

    expect(response.status).toBe(200);
    expect(response.body.pokemon.name).toBe("Venusaur");
    expect(response.body.pokemon.value).toBe(2);
  });

  it("supports mixed-case stat input for top endpoint", async () => {
    const response = await request(app).get("/pokemon/top/Attack");

    expect(response.status).toBe(200);
    expect(response.body.stat).toBe("attack");
    expect(response.body.pokemon.name).toBe("Charizard");
  });

  it("returns exact name search results", async () => {
    const response = await request(app).get("/pokemon/search?name=pikachu");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.pokemon[0].name).toBe("Pikachu");
  });

  it("returns case-insensitive name search results", async () => {
    const response = await request(app).get("/pokemon/search?name=CHAR");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
  });

  it("returns no matches when name search misses", async () => {
    const response = await request(app).get("/pokemon/search?name=xyz");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(0);
    expect(response.body.pokemon).toEqual([]);
  });

  it("filters by lowercase water type", async () => {
    const response = await request(app).get("/pokemon/type/water");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
  });

  it("filters by mixed-case fire type", async () => {
    const response = await request(app).get("/pokemon/type/fIrE");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
    expect(response.body.pokemon.map((entry) => entry.name)).toContain(
      "Charizard",
    );
  });

  it("supports lowercase type summaries", async () => {
    const response = await request(app).get("/pokemon/type-summary/fire");

    expect(response.status).toBe(200);
    expect(response.body.type).toBe("fire");
    expect(response.body.count).toBe(3);
  });

  it("returns single-entry electric type summary", async () => {
    const response = await request(app).get("/pokemon/type-summary/Electric");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.champions.strongest.name).toBe("Pikachu");
    expect(response.body.champions.weakest.name).toBe("Pikachu");
  });

  it("returns Bulbasaur matchup weaknesses", async () => {
    const response = await request(app).get("/pokemon/type-matchup/1");

    expect(response.status).toBe(200);
    expect(response.body.matchups.vulnerableTo).toContain("Fire");
    expect(response.body.matchups.strongAgainst).toContain("Water");
  });

  it("returns Squirtle matchup strengths", async () => {
    const response = await request(app).get("/pokemon/type-matchup/7");

    expect(response.status).toBe(200);
    expect(response.body.matchups.strongAgainst).toContain("Fire");
  });

  it("returns Ivysaur evolution chain ids", async () => {
    const response = await request(app).get("/pokemon/evolution/2");

    expect(response.status).toBe(200);
    expect(response.body.chain.map((entry) => entry.id)).toEqual([2, 3]);
  });

  it("returns Wartortle evolution chain names", async () => {
    const response = await request(app).get("/pokemon/evolution/8");

    expect(response.status).toBe(200);
    expect(response.body.chain.map((entry) => entry.name)).toEqual([
      "Wartortle",
      "Blastoise",
    ]);
  });

  it("returns Venusaur as a completed evolution", async () => {
    const response = await request(app).get("/pokemon/evolution/3");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body.chain[0].name).toBe("Venusaur");
  });

  it("compares Pikachu vs Charizard with Charizard winning", async () => {
    const response = await request(app).get("/pokemon/compare/25/6");

    expect(response.status).toBe(200);
    expect(response.body.winner.name).toBe("Charizard");
  });

  it("compares Squirtle vs Wartortle with Wartortle winning", async () => {
    const response = await request(app).get("/pokemon/compare/7/8");

    expect(response.status).toBe(200);
    expect(response.body.winner.name).toBe("Wartortle");
  });

  it("returns 404 when first Pokémon in compare is missing", async () => {
    const response = await request(app).get("/pokemon/compare/999/1");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("One or both Pokémon were not found");
  });

  it("returns Misty in the trainer roster", async () => {
    const response = await request(app).get("/trainers");

    expect(response.status).toBe(200);
    const misty = response.body.trainers.find((trainer) => trainer.id === 2);
    expect(misty.name).toBe("Misty");
    expect(misty.hometown).toBe("Cerulean City");
  });

  it("returns Misty by trainer id", async () => {
    const response = await request(app).get("/trainers/2");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Misty");
    expect(response.body.team).toContain("Blastoise");
  });

  it("returns Ash team average power summary", async () => {
    const response = await request(app).get("/trainers/1/team-summary");

    expect(response.status).toBe(200);
    expect(response.body.summary.totalPower).toBe(407);
    expect(response.body.summary.averagePower).toBe(135.7);
  });

  it("returns Misty water-only team coverage", async () => {
    const response = await request(app).get("/trainers/2/team-summary");

    expect(response.status).toBe(200);
    expect(response.body.summary.typeCoverage).toEqual(["Water"]);
    expect(response.body.summary.strongestPokemon.name).toBe("Blastoise");
  });

  it("returns trainer rankings with badge values", async () => {
    const response = await request(app).get("/trainers/rankings");

    expect(response.status).toBe(200);
    expect(response.body.rankings[0].trainer.badges).toBe(1);
    expect(response.body.rankings[1].trainer.badges).toBe(8);
  });

  it("returns trainer lineup positions", async () => {
    const response = await request(app).get("/trainers/lineup");

    expect(response.status).toBe(200);
    expect(response.body.lineup[0].position).toBe(1);
    expect(response.body.lineup[1].position).toBe(2);
  });

  it("matches hometown lookup with lowercase city query", async () => {
    const response = await request(app).get("/trainers/hometown/pallet");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.trainers[0].name).toBe("Ash Ketchum");
  });

  it("matches hometown lookup by substring", async () => {
    const response = await request(app).get("/trainers/hometown/City");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.trainers[0].name).toBe("Misty");
  });

  it("returns a trainer battle result with the stronger team winning", async () => {
    const response = await request(app).get("/trainers/battle/1/2");

    expect(response.status).toBe(200);
    expect(response.body.first.trainer.name).toBe("Ash Ketchum");
    expect(response.body.second.trainer.name).toBe("Misty");
    expect(response.body.winner.result).toBe("winner");
    expect(response.body.winner.trainerName).toBe("Misty");
    expect(response.body.winner.reason).toBe("higher total team power");
  });

  it("returns consistent trainer battle winner when ids are swapped", async () => {
    const response = await request(app).get("/trainers/battle/2/1");

    expect(response.status).toBe(200);
    expect(response.body.winner.result).toBe("winner");
    expect(response.body.winner.trainerId).toBe(2);
    expect(response.body.winner.trainerName).toBe("Misty");
  });

  it("returns both trainer power totals in battle payload", async () => {
    const response = await request(app).get("/trainers/battle/1/2");

    expect(response.status).toBe(200);
    expect(response.body.first.summary.totalPower).toBe(407);
    expect(response.body.second.summary.totalPower).toBe(621);
  });

  it("returns a 404 when the first battle trainer is missing", async () => {
    const response = await request(app).get("/trainers/battle/99/1");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("One or both trainers were not found");
  });

  it("returns a 404 when the second battle trainer is missing", async () => {
    const response = await request(app).get("/trainers/battle/1/99");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("One or both trainers were not found");
  });
});
