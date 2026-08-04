require("react-native-gesture-handler/jestSetup");

jest.mock("expo-font", () => ({
  useFonts: () => [true],
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
  Stack: () => null,
}));

// The directory screen's tests are about filtering, sorting, and rendering —
// not about the network. Mocking the hook rather than global.fetch keeps those
// 33 tests synchronous and unchanged: they still render <Index /> and assert
// immediately, because the roster is already there.
//
// The fetch layer itself is covered separately in __tests__/heroes-api.test.ts,
// which is the right split — one suite per reason to fail.
jest.mock("./src/hooks/useHeroes", () => ({
  useHeroes: () => ({
    heroes: require("./__tests__/fixtures/heroes.json"),
    status: "ready",
    error: "",
    reload: jest.fn(),
  }),
}));

// Same reasoning as the useHeroes mock above: the archive panel's tests are
// about search, filter, and sort over a known set of rows, not about whether
// fetch works. The fixture is the exact payload GET /archive returns.
jest.mock("./src/hooks/useArchive", () => ({
  useArchive: () => ({
    entries: require("./__tests__/fixtures/archive.json"),
    status: "ready",
  }),
}));

// The detail screen's tests are about rendering a hero, not about fetching one.
// This resolves against the same fixture the API is seeded from, and computes
// powerScore exactly the way heroService does — including returning null rather
// than zero for the ten heroes with no stat block, which is the case the screen
// has to survive.
jest.mock("./src/hooks/useHero", () => ({
  useHero: (id) => {
    // Mirrors heroService.getHero: a name that belongs to a hero in the roster
    // resolves to their id, anyone else gets null.
    const roster = require("./__tests__/fixtures/heroes.json");
    const idByName = new Map(roster.map((h) => [h.name, h.id]));
    const resolveNames = (names) =>
      (names ?? []).map((name) => ({ name, id: idByName.get(name) ?? null }));
    const hero = require("./__tests__/fixtures/heroes.json").find((h) => h.id === id);
    if (!hero) return { hero: null, status: "error" };
    return {
      hero: {
        ...hero,
        allies: resolveNames(hero.allies),
        enemies: resolveNames(hero.enemies),
        powerScore: hero.stats
          ? Object.values(hero.stats).reduce((total, value) => total + value, 0)
          : null,
      },
      status: "ready",
    };
  },
}));
