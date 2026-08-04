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
