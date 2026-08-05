// The shared component layer.
//
// There wasn't one. `app/index.tsx` was 800 lines holding two components and a
// 270-line stylesheet, with the same pill button written out inline eight
// times and the same panel wrapper declared six. Every one of them accepted the
// tokens and then diverged slightly, which is why nothing looked like it
// belonged to the same app.
//
// Every component forwards `testID` — the suite pins 21 of them, including
// templated ones like `hero-card-${id}`.
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { colors, font, layout, radius, space, teamColor, teamFill } from "../theme";

// react-native-web supplies `hovered` and `focused`; native leaves them
// undefined, which is falsy. React Native's own PressableStateCallbackType only
// declares `pressed`, so this has to be spelled out or it will not typecheck.
type Interaction = { pressed: boolean; hovered?: boolean; focused?: boolean };

/**
 * The page shell: one scroll container, capped width, centred.
 *
 * Nothing capped the column before, so on a 1400px browser window every card
 * was 1368px wide to hold twenty characters of text. `alignItems` on the
 * content container plus a `width: "100%"` inner block is the centring recipe
 * that behaves the same on web and native.
 */
export function Screen({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  return (
    <ScrollView
      testID={testID}
      style={s.screen}
      contentContainerStyle={s.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.page}>{children}</View>
    </ScrollView>
  );
}

/** A filter or sort control. Replaces eight inline copies of the same 16 lines. */
export function Pill({
  label,
  selected = false,
  onPress,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      style={({ pressed, hovered, focused }: Interaction) => [
        s.pill,
        hovered && !selected && s.pillHover,
        selected && s.pillSelected,
        focused && s.pillFocus,
        pressed && s.pressed,
      ]}
    >
      <Text style={[s.pillText, selected && s.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

/** An action. Distinct from Pill on purpose — a button that does something
 *  should not look identical to six adjacent radio buttons. */
export function Button({
  label,
  onPress,
  variant = "ghost",
  disabled = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  variant?: "ghost" | "danger";
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed, hovered }: Interaction) => [
        s.button,
        variant === "danger" && s.buttonDanger,
        hovered && !disabled && s.buttonHover,
        disabled && s.buttonDisabled,
        pressed && s.pressed,
      ]}
    >
      <Text
        style={[
          s.buttonText,
          variant === "danger" && s.buttonTextDanger,
          // Disabled has to go *down* in contrast. The old disabled state kept
          // full-strength text on a dimmer fill, so it read as more prominent
          // than the enabled button.
          disabled && s.buttonTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * A section of the page.
 *
 * Deliberately not a card: no fill, no border, no radius. Sections and list
 * items were previously styled identically — same surface, same 16 radius,
 * same 1px border, same 12 margin — so a container holding twelve things
 * looked exactly like one of the things. A rule and 40px of space says
 * "section" without competing with the cards inside it.
 */
export function Section({
  title,
  trailing,
  children,
  style,
}: {
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.section, style]}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

/** The team chip. Was a Text with a tinted background in one file and a View
 *  wrapping a Text in the other — same element, two implementations. */
export function TeamBadge({ team, testID }: { team: string; testID?: string }) {
  return (
    <View
      testID={testID}
      style={[s.badge, { backgroundColor: teamFill(team), borderColor: teamColor(team) }]}
    >
      <Text style={[s.badgeText, { color: teamColor(team) }]}>{team}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: {
    alignItems: "center",
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.section,
  },
  page: { width: "100%", maxWidth: layout.maxContentWidth },

  pill: {
    paddingHorizontal: space.md,
    // 44pt minimum target. This was 8px vertical on 13px text — about 34.
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    cursor: "pointer",
  },
  pillHover: { borderColor: colors.lineStrong, backgroundColor: colors.hover },
  // A quiet fill rather than solid gold. Selection is a state, not a call to
  // action, and solid accent on five chips made the least important controls
  // on the page the loudest thing on it.
  pillSelected: { backgroundColor: colors.raised, borderColor: colors.accent },
  pillFocus: { borderColor: colors.accent },
  pillText: { color: colors.muted, fontSize: font.small, fontWeight: "600" },
  pillTextSelected: { color: colors.accent },

  button: {
    paddingHorizontal: space.lg,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    cursor: "pointer",
  },
  buttonHover: { backgroundColor: colors.hover },
  buttonDanger: { backgroundColor: colors.dangerFill, borderColor: colors.dangerFill },
  buttonDisabled: { backgroundColor: "transparent", borderColor: colors.line },
  buttonText: { color: colors.text, fontSize: font.small, fontWeight: "700" },
  buttonTextDanger: { color: colors.onDanger },
  buttonTextDisabled: { color: colors.faint },

  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },

  section: { marginBottom: space.section },
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  // A real heading, not an 11px uppercase gold eyebrow. That treatment was
  // used nine times across the two screens, which stopped it signalling
  // anything and made it the page's default voice.
  sectionTitle: { fontSize: font.large, fontWeight: "700", color: colors.text },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: font.micro,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
