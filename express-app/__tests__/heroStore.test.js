// Tests for the Supabase code path, without Supabase.
//
// The rest of the suite runs against the in-memory store, which leaves the
// Postgres implementation completely unexercised — and that is the half most
// likely to be wrong, because it has to translate snake_case rows and nested
// joins back into the shape the API has always returned.
//
// `createHeroStore` takes the client as an argument precisely so a stub can be
// passed here. That is what dependency injection buys: the real code path runs
// on every commit, with no credentials and no network.
import { createHeroStore } from "../src/data/heroStore.js";

/**
 * The smallest thing that behaves like a Supabase query builder: every method
 * returns `this` so calls chain, and awaiting it resolves to the canned result.
 */
function stubClient(result) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    or: () => builder,
    ilike: () => builder,
    order: () => builder,
    limit: () => builder,
    then: (resolve) => Promise.resolve(result).then(resolve),
  };
  return { from: () => builder, builder };
}

describe("Supabase hero store", () => {
  it("maps snake_case columns and joined tables into the API's shape", async () => {
    const store = createHeroStore(
      stubClient({
        data: [
          {
            id: 1,
            name: "Spider-Man",
            real_name: "Peter Parker",
            team: "Avengers",
            quote: "With great power…",
            hero_powers: [{ power: "Web-slinging" }, { power: "Spider-sense" }],
            hero_stats: {
              hero_id: 1,
              strength: 8,
              speed: 7,
              intelligence: 9,
              durability: 6,
              energy: 4,
              fighting: 8,
            },
            hero_relationships: [
              { related_name: "Iron Man", kind: "ally" },
              { related_name: "Venom", kind: "enemy" },
            ],
          },
        ],
        error: null,
      }),
    );

    const hero = await store.findHeroById(1);

    // The wire format is camelCase and always has been; Postgres is snake_case.
    expect(hero.realName).toBe("Peter Parker");
    // Joined child tables get flattened back into plain arrays.
    expect(hero.powers).toEqual(["Web-slinging", "Spider-sense"]);
    // One relationships table with a `kind` column splits into two fields.
    expect(hero.allies).toEqual(["Iron Man"]);
    expect(hero.enemies).toEqual(["Venom"]);
    // The join key must not leak into the public stats object.
    expect(hero.stats).not.toHaveProperty("hero_id");
    expect(hero.stats.strength).toBe(8);
  });

  it("returns null rather than throwing when no row matches", async () => {
    const store = createHeroStore(stubClient({ data: [], error: null }));

    // The service turns this into a 404. The store's job is only to report
    // absence, not to decide what absence means over HTTP.
    await expect(store.findHeroById(999)).resolves.toBeNull();
  });

  it("throws when the database reports an error", async () => {
    // Supabase puts failures in a field instead of rejecting, so a store that
    // forgot to check would silently treat an error as an empty result — the
    // worst possible failure mode, because it looks like success.
    const store = createHeroStore(
      stubClient({ data: null, error: { message: 'relation "heroes" does not exist' } }),
    );

    await expect(store.allHeroes()).rejects.toThrow(/Supabase query failed/);
  });

  it("defaults to the in-memory store when no client is given", async () => {
    const store = createHeroStore(null);

    expect(store.kind).toBe("memory");
    await expect(store.allHeroes()).resolves.toHaveLength(18);
  });

  it("serves archive entries from the seed with the join key stripped", async () => {
    const store = createHeroStore(null);

    const entries = await store.findArchiveByHero(1, { limit: 3 });

    expect(entries).toHaveLength(3);
    expect(entries[0]).not.toHaveProperty("hero_id");
    expect(entries[0]).toMatchObject({ note: expect.any(String), year: expect.any(Number) });
  });
});
