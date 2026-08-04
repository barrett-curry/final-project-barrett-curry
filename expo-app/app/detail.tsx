import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const allyNameToId: { [key: string]: number } = {
  "Iron Man": 3,
  "Captain America": 1,
  "Doctor Strange": 1,
  "Aunt May": 1,
  Superman: 2,
  Batman: 4,
  "The Flash": 6,
  "Steve Trevor": 2,
  Thor: 3,
  Hulk: 3,
  "Pepper Potts": 3,
  Robin: 4,
  Alfred: 4,
  "Commissioner Gordon": 4,
  "Spider-Man": 1,
  "Monica Rambeau": 5,
  "Nick Fury": 5,
  "Green Lantern": 6,
  "Iris West": 6,
  "Kid Flash": 6,
  Hawkeye: 7,
  "Yelena Belova": 7,
  Mera: 8,
  "Wonder Woman": 2,
  Vulko: 8,
};

const superheroDetails = {
  1: {
    name: "Spider-Man",
    realName: "Peter Parker",
    powers: [
      "Web-slinging",
      "Spider-sense",
      "Super strength",
      "Wall-crawling",
      "Enhanced agility",
    ],
    team: "Avengers",
    origin: "Bitten by a radioactive spider during a school field trip",
    firstAppearance: "Amazing Fantasy #15 (1962)",
    creator: "Stan Lee & Steve Ditko",
    location: "New York City",
    allies: ["Iron Man", "Captain America", "Doctor Strange", "Aunt May"],
    enemies: ["Green Goblin", "Doctor Octopus", "Venom", "Sandman"],
    quote: "With great power comes great responsibility",
    stats: {
      strength: 8,
      speed: 7,
      intelligence: 9,
      durability: 6,
      energy: 4,
      fighting: 8,
    },
  },
  2: {
    name: "Wonder Woman",
    realName: "Diana Prince",
    powers: [
      "Super strength",
      "Flight",
      "Lasso of Truth",
      "Bulletproof bracelets",
      "Divine wisdom",
    ],
    team: "Justice League",
    origin: "Amazonian princess blessed by the Greek gods",
    firstAppearance: "All Star Comics #8 (1941)",
    creator: "William Moulton Marston",
    location: "Themyscira / Washington D.C.",
    allies: ["Superman", "Batman", "The Flash", "Steve Trevor"],
    enemies: ["Ares", "Cheetah", "Circe", "Doctor Poison"],
    quote: "I will fight for those who cannot fight for themselves",
    stats: {
      strength: 10,
      speed: 8,
      intelligence: 8,
      durability: 9,
      energy: 7,
      fighting: 10,
    },
  },
  3: {
    name: "Iron Man",
    realName: "Tony Stark",
    powers: [
      "Genius intellect",
      "Powered armor",
      "Arc reactor",
      "Advanced technology",
      "Flight",
    ],
    team: "Avengers",
    origin: "Built powered armor to escape captivity and protect the world",
    firstAppearance: "Tales of Suspense #39 (1963)",
    creator: "Stan Lee, Larry Lieber, Don Heck & Jack Kirby",
    location: "Malibu, California",
    allies: ["Captain America", "Thor", "Hulk", "Pepper Potts"],
    enemies: ["Mandarin", "Iron Monger", "Whiplash", "Justin Hammer"],
    quote: "I am Iron Man",
    stats: {
      strength: 6,
      speed: 7,
      intelligence: 10,
      durability: 7,
      energy: 9,
      fighting: 6,
    },
  },
  4: {
    name: "Batman",
    realName: "Bruce Wayne",
    powers: [
      "Martial arts",
      "Detective skills",
      "Advanced technology",
      "Peak human conditioning",
      "Tactical genius",
    ],
    team: "Justice League",
    origin: "Witnessed parents' murder, trained to fight crime",
    firstAppearance: "Detective Comics #27 (1939)",
    creator: "Bob Kane & Bill Finger",
    location: "Gotham City",
    allies: ["Robin", "Alfred", "Commissioner Gordon", "Superman"],
    enemies: ["Joker", "Penguin", "Riddler", "Two-Face"],
    quote: "I am vengeance, I am the night, I am Batman",
    stats: {
      strength: 4,
      speed: 5,
      intelligence: 10,
      durability: 5,
      energy: 3,
      fighting: 10,
    },
  },
  5: {
    name: "Captain Marvel",
    realName: "Carol Danvers",
    powers: [
      "Energy projection",
      "Flight",
      "Super strength",
      "Photon blasts",
      "Binary form",
    ],
    team: "Avengers",
    origin: "Gained powers from Kree technology explosion",
    firstAppearance: "Marvel Super-Heroes #13 (1968)",
    creator: "Roy Thomas & Gene Colan",
    location: "Space / Earth",
    allies: ["Iron Man", "Spider-Man", "Monica Rambeau", "Nick Fury"],
    enemies: ["Yon-Rogg", "Supreme Intelligence", "Moonstone", "Deathbird"],
    quote: "Higher, further, faster",
    stats: {
      strength: 9,
      speed: 9,
      intelligence: 7,
      durability: 9,
      energy: 10,
      fighting: 7,
    },
  },
  6: {
    name: "The Flash",
    realName: "Barry Allen",
    powers: [
      "Super speed",
      "Time travel",
      "Speed force",
      "Phasing",
      "Lightning generation",
    ],
    team: "Justice League",
    origin: "Struck by lightning while working with chemicals",
    firstAppearance: "Showcase #4 (1956)",
    creator: "Robert Kanigher & Carmine Infantino",
    location: "Central City",
    allies: ["Green Lantern", "Superman", "Iris West", "Kid Flash"],
    enemies: [
      "Reverse-Flash",
      "Captain Cold",
      "Gorilla Grodd",
      "Mirror Master",
    ],
    quote: "Life is locomotion. If you're not moving, you're not living",
    stats: {
      strength: 5,
      speed: 10,
      intelligence: 8,
      durability: 6,
      energy: 8,
      fighting: 6,
    },
  },
  7: {
    name: "Black Widow",
    realName: "Natasha Romanoff",
    powers: [
      "Master spy",
      "Combat skills",
      "Weapons expert",
      "Acrobatics",
      "Enhanced longevity",
    ],
    team: "Avengers",
    origin: "Trained as a spy in the Red Room program",
    firstAppearance: "Tales of Suspense #52 (1964)",
    creator: "Stan Lee, Don Rico & Don Heck",
    location: "Various / Mobile",
    allies: ["Hawkeye", "Captain America", "Iron Man", "Yelena Belova"],
    enemies: ["Taskmaster", "Red Room", "Winter Soldier", "General Dreykov"],
    quote: "I've got red in my ledger, I'd like to wipe it out",
    stats: {
      strength: 4,
      speed: 6,
      intelligence: 8,
      durability: 5,
      energy: 3,
      fighting: 9,
    },
  },
  8: {
    name: "Aquaman",
    realName: "Arthur Curry",
    powers: [
      "Underwater breathing",
      "Marine telepathy",
      "Trident mastery",
      "Super strength",
      "Hydrokinesis",
    ],
    team: "Justice League",
    origin: "Half-human, half-Atlantean heir to the underwater throne",
    firstAppearance: "More Fun Comics #73 (1941)",
    creator: "Paul Norris & Mort Weisinger",
    location: "Atlantis / Surface World",
    allies: ["Mera", "Superman", "Wonder Woman", "Vulko"],
    enemies: ["Black Manta", "Ocean Master", "Atrocitus", "King Shark"],
    quote: "The ocean doesn't like to be ignored",
    stats: {
      strength: 9,
      speed: 7,
      intelligence: 7,
      durability: 8,
      energy: 6,
      fighting: 8,
    },
  },
};

