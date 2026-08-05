import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../src/theme";

// This file was five lines: `return <Stack />`. Unconfigured, expo-router
// inherits react-navigation's light theme, so the app rendered a white header
// with a grey hairline — containing the literal route filename, "index" — on
// top of a near-black screen. That white bar was the single most visible thing
// in the app, and no amount of token work compensates for it.
//
// Both screens already draw their own title and back button, so the header is
// hidden rather than restyled: it was duplicated chrome either way.
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.line,
    primary: colors.accent,
    notification: colors.danger,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        {/* Without this the iOS status bar draws dark glyphs, invisible on a
            near-black background. expo-status-bar was already a dependency and
            was never imported. */}
        <StatusBar style="light" />
        {/* The safe area lives here rather than in the screens on purpose: the
            test suite renders <Index /> and <Detail /> directly and never
            mounts this layout, so a useSafeAreaInsets() call inside a screen
            would throw "No safe area value available" and fail every test. */}
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
          edges={["top", "left", "right"]}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              // Without this the scene background is white, so every push and
              // pop flashes white behind the dark screens.
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
