import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

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
    if (value >= 8) return "#e74c3c"; // Red for high stats
    if (value >= 6) return "#f39c12"; // Orange for medium stats
    return "#3498db"; // Blue for lower stats
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
        <View style={styles.teamBadge}>
          <Text style={styles.teamText}>{hero.team}</Text>
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
  loading: { marginTop: 48 },
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingTop: 60,
  },
  backButton: {
    marginLeft: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "#e74c3c",
    marginTop: 100,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  realName: {
    fontSize: 18,
    color: "#7f8c8d",
    fontStyle: "italic",
    marginTop: 5,
    marginBottom: 15,
  },
  teamBadge: {
    backgroundColor: "#3498db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  teamText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: "#34495e",
    lineHeight: 24,
  },
  powerItem: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 6,
    marginLeft: 10,
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    width: 80,
    textTransform: "capitalize",
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#ecf0f1",
    borderRadius: 4,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    borderRadius: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7f8c8d",
    width: 35,
    textAlign: "right",
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  listItem: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  enemyItem: {
    backgroundColor: "#fadbd8",
  },
  listText: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  enemyText: {
    color: "#c0392b",
  },
  clickableAlly: {
    backgroundColor: "#e8f4fd",
    borderWidth: 1,
    borderColor: "#3498db",
  },
  clickableAllyText: {
    color: "#3498db",
    fontWeight: "600",
  },
  infoRow: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 8,
    lineHeight: 22,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#2c3e50",
  },
  quoteSection: {
    backgroundColor: "#3498db",
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quote: {
    fontSize: 18,
    color: "white",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 26,
  },
});