export default function Detail() {
  const { id } = useLocalSearchParams();
  const heroId = parseInt(id as string);
  const hero = superheroDetails[heroId as keyof typeof superheroDetails];

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

  const statEntries = Object.entries(hero.stats);
  const powerScore = Math.round(
    statEntries.reduce((sum, [, value]) => sum + value, 0),
  );
  const bestStat = statEntries.reduce((prev, current) =>
    current[1] > prev[1] ? current : prev,
  );

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
        <Text style={styles.sectionText}>Power score: {powerScore}/60</Text>
        <Text style={styles.sectionText}>
          Strongest stat:{" "}
          {bestStat[0].charAt(0).toUpperCase() + bestStat[0].slice(1)} (
          {bestStat[1]}/10)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Origin Story</Text>
        <Text style={styles.sectionText}>{hero.origin}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Powers & Abilities</Text>
        {hero.powers.map((power, index) => (
          <Text key={index} style={styles.powerItem}>
            • {power}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsContainer}>
          {Object.entries(hero.stats).map(([stat, value]) => (
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
          {hero.allies.map((ally, index) => {
            const allyId = allyNameToId[ally];
            const isClickable = allyId && allyId !== heroId; // Don't make self-references clickable

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
                  {ally}
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
          {hero.enemies.map((enemy, index) => (
            <View key={index} style={[styles.listItem, styles.enemyItem]}>
              <Text style={[styles.listText, styles.enemyText]}>{enemy}</Text>
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
