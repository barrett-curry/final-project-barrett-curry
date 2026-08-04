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
