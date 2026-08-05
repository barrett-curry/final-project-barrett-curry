import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { colors, font, radius, space, teamColor } from "../src/theme";
import { useHero } from "../src/hooks/useHero";




export default function Detail() {
  const { id } = useLocalSearchParams();
  const heroId = parseInt(id as string);
  const { hero, status } = useHero(heroId);

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.loading} />
      </View>
    );
  }

  if (!hero) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Hero not found</Text>
      </View>
    );
  }

  const getStatColor = (value: number) => {
    // Three bands rather than a gradient: a reader can tell three colors
    // apart at a glance, which is the whole job of coloring a bar.
    if (value >= 8) return colors.avengers;
    if (value >= 6) return colors.accent;
    return colors.justiceLeague;
  };

  // The API is the source of truth for the score; it returns null for heroes
  // with no stat block rather than a misleading zero.
  const statEntries = Object.entries(hero.stats ?? {});
  const powerScore = hero.powerScore;
  const bestStat = statEntries.length
    ? statEntries.reduce((prev, current) => (current[1] > prev[1] ? current : prev))
    : null;

  return (
    <ScrollView style={styles.container}>
      <Pressable
        testID="back-button"
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to directory</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.heroName}>{hero.name}</Text>
        <Text style={styles.realName}>{hero.realName}</Text>
        <View
          style={[
            styles.teamBadge,
            { borderColor: teamColor(hero.team), backgroundColor: teamColor(hero.team) + "22" },
          ]}
        >
          <Text style={[styles.teamText, { color: teamColor(hero.team) }]}>{hero.team}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Power Summary</Text>
        {powerScore === null && (
          <Text style={styles.sectionText}>No stat block on file for this hero.</Text>
        )}
        <Text style={styles.sectionText}>Power score: {powerScore}/60</Text>
        <Text style={styles.sectionText}>
          Strongest stat:{" "}
          {bestStat
            ? `${bestStat[0].charAt(0).toUpperCase()}${bestStat[0].slice(1)} (${bestStat[1]}/10)`
            : "Unknown"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Origin Story</Text>
        <Text style={styles.sectionText}>{hero.origin}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Powers & Abilities</Text>
        {(hero.powers ?? []).map((power, index) => (
          <Text key={index} style={styles.powerItem}>
            • {power}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsContainer}>
          {statEntries.map(([stat, value]) => (
            <View key={stat} style={styles.statRow}>
              <Text style={styles.statLabel}>
                {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </Text>
              <View style={styles.statBarContainer}>
                <View
                  style={[
                    styles.statBar,
                    {
                      width: `${(value / 10) * 100}%`,
                      backgroundColor: getStatColor(value),
                    },
                  ]}
                />
              </View>
              <Text style={styles.statValue}>{value}/10</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allies</Text>
        <View style={styles.listContainer}>
          {(hero.allies ?? []).map((ally, index) => {
            // id is null for supporting characters who are not heroes in
            // their own right, so they render as plain text rather than as a
            // link to nowhere.
            const allyId = ally.id;
            const isClickable = allyId !== null && allyId !== heroId;

            return (
              <Pressable
                key={index}
                style={[
                  styles.listItem,
                  isClickable ? styles.clickableAlly : null,
                ]}
                onPress={() => {
                  if (isClickable) {
                    router.push({
                      pathname: "/detail" as any,
                      params: { id: allyId },
                    });
                  }
                }}
                disabled={!isClickable}
              >
                <Text
                  style={[
                    styles.listText,
                    isClickable ? styles.clickableAllyText : null,
                  ]}
                >
                  {ally.name}
                  {isClickable && " →"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enemies</Text>
        <View style={styles.listContainer}>
          {(hero.enemies ?? []).map((enemy, index) => (
            <View key={index} style={[styles.listItem, styles.enemyItem]}>
              <Text style={[styles.listText, styles.enemyText]}>{enemy.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comic Info</Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>First Appearance:</Text>{" "}
          {hero.firstAppearance}
        </Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creator:</Text> {hero.creator}
        </Text>
        <Text style={styles.infoRow}>
          <Text style={styles.infoLabel}>Base of Operations:</Text>{" "}
          {hero.location}
        </Text>
      </View>

      <View style={styles.quoteSection}>
        <Text style={styles.quote}>&ldquo;{hero.quote}&rdquo;</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: space.lg },
  loading: { marginTop: 48 },

  backButton: { paddingVertical: space.sm, marginBottom: space.sm },
  backButtonText: { color: colors.accent, fontSize: font.body, fontWeight: "600" },

  header: { marginBottom: space.xl },
  heroName: {
    fontSize: font.display,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  realName: { fontSize: font.body, color: colors.muted, marginTop: 2 },
  teamBadge: {
    alignSelf: "flex-start",
    marginTop: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  teamText: {
    fontSize: font.micro,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  sectionTitle: {
    fontSize: font.micro,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: space.sm,
  },
  sectionText: { color: colors.text, fontSize: font.body, lineHeight: 22 },

  powerItem: { color: colors.text, fontSize: font.body, lineHeight: 24 },

  // --- Stat bars ----------------------------------------------------------
  statsContainer: { gap: space.sm },
  statRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  // Fixed width so every bar starts at the same x. Ragged starts make a set of
  // bars impossible to compare, which is the only thing bars are for.
  statLabel: { width: 92, color: colors.muted, fontSize: font.small },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  statBar: { height: "100%", borderRadius: radius.pill },
  statValue: {
    width: 46,
    textAlign: "right",
    color: colors.text,
    fontSize: font.small,
    fontVariant: ["tabular-nums"],
  },

  // --- Allies and enemies -------------------------------------------------
  listContainer: { gap: space.xs },
  listItem: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: "transparent",
  },
  listText: { color: colors.text, fontSize: font.body },
  // Only characters who are heroes in their own right are navigable, so they
  // are the only ones that look navigable.
  clickableAlly: { borderColor: colors.lineStrong },
  clickableAllyText: { color: colors.accent, fontWeight: "600" },
  enemyItem: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.raised,
    borderLeftWidth: 2,
    borderLeftColor: colors.danger,
  },
  enemyText: { color: colors.text, fontSize: font.body },

  infoRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: space.xs },
  infoLabel: { color: colors.faint, fontWeight: "700" },

  quoteSection: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: space.lg,
    paddingVertical: space.sm,
    marginBottom: space.xxl,
  },
  quote: { color: colors.text, fontSize: font.large, fontStyle: "italic", lineHeight: 26 },

  errorText: {
    color: colors.muted,
    fontSize: font.large,
    textAlign: "center",
    marginTop: 64,
  },
});
