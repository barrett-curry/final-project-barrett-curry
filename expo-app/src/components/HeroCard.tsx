import { Pressable, StyleSheet, Text, View } from "react-native";

import type { HeroSummary } from "../api/heroes";
import { colors, font, radius, space } from "../theme";
import { TeamBadge } from "./index";

type Interaction = { pressed: boolean; hovered?: boolean };

/**
 * One hero in the directory.
 *
 * The card used to list every power as its own bullet plus a "Tap for more
 * details →" line, which put it around 230pt tall and the 18-hero list at
 * roughly 4,100pt. A row in a list answers one question — is this the one I
 * want — so the powers collapse to a single truncated line and the tap hint is
 * gone, because the whole card is a Pressable and it does not need eighteen
 * captions saying so.
 */
export function HeroCard({
  hero,
  isFavorite,
  onPress,
  onToggleFavorite,
  testID,
  favoriteTestID,
}: {
  hero: HeroSummary;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  testID?: string;
  favoriteTestID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${hero.name}, ${hero.realName}, ${hero.team}`}
      style={({ pressed, hovered }: Interaction) => [
        styles.card,
        hovered && styles.cardHover,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.head}>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>
            {hero.name}
          </Text>
          <Text style={styles.realName} numberOfLines={1}>
            {hero.realName}
          </Text>
        </View>

        <Pressable
          testID={favoriteTestID}
          // stopPropagation matters on web only. Native touch responders give
          // the child exclusive ownership, but a DOM click bubbles — so in a
          // browser, tapping the heart both favourited the hero and navigated
          // to their detail page.
          // `event?` as well as `stopPropagation?` — fireEvent.press() in the
          // test suite calls onPress with no arguments at all, so the event is
          // undefined there even though a real press always supplies one.
          onPress={(event) => {
            event?.stopPropagation?.();
            onToggleFavorite();
          }}
          accessibilityRole="button"
          accessibilityLabel={`${isFavorite ? "Unfavorite" : "Favorite"} ${hero.name}`}
          hitSlop={8}
          style={({ pressed }: Interaction) => [styles.favorite, pressed && styles.cardPressed]}
        >
          <Text style={[styles.favoriteGlyph, isFavorite && styles.favoriteOn]}>
            {isFavorite ? "★" : "☆"}
          </Text>
        </Pressable>
      </View>

      <TeamBadge team={hero.team} />

      <Text style={styles.powers} numberOfLines={1}>
        {hero.powers.join("  ·  ")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    // 16 radius inside 16 padding makes the corner arc eat the whole padding
    // box. Radius wants to be roughly 0.7x the padding.
    borderRadius: radius.md,
    padding: space.lg,
    gap: space.sm,
    cursor: "pointer",
  },
  cardHover: { borderColor: colors.lineStrong, backgroundColor: colors.raised },
  cardPressed: { opacity: 0.85 },

  head: { flexDirection: "row", alignItems: "flex-start", gap: space.sm },
  // The heart used to be absolutely positioned 40pt wide in a 24pt gutter, so
  // a long name slid underneath it. In the flex row it cannot overlap.
  identity: { flex: 1 },
  name: { fontSize: font.title, fontWeight: "700", color: colors.text, letterSpacing: -0.3 },
  realName: { fontSize: font.small, color: colors.muted, marginTop: 2 },

  favorite: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginTop: -6 },
  // A star, not a heart: red hearts on an Avengers card disappear into the
  // team color, which already means red.
  favoriteGlyph: { fontSize: 22, color: colors.faint },
  favoriteOn: { color: colors.accent },

  powers: { fontSize: font.small, color: colors.muted },
});
