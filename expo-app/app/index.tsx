import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

const superheroes = [
  {
    id: 1,
    name: "Spider-Man",
    realName: "Peter Parker",
    powers: ["Web-slinging", "Spider-sense", "Super strength"],
    team: "Avengers",
  },
  {
    id: 2,
    name: "Wonder Woman",
    realName: "Diana Prince",
    powers: ["Super strength", "Flight", "Lasso of Truth"],
    team: "Justice League",
  },
  {
    id: 3,
    name: "Iron Man",
    realName: "Tony Stark",
    powers: ["Genius intellect", "Powered armor", "Arc reactor"],
    team: "Avengers",
  },
  {
    id: 4,
    name: "Batman",
    realName: "Bruce Wayne",
    powers: ["Martial arts", "Detective skills", "Advanced technology"],
    team: "Justice League",
  },
  {
    id: 5,
    name: "Captain Marvel",
    realName: "Carol Danvers",
    powers: ["Energy projection", "Flight", "Super strength"],
    team: "Avengers",
  },
  {
    id: 6,
    name: "The Flash",
    realName: "Barry Allen",
    powers: ["Super speed", "Time travel", "Speed force"],
    team: "Justice League",
  },
  {
    id: 7,
    name: "Black Widow",
    realName: "Natasha Romanoff",
    powers: ["Master spy", "Combat skills", "Weapons expert"],
    team: "Avengers",
  },
  {
    id: 8,
    name: "Aquaman",
    realName: "Arthur Curry",
    powers: ["Underwater breathing", "Marine telepathy", "Trident mastery"],
    team: "Justice League",
  },
  {
    id: 9,
    name: "Thor",
    realName: "Thor Odinson",
    powers: ["God of Thunder", "Mjolnir mastery", "Super strength"],
    team: "Avengers",
  },
  {
    id: 10,
    name: "Green Lantern",
    realName: "Hal Jordan",
    powers: ["Power ring", "Energy constructs", "Flight"],
    team: "Justice League",
  },
  {
    id: 11,
    name: "Hulk",
    realName: "Bruce Banner",
    powers: ["Incredible strength", "Regeneration", "Gamma radiation"],
    team: "Avengers",
  },
  {
    id: 12,
    name: "Supergirl",
    realName: "Kara Zor-El",
    powers: ["Super strength", "Flight", "Heat vision"],
    team: "Justice League",
  },
  {
    id: 13,
    name: "Doctor Strange",
    realName: "Stephen Strange",
    powers: ["Mystic arts", "Time manipulation", "Dimensional travel"],
    team: "Avengers",
  },
  {
    id: 14,
    name: "Cyborg",
    realName: "Victor Stone",
    powers: ["Cybernetic enhancement", "Technology interface", "Energy cannon"],
    team: "Justice League",
  },
  {
    id: 15,
    name: "Scarlet Witch",
    realName: "Wanda Maximoff",
    powers: ["Reality manipulation", "Chaos magic", "Telekinesis"],
    team: "Avengers",
  },
  {
    id: 16,
    name: "Green Arrow",
    realName: "Oliver Queen",
    powers: ["Master archer", "Martial arts", "Trick arrows"],
    team: "Justice League",
  },
  {
    id: 17,
    name: "Captain America",
    realName: "Steve Rogers",
    powers: ["Super soldier serum", "Vibranium shield", "Enhanced reflexes"],
    team: "Avengers",
  },
  {
    id: 18,
    name: "Martian Manhunter",
    realName: "J'onn J'onzz",
    powers: ["Shape-shifting", "Telepathy", "Martian vision"],
    team: "Justice League",
  },
];

export default function Index() {
  const [visibleHeroes, setVisibleHeroes] = useState(superheroes);
  const [snappedHeroes, setSnappedHeroes] = useState<typeof superheroes>([]);
  const [isSnapped, setIsSnapped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<
    "All" | "Avengers" | "Justice League"
  >("All");
  const [sortMode, setSortMode] = useState<"default" | "name" | "team">(
    "default",
  );
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteHeroIds, setFavoriteHeroIds] = useState<number[]>([]);
  const [featuredMode, setFeaturedMode] = useState<"topPower" | "random">(
    "topPower",
  );
  const [featuredHeroIndex, setFeaturedHeroIndex] = useState(0);

  const teamTotals = superheroes.reduce(
    (accumulator, hero) => {
      accumulator[hero.team] = (accumulator[hero.team] || 0) + 1;
      return accumulator;
    },
    {} as Record<string, number>,
  );

  const toggleFavorite = (heroId: number) => {
    setFavoriteHeroIds((current) =>
      current.includes(heroId)
        ? current.filter((id) => id !== heroId)
        : [...current, heroId],
    );
  };

  const filteredHeroes = visibleHeroes.filter((hero) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      hero.name.toLowerCase().includes(query) ||
      hero.realName.toLowerCase().includes(query);
    const matchesTeam = teamFilter === "All" || hero.team === teamFilter;
    const matchesFavorites =
      !favoritesOnly || favoriteHeroIds.includes(hero.id);

    return matchesSearch && matchesTeam && matchesFavorites;
  });

  const displayedHeroes = [...filteredHeroes].sort((left, right) => {
    if (sortMode === "name") {
      return left.name.localeCompare(right.name);
    }

    if (sortMode === "team") {
      const teamComparison = left.team.localeCompare(right.team);

      return teamComparison !== 0
        ? teamComparison
        : left.name.localeCompare(right.name);
    }

    return left.id - right.id;
  });

  const leadHeroName = displayedHeroes[0]?.name ?? "No heroes";
  const featuredHero =
    featuredMode === "topPower"
      ? [...superheroes].sort((left, right) => {
          const leftScore = left.powers.length * 10 + left.name.length;
          const rightScore = right.powers.length * 10 + right.name.length;

          return rightScore - leftScore;
        })[0]
      : superheroes[featuredHeroIndex];

  const handleThanosSnap = () => {
    if (isSnapped) return;

    const shuffled = [...visibleHeroes].sort(() => 0.5 - Math.random());
    const halfLength = Math.floor(shuffled.length / 2);
    const toRemove = shuffled.slice(0, halfLength);
    const remaining = shuffled.slice(halfLength);

    setSnappedHeroes(toRemove);
    setVisibleHeroes(remaining);
    setIsSnapped(true);
  };

  const handleUndo = () => {
    setVisibleHeroes(superheroes);
    setSnappedHeroes([]);
    setIsSnapped(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦸‍♂️ Superhero Directory 🦸‍♀️</Text>

      <TextInput
        testID="hero-search-input"
        style={styles.searchInput}
        placeholder="Search by hero or real name"
        placeholderTextColor="#7f8c8d"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filterRow}>
        {(["All", "Avengers", "Justice League"] as const).map((team) => (
          <Pressable
            key={team}
            testID={`team-filter-${team}`}
            style={[
              styles.filterButton,
              teamFilter === team && styles.filterButtonActive,
            ]}
            onPress={() => setTeamFilter(team)}
          >
            <Text
              style={[
                styles.filterButtonText,
                teamFilter === team && styles.filterButtonTextActive,
              ]}
            >
              {team}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filterRow}>
        {(["default", "name", "team"] as const).map((mode) => (
          <Pressable
            key={mode}
            testID={`sort-mode-${mode}`}
            style={[
              styles.filterButton,
              sortMode === mode && styles.filterButtonActive,
            ]}
            onPress={() => setSortMode(mode)}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortMode === mode && styles.filterButtonTextActive,
              ]}
            >
              {mode === "default" ? "Default Order" : `Sort ${mode}`}
            </Text>
          </Pressable>
        ))}
        <Pressable
          testID="favorites-only-toggle"
          style={[
            styles.filterButton,
            favoritesOnly && styles.filterButtonActive,
          ]}
          onPress={() => setFavoritesOnly((current) => !current)}
        >
          <Text
            style={[
              styles.filterButtonText,
              favoritesOnly && styles.filterButtonTextActive,
            ]}
          >
            Favorites Only
          </Text>
        </Pressable>
      </View>

      <View style={styles.featuredPanel}>
        <Text style={styles.featuredLabel}>Featured Hero</Text>
        <Text testID="featured-hero-name" style={styles.featuredName}>
          {featuredHero.name}
        </Text>
        <Text style={styles.featuredMeta}>
          {featuredHero.team} • {featuredHero.powers.length} powers
        </Text>
        <View style={styles.featuredButtonRow}>
          <Pressable
            testID="featured-mode-power"
            style={[
              styles.featuredButton,
              featuredMode === "topPower" && styles.featuredButtonActive,
            ]}
            onPress={() => setFeaturedMode("topPower")}
          >
            <Text
              style={[
                styles.featuredButtonText,
                featuredMode === "topPower" && styles.featuredButtonTextActive,
              ]}
            >
              Top Power
            </Text>
          </Pressable>
          <Pressable
            testID="featured-mode-random"
            style={[
              styles.featuredButton,
              featuredMode === "random" && styles.featuredButtonActive,
            ]}
            onPress={() => {
              setFeaturedMode("random");
              setFeaturedHeroIndex(
                Math.floor(Math.random() * superheroes.length),
              );
            }}
          >
            <Text
              style={[
                styles.featuredButtonText,
                featuredMode === "random" && styles.featuredButtonTextActive,
              ]}
            >
              Stable Random
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.teamPanel}>
        <Text style={styles.teamPanelTitle}>Team Breakdown</Text>
        {Object.entries(teamTotals).map(([team, count]) => (
          <Text key={team} style={styles.teamPanelItem}>
            {team}: {count}
          </Text>
        ))}
      </View>

      <HeroArchivePanel />

      <View style={styles.controlsContainer}>
        <Pressable
          style={[styles.snapButton, isSnapped && styles.snapButtonDisabled]}
          onPress={handleThanosSnap}
          disabled={isSnapped}
        >
          <Text style={styles.snapButtonText}>
            {isSnapped ? "💀 Snapped!" : "🫰 Thanos Snap"}
          </Text>
        </Pressable>

        {isSnapped && (
          <Pressable style={styles.undoButton} onPress={handleUndo}>
            <Text style={styles.undoButtonText}>⏪ Undo Snap</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.heroCount}>
        {displayedHeroes.length} of {visibleHeroes.length} heroes shown
        {isSnapped
          ? ` • ${snappedHeroes.length} dusted`
          : " • all heroes available"}
      </Text>

      <Text testID="lead-hero-label" style={styles.leadHeroLabel}>
        First hero in list: {leadHeroName}
      </Text>

      <Text testID="favorites-count" style={styles.favoriteCount}>
        Favorites: {favoriteHeroIds.length}
      </Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {displayedHeroes.length === 0 ? (
          <Text style={styles.emptyState}>
            No heroes match the current search and team filters.
          </Text>
        ) : (
          displayedHeroes.map((hero) => (
            <Pressable
              key={hero.id}
              testID={`hero-card-${hero.id}`}
              style={styles.heroCard}
              onPress={() =>
                router.push({
                  pathname: "/detail" as any,
                  params: { id: hero.id },
                })
              }
            >
              <Pressable
                testID={`favorite-button-${hero.id}`}
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(hero.id)}
              >
                <Text style={styles.favoriteButtonText}>
                  {favoriteHeroIds.includes(hero.id) ? "♥" : "♡"}
                </Text>
              </Pressable>
              <View style={styles.heroHeader}>
                <Text style={styles.heroName}>{hero.name}</Text>
                <Text style={styles.teamBadge}>{hero.team}</Text>
              </View>
              <Text style={styles.realName}>Real Name: {hero.realName}</Text>
              <Text style={styles.powersLabel}>Powers:</Text>
              {hero.powers.map((power, index) => (
                <Text key={index} style={styles.powerItem}>
                  • {power}
                </Text>
              ))}
              <Text style={styles.tapHint}>Tap for more details →</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2c3e50",
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: "#dfe6e9",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterButtonActive: {
    backgroundColor: "#2c3e50",
  },
  filterButtonText: {
    color: "#2c3e50",
    fontWeight: "700",
  },
  filterButtonTextActive: {
    color: "white",
  },
  featuredPanel: {
    backgroundColor: "#1f2933",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  featuredLabel: {
    color: "#9fb3c8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  featuredName: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  featuredMeta: {
    color: "#d9e2ec",
    marginBottom: 12,
  },
  featuredButtonRow: {
    flexDirection: "row",
    gap: 8,
  },
  featuredButton: {
    backgroundColor: "#334e68",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  featuredButtonActive: {
    backgroundColor: "#f0b429",
  },
  featuredButtonText: {
    color: "#d9e2ec",
    fontWeight: "700",
  },
  featuredButtonTextActive: {
    color: "#1f2933",
  },
  teamPanel: {
    backgroundColor: "#fff7e6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  teamPanelTitle: {
    color: "#7c4700",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  teamPanelItem: {
    color: "#7c4700",
    fontWeight: "600",
    marginBottom: 4,
  },
  favoriteButton: {
    alignSelf: "flex-end",
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  favoriteButtonText: {
    fontSize: 18,
    color: "#e74c3c",
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
  },
  teamBadge: {
    backgroundColor: "#3498db",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: "600",
  },
  realName: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 12,
    fontStyle: "italic",
  },
  powersLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  powerItem: {
    fontSize: 14,
    color: "#34495e",
    marginLeft: 8,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 12,
    color: "#3498db",
    fontStyle: "italic",
    textAlign: "right",
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  snapButton: {
    backgroundColor: "#8e44ad",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  snapButtonDisabled: {
    backgroundColor: "#95a5a6",
    opacity: 0.6,
  },
  snapButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  undoButton: {
    backgroundColor: "#27ae60",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  undoButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  heroCount: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 15,
    fontStyle: "italic",
  },
  leadHeroLabel: {
    textAlign: "center",
    color: "#2c3e50",
    fontWeight: "700",
    marginBottom: 6,
  },
  favoriteCount: {
    textAlign: "center",
    color: "#e74c3c",
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyState: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 24,
  },
  archivePanel: {
    backgroundColor: "#f7f7fb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d9dee7",
  },
  archiveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  archiveTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2c3e50",
  },
  archiveCount: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "700",
  },
  archiveControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  archiveInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d9dee7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#2c3e50",
    marginBottom: 12,
  },
  archiveGrid: {
    gap: 10,
  },
  archiveCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e1e7ef",
  },
  archiveCardHighlighted: {
    borderColor: "#8e44ad",
    backgroundColor: "#f8f1fc",
  },
  archiveCardName: {
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 4,
  },
  archiveCardMeta: {
    color: "#7f8c8d",
    fontSize: 12,
    marginBottom: 4,
  },
  archiveCardNote: {
    color: "#34495e",
    fontSize: 13,
  },
  archiveEmpty: {
    color: "#7f8c8d",
    textAlign: "center",
    paddingVertical: 12,
  },
});

const heroArchiveSeed = `
0001|Spider-Man|Archive note 0001|New York|1962|Avengers
0002|Wonder Woman|Archive note 0002|Themyscira|1941|Justice League
0003|Iron Man|Archive note 0003|Malibu|1963|Avengers
0004|Batman|Archive note 0004|Gotham City|1939|Justice League
0005|Captain Marvel|Archive note 0005|Space|1968|Avengers
0006|The Flash|Archive note 0006|Central City|1956|Justice League
0007|Black Widow|Archive note 0007|Various|1964|Avengers
0008|Aquaman|Archive note 0008|Atlantis|1941|Justice League
0009|Thor|Archive note 0009|Asgard|1962|Avengers
0010|Green Lantern|Archive note 0010|Coast City|1940|Justice League
0011|Hulk|Archive note 0011|Dayton|1962|Avengers
0012|Supergirl|Archive note 0012|Midvale|1959|Justice League
0013|Doctor Strange|Archive note 0013|New York|1963|Avengers
0014|Cyborg|Archive note 0014|Detroit|1980|Justice League
0015|Scarlet Witch|Archive note 0015|Transia|1964|Avengers
0016|Green Arrow|Archive note 0016|Star City|1941|Justice League
0017|Captain America|Archive note 0017|Brooklyn|1941|Avengers
0018|Martian Manhunter|Archive note 0018|Mars|1955|Justice League
0019|Spider-Man|Archive note 0019|New York|1962|Avengers
0020|Wonder Woman|Archive note 0020|Themyscira|1941|Justice League
0021|Iron Man|Archive note 0021|Malibu|1963|Avengers
0022|Batman|Archive note 0022|Gotham City|1939|Justice League
0023|Captain Marvel|Archive note 0023|Space|1968|Avengers
0024|The Flash|Archive note 0024|Central City|1956|Justice League
0025|Black Widow|Archive note 0025|Various|1964|Avengers
0026|Aquaman|Archive note 0026|Atlantis|1941|Justice League
0027|Thor|Archive note 0027|Asgard|1962|Avengers
0028|Green Lantern|Archive note 0028|Coast City|1940|Justice League
0029|Hulk|Archive note 0029|Dayton|1962|Avengers
0030|Supergirl|Archive note 0030|Midvale|1959|Justice League
0031|Doctor Strange|Archive note 0031|New York|1963|Avengers
0032|Cyborg|Archive note 0032|Detroit|1980|Justice League
0033|Scarlet Witch|Archive note 0033|Transia|1964|Avengers
0034|Green Arrow|Archive note 0034|Star City|1941|Justice League
0035|Captain America|Archive note 0035|Brooklyn|1941|Avengers
0036|Martian Manhunter|Archive note 0036|Mars|1955|Justice League
0037|Spider-Man|Archive note 0037|New York|1962|Avengers
0038|Wonder Woman|Archive note 0038|Themyscira|1941|Justice League
0039|Iron Man|Archive note 0039|Malibu|1963|Avengers
0040|Batman|Archive note 0040|Gotham City|1939|Justice League
0041|Captain Marvel|Archive note 0041|Space|1968|Avengers
0042|The Flash|Archive note 0042|Central City|1956|Justice League
0043|Black Widow|Archive note 0043|Various|1964|Avengers
0044|Aquaman|Archive note 0044|Atlantis|1941|Justice League
0045|Thor|Archive note 0045|Asgard|1962|Avengers
0046|Green Lantern|Archive note 0046|Coast City|1940|Justice League
0047|Hulk|Archive note 0047|Dayton|1962|Avengers
0048|Supergirl|Archive note 0048|Midvale|1959|Justice League
0049|Doctor Strange|Archive note 0049|New York|1963|Avengers
0050|Cyborg|Archive note 0050|Detroit|1980|Justice League
0051|Scarlet Witch|Archive note 0051|Transia|1964|Avengers
0052|Green Arrow|Archive note 0052|Star City|1941|Justice League
0053|Captain America|Archive note 0053|Brooklyn|1941|Avengers
0054|Martian Manhunter|Archive note 0054|Mars|1955|Justice League
0055|Spider-Man|Archive note 0055|New York|1962|Avengers
0056|Wonder Woman|Archive note 0056|Themyscira|1941|Justice League
0057|Iron Man|Archive note 0057|Malibu|1963|Avengers
0058|Batman|Archive note 0058|Gotham City|1939|Justice League
0059|Captain Marvel|Archive note 0059|Space|1968|Avengers
0060|The Flash|Archive note 0060|Central City|1956|Justice League
0061|Black Widow|Archive note 0061|Various|1964|Avengers
0062|Aquaman|Archive note 0062|Atlantis|1941|Justice League
0063|Thor|Archive note 0063|Asgard|1962|Avengers
0064|Green Lantern|Archive note 0064|Coast City|1940|Justice League
0065|Hulk|Archive note 0065|Dayton|1962|Avengers
0066|Supergirl|Archive note 0066|Midvale|1959|Justice League
0067|Doctor Strange|Archive note 0067|New York|1963|Avengers
0068|Cyborg|Archive note 0068|Detroit|1980|Justice League
0069|Scarlet Witch|Archive note 0069|Transia|1964|Avengers
0070|Green Arrow|Archive note 0070|Star City|1941|Justice League
0071|Captain America|Archive note 0071|Brooklyn|1941|Avengers
0072|Martian Manhunter|Archive note 0072|Mars|1955|Justice League
0073|Spider-Man|Archive note 0073|New York|1962|Avengers
0074|Wonder Woman|Archive note 0074|Themyscira|1941|Justice League
0075|Iron Man|Archive note 0075|Malibu|1963|Avengers
0076|Batman|Archive note 0076|Gotham City|1939|Justice League
0077|Captain Marvel|Archive note 0077|Space|1968|Avengers
0078|The Flash|Archive note 0078|Central City|1956|Justice League
0079|Black Widow|Archive note 0079|Various|1964|Avengers
0080|Aquaman|Archive note 0080|Atlantis|1941|Justice League
0081|Thor|Archive note 0081|Asgard|1962|Avengers
0082|Green Lantern|Archive note 0082|Coast City|1940|Justice League
0083|Hulk|Archive note 0083|Dayton|1962|Avengers
0084|Supergirl|Archive note 0084|Midvale|1959|Justice League
0085|Doctor Strange|Archive note 0085|New York|1963|Avengers
0086|Cyborg|Archive note 0086|Detroit|1980|Justice League
0087|Scarlet Witch|Archive note 0087|Transia|1964|Avengers
0088|Green Arrow|Archive note 0088|Star City|1941|Justice League
0089|Captain America|Archive note 0089|Brooklyn|1941|Avengers
0090|Martian Manhunter|Archive note 0090|Mars|1955|Justice League
0091|Spider-Man|Archive note 0091|New York|1962|Avengers
0092|Wonder Woman|Archive note 0092|Themyscira|1941|Justice League
0093|Iron Man|Archive note 0093|Malibu|1963|Avengers
0094|Batman|Archive note 0094|Gotham City|1939|Justice League
0095|Captain Marvel|Archive note 0095|Space|1968|Avengers
0096|The Flash|Archive note 0096|Central City|1956|Justice League
0097|Black Widow|Archive note 0097|Various|1964|Avengers
0098|Aquaman|Archive note 0098|Atlantis|1941|Justice League
0099|Thor|Archive note 0099|Asgard|1962|Avengers
0100|Green Lantern|Archive note 0100|Coast City|1940|Justice League
0101|Hulk|Archive note 0101|Dayton|1962|Avengers
0102|Supergirl|Archive note 0102|Midvale|1959|Justice League
0103|Doctor Strange|Archive note 0103|New York|1963|Avengers
0104|Cyborg|Archive note 0104|Detroit|1980|Justice League
0105|Scarlet Witch|Archive note 0105|Transia|1964|Avengers
0106|Green Arrow|Archive note 0106|Star City|1941|Justice League
0107|Captain America|Archive note 0107|Brooklyn|1941|Avengers
0108|Martian Manhunter|Archive note 0108|Mars|1955|Justice League
0109|Spider-Man|Archive note 0109|New York|1962|Avengers
0110|Wonder Woman|Archive note 0110|Themyscira|1941|Justice League
0111|Iron Man|Archive note 0111|Malibu|1963|Avengers
0112|Batman|Archive note 0112|Gotham City|1939|Justice League
0113|Captain Marvel|Archive note 0113|Space|1968|Avengers
0114|The Flash|Archive note 0114|Central City|1956|Justice League
0115|Black Widow|Archive note 0115|Various|1964|Avengers
0116|Aquaman|Archive note 0116|Atlantis|1941|Justice League
0117|Thor|Archive note 0117|Asgard|1962|Avengers
0118|Green Lantern|Archive note 0118|Coast City|1940|Justice League
0119|Hulk|Archive note 0119|Dayton|1962|Avengers
0120|Supergirl|Archive note 0120|Midvale|1959|Justice League
0121|Doctor Strange|Archive note 0121|New York|1963|Avengers
0122|Cyborg|Archive note 0122|Detroit|1980|Justice League
0123|Scarlet Witch|Archive note 0123|Transia|1964|Avengers
0124|Green Arrow|Archive note 0124|Star City|1941|Justice League
0125|Captain America|Archive note 0125|Brooklyn|1941|Avengers
0126|Martian Manhunter|Archive note 0126|Mars|1955|Justice League
0127|Spider-Man|Archive note 0127|New York|1962|Avengers
0128|Wonder Woman|Archive note 0128|Themyscira|1941|Justice League
0129|Iron Man|Archive note 0129|Malibu|1963|Avengers
0130|Batman|Archive note 0130|Gotham City|1939|Justice League
0131|Captain Marvel|Archive note 0131|Space|1968|Avengers
0132|The Flash|Archive note 0132|Central City|1956|Justice League
0133|Black Widow|Archive note 0133|Various|1964|Avengers
0134|Aquaman|Archive note 0134|Atlantis|1941|Justice League
0135|Thor|Archive note 0135|Asgard|1962|Avengers
0136|Green Lantern|Archive note 0136|Coast City|1940|Justice League
0137|Hulk|Archive note 0137|Dayton|1962|Avengers
0138|Supergirl|Archive note 0138|Midvale|1959|Justice League
0139|Doctor Strange|Archive note 0139|New York|1963|Avengers
0140|Cyborg|Archive note 0140|Detroit|1980|Justice League
0141|Scarlet Witch|Archive note 0141|Transia|1964|Avengers
0142|Green Arrow|Archive note 0142|Star City|1941|Justice League
0143|Captain America|Archive note 0143|Brooklyn|1941|Avengers
0144|Martian Manhunter|Archive note 0144|Mars|1955|Justice League
0145|Spider-Man|Archive note 0145|New York|1962|Avengers
0146|Wonder Woman|Archive note 0146|Themyscira|1941|Justice League
0147|Iron Man|Archive note 0147|Malibu|1963|Avengers
0148|Batman|Archive note 0148|Gotham City|1939|Justice League
0149|Captain Marvel|Archive note 0149|Space|1968|Avengers
0150|The Flash|Archive note 0150|Central City|1956|Justice League
0151|Black Widow|Archive note 0151|Various|1964|Avengers
0152|Aquaman|Archive note 0152|Atlantis|1941|Justice League
0153|Thor|Archive note 0153|Asgard|1962|Avengers
0154|Green Lantern|Archive note 0154|Coast City|1940|Justice League
0155|Hulk|Archive note 0155|Dayton|1962|Avengers
0156|Supergirl|Archive note 0156|Midvale|1959|Justice League
0157|Doctor Strange|Archive note 0157|New York|1963|Avengers
0158|Cyborg|Archive note 0158|Detroit|1980|Justice League
0159|Scarlet Witch|Archive note 0159|Transia|1964|Avengers
0160|Green Arrow|Archive note 0160|Star City|1941|Justice League
0161|Captain America|Archive note 0161|Brooklyn|1941|Avengers
0162|Martian Manhunter|Archive note 0162|Mars|1955|Justice League
0163|Spider-Man|Archive note 0163|New York|1962|Avengers
0164|Wonder Woman|Archive note 0164|Themyscira|1941|Justice League
0165|Iron Man|Archive note 0165|Malibu|1963|Avengers
0166|Batman|Archive note 0166|Gotham City|1939|Justice League
0167|Captain Marvel|Archive note 0167|Space|1968|Avengers
0168|The Flash|Archive note 0168|Central City|1956|Justice League
0169|Black Widow|Archive note 0169|Various|1964|Avengers
0170|Aquaman|Archive note 0170|Atlantis|1941|Justice League
0171|Thor|Archive note 0171|Asgard|1962|Avengers
0172|Green Lantern|Archive note 0172|Coast City|1940|Justice League
0173|Hulk|Archive note 0173|Dayton|1962|Avengers
0174|Supergirl|Archive note 0174|Midvale|1959|Justice League
0175|Doctor Strange|Archive note 0175|New York|1963|Avengers
0176|Cyborg|Archive note 0176|Detroit|1980|Justice League
0177|Scarlet Witch|Archive note 0177|Transia|1964|Avengers
0178|Green Arrow|Archive note 0178|Star City|1941|Justice League
0179|Captain America|Archive note 0179|Brooklyn|1941|Avengers
0180|Martian Manhunter|Archive note 0180|Mars|1955|Justice League
0181|Spider-Man|Archive note 0181|New York|1962|Avengers
0182|Wonder Woman|Archive note 0182|Themyscira|1941|Justice League
0183|Iron Man|Archive note 0183|Malibu|1963|Avengers
0184|Batman|Archive note 0184|Gotham City|1939|Justice League
0185|Captain Marvel|Archive note 0185|Space|1968|Avengers
0186|The Flash|Archive note 0186|Central City|1956|Justice League
0187|Black Widow|Archive note 0187|Various|1964|Avengers
0188|Aquaman|Archive note 0188|Atlantis|1941|Justice League
0189|Thor|Archive note 0189|Asgard|1962|Avengers
0190|Green Lantern|Archive note 0190|Coast City|1940|Justice League
0191|Hulk|Archive note 0191|Dayton|1962|Avengers
0192|Supergirl|Archive note 0192|Midvale|1959|Justice League
0193|Doctor Strange|Archive note 0193|New York|1963|Avengers
0194|Cyborg|Archive note 0194|Detroit|1980|Justice League
0195|Scarlet Witch|Archive note 0195|Transia|1964|Avengers
0196|Green Arrow|Archive note 0196|Star City|1941|Justice League
0197|Captain America|Archive note 0197|Brooklyn|1941|Avengers
0198|Martian Manhunter|Archive note 0198|Mars|1955|Justice League
0199|Spider-Man|Archive note 0199|New York|1962|Avengers
0200|Wonder Woman|Archive note 0200|Themyscira|1941|Justice League
0201|Iron Man|Archive note 0201|Malibu|1963|Avengers
0202|Batman|Archive note 0202|Gotham City|1939|Justice League
0203|Captain Marvel|Archive note 0203|Space|1968|Avengers
0204|The Flash|Archive note 0204|Central City|1956|Justice League
0205|Black Widow|Archive note 0205|Various|1964|Avengers
0206|Aquaman|Archive note 0206|Atlantis|1941|Justice League
0207|Thor|Archive note 0207|Asgard|1962|Avengers
0208|Green Lantern|Archive note 0208|Coast City|1940|Justice League
0209|Hulk|Archive note 0209|Dayton|1962|Avengers
0210|Supergirl|Archive note 0210|Midvale|1959|Justice League
0211|Doctor Strange|Archive note 0211|New York|1963|Avengers
0212|Cyborg|Archive note 0212|Detroit|1980|Justice League
0213|Scarlet Witch|Archive note 0213|Transia|1964|Avengers
0214|Green Arrow|Archive note 0214|Star City|1941|Justice League
0215|Captain America|Archive note 0215|Brooklyn|1941|Avengers
0216|Martian Manhunter|Archive note 0216|Mars|1955|Justice League
0217|Spider-Man|Archive note 0217|New York|1962|Avengers
0218|Wonder Woman|Archive note 0218|Themyscira|1941|Justice League
0219|Iron Man|Archive note 0219|Malibu|1963|Avengers
0220|Batman|Archive note 0220|Gotham City|1939|Justice League
0221|Captain Marvel|Archive note 0221|Space|1968|Avengers
0222|The Flash|Archive note 0222|Central City|1956|Justice League
0223|Black Widow|Archive note 0223|Various|1964|Avengers
0224|Aquaman|Archive note 0224|Atlantis|1941|Justice League
0225|Thor|Archive note 0225|Asgard|1962|Avengers
0226|Green Lantern|Archive note 0226|Coast City|1940|Justice League
0227|Hulk|Archive note 0227|Dayton|1962|Avengers
0228|Supergirl|Archive note 0228|Midvale|1959|Justice League
0229|Doctor Strange|Archive note 0229|New York|1963|Avengers
0230|Cyborg|Archive note 0230|Detroit|1980|Justice League
0231|Scarlet Witch|Archive note 0231|Transia|1964|Avengers
0232|Green Arrow|Archive note 0232|Star City|1941|Justice League
0233|Captain America|Archive note 0233|Brooklyn|1941|Avengers
0234|Martian Manhunter|Archive note 0234|Mars|1955|Justice League
0235|Spider-Man|Archive note 0235|New York|1962|Avengers
0236|Wonder Woman|Archive note 0236|Themyscira|1941|Justice League
0237|Iron Man|Archive note 0237|Malibu|1963|Avengers
0238|Batman|Archive note 0238|Gotham City|1939|Justice League
0239|Captain Marvel|Archive note 0239|Space|1968|Avengers
0240|The Flash|Archive note 0240|Central City|1956|Justice League
0241|Black Widow|Archive note 0241|Various|1964|Avengers
0242|Aquaman|Archive note 0242|Atlantis|1941|Justice League
0243|Thor|Archive note 0243|Asgard|1962|Avengers
0244|Green Lantern|Archive note 0244|Coast City|1940|Justice League
0245|Hulk|Archive note 0245|Dayton|1962|Avengers
0246|Supergirl|Archive note 0246|Midvale|1959|Justice League
0247|Doctor Strange|Archive note 0247|New York|1963|Avengers
0248|Cyborg|Archive note 0248|Detroit|1980|Justice League
0249|Scarlet Witch|Archive note 0249|Transia|1964|Avengers
0250|Green Arrow|Archive note 0250|Star City|1941|Justice League
0251|Captain America|Archive note 0251|Brooklyn|1941|Avengers
0252|Martian Manhunter|Archive note 0252|Mars|1955|Justice League
0253|Spider-Man|Archive note 0253|New York|1962|Avengers
0254|Wonder Woman|Archive note 0254|Themyscira|1941|Justice League
0255|Iron Man|Archive note 0255|Malibu|1963|Avengers
0256|Batman|Archive note 0256|Gotham City|1939|Justice League
0257|Captain Marvel|Archive note 0257|Space|1968|Avengers
0258|The Flash|Archive note 0258|Central City|1956|Justice League
0259|Black Widow|Archive note 0259|Various|1964|Avengers
0260|Aquaman|Archive note 0260|Atlantis|1941|Justice League
0261|Thor|Archive note 0261|Asgard|1962|Avengers
0262|Green Lantern|Archive note 0262|Coast City|1940|Justice League
0263|Hulk|Archive note 0263|Dayton|1962|Avengers
0264|Supergirl|Archive note 0264|Midvale|1959|Justice League
0265|Doctor Strange|Archive note 0265|New York|1963|Avengers
0266|Cyborg|Archive note 0266|Detroit|1980|Justice League
0267|Scarlet Witch|Archive note 0267|Transia|1964|Avengers
0268|Green Arrow|Archive note 0268|Star City|1941|Justice League
0269|Captain America|Archive note 0269|Brooklyn|1941|Avengers
0270|Martian Manhunter|Archive note 0270|Mars|1955|Justice League
0271|Spider-Man|Archive note 0271|New York|1962|Avengers
0272|Wonder Woman|Archive note 0272|Themyscira|1941|Justice League
0273|Iron Man|Archive note 0273|Malibu|1963|Avengers
0274|Batman|Archive note 0274|Gotham City|1939|Justice League
0275|Captain Marvel|Archive note 0275|Space|1968|Avengers
0276|The Flash|Archive note 0276|Central City|1956|Justice League
0277|Black Widow|Archive note 0277|Various|1964|Avengers
0278|Aquaman|Archive note 0278|Atlantis|1941|Justice League
0279|Thor|Archive note 0279|Asgard|1962|Avengers
0280|Green Lantern|Archive note 0280|Coast City|1940|Justice League
0281|Hulk|Archive note 0281|Dayton|1962|Avengers
0282|Supergirl|Archive note 0282|Midvale|1959|Justice League
0283|Doctor Strange|Archive note 0283|New York|1963|Avengers
0284|Cyborg|Archive note 0284|Detroit|1980|Justice League
0285|Scarlet Witch|Archive note 0285|Transia|1964|Avengers
0286|Green Arrow|Archive note 0286|Star City|1941|Justice League
0287|Captain America|Archive note 0287|Brooklyn|1941|Avengers
0288|Martian Manhunter|Archive note 0288|Mars|1955|Justice League
0289|Spider-Man|Archive note 0289|New York|1962|Avengers
0290|Wonder Woman|Archive note 0290|Themyscira|1941|Justice League
0291|Iron Man|Archive note 0291|Malibu|1963|Avengers
0292|Batman|Archive note 0292|Gotham City|1939|Justice League
0293|Captain Marvel|Archive note 0293|Space|1968|Avengers
0294|The Flash|Archive note 0294|Central City|1956|Justice League
0295|Black Widow|Archive note 0295|Various|1964|Avengers
0296|Aquaman|Archive note 0296|Atlantis|1941|Justice League
0297|Thor|Archive note 0297|Asgard|1962|Avengers
0298|Green Lantern|Archive note 0298|Coast City|1940|Justice League
0299|Hulk|Archive note 0299|Dayton|1962|Avengers
0300|Supergirl|Archive note 0300|Midvale|1959|Justice League
0301|Doctor Strange|Archive note 0301|New York|1963|Avengers
0302|Cyborg|Archive note 0302|Detroit|1980|Justice League
0303|Scarlet Witch|Archive note 0303|Transia|1964|Avengers
0304|Green Arrow|Archive note 0304|Star City|1941|Justice League
0305|Captain America|Archive note 0305|Brooklyn|1941|Avengers
0306|Martian Manhunter|Archive note 0306|Mars|1955|Justice League
0307|Spider-Man|Archive note 0307|New York|1962|Avengers
0308|Wonder Woman|Archive note 0308|Themyscira|1941|Justice League
0309|Iron Man|Archive note 0309|Malibu|1963|Avengers
0310|Batman|Archive note 0310|Gotham City|1939|Justice League
0311|Captain Marvel|Archive note 0311|Space|1968|Avengers
0312|The Flash|Archive note 0312|Central City|1956|Justice League
0313|Black Widow|Archive note 0313|Various|1964|Avengers
0314|Aquaman|Archive note 0314|Atlantis|1941|Justice League
0315|Thor|Archive note 0315|Asgard|1962|Avengers
0316|Green Lantern|Archive note 0316|Coast City|1940|Justice League
0317|Hulk|Archive note 0317|Dayton|1962|Avengers
0318|Supergirl|Archive note 0318|Midvale|1959|Justice League
0319|Doctor Strange|Archive note 0319|New York|1963|Avengers
0320|Cyborg|Archive note 0320|Detroit|1980|Justice League
0321|Scarlet Witch|Archive note 0321|Transia|1964|Avengers
0322|Green Arrow|Archive note 0322|Star City|1941|Justice League
0323|Captain America|Archive note 0323|Brooklyn|1941|Avengers
0324|Martian Manhunter|Archive note 0324|Mars|1955|Justice League
0325|Spider-Man|Archive note 0325|New York|1962|Avengers
0326|Wonder Woman|Archive note 0326|Themyscira|1941|Justice League
0327|Iron Man|Archive note 0327|Malibu|1963|Avengers
0328|Batman|Archive note 0328|Gotham City|1939|Justice League
0329|Captain Marvel|Archive note 0329|Space|1968|Avengers
0330|The Flash|Archive note 0330|Central City|1956|Justice League
0331|Black Widow|Archive note 0331|Various|1964|Avengers
0332|Aquaman|Archive note 0332|Atlantis|1941|Justice League
0333|Thor|Archive note 0333|Asgard|1962|Avengers
0334|Green Lantern|Archive note 0334|Coast City|1940|Justice League
0335|Hulk|Archive note 0335|Dayton|1962|Avengers
0336|Supergirl|Archive note 0336|Midvale|1959|Justice League
0337|Doctor Strange|Archive note 0337|New York|1963|Avengers
0338|Cyborg|Archive note 0338|Detroit|1980|Justice League
0339|Scarlet Witch|Archive note 0339|Transia|1964|Avengers
0340|Green Arrow|Archive note 0340|Star City|1941|Justice League
0341|Captain America|Archive note 0341|Brooklyn|1941|Avengers
0342|Martian Manhunter|Archive note 0342|Mars|1955|Justice League
0343|Spider-Man|Archive note 0343|New York|1962|Avengers
0344|Wonder Woman|Archive note 0344|Themyscira|1941|Justice League
0345|Iron Man|Archive note 0345|Malibu|1963|Avengers
0346|Batman|Archive note 0346|Gotham City|1939|Justice League
0347|Captain Marvel|Archive note 0347|Space|1968|Avengers
0348|The Flash|Archive note 0348|Central City|1956|Justice League
0349|Black Widow|Archive note 0349|Various|1964|Avengers
0350|Aquaman|Archive note 0350|Atlantis|1941|Justice League
0351|Thor|Archive note 0351|Asgard|1962|Avengers
0352|Green Lantern|Archive note 0352|Coast City|1940|Justice League
0353|Hulk|Archive note 0353|Dayton|1962|Avengers
0354|Supergirl|Archive note 0354|Midvale|1959|Justice League
0355|Doctor Strange|Archive note 0355|New York|1963|Avengers
0356|Cyborg|Archive note 0356|Detroit|1980|Justice League
0357|Scarlet Witch|Archive note 0357|Transia|1964|Avengers
0358|Green Arrow|Archive note 0358|Star City|1941|Justice League
0359|Captain America|Archive note 0359|Brooklyn|1941|Avengers
0360|Martian Manhunter|Archive note 0360|Mars|1955|Justice League
0361|Spider-Man|Archive note 0361|New York|1962|Avengers
0362|Wonder Woman|Archive note 0362|Themyscira|1941|Justice League
0363|Iron Man|Archive note 0363|Malibu|1963|Avengers
0364|Batman|Archive note 0364|Gotham City|1939|Justice League
0365|Captain Marvel|Archive note 0365|Space|1968|Avengers
0366|The Flash|Archive note 0366|Central City|1956|Justice League
0367|Black Widow|Archive note 0367|Various|1964|Avengers
0368|Aquaman|Archive note 0368|Atlantis|1941|Justice League
0369|Thor|Archive note 0369|Asgard|1962|Avengers
0370|Green Lantern|Archive note 0370|Coast City|1940|Justice League
0371|Hulk|Archive note 0371|Dayton|1962|Avengers
0372|Supergirl|Archive note 0372|Midvale|1959|Justice League
0373|Doctor Strange|Archive note 0373|New York|1963|Avengers
0374|Cyborg|Archive note 0374|Detroit|1980|Justice League
0375|Scarlet Witch|Archive note 0375|Transia|1964|Avengers
0376|Green Arrow|Archive note 0376|Star City|1941|Justice League
0377|Captain America|Archive note 0377|Brooklyn|1941|Avengers
0378|Martian Manhunter|Archive note 0378|Mars|1955|Justice League
0379|Spider-Man|Archive note 0379|New York|1962|Avengers
0380|Wonder Woman|Archive note 0380|Themyscira|1941|Justice League
0381|Iron Man|Archive note 0381|Malibu|1963|Avengers
0382|Batman|Archive note 0382|Gotham City|1939|Justice League
0383|Captain Marvel|Archive note 0383|Space|1968|Avengers
0384|The Flash|Archive note 0384|Central City|1956|Justice League
0385|Black Widow|Archive note 0385|Various|1964|Avengers
0386|Aquaman|Archive note 0386|Atlantis|1941|Justice League
0387|Thor|Archive note 0387|Asgard|1962|Avengers
0388|Green Lantern|Archive note 0388|Coast City|1940|Justice League
0389|Hulk|Archive note 0389|Dayton|1962|Avengers
0390|Supergirl|Archive note 0390|Midvale|1959|Justice League
0391|Doctor Strange|Archive note 0391|New York|1963|Avengers
0392|Cyborg|Archive note 0392|Detroit|1980|Justice League
0393|Scarlet Witch|Archive note 0393|Transia|1964|Avengers
0394|Green Arrow|Archive note 0394|Star City|1941|Justice League
0395|Captain America|Archive note 0395|Brooklyn|1941|Avengers
0396|Martian Manhunter|Archive note 0396|Mars|1955|Justice League
0397|Spider-Man|Archive note 0397|New York|1962|Avengers
0398|Wonder Woman|Archive note 0398|Themyscira|1941|Justice League
0399|Iron Man|Archive note 0399|Malibu|1963|Avengers
0400|Batman|Archive note 0400|Gotham City|1939|Justice League
0401|Captain Marvel|Archive note 0401|Space|1968|Avengers
0402|The Flash|Archive note 0402|Central City|1956|Justice League
0403|Black Widow|Archive note 0403|Various|1964|Avengers
0404|Aquaman|Archive note 0404|Atlantis|1941|Justice League
0405|Thor|Archive note 0405|Asgard|1962|Avengers
0406|Green Lantern|Archive note 0406|Coast City|1940|Justice League
0407|Hulk|Archive note 0407|Dayton|1962|Avengers
0408|Supergirl|Archive note 0408|Midvale|1959|Justice League
0409|Doctor Strange|Archive note 0409|New York|1963|Avengers
0410|Cyborg|Archive note 0410|Detroit|1980|Justice League
0411|Scarlet Witch|Archive note 0411|Transia|1964|Avengers
0412|Green Arrow|Archive note 0412|Star City|1941|Justice League
0413|Captain America|Archive note 0413|Brooklyn|1941|Avengers
0414|Martian Manhunter|Archive note 0414|Mars|1955|Justice League
0415|Spider-Man|Archive note 0415|New York|1962|Avengers
0416|Wonder Woman|Archive note 0416|Themyscira|1941|Justice League
0417|Iron Man|Archive note 0417|Malibu|1963|Avengers
0418|Batman|Archive note 0418|Gotham City|1939|Justice League
0419|Captain Marvel|Archive note 0419|Space|1968|Avengers
0420|The Flash|Archive note 0420|Central City|1956|Justice League
0421|Black Widow|Archive note 0421|Various|1964|Avengers
0422|Aquaman|Archive note 0422|Atlantis|1941|Justice League
0423|Thor|Archive note 0423|Asgard|1962|Avengers
0424|Green Lantern|Archive note 0424|Coast City|1940|Justice League
0425|Hulk|Archive note 0425|Dayton|1962|Avengers
0426|Supergirl|Archive note 0426|Midvale|1959|Justice League
0427|Doctor Strange|Archive note 0427|New York|1963|Avengers
0428|Cyborg|Archive note 0428|Detroit|1980|Justice League
0429|Scarlet Witch|Archive note 0429|Transia|1964|Avengers
0430|Green Arrow|Archive note 0430|Star City|1941|Justice League
0431|Captain America|Archive note 0431|Brooklyn|1941|Avengers
0432|Martian Manhunter|Archive note 0432|Mars|1955|Justice League
0433|Spider-Man|Archive note 0433|New York|1962|Avengers
0434|Wonder Woman|Archive note 0434|Themyscira|1941|Justice League
0435|Iron Man|Archive note 0435|Malibu|1963|Avengers
0436|Batman|Archive note 0436|Gotham City|1939|Justice League
0437|Captain Marvel|Archive note 0437|Space|1968|Avengers
0438|The Flash|Archive note 0438|Central City|1956|Justice League
0439|Black Widow|Archive note 0439|Various|1964|Avengers
0440|Aquaman|Archive note 0440|Atlantis|1941|Justice League
0441|Thor|Archive note 0441|Asgard|1962|Avengers
0442|Green Lantern|Archive note 0442|Coast City|1940|Justice League
0443|Hulk|Archive note 0443|Dayton|1962|Avengers
0444|Supergirl|Archive note 0444|Midvale|1959|Justice League
0445|Doctor Strange|Archive note 0445|New York|1963|Avengers
0446|Cyborg|Archive note 0446|Detroit|1980|Justice League
0447|Scarlet Witch|Archive note 0447|Transia|1964|Avengers
0448|Green Arrow|Archive note 0448|Star City|1941|Justice League
0449|Captain America|Archive note 0449|Brooklyn|1941|Avengers
0450|Martian Manhunter|Archive note 0450|Mars|1955|Justice League
0451|Spider-Man|Archive note 0451|New York|1962|Avengers
0452|Wonder Woman|Archive note 0452|Themyscira|1941|Justice League
0453|Iron Man|Archive note 0453|Malibu|1963|Avengers
0454|Batman|Archive note 0454|Gotham City|1939|Justice League
0455|Captain Marvel|Archive note 0455|Space|1968|Avengers
0456|The Flash|Archive note 0456|Central City|1956|Justice League
0457|Black Widow|Archive note 0457|Various|1964|Avengers
0458|Aquaman|Archive note 0458|Atlantis|1941|Justice League
0459|Thor|Archive note 0459|Asgard|1962|Avengers
0460|Green Lantern|Archive note 0460|Coast City|1940|Justice League
0461|Hulk|Archive note 0461|Dayton|1962|Avengers
0462|Supergirl|Archive note 0462|Midvale|1959|Justice League
0463|Doctor Strange|Archive note 0463|New York|1963|Avengers
0464|Cyborg|Archive note 0464|Detroit|1980|Justice League
0465|Scarlet Witch|Archive note 0465|Transia|1964|Avengers
0466|Green Arrow|Archive note 0466|Star City|1941|Justice League
0467|Captain America|Archive note 0467|Brooklyn|1941|Avengers
0468|Martian Manhunter|Archive note 0468|Mars|1955|Justice League
0469|Spider-Man|Archive note 0469|New York|1962|Avengers
0470|Wonder Woman|Archive note 0470|Themyscira|1941|Justice League
0471|Iron Man|Archive note 0471|Malibu|1963|Avengers
0472|Batman|Archive note 0472|Gotham City|1939|Justice League
0473|Captain Marvel|Archive note 0473|Space|1968|Avengers
0474|The Flash|Archive note 0474|Central City|1956|Justice League
0475|Black Widow|Archive note 0475|Various|1964|Avengers
0476|Aquaman|Archive note 0476|Atlantis|1941|Justice League
0477|Thor|Archive note 0477|Asgard|1962|Avengers
0478|Green Lantern|Archive note 0478|Coast City|1940|Justice League
0479|Hulk|Archive note 0479|Dayton|1962|Avengers
0480|Supergirl|Archive note 0480|Midvale|1959|Justice League
0481|Doctor Strange|Archive note 0481|New York|1963|Avengers
0482|Cyborg|Archive note 0482|Detroit|1980|Justice League
0483|Scarlet Witch|Archive note 0483|Transia|1964|Avengers
0484|Green Arrow|Archive note 0484|Star City|1941|Justice League
0485|Captain America|Archive note 0485|Brooklyn|1941|Avengers
0486|Martian Manhunter|Archive note 0486|Mars|1955|Justice League
0487|Spider-Man|Archive note 0487|New York|1962|Avengers
0488|Wonder Woman|Archive note 0488|Themyscira|1941|Justice League
0489|Iron Man|Archive note 0489|Malibu|1963|Avengers
0490|Batman|Archive note 0490|Gotham City|1939|Justice League
0491|Captain Marvel|Archive note 0491|Space|1968|Avengers
0492|The Flash|Archive note 0492|Central City|1956|Justice League
0493|Black Widow|Archive note 0493|Various|1964|Avengers
0494|Aquaman|Archive note 0494|Atlantis|1941|Justice League
0495|Thor|Archive note 0495|Asgard|1962|Avengers
0496|Green Lantern|Archive note 0496|Coast City|1940|Justice League
0497|Hulk|Archive note 0497|Dayton|1962|Avengers
0498|Supergirl|Archive note 0498|Midvale|1959|Justice League
0499|Doctor Strange|Archive note 0499|New York|1963|Avengers
0500|Cyborg|Archive note 0500|Detroit|1980|Justice League
0501|Scarlet Witch|Archive note 0501|Transia|1964|Avengers
0502|Green Arrow|Archive note 0502|Star City|1941|Justice League
0503|Captain America|Archive note 0503|Brooklyn|1941|Avengers
0504|Martian Manhunter|Archive note 0504|Mars|1955|Justice League
0505|Spider-Man|Archive note 0505|New York|1962|Avengers
0506|Wonder Woman|Archive note 0506|Themyscira|1941|Justice League
0507|Iron Man|Archive note 0507|Malibu|1963|Avengers
0508|Batman|Archive note 0508|Gotham City|1939|Justice League
0509|Captain Marvel|Archive note 0509|Space|1968|Avengers
0510|The Flash|Archive note 0510|Central City|1956|Justice League
0511|Black Widow|Archive note 0511|Various|1964|Avengers
0512|Aquaman|Archive note 0512|Atlantis|1941|Justice League
0513|Thor|Archive note 0513|Asgard|1962|Avengers
0514|Green Lantern|Archive note 0514|Coast City|1940|Justice League
0515|Hulk|Archive note 0515|Dayton|1962|Avengers
0516|Supergirl|Archive note 0516|Midvale|1959|Justice League
0517|Doctor Strange|Archive note 0517|New York|1963|Avengers
0518|Cyborg|Archive note 0518|Detroit|1980|Justice League
0519|Scarlet Witch|Archive note 0519|Transia|1964|Avengers
0520|Green Arrow|Archive note 0520|Star City|1941|Justice League
0521|Captain America|Archive note 0521|Brooklyn|1941|Avengers
0522|Martian Manhunter|Archive note 0522|Mars|1955|Justice League
0523|Spider-Man|Archive note 0523|New York|1962|Avengers
0524|Wonder Woman|Archive note 0524|Themyscira|1941|Justice League
0525|Iron Man|Archive note 0525|Malibu|1963|Avengers
0526|Batman|Archive note 0526|Gotham City|1939|Justice League
0527|Captain Marvel|Archive note 0527|Space|1968|Avengers
0528|The Flash|Archive note 0528|Central City|1956|Justice League
0529|Black Widow|Archive note 0529|Various|1964|Avengers
0530|Aquaman|Archive note 0530|Atlantis|1941|Justice League
0531|Thor|Archive note 0531|Asgard|1962|Avengers
0532|Green Lantern|Archive note 0532|Coast City|1940|Justice League
0533|Hulk|Archive note 0533|Dayton|1962|Avengers
0534|Supergirl|Archive note 0534|Midvale|1959|Justice League
0535|Doctor Strange|Archive note 0535|New York|1963|Avengers
0536|Cyborg|Archive note 0536|Detroit|1980|Justice League
0537|Scarlet Witch|Archive note 0537|Transia|1964|Avengers
0538|Green Arrow|Archive note 0538|Star City|1941|Justice League
0539|Captain America|Archive note 0539|Brooklyn|1941|Avengers
0540|Martian Manhunter|Archive note 0540|Mars|1955|Justice League
0541|Spider-Man|Archive note 0541|New York|1962|Avengers
0542|Wonder Woman|Archive note 0542|Themyscira|1941|Justice League
0543|Iron Man|Archive note 0543|Malibu|1963|Avengers
0544|Batman|Archive note 0544|Gotham City|1939|Justice League
0545|Captain Marvel|Archive note 0545|Space|1968|Avengers
0546|The Flash|Archive note 0546|Central City|1956|Justice League
0547|Black Widow|Archive note 0547|Various|1964|Avengers
0548|Aquaman|Archive note 0548|Atlantis|1941|Justice League
0549|Thor|Archive note 0549|Asgard|1962|Avengers
0550|Green Lantern|Archive note 0550|Coast City|1940|Justice League
0551|Hulk|Archive note 0551|Dayton|1962|Avengers
0552|Supergirl|Archive note 0552|Midvale|1959|Justice League
0553|Doctor Strange|Archive note 0553|New York|1963|Avengers
0554|Cyborg|Archive note 0554|Detroit|1980|Justice League
0555|Scarlet Witch|Archive note 0555|Transia|1964|Avengers
0556|Green Arrow|Archive note 0556|Star City|1941|Justice League
0557|Captain America|Archive note 0557|Brooklyn|1941|Avengers
0558|Martian Manhunter|Archive note 0558|Mars|1955|Justice League
0559|Spider-Man|Archive note 0559|New York|1962|Avengers
0560|Wonder Woman|Archive note 0560|Themyscira|1941|Justice League
0561|Iron Man|Archive note 0561|Malibu|1963|Avengers
0562|Batman|Archive note 0562|Gotham City|1939|Justice League
0563|Captain Marvel|Archive note 0563|Space|1968|Avengers
0564|The Flash|Archive note 0564|Central City|1956|Justice League
0565|Black Widow|Archive note 0565|Various|1964|Avengers
0566|Aquaman|Archive note 0566|Atlantis|1941|Justice League
0567|Thor|Archive note 0567|Asgard|1962|Avengers
0568|Green Lantern|Archive note 0568|Coast City|1940|Justice League
0569|Hulk|Archive note 0569|Dayton|1962|Avengers
0570|Supergirl|Archive note 0570|Midvale|1959|Justice League
0571|Doctor Strange|Archive note 0571|New York|1963|Avengers
0572|Cyborg|Archive note 0572|Detroit|1980|Justice League
0573|Scarlet Witch|Archive note 0573|Transia|1964|Avengers
0574|Green Arrow|Archive note 0574|Star City|1941|Justice League
0575|Captain America|Archive note 0575|Brooklyn|1941|Avengers
0576|Martian Manhunter|Archive note 0576|Mars|1955|Justice League
0577|Spider-Man|Archive note 0577|New York|1962|Avengers
0578|Wonder Woman|Archive note 0578|Themyscira|1941|Justice League
0579|Iron Man|Archive note 0579|Malibu|1963|Avengers
0580|Batman|Archive note 0580|Gotham City|1939|Justice League
0581|Captain Marvel|Archive note 0581|Space|1968|Avengers
0582|The Flash|Archive note 0582|Central City|1956|Justice League
0583|Black Widow|Archive note 0583|Various|1964|Avengers
0584|Aquaman|Archive note 0584|Atlantis|1941|Justice League
0585|Thor|Archive note 0585|Asgard|1962|Avengers
0586|Green Lantern|Archive note 0586|Coast City|1940|Justice League
0587|Hulk|Archive note 0587|Dayton|1962|Avengers
0588|Supergirl|Archive note 0588|Midvale|1959|Justice League
0589|Doctor Strange|Archive note 0589|New York|1963|Avengers
0590|Cyborg|Archive note 0590|Detroit|1980|Justice League
0591|Scarlet Witch|Archive note 0591|Transia|1964|Avengers
0592|Green Arrow|Archive note 0592|Star City|1941|Justice League
0593|Captain America|Archive note 0593|Brooklyn|1941|Avengers
0594|Martian Manhunter|Archive note 0594|Mars|1955|Justice League
0595|Spider-Man|Archive note 0595|New York|1962|Avengers
0596|Wonder Woman|Archive note 0596|Themyscira|1941|Justice League
0597|Iron Man|Archive note 0597|Malibu|1963|Avengers
0598|Batman|Archive note 0598|Gotham City|1939|Justice League
0599|Captain Marvel|Archive note 0599|Space|1968|Avengers
0600|The Flash|Archive note 0600|Central City|1956|Justice League
0601|Black Widow|Archive note 0601|Various|1964|Avengers
0602|Aquaman|Archive note 0602|Atlantis|1941|Justice League
0603|Thor|Archive note 0603|Asgard|1962|Avengers
0604|Green Lantern|Archive note 0604|Coast City|1940|Justice League
0605|Hulk|Archive note 0605|Dayton|1962|Avengers
0606|Supergirl|Archive note 0606|Midvale|1959|Justice League
0607|Doctor Strange|Archive note 0607|New York|1963|Avengers
0608|Cyborg|Archive note 0608|Detroit|1980|Justice League
0609|Scarlet Witch|Archive note 0609|Transia|1964|Avengers
0610|Green Arrow|Archive note 0610|Star City|1941|Justice League
0611|Captain America|Archive note 0611|Brooklyn|1941|Avengers
0612|Martian Manhunter|Archive note 0612|Mars|1955|Justice League
0613|Spider-Man|Archive note 0613|New York|1962|Avengers
0614|Wonder Woman|Archive note 0614|Themyscira|1941|Justice League
0615|Iron Man|Archive note 0615|Malibu|1963|Avengers
0616|Batman|Archive note 0616|Gotham City|1939|Justice League
0617|Captain Marvel|Archive note 0617|Space|1968|Avengers
0618|The Flash|Archive note 0618|Central City|1956|Justice League
0619|Black Widow|Archive note 0619|Various|1964|Avengers
0620|Aquaman|Archive note 0620|Atlantis|1941|Justice League
0621|Thor|Archive note 0621|Asgard|1962|Avengers
0622|Green Lantern|Archive note 0622|Coast City|1940|Justice League
0623|Hulk|Archive note 0623|Dayton|1962|Avengers
0624|Supergirl|Archive note 0624|Midvale|1959|Justice League
0625|Doctor Strange|Archive note 0625|New York|1963|Avengers
0626|Cyborg|Archive note 0626|Detroit|1980|Justice League
0627|Scarlet Witch|Archive note 0627|Transia|1964|Avengers
0628|Green Arrow|Archive note 0628|Star City|1941|Justice League
0629|Captain America|Archive note 0629|Brooklyn|1941|Avengers
0630|Martian Manhunter|Archive note 0630|Mars|1955|Justice League
0631|Spider-Man|Archive note 0631|New York|1962|Avengers
0632|Wonder Woman|Archive note 0632|Themyscira|1941|Justice League
0633|Iron Man|Archive note 0633|Malibu|1963|Avengers
0634|Batman|Archive note 0634|Gotham City|1939|Justice League
0635|Captain Marvel|Archive note 0635|Space|1968|Avengers
0636|The Flash|Archive note 0636|Central City|1956|Justice League
0637|Black Widow|Archive note 0637|Various|1964|Avengers
0638|Aquaman|Archive note 0638|Atlantis|1941|Justice League
0639|Thor|Archive note 0639|Asgard|1962|Avengers
0640|Green Lantern|Archive note 0640|Coast City|1940|Justice League
0641|Hulk|Archive note 0641|Dayton|1962|Avengers
0642|Supergirl|Archive note 0642|Midvale|1959|Justice League
0643|Doctor Strange|Archive note 0643|New York|1963|Avengers
0644|Cyborg|Archive note 0644|Detroit|1980|Justice League
0645|Scarlet Witch|Archive note 0645|Transia|1964|Avengers
0646|Green Arrow|Archive note 0646|Star City|1941|Justice League
0647|Captain America|Archive note 0647|Brooklyn|1941|Avengers
0648|Martian Manhunter|Archive note 0648|Mars|1955|Justice League
0649|Spider-Man|Archive note 0649|New York|1962|Avengers
0650|Wonder Woman|Archive note 0650|Themyscira|1941|Justice League
0651|Iron Man|Archive note 0651|Malibu|1963|Avengers
0652|Batman|Archive note 0652|Gotham City|1939|Justice League
0653|Captain Marvel|Archive note 0653|Space|1968|Avengers
0654|The Flash|Archive note 0654|Central City|1956|Justice League
0655|Black Widow|Archive note 0655|Various|1964|Avengers
0656|Aquaman|Archive note 0656|Atlantis|1941|Justice League
0657|Thor|Archive note 0657|Asgard|1962|Avengers
0658|Green Lantern|Archive note 0658|Coast City|1940|Justice League
0659|Hulk|Archive note 0659|Dayton|1962|Avengers
0660|Supergirl|Archive note 0660|Midvale|1959|Justice League
0661|Doctor Strange|Archive note 0661|New York|1963|Avengers
0662|Cyborg|Archive note 0662|Detroit|1980|Justice League
0663|Scarlet Witch|Archive note 0663|Transia|1964|Avengers
0664|Green Arrow|Archive note 0664|Star City|1941|Justice League
0665|Captain America|Archive note 0665|Brooklyn|1941|Avengers
0666|Martian Manhunter|Archive note 0666|Mars|1955|Justice League
0667|Spider-Man|Archive note 0667|New York|1962|Avengers
0668|Wonder Woman|Archive note 0668|Themyscira|1941|Justice League
0669|Iron Man|Archive note 0669|Malibu|1963|Avengers
0670|Batman|Archive note 0670|Gotham City|1939|Justice League
0671|Captain Marvel|Archive note 0671|Space|1968|Avengers
0672|The Flash|Archive note 0672|Central City|1956|Justice League
0673|Black Widow|Archive note 0673|Various|1964|Avengers
0674|Aquaman|Archive note 0674|Atlantis|1941|Justice League
0675|Thor|Archive note 0675|Asgard|1962|Avengers
0676|Green Lantern|Archive note 0676|Coast City|1940|Justice League
0677|Hulk|Archive note 0677|Dayton|1962|Avengers
0678|Supergirl|Archive note 0678|Midvale|1959|Justice League
0679|Doctor Strange|Archive note 0679|New York|1963|Avengers
0680|Cyborg|Archive note 0680|Detroit|1980|Justice League
0681|Scarlet Witch|Archive note 0681|Transia|1964|Avengers
0682|Green Arrow|Archive note 0682|Star City|1941|Justice League
0683|Captain America|Archive note 0683|Brooklyn|1941|Avengers
0684|Martian Manhunter|Archive note 0684|Mars|1955|Justice League
0685|Spider-Man|Archive note 0685|New York|1962|Avengers
0686|Wonder Woman|Archive note 0686|Themyscira|1941|Justice League
0687|Iron Man|Archive note 0687|Malibu|1963|Avengers
0688|Batman|Archive note 0688|Gotham City|1939|Justice League
0689|Captain Marvel|Archive note 0689|Space|1968|Avengers
0690|The Flash|Archive note 0690|Central City|1956|Justice League
0691|Black Widow|Archive note 0691|Various|1964|Avengers
0692|Aquaman|Archive note 0692|Atlantis|1941|Justice League
0693|Thor|Archive note 0693|Asgard|1962|Avengers
0694|Green Lantern|Archive note 0694|Coast City|1940|Justice League
0695|Hulk|Archive note 0695|Dayton|1962|Avengers
0696|Supergirl|Archive note 0696|Midvale|1959|Justice League
0697|Doctor Strange|Archive note 0697|New York|1963|Avengers
0698|Cyborg|Archive note 0698|Detroit|1980|Justice League
0699|Scarlet Witch|Archive note 0699|Transia|1964|Avengers
0700|Green Arrow|Archive note 0700|Star City|1941|Justice League
0701|Captain America|Archive note 0701|Brooklyn|1941|Avengers
0702|Martian Manhunter|Archive note 0702|Mars|1955|Justice League
0703|Spider-Man|Archive note 0703|New York|1962|Avengers
0704|Wonder Woman|Archive note 0704|Themyscira|1941|Justice League
0705|Iron Man|Archive note 0705|Malibu|1963|Avengers
0706|Batman|Archive note 0706|Gotham City|1939|Justice League
0707|Captain Marvel|Archive note 0707|Space|1968|Avengers
0708|The Flash|Archive note 0708|Central City|1956|Justice League
0709|Black Widow|Archive note 0709|Various|1964|Avengers
0710|Aquaman|Archive note 0710|Atlantis|1941|Justice League
0711|Thor|Archive note 0711|Asgard|1962|Avengers
0712|Green Lantern|Archive note 0712|Coast City|1940|Justice League
0713|Hulk|Archive note 0713|Dayton|1962|Avengers
0714|Supergirl|Archive note 0714|Midvale|1959|Justice League
0715|Doctor Strange|Archive note 0715|New York|1963|Avengers
0716|Cyborg|Archive note 0716|Detroit|1980|Justice League
0717|Scarlet Witch|Archive note 0717|Transia|1964|Avengers
0718|Green Arrow|Archive note 0718|Star City|1941|Justice League
0719|Captain America|Archive note 0719|Brooklyn|1941|Avengers
0720|Martian Manhunter|Archive note 0720|Mars|1955|Justice League
0721|Spider-Man|Archive note 0721|New York|1962|Avengers
0722|Wonder Woman|Archive note 0722|Themyscira|1941|Justice League
0723|Iron Man|Archive note 0723|Malibu|1963|Avengers
0724|Batman|Archive note 0724|Gotham City|1939|Justice League
0725|Captain Marvel|Archive note 0725|Space|1968|Avengers
0726|The Flash|Archive note 0726|Central City|1956|Justice League
0727|Black Widow|Archive note 0727|Various|1964|Avengers
0728|Aquaman|Archive note 0728|Atlantis|1941|Justice League
0729|Thor|Archive note 0729|Asgard|1962|Avengers
0730|Green Lantern|Archive note 0730|Coast City|1940|Justice League
0731|Hulk|Archive note 0731|Dayton|1962|Avengers
0732|Supergirl|Archive note 0732|Midvale|1959|Justice League
0733|Doctor Strange|Archive note 0733|New York|1963|Avengers
0734|Cyborg|Archive note 0734|Detroit|1980|Justice League
0735|Scarlet Witch|Archive note 0735|Transia|1964|Avengers
0736|Green Arrow|Archive note 0736|Star City|1941|Justice League
0737|Captain America|Archive note 0737|Brooklyn|1941|Avengers
0738|Martian Manhunter|Archive note 0738|Mars|1955|Justice League
0739|Spider-Man|Archive note 0739|New York|1962|Avengers
0740|Wonder Woman|Archive note 0740|Themyscira|1941|Justice League
0741|Iron Man|Archive note 0741|Malibu|1963|Avengers
0742|Batman|Archive note 0742|Gotham City|1939|Justice League
0743|Captain Marvel|Archive note 0743|Space|1968|Avengers
0744|The Flash|Archive note 0744|Central City|1956|Justice League
0745|Black Widow|Archive note 0745|Various|1964|Avengers
0746|Aquaman|Archive note 0746|Atlantis|1941|Justice League
0747|Thor|Archive note 0747|Asgard|1962|Avengers
0748|Green Lantern|Archive note 0748|Coast City|1940|Justice League
0749|Hulk|Archive note 0749|Dayton|1962|Avengers
0750|Supergirl|Archive note 0750|Midvale|1959|Justice League
0751|Doctor Strange|Archive note 0751|New York|1963|Avengers
0752|Cyborg|Archive note 0752|Detroit|1980|Justice League
0753|Scarlet Witch|Archive note 0753|Transia|1964|Avengers
0754|Green Arrow|Archive note 0754|Star City|1941|Justice League
0755|Captain America|Archive note 0755|Brooklyn|1941|Avengers
0756|Martian Manhunter|Archive note 0756|Mars|1955|Justice League
0757|Spider-Man|Archive note 0757|New York|1962|Avengers
0758|Wonder Woman|Archive note 0758|Themyscira|1941|Justice League
0759|Iron Man|Archive note 0759|Malibu|1963|Avengers
0760|Batman|Archive note 0760|Gotham City|1939|Justice League
0761|Captain Marvel|Archive note 0761|Space|1968|Avengers
0762|The Flash|Archive note 0762|Central City|1956|Justice League
0763|Black Widow|Archive note 0763|Various|1964|Avengers
0764|Aquaman|Archive note 0764|Atlantis|1941|Justice League
0765|Thor|Archive note 0765|Asgard|1962|Avengers
0766|Green Lantern|Archive note 0766|Coast City|1940|Justice League
0767|Hulk|Archive note 0767|Dayton|1962|Avengers
0768|Supergirl|Archive note 0768|Midvale|1959|Justice League
0769|Doctor Strange|Archive note 0769|New York|1963|Avengers
0770|Cyborg|Archive note 0770|Detroit|1980|Justice League
0771|Scarlet Witch|Archive note 0771|Transia|1964|Avengers
0772|Green Arrow|Archive note 0772|Star City|1941|Justice League
0773|Captain America|Archive note 0773|Brooklyn|1941|Avengers
0774|Martian Manhunter|Archive note 0774|Mars|1955|Justice League
0775|Spider-Man|Archive note 0775|New York|1962|Avengers
0776|Wonder Woman|Archive note 0776|Themyscira|1941|Justice League
0777|Iron Man|Archive note 0777|Malibu|1963|Avengers
0778|Batman|Archive note 0778|Gotham City|1939|Justice League
0779|Captain Marvel|Archive note 0779|Space|1968|Avengers
0780|The Flash|Archive note 0780|Central City|1956|Justice League
0781|Black Widow|Archive note 0781|Various|1964|Avengers
0782|Aquaman|Archive note 0782|Atlantis|1941|Justice League
0783|Thor|Archive note 0783|Asgard|1962|Avengers
0784|Green Lantern|Archive note 0784|Coast City|1940|Justice League
0785|Hulk|Archive note 0785|Dayton|1962|Avengers
0786|Supergirl|Archive note 0786|Midvale|1959|Justice League
0787|Doctor Strange|Archive note 0787|New York|1963|Avengers
0788|Cyborg|Archive note 0788|Detroit|1980|Justice League
0789|Scarlet Witch|Archive note 0789|Transia|1964|Avengers
0790|Green Arrow|Archive note 0790|Star City|1941|Justice League
0791|Captain America|Archive note 0791|Brooklyn|1941|Avengers
0792|Martian Manhunter|Archive note 0792|Mars|1955|Justice League
0793|Spider-Man|Archive note 0793|New York|1962|Avengers
0794|Wonder Woman|Archive note 0794|Themyscira|1941|Justice League
0795|Iron Man|Archive note 0795|Malibu|1963|Avengers
0796|Batman|Archive note 0796|Gotham City|1939|Justice League
0797|Captain Marvel|Archive note 0797|Space|1968|Avengers
0798|The Flash|Archive note 0798|Central City|1956|Justice League
0799|Black Widow|Archive note 0799|Various|1964|Avengers
0800|Aquaman|Archive note 0800|Atlantis|1941|Justice League
0801|Thor|Archive note 0801|Asgard|1962|Avengers
0802|Green Lantern|Archive note 0802|Coast City|1940|Justice League
0803|Hulk|Archive note 0803|Dayton|1962|Avengers
0804|Supergirl|Archive note 0804|Midvale|1959|Justice League
0805|Doctor Strange|Archive note 0805|New York|1963|Avengers
0806|Cyborg|Archive note 0806|Detroit|1980|Justice League
0807|Scarlet Witch|Archive note 0807|Transia|1964|Avengers
0808|Green Arrow|Archive note 0808|Star City|1941|Justice League
0809|Captain America|Archive note 0809|Brooklyn|1941|Avengers
0810|Martian Manhunter|Archive note 0810|Mars|1955|Justice League
0811|Spider-Man|Archive note 0811|New York|1962|Avengers
0812|Wonder Woman|Archive note 0812|Themyscira|1941|Justice League
0813|Iron Man|Archive note 0813|Malibu|1963|Avengers
0814|Batman|Archive note 0814|Gotham City|1939|Justice League
0815|Captain Marvel|Archive note 0815|Space|1968|Avengers
0816|The Flash|Archive note 0816|Central City|1956|Justice League
0817|Black Widow|Archive note 0817|Various|1964|Avengers
0818|Aquaman|Archive note 0818|Atlantis|1941|Justice League
0819|Thor|Archive note 0819|Asgard|1962|Avengers
0820|Green Lantern|Archive note 0820|Coast City|1940|Justice League
0821|Hulk|Archive note 0821|Dayton|1962|Avengers
0822|Supergirl|Archive note 0822|Midvale|1959|Justice League
0823|Doctor Strange|Archive note 0823|New York|1963|Avengers
0824|Cyborg|Archive note 0824|Detroit|1980|Justice League
0825|Scarlet Witch|Archive note 0825|Transia|1964|Avengers
0826|Green Arrow|Archive note 0826|Star City|1941|Justice League
0827|Captain America|Archive note 0827|Brooklyn|1941|Avengers
0828|Martian Manhunter|Archive note 0828|Mars|1955|Justice League
0829|Spider-Man|Archive note 0829|New York|1962|Avengers
0830|Wonder Woman|Archive note 0830|Themyscira|1941|Justice League
0831|Iron Man|Archive note 0831|Malibu|1963|Avengers
0832|Batman|Archive note 0832|Gotham City|1939|Justice League
0833|Captain Marvel|Archive note 0833|Space|1968|Avengers
0834|The Flash|Archive note 0834|Central City|1956|Justice League
0835|Black Widow|Archive note 0835|Various|1964|Avengers
0836|Aquaman|Archive note 0836|Atlantis|1941|Justice League
0837|Thor|Archive note 0837|Asgard|1962|Avengers
0838|Green Lantern|Archive note 0838|Coast City|1940|Justice League
0839|Hulk|Archive note 0839|Dayton|1962|Avengers
0840|Supergirl|Archive note 0840|Midvale|1959|Justice League
0841|Doctor Strange|Archive note 0841|New York|1963|Avengers
0842|Cyborg|Archive note 0842|Detroit|1980|Justice League
0843|Scarlet Witch|Archive note 0843|Transia|1964|Avengers
0844|Green Arrow|Archive note 0844|Star City|1941|Justice League
0845|Captain America|Archive note 0845|Brooklyn|1941|Avengers
0846|Martian Manhunter|Archive note 0846|Mars|1955|Justice League
0847|Spider-Man|Archive note 0847|New York|1962|Avengers
0848|Wonder Woman|Archive note 0848|Themyscira|1941|Justice League
0849|Iron Man|Archive note 0849|Malibu|1963|Avengers
0850|Batman|Archive note 0850|Gotham City|1939|Justice League
0851|Captain Marvel|Archive note 0851|Space|1968|Avengers
0852|The Flash|Archive note 0852|Central City|1956|Justice League
0853|Black Widow|Archive note 0853|Various|1964|Avengers
0854|Aquaman|Archive note 0854|Atlantis|1941|Justice League
0855|Thor|Archive note 0855|Asgard|1962|Avengers
0856|Green Lantern|Archive note 0856|Coast City|1940|Justice League
0857|Hulk|Archive note 0857|Dayton|1962|Avengers
0858|Supergirl|Archive note 0858|Midvale|1959|Justice League
0859|Doctor Strange|Archive note 0859|New York|1963|Avengers
0860|Cyborg|Archive note 0860|Detroit|1980|Justice League
0861|Scarlet Witch|Archive note 0861|Transia|1964|Avengers
0862|Green Arrow|Archive note 0862|Star City|1941|Justice League
0863|Captain America|Archive note 0863|Brooklyn|1941|Avengers
0864|Martian Manhunter|Archive note 0864|Mars|1955|Justice League
0865|Spider-Man|Archive note 0865|New York|1962|Avengers
0866|Wonder Woman|Archive note 0866|Themyscira|1941|Justice League
0867|Iron Man|Archive note 0867|Malibu|1963|Avengers
0868|Batman|Archive note 0868|Gotham City|1939|Justice League
0869|Captain Marvel|Archive note 0869|Space|1968|Avengers
0870|The Flash|Archive note 0870|Central City|1956|Justice League
0871|Black Widow|Archive note 0871|Various|1964|Avengers
0872|Aquaman|Archive note 0872|Atlantis|1941|Justice League
0873|Thor|Archive note 0873|Asgard|1962|Avengers
0874|Green Lantern|Archive note 0874|Coast City|1940|Justice League
0875|Hulk|Archive note 0875|Dayton|1962|Avengers
0876|Supergirl|Archive note 0876|Midvale|1959|Justice League
0877|Doctor Strange|Archive note 0877|New York|1963|Avengers
0878|Cyborg|Archive note 0878|Detroit|1980|Justice League
0879|Scarlet Witch|Archive note 0879|Transia|1964|Avengers
0880|Green Arrow|Archive note 0880|Star City|1941|Justice League
0881|Captain America|Archive note 0881|Brooklyn|1941|Avengers
0882|Martian Manhunter|Archive note 0882|Mars|1955|Justice League
0883|Spider-Man|Archive note 0883|New York|1962|Avengers
0884|Wonder Woman|Archive note 0884|Themyscira|1941|Justice League
0885|Iron Man|Archive note 0885|Malibu|1963|Avengers
0886|Batman|Archive note 0886|Gotham City|1939|Justice League
0887|Captain Marvel|Archive note 0887|Space|1968|Avengers
0888|The Flash|Archive note 0888|Central City|1956|Justice League
0889|Black Widow|Archive note 0889|Various|1964|Avengers
0890|Aquaman|Archive note 0890|Atlantis|1941|Justice League
0891|Thor|Archive note 0891|Asgard|1962|Avengers
0892|Green Lantern|Archive note 0892|Coast City|1940|Justice League
0893|Hulk|Archive note 0893|Dayton|1962|Avengers
0894|Supergirl|Archive note 0894|Midvale|1959|Justice League
0895|Doctor Strange|Archive note 0895|New York|1963|Avengers
0896|Cyborg|Archive note 0896|Detroit|1980|Justice League
0897|Scarlet Witch|Archive note 0897|Transia|1964|Avengers
0898|Green Arrow|Archive note 0898|Star City|1941|Justice League
0899|Captain America|Archive note 0899|Brooklyn|1941|Avengers
0900|Martian Manhunter|Archive note 0900|Mars|1955|Justice League
0901|Spider-Man|Archive note 0901|New York|1962|Avengers
0902|Wonder Woman|Archive note 0902|Themyscira|1941|Justice League
0903|Iron Man|Archive note 0903|Malibu|1963|Avengers
0904|Batman|Archive note 0904|Gotham City|1939|Justice League
0905|Captain Marvel|Archive note 0905|Space|1968|Avengers
0906|The Flash|Archive note 0906|Central City|1956|Justice League
0907|Black Widow|Archive note 0907|Various|1964|Avengers
0908|Aquaman|Archive note 0908|Atlantis|1941|Justice League
0909|Thor|Archive note 0909|Asgard|1962|Avengers
0910|Green Lantern|Archive note 0910|Coast City|1940|Justice League
0911|Hulk|Archive note 0911|Dayton|1962|Avengers
0912|Supergirl|Archive note 0912|Midvale|1959|Justice League
0913|Doctor Strange|Archive note 0913|New York|1963|Avengers
0914|Cyborg|Archive note 0914|Detroit|1980|Justice League
0915|Scarlet Witch|Archive note 0915|Transia|1964|Avengers
0916|Green Arrow|Archive note 0916|Star City|1941|Justice League
0917|Captain America|Archive note 0917|Brooklyn|1941|Avengers
0918|Martian Manhunter|Archive note 0918|Mars|1955|Justice League
0919|Spider-Man|Archive note 0919|New York|1962|Avengers
0920|Wonder Woman|Archive note 0920|Themyscira|1941|Justice League
0921|Iron Man|Archive note 0921|Malibu|1963|Avengers
0922|Batman|Archive note 0922|Gotham City|1939|Justice League
0923|Captain Marvel|Archive note 0923|Space|1968|Avengers
0924|The Flash|Archive note 0924|Central City|1956|Justice League
0925|Black Widow|Archive note 0925|Various|1964|Avengers
0926|Aquaman|Archive note 0926|Atlantis|1941|Justice League
0927|Thor|Archive note 0927|Asgard|1962|Avengers
0928|Green Lantern|Archive note 0928|Coast City|1940|Justice League
0929|Hulk|Archive note 0929|Dayton|1962|Avengers
0930|Supergirl|Archive note 0930|Midvale|1959|Justice League
0931|Doctor Strange|Archive note 0931|New York|1963|Avengers
0932|Cyborg|Archive note 0932|Detroit|1980|Justice League
0933|Scarlet Witch|Archive note 0933|Transia|1964|Avengers
0934|Green Arrow|Archive note 0934|Star City|1941|Justice League
0935|Captain America|Archive note 0935|Brooklyn|1941|Avengers
0936|Martian Manhunter|Archive note 0936|Mars|1955|Justice League
0937|Spider-Man|Archive note 0937|New York|1962|Avengers
0938|Wonder Woman|Archive note 0938|Themyscira|1941|Justice League
0939|Iron Man|Archive note 0939|Malibu|1963|Avengers
0940|Batman|Archive note 0940|Gotham City|1939|Justice League
0941|Captain Marvel|Archive note 0941|Space|1968|Avengers
0942|The Flash|Archive note 0942|Central City|1956|Justice League
0943|Black Widow|Archive note 0943|Various|1964|Avengers
0944|Aquaman|Archive note 0944|Atlantis|1941|Justice League
0945|Thor|Archive note 0945|Asgard|1962|Avengers
0946|Green Lantern|Archive note 0946|Coast City|1940|Justice League
0947|Hulk|Archive note 0947|Dayton|1962|Avengers
0948|Supergirl|Archive note 0948|Midvale|1959|Justice League
0949|Doctor Strange|Archive note 0949|New York|1963|Avengers
0950|Cyborg|Archive note 0950|Detroit|1980|Justice League
0951|Scarlet Witch|Archive note 0951|Transia|1964|Avengers
0952|Green Arrow|Archive note 0952|Star City|1941|Justice League
0953|Captain America|Archive note 0953|Brooklyn|1941|Avengers
0954|Martian Manhunter|Archive note 0954|Mars|1955|Justice League
0955|Spider-Man|Archive note 0955|New York|1962|Avengers
0956|Wonder Woman|Archive note 0956|Themyscira|1941|Justice League
0957|Iron Man|Archive note 0957|Malibu|1963|Avengers
0958|Batman|Archive note 0958|Gotham City|1939|Justice League
0959|Captain Marvel|Archive note 0959|Space|1968|Avengers
0960|The Flash|Archive note 0960|Central City|1956|Justice League
0961|Black Widow|Archive note 0961|Various|1964|Avengers
0962|Aquaman|Archive note 0962|Atlantis|1941|Justice League
0963|Thor|Archive note 0963|Asgard|1962|Avengers
0964|Green Lantern|Archive note 0964|Coast City|1940|Justice League
0965|Hulk|Archive note 0965|Dayton|1962|Avengers
0966|Supergirl|Archive note 0966|Midvale|1959|Justice League
0967|Doctor Strange|Archive note 0967|New York|1963|Avengers
0968|Cyborg|Archive note 0968|Detroit|1980|Justice League
0969|Scarlet Witch|Archive note 0969|Transia|1964|Avengers
0970|Green Arrow|Archive note 0970|Star City|1941|Justice League
0971|Captain America|Archive note 0971|Brooklyn|1941|Avengers
0972|Martian Manhunter|Archive note 0972|Mars|1955|Justice League
0973|Spider-Man|Archive note 0973|New York|1962|Avengers
0974|Wonder Woman|Archive note 0974|Themyscira|1941|Justice League
0975|Iron Man|Archive note 0975|Malibu|1963|Avengers
0976|Batman|Archive note 0976|Gotham City|1939|Justice League
0977|Captain Marvel|Archive note 0977|Space|1968|Avengers
0978|The Flash|Archive note 0978|Central City|1956|Justice League
0979|Black Widow|Archive note 0979|Various|1964|Avengers
0980|Aquaman|Archive note 0980|Atlantis|1941|Justice League
0981|Thor|Archive note 0981|Asgard|1962|Avengers
0982|Green Lantern|Archive note 0982|Coast City|1940|Justice League
0983|Hulk|Archive note 0983|Dayton|1962|Avengers
0984|Supergirl|Archive note 0984|Midvale|1959|Justice League
0985|Doctor Strange|Archive note 0985|New York|1963|Avengers
0986|Cyborg|Archive note 0986|Detroit|1980|Justice League
0987|Scarlet Witch|Archive note 0987|Transia|1964|Avengers
0988|Green Arrow|Archive note 0988|Star City|1941|Justice League
0989|Captain America|Archive note 0989|Brooklyn|1941|Avengers
0990|Martian Manhunter|Archive note 0990|Mars|1955|Justice League
0991|Spider-Man|Archive note 0991|New York|1962|Avengers
0992|Wonder Woman|Archive note 0992|Themyscira|1941|Justice League
0993|Iron Man|Archive note 0993|Malibu|1963|Avengers
0994|Batman|Archive note 0994|Gotham City|1939|Justice League
0995|Captain Marvel|Archive note 0995|Space|1968|Avengers
0996|The Flash|Archive note 0996|Central City|1956|Justice League
0997|Black Widow|Archive note 0997|Various|1964|Avengers
0998|Aquaman|Archive note 0998|Atlantis|1941|Justice League
0999|Thor|Archive note 0999|Asgard|1962|Avengers
1000|Green Lantern|Archive note 1000|Coast City|1940|Justice League
1001|Hulk|Archive note 1001|Dayton|1962|Avengers
1002|Supergirl|Archive note 1002|Midvale|1959|Justice League
1003|Doctor Strange|Archive note 1003|New York|1963|Avengers
1004|Cyborg|Archive note 1004|Detroit|1980|Justice League
1005|Scarlet Witch|Archive note 1005|Transia|1964|Avengers
1006|Green Arrow|Archive note 1006|Star City|1941|Justice League
1007|Captain America|Archive note 1007|Brooklyn|1941|Avengers
1008|Martian Manhunter|Archive note 1008|Mars|1955|Justice League
1009|Spider-Man|Archive note 1009|New York|1962|Avengers
1010|Wonder Woman|Archive note 1010|Themyscira|1941|Justice League
1011|Iron Man|Archive note 1011|Malibu|1963|Avengers
1012|Batman|Archive note 1012|Gotham City|1939|Justice League
1013|Captain Marvel|Archive note 1013|Space|1968|Avengers
1014|The Flash|Archive note 1014|Central City|1956|Justice League
1015|Black Widow|Archive note 1015|Various|1964|Avengers
1016|Aquaman|Archive note 1016|Atlantis|1941|Justice League
1017|Thor|Archive note 1017|Asgard|1962|Avengers
1018|Green Lantern|Archive note 1018|Coast City|1940|Justice League
1019|Hulk|Archive note 1019|Dayton|1962|Avengers
1020|Supergirl|Archive note 1020|Midvale|1959|Justice League
1021|Doctor Strange|Archive note 1021|New York|1963|Avengers
1022|Cyborg|Archive note 1022|Detroit|1980|Justice League
1023|Scarlet Witch|Archive note 1023|Transia|1964|Avengers
1024|Green Arrow|Archive note 1024|Star City|1941|Justice League
1025|Captain America|Archive note 1025|Brooklyn|1941|Avengers
1026|Martian Manhunter|Archive note 1026|Mars|1955|Justice League
1027|Spider-Man|Archive note 1027|New York|1962|Avengers
1028|Wonder Woman|Archive note 1028|Themyscira|1941|Justice League
1029|Iron Man|Archive note 1029|Malibu|1963|Avengers
1030|Batman|Archive note 1030|Gotham City|1939|Justice League
1031|Captain Marvel|Archive note 1031|Space|1968|Avengers
1032|The Flash|Archive note 1032|Central City|1956|Justice League
1033|Black Widow|Archive note 1033|Various|1964|Avengers
1034|Aquaman|Archive note 1034|Atlantis|1941|Justice League
1035|Thor|Archive note 1035|Asgard|1962|Avengers
1036|Green Lantern|Archive note 1036|Coast City|1940|Justice League
1037|Hulk|Archive note 1037|Dayton|1962|Avengers
1038|Supergirl|Archive note 1038|Midvale|1959|Justice League
1039|Doctor Strange|Archive note 1039|New York|1963|Avengers
1040|Cyborg|Archive note 1040|Detroit|1980|Justice League
1041|Scarlet Witch|Archive note 1041|Transia|1964|Avengers
1042|Green Arrow|Archive note 1042|Star City|1941|Justice League
1043|Captain America|Archive note 1043|Brooklyn|1941|Avengers
1044|Martian Manhunter|Archive note 1044|Mars|1955|Justice League
1045|Spider-Man|Archive note 1045|New York|1962|Avengers
1046|Wonder Woman|Archive note 1046|Themyscira|1941|Justice League
1047|Iron Man|Archive note 1047|Malibu|1963|Avengers
1048|Batman|Archive note 1048|Gotham City|1939|Justice League
1049|Captain Marvel|Archive note 1049|Space|1968|Avengers
1050|The Flash|Archive note 1050|Central City|1956|Justice League
1051|Black Widow|Archive note 1051|Various|1964|Avengers
1052|Aquaman|Archive note 1052|Atlantis|1941|Justice League
1053|Thor|Archive note 1053|Asgard|1962|Avengers
1054|Green Lantern|Archive note 1054|Coast City|1940|Justice League
1055|Hulk|Archive note 1055|Dayton|1962|Avengers
1056|Supergirl|Archive note 1056|Midvale|1959|Justice League
1057|Doctor Strange|Archive note 1057|New York|1963|Avengers
1058|Cyborg|Archive note 1058|Detroit|1980|Justice League
1059|Scarlet Witch|Archive note 1059|Transia|1964|Avengers
1060|Green Arrow|Archive note 1060|Star City|1941|Justice League
1061|Captain America|Archive note 1061|Brooklyn|1941|Avengers
1062|Martian Manhunter|Archive note 1062|Mars|1955|Justice League
1063|Spider-Man|Archive note 1063|New York|1962|Avengers
1064|Wonder Woman|Archive note 1064|Themyscira|1941|Justice League
1065|Iron Man|Archive note 1065|Malibu|1963|Avengers
1066|Batman|Archive note 1066|Gotham City|1939|Justice League
1067|Captain Marvel|Archive note 1067|Space|1968|Avengers
1068|The Flash|Archive note 1068|Central City|1956|Justice League
1069|Black Widow|Archive note 1069|Various|1964|Avengers
1070|Aquaman|Archive note 1070|Atlantis|1941|Justice League
1071|Thor|Archive note 1071|Asgard|1962|Avengers
1072|Green Lantern|Archive note 1072|Coast City|1940|Justice League
1073|Hulk|Archive note 1073|Dayton|1962|Avengers
1074|Supergirl|Archive note 1074|Midvale|1959|Justice League
1075|Doctor Strange|Archive note 1075|New York|1963|Avengers
1076|Cyborg|Archive note 1076|Detroit|1980|Justice League
1077|Scarlet Witch|Archive note 1077|Transia|1964|Avengers
1078|Green Arrow|Archive note 1078|Star City|1941|Justice League
1079|Captain America|Archive note 1079|Brooklyn|1941|Avengers
1080|Martian Manhunter|Archive note 1080|Mars|1955|Justice League
1081|Spider-Man|Archive note 1081|New York|1962|Avengers
1082|Wonder Woman|Archive note 1082|Themyscira|1941|Justice League
1083|Iron Man|Archive note 1083|Malibu|1963|Avengers
1084|Batman|Archive note 1084|Gotham City|1939|Justice League
1085|Captain Marvel|Archive note 1085|Space|1968|Avengers
1086|The Flash|Archive note 1086|Central City|1956|Justice League
1087|Black Widow|Archive note 1087|Various|1964|Avengers
1088|Aquaman|Archive note 1088|Atlantis|1941|Justice League
1089|Thor|Archive note 1089|Asgard|1962|Avengers
1090|Green Lantern|Archive note 1090|Coast City|1940|Justice League
1091|Hulk|Archive note 1091|Dayton|1962|Avengers
1092|Supergirl|Archive note 1092|Midvale|1959|Justice League
1093|Doctor Strange|Archive note 1093|New York|1963|Avengers
1094|Cyborg|Archive note 1094|Detroit|1980|Justice League
1095|Scarlet Witch|Archive note 1095|Transia|1964|Avengers
1096|Green Arrow|Archive note 1096|Star City|1941|Justice League
1097|Captain America|Archive note 1097|Brooklyn|1941|Avengers
1098|Martian Manhunter|Archive note 1098|Mars|1955|Justice League
1099|Spider-Man|Archive note 1099|New York|1962|Avengers
1100|Wonder Woman|Archive note 1100|Themyscira|1941|Justice League
1101|Iron Man|Archive note 1101|Malibu|1963|Avengers
1102|Batman|Archive note 1102|Gotham City|1939|Justice League
1103|Captain Marvel|Archive note 1103|Space|1968|Avengers
1104|The Flash|Archive note 1104|Central City|1956|Justice League
1105|Black Widow|Archive note 1105|Various|1964|Avengers
1106|Aquaman|Archive note 1106|Atlantis|1941|Justice League
1107|Thor|Archive note 1107|Asgard|1962|Avengers
1108|Green Lantern|Archive note 1108|Coast City|1940|Justice League
1109|Hulk|Archive note 1109|Dayton|1962|Avengers
1110|Supergirl|Archive note 1110|Midvale|1959|Justice League
1111|Doctor Strange|Archive note 1111|New York|1963|Avengers
1112|Cyborg|Archive note 1112|Detroit|1980|Justice League
1113|Scarlet Witch|Archive note 1113|Transia|1964|Avengers
1114|Green Arrow|Archive note 1114|Star City|1941|Justice League
1115|Captain America|Archive note 1115|Brooklyn|1941|Avengers
1116|Martian Manhunter|Archive note 1116|Mars|1955|Justice League
1117|Spider-Man|Archive note 1117|New York|1962|Avengers
1118|Wonder Woman|Archive note 1118|Themyscira|1941|Justice League
1119|Iron Man|Archive note 1119|Malibu|1963|Avengers
1120|Batman|Archive note 1120|Gotham City|1939|Justice League
1121|Captain Marvel|Archive note 1121|Space|1968|Avengers
1122|The Flash|Archive note 1122|Central City|1956|Justice League
1123|Black Widow|Archive note 1123|Various|1964|Avengers
1124|Aquaman|Archive note 1124|Atlantis|1941|Justice League
1125|Thor|Archive note 1125|Asgard|1962|Avengers
1126|Green Lantern|Archive note 1126|Coast City|1940|Justice League
1127|Hulk|Archive note 1127|Dayton|1962|Avengers
1128|Supergirl|Archive note 1128|Midvale|1959|Justice League
1129|Doctor Strange|Archive note 1129|New York|1963|Avengers
1130|Cyborg|Archive note 1130|Detroit|1980|Justice League
1131|Scarlet Witch|Archive note 1131|Transia|1964|Avengers
1132|Green Arrow|Archive note 1132|Star City|1941|Justice League
1133|Captain America|Archive note 1133|Brooklyn|1941|Avengers
1134|Martian Manhunter|Archive note 1134|Mars|1955|Justice League
1135|Spider-Man|Archive note 1135|New York|1962|Avengers
1136|Wonder Woman|Archive note 1136|Themyscira|1941|Justice League
1137|Iron Man|Archive note 1137|Malibu|1963|Avengers
1138|Batman|Archive note 1138|Gotham City|1939|Justice League
1139|Captain Marvel|Archive note 1139|Space|1968|Avengers
1140|The Flash|Archive note 1140|Central City|1956|Justice League
1141|Black Widow|Archive note 1141|Various|1964|Avengers
1142|Aquaman|Archive note 1142|Atlantis|1941|Justice League
1143|Thor|Archive note 1143|Asgard|1962|Avengers
1144|Green Lantern|Archive note 1144|Coast City|1940|Justice League
1145|Hulk|Archive note 1145|Dayton|1962|Avengers
1146|Supergirl|Archive note 1146|Midvale|1959|Justice League
1147|Doctor Strange|Archive note 1147|New York|1963|Avengers
1148|Cyborg|Archive note 1148|Detroit|1980|Justice League
1149|Scarlet Witch|Archive note 1149|Transia|1964|Avengers
1150|Green Arrow|Archive note 1150|Star City|1941|Justice League
1151|Captain America|Archive note 1151|Brooklyn|1941|Avengers
1152|Martian Manhunter|Archive note 1152|Mars|1955|Justice League
1153|Spider-Man|Archive note 1153|New York|1962|Avengers
1154|Wonder Woman|Archive note 1154|Themyscira|1941|Justice League
1155|Iron Man|Archive note 1155|Malibu|1963|Avengers
1156|Batman|Archive note 1156|Gotham City|1939|Justice League
1157|Captain Marvel|Archive note 1157|Space|1968|Avengers
1158|The Flash|Archive note 1158|Central City|1956|Justice League
1159|Black Widow|Archive note 1159|Various|1964|Avengers
1160|Aquaman|Archive note 1160|Atlantis|1941|Justice League
1161|Thor|Archive note 1161|Asgard|1962|Avengers
1162|Green Lantern|Archive note 1162|Coast City|1940|Justice League
1163|Hulk|Archive note 1163|Dayton|1962|Avengers
1164|Supergirl|Archive note 1164|Midvale|1959|Justice League
1165|Doctor Strange|Archive note 1165|New York|1963|Avengers
1166|Cyborg|Archive note 1166|Detroit|1980|Justice League
1167|Scarlet Witch|Archive note 1167|Transia|1964|Avengers
1168|Green Arrow|Archive note 1168|Star City|1941|Justice League
1169|Captain America|Archive note 1169|Brooklyn|1941|Avengers
1170|Martian Manhunter|Archive note 1170|Mars|1955|Justice League
1171|Spider-Man|Archive note 1171|New York|1962|Avengers
1172|Wonder Woman|Archive note 1172|Themyscira|1941|Justice League
1173|Iron Man|Archive note 1173|Malibu|1963|Avengers
1174|Batman|Archive note 1174|Gotham City|1939|Justice League
1175|Captain Marvel|Archive note 1175|Space|1968|Avengers
1176|The Flash|Archive note 1176|Central City|1956|Justice League
1177|Black Widow|Archive note 1177|Various|1964|Avengers
1178|Aquaman|Archive note 1178|Atlantis|1941|Justice League
1179|Thor|Archive note 1179|Asgard|1962|Avengers
1180|Green Lantern|Archive note 1180|Coast City|1940|Justice League
1181|Hulk|Archive note 1181|Dayton|1962|Avengers
1182|Supergirl|Archive note 1182|Midvale|1959|Justice League
1183|Doctor Strange|Archive note 1183|New York|1963|Avengers
1184|Cyborg|Archive note 1184|Detroit|1980|Justice League
1185|Scarlet Witch|Archive note 1185|Transia|1964|Avengers
1186|Green Arrow|Archive note 1186|Star City|1941|Justice League
1187|Captain America|Archive note 1187|Brooklyn|1941|Avengers
1188|Martian Manhunter|Archive note 1188|Mars|1955|Justice League
1189|Spider-Man|Archive note 1189|New York|1962|Avengers
1190|Wonder Woman|Archive note 1190|Themyscira|1941|Justice League
1191|Iron Man|Archive note 1191|Malibu|1963|Avengers
1192|Batman|Archive note 1192|Gotham City|1939|Justice League
1193|Captain Marvel|Archive note 1193|Space|1968|Avengers
1194|The Flash|Archive note 1194|Central City|1956|Justice League
1195|Black Widow|Archive note 1195|Various|1964|Avengers
1196|Aquaman|Archive note 1196|Atlantis|1941|Justice League
1197|Thor|Archive note 1197|Asgard|1962|Avengers
1198|Green Lantern|Archive note 1198|Coast City|1940|Justice League
1199|Hulk|Archive note 1199|Dayton|1962|Avengers
1200|Supergirl|Archive note 1200|Midvale|1959|Justice League
1201|Doctor Strange|Archive note 1201|New York|1963|Avengers
1202|Cyborg|Archive note 1202|Detroit|1980|Justice League
1203|Scarlet Witch|Archive note 1203|Transia|1964|Avengers
1204|Green Arrow|Archive note 1204|Star City|1941|Justice League
1205|Captain America|Archive note 1205|Brooklyn|1941|Avengers
1206|Martian Manhunter|Archive note 1206|Mars|1955|Justice League
1207|Spider-Man|Archive note 1207|New York|1962|Avengers
1208|Wonder Woman|Archive note 1208|Themyscira|1941|Justice League
1209|Iron Man|Archive note 1209|Malibu|1963|Avengers
1210|Batman|Archive note 1210|Gotham City|1939|Justice League
1211|Captain Marvel|Archive note 1211|Space|1968|Avengers
1212|The Flash|Archive note 1212|Central City|1956|Justice League
1213|Black Widow|Archive note 1213|Various|1964|Avengers
1214|Aquaman|Archive note 1214|Atlantis|1941|Justice League
1215|Thor|Archive note 1215|Asgard|1962|Avengers
1216|Green Lantern|Archive note 1216|Coast City|1940|Justice League
1217|Hulk|Archive note 1217|Dayton|1962|Avengers
1218|Supergirl|Archive note 1218|Midvale|1959|Justice League
1219|Doctor Strange|Archive note 1219|New York|1963|Avengers
1220|Cyborg|Archive note 1220|Detroit|1980|Justice League
1221|Scarlet Witch|Archive note 1221|Transia|1964|Avengers
1222|Green Arrow|Archive note 1222|Star City|1941|Justice League
1223|Captain America|Archive note 1223|Brooklyn|1941|Avengers
1224|Martian Manhunter|Archive note 1224|Mars|1955|Justice League
1225|Spider-Man|Archive note 1225|New York|1962|Avengers
1226|Wonder Woman|Archive note 1226|Themyscira|1941|Justice League
1227|Iron Man|Archive note 1227|Malibu|1963|Avengers
1228|Batman|Archive note 1228|Gotham City|1939|Justice League
1229|Captain Marvel|Archive note 1229|Space|1968|Avengers
1230|The Flash|Archive note 1230|Central City|1956|Justice League
1231|Black Widow|Archive note 1231|Various|1964|Avengers
1232|Aquaman|Archive note 1232|Atlantis|1941|Justice League
1233|Thor|Archive note 1233|Asgard|1962|Avengers
1234|Green Lantern|Archive note 1234|Coast City|1940|Justice League
1235|Hulk|Archive note 1235|Dayton|1962|Avengers
1236|Supergirl|Archive note 1236|Midvale|1959|Justice League
1237|Doctor Strange|Archive note 1237|New York|1963|Avengers
1238|Cyborg|Archive note 1238|Detroit|1980|Justice League
1239|Scarlet Witch|Archive note 1239|Transia|1964|Avengers
1240|Green Arrow|Archive note 1240|Star City|1941|Justice League
1241|Captain America|Archive note 1241|Brooklyn|1941|Avengers
1242|Martian Manhunter|Archive note 1242|Mars|1955|Justice League
1243|Spider-Man|Archive note 1243|New York|1962|Avengers
1244|Wonder Woman|Archive note 1244|Themyscira|1941|Justice League
1245|Iron Man|Archive note 1245|Malibu|1963|Avengers
1246|Batman|Archive note 1246|Gotham City|1939|Justice League
1247|Captain Marvel|Archive note 1247|Space|1968|Avengers
1248|The Flash|Archive note 1248|Central City|1956|Justice League
1249|Black Widow|Archive note 1249|Various|1964|Avengers
1250|Aquaman|Archive note 1250|Atlantis|1941|Justice League
1251|Thor|Archive note 1251|Asgard|1962|Avengers
1252|Green Lantern|Archive note 1252|Coast City|1940|Justice League
1253|Hulk|Archive note 1253|Dayton|1962|Avengers
1254|Supergirl|Archive note 1254|Midvale|1959|Justice League
1255|Doctor Strange|Archive note 1255|New York|1963|Avengers
1256|Cyborg|Archive note 1256|Detroit|1980|Justice League
1257|Scarlet Witch|Archive note 1257|Transia|1964|Avengers
1258|Green Arrow|Archive note 1258|Star City|1941|Justice League
1259|Captain America|Archive note 1259|Brooklyn|1941|Avengers
1260|Martian Manhunter|Archive note 1260|Mars|1955|Justice League
1261|Spider-Man|Archive note 1261|New York|1962|Avengers
1262|Wonder Woman|Archive note 1262|Themyscira|1941|Justice League
1263|Iron Man|Archive note 1263|Malibu|1963|Avengers
1264|Batman|Archive note 1264|Gotham City|1939|Justice League
1265|Captain Marvel|Archive note 1265|Space|1968|Avengers
1266|The Flash|Archive note 1266|Central City|1956|Justice League
1267|Black Widow|Archive note 1267|Various|1964|Avengers
1268|Aquaman|Archive note 1268|Atlantis|1941|Justice League
1269|Thor|Archive note 1269|Asgard|1962|Avengers
1270|Green Lantern|Archive note 1270|Coast City|1940|Justice League
1271|Hulk|Archive note 1271|Dayton|1962|Avengers
1272|Supergirl|Archive note 1272|Midvale|1959|Justice League
1273|Doctor Strange|Archive note 1273|New York|1963|Avengers
1274|Cyborg|Archive note 1274|Detroit|1980|Justice League
1275|Scarlet Witch|Archive note 1275|Transia|1964|Avengers
1276|Green Arrow|Archive note 1276|Star City|1941|Justice League
1277|Captain America|Archive note 1277|Brooklyn|1941|Avengers
1278|Martian Manhunter|Archive note 1278|Mars|1955|Justice League
1279|Spider-Man|Archive note 1279|New York|1962|Avengers
1280|Wonder Woman|Archive note 1280|Themyscira|1941|Justice League
1281|Iron Man|Archive note 1281|Malibu|1963|Avengers
1282|Batman|Archive note 1282|Gotham City|1939|Justice League
1283|Captain Marvel|Archive note 1283|Space|1968|Avengers
1284|The Flash|Archive note 1284|Central City|1956|Justice League
1285|Black Widow|Archive note 1285|Various|1964|Avengers
1286|Aquaman|Archive note 1286|Atlantis|1941|Justice League
1287|Thor|Archive note 1287|Asgard|1962|Avengers
1288|Green Lantern|Archive note 1288|Coast City|1940|Justice League
1289|Hulk|Archive note 1289|Dayton|1962|Avengers
1290|Supergirl|Archive note 1290|Midvale|1959|Justice League
1291|Doctor Strange|Archive note 1291|New York|1963|Avengers
1292|Cyborg|Archive note 1292|Detroit|1980|Justice League
1293|Scarlet Witch|Archive note 1293|Transia|1964|Avengers
1294|Green Arrow|Archive note 1294|Star City|1941|Justice League
1295|Captain America|Archive note 1295|Brooklyn|1941|Avengers
1296|Martian Manhunter|Archive note 1296|Mars|1955|Justice League
1297|Spider-Man|Archive note 1297|New York|1962|Avengers
1298|Wonder Woman|Archive note 1298|Themyscira|1941|Justice League
1299|Iron Man|Archive note 1299|Malibu|1963|Avengers
1300|Batman|Archive note 1300|Gotham City|1939|Justice League
1301|Captain Marvel|Archive note 1301|Space|1968|Avengers
1302|The Flash|Archive note 1302|Central City|1956|Justice League
1303|Black Widow|Archive note 1303|Various|1964|Avengers
1304|Aquaman|Archive note 1304|Atlantis|1941|Justice League
1305|Thor|Archive note 1305|Asgard|1962|Avengers
1306|Green Lantern|Archive note 1306|Coast City|1940|Justice League
1307|Hulk|Archive note 1307|Dayton|1962|Avengers
1308|Supergirl|Archive note 1308|Midvale|1959|Justice League
1309|Doctor Strange|Archive note 1309|New York|1963|Avengers
1310|Cyborg|Archive note 1310|Detroit|1980|Justice League
1311|Scarlet Witch|Archive note 1311|Transia|1964|Avengers
1312|Green Arrow|Archive note 1312|Star City|1941|Justice League
1313|Captain America|Archive note 1313|Brooklyn|1941|Avengers
1314|Martian Manhunter|Archive note 1314|Mars|1955|Justice League
1315|Spider-Man|Archive note 1315|New York|1962|Avengers
1316|Wonder Woman|Archive note 1316|Themyscira|1941|Justice League
1317|Iron Man|Archive note 1317|Malibu|1963|Avengers
1318|Batman|Archive note 1318|Gotham City|1939|Justice League
1319|Captain Marvel|Archive note 1319|Space|1968|Avengers
1320|The Flash|Archive note 1320|Central City|1956|Justice League
1321|Black Widow|Archive note 1321|Various|1964|Avengers
1322|Aquaman|Archive note 1322|Atlantis|1941|Justice League
1323|Thor|Archive note 1323|Asgard|1962|Avengers
1324|Green Lantern|Archive note 1324|Coast City|1940|Justice League
1325|Hulk|Archive note 1325|Dayton|1962|Avengers
1326|Supergirl|Archive note 1326|Midvale|1959|Justice League
1327|Doctor Strange|Archive note 1327|New York|1963|Avengers
1328|Cyborg|Archive note 1328|Detroit|1980|Justice League
1329|Scarlet Witch|Archive note 1329|Transia|1964|Avengers
1330|Green Arrow|Archive note 1330|Star City|1941|Justice League
1331|Captain America|Archive note 1331|Brooklyn|1941|Avengers
1332|Martian Manhunter|Archive note 1332|Mars|1955|Justice League
1333|Spider-Man|Archive note 1333|New York|1962|Avengers
1334|Wonder Woman|Archive note 1334|Themyscira|1941|Justice League
1335|Iron Man|Archive note 1335|Malibu|1963|Avengers
1336|Batman|Archive note 1336|Gotham City|1939|Justice League
1337|Captain Marvel|Archive note 1337|Space|1968|Avengers
1338|The Flash|Archive note 1338|Central City|1956|Justice League
1339|Black Widow|Archive note 1339|Various|1964|Avengers
1340|Aquaman|Archive note 1340|Atlantis|1941|Justice League
1341|Thor|Archive note 1341|Asgard|1962|Avengers
1342|Green Lantern|Archive note 1342|Coast City|1940|Justice League
1343|Hulk|Archive note 1343|Dayton|1962|Avengers
1344|Supergirl|Archive note 1344|Midvale|1959|Justice League
1345|Doctor Strange|Archive note 1345|New York|1963|Avengers
1346|Cyborg|Archive note 1346|Detroit|1980|Justice League
1347|Scarlet Witch|Archive note 1347|Transia|1964|Avengers
1348|Green Arrow|Archive note 1348|Star City|1941|Justice League
1349|Captain America|Archive note 1349|Brooklyn|1941|Avengers
1350|Martian Manhunter|Archive note 1350|Mars|1955|Justice League
1351|Spider-Man|Archive note 1351|New York|1962|Avengers
1352|Wonder Woman|Archive note 1352|Themyscira|1941|Justice League
1353|Iron Man|Archive note 1353|Malibu|1963|Avengers
1354|Batman|Archive note 1354|Gotham City|1939|Justice League
1355|Captain Marvel|Archive note 1355|Space|1968|Avengers
1356|The Flash|Archive note 1356|Central City|1956|Justice League
1357|Black Widow|Archive note 1357|Various|1964|Avengers
1358|Aquaman|Archive note 1358|Atlantis|1941|Justice League
1359|Thor|Archive note 1359|Asgard|1962|Avengers
1360|Green Lantern|Archive note 1360|Coast City|1940|Justice League
1361|Hulk|Archive note 1361|Dayton|1962|Avengers
1362|Supergirl|Archive note 1362|Midvale|1959|Justice League
1363|Doctor Strange|Archive note 1363|New York|1963|Avengers
1364|Cyborg|Archive note 1364|Detroit|1980|Justice League
1365|Scarlet Witch|Archive note 1365|Transia|1964|Avengers
1366|Green Arrow|Archive note 1366|Star City|1941|Justice League
1367|Captain America|Archive note 1367|Brooklyn|1941|Avengers
1368|Martian Manhunter|Archive note 1368|Mars|1955|Justice League
1369|Spider-Man|Archive note 1369|New York|1962|Avengers
1370|Wonder Woman|Archive note 1370|Themyscira|1941|Justice League
1371|Iron Man|Archive note 1371|Malibu|1963|Avengers
1372|Batman|Archive note 1372|Gotham City|1939|Justice League
1373|Captain Marvel|Archive note 1373|Space|1968|Avengers
1374|The Flash|Archive note 1374|Central City|1956|Justice League
1375|Black Widow|Archive note 1375|Various|1964|Avengers
1376|Aquaman|Archive note 1376|Atlantis|1941|Justice League
1377|Thor|Archive note 1377|Asgard|1962|Avengers
1378|Green Lantern|Archive note 1378|Coast City|1940|Justice League
1379|Hulk|Archive note 1379|Dayton|1962|Avengers
1380|Supergirl|Archive note 1380|Midvale|1959|Justice League
1381|Doctor Strange|Archive note 1381|New York|1963|Avengers
1382|Cyborg|Archive note 1382|Detroit|1980|Justice League
1383|Scarlet Witch|Archive note 1383|Transia|1964|Avengers
1384|Green Arrow|Archive note 1384|Star City|1941|Justice League
1385|Captain America|Archive note 1385|Brooklyn|1941|Avengers
1386|Martian Manhunter|Archive note 1386|Mars|1955|Justice League
1387|Spider-Man|Archive note 1387|New York|1962|Avengers
1388|Wonder Woman|Archive note 1388|Themyscira|1941|Justice League
1389|Iron Man|Archive note 1389|Malibu|1963|Avengers
1390|Batman|Archive note 1390|Gotham City|1939|Justice League
1391|Captain Marvel|Archive note 1391|Space|1968|Avengers
1392|The Flash|Archive note 1392|Central City|1956|Justice League
1393|Black Widow|Archive note 1393|Various|1964|Avengers
1394|Aquaman|Archive note 1394|Atlantis|1941|Justice League
1395|Thor|Archive note 1395|Asgard|1962|Avengers
1396|Green Lantern|Archive note 1396|Coast City|1940|Justice League
1397|Hulk|Archive note 1397|Dayton|1962|Avengers
1398|Supergirl|Archive note 1398|Midvale|1959|Justice League
1399|Doctor Strange|Archive note 1399|New York|1963|Avengers
1400|Cyborg|Archive note 1400|Detroit|1980|Justice League
`;

const heroArchiveEntries = heroArchiveSeed
  .trim()
  .split("\n")
  .map((line) => {
    const [index, hero, note, city, era, team] = line.split("|");

    return {
      index: parseInt(index, 10),
      hero,
      note,
      city,
      era,
      team,
    };
  });

function HeroArchivePanel() {
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<
    "All" | "Avengers" | "Justice League"
  >("All");
  const [sortMode, setSortMode] = useState<"index" | "hero" | "era">("index");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [pinnedIndexes, setPinnedIndexes] = useState<number[]>([]);

  const filtered = heroArchiveEntries.filter((entry) => {
    const normalizedQuery = query.toLowerCase();
    const matchesSearch =
      entry.hero.toLowerCase().includes(normalizedQuery) ||
      entry.note.toLowerCase().includes(normalizedQuery) ||
      entry.city.toLowerCase().includes(normalizedQuery);
    const matchesTeam = teamFilter === "All" || entry.team === teamFilter;

    return matchesSearch && matchesTeam;
  });

  const sorted = [...filtered].sort((left, right) => {
    if (sortMode === "hero") {
      return left.hero.localeCompare(right.hero);
    }

    if (sortMode === "era") {
      return left.era.localeCompare(right.era);
    }

    return left.index - right.index;
  });

  const spotlight = sorted[spotlightIndex % Math.max(sorted.length, 1)] ?? null;

  const togglePinned = (index: number) => {
    setPinnedIndexes((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index],
    );
  };

  return (
    <View style={styles.archivePanel}>
      <View style={styles.archiveHeader}>
        <View>
          <Text style={styles.archiveTitle}>Hero Archive</Text>
          <Text testID="archive-count" style={styles.archiveCount}>
            {sorted.length} archived briefings
          </Text>
        </View>
        <Text style={styles.archiveCount}>{pinnedIndexes.length} pinned</Text>
      </View>

      <TextInput
        testID="archive-search-input"
        style={styles.archiveInput}
        placeholder="Search archive by hero, note, or city"
        placeholderTextColor="#7f8c8d"
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.archiveControls}>
        {(["All", "Avengers", "Justice League"] as const).map((team) => (
          <Pressable
            key={team}
            testID={`archive-team-${team}`}
            style={[
              styles.filterButton,
              teamFilter === team && styles.filterButtonActive,
            ]}
            onPress={() => setTeamFilter(team)}
          >
            <Text
              style={[
                styles.filterButtonText,
                teamFilter === team && styles.filterButtonTextActive,
              ]}
            >
              {team}
            </Text>
          </Pressable>
        ))}
        {(["index", "hero", "era"] as const).map((mode) => (
          <Pressable
            key={mode}
            testID={`archive-sort-${mode}`}
            style={[
              styles.filterButton,
              sortMode === mode && styles.filterButtonActive,
            ]}
            onPress={() => setSortMode(mode)}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortMode === mode && styles.filterButtonTextActive,
              ]}
            >
              {mode}
            </Text>
          </Pressable>
        ))}
        <Pressable
          testID="archive-spotlight-next"
          style={styles.filterButton}
          onPress={() => setSpotlightIndex((current) => current + 1)}
        >
          <Text style={styles.filterButtonText}>Next Spotlight</Text>
        </Pressable>
      </View>

      <Text testID="archive-spotlight" style={styles.archiveCardMeta}>
        {spotlight
          ? `Spotlight: #${spotlight.index} ${spotlight.hero} in ${spotlight.city}`
          : "Spotlight: no matches"}
      </Text>

      <View style={styles.archiveGrid}>
        {sorted.length === 0 ? (
          <Text style={styles.archiveEmpty}>No archive entries match.</Text>
        ) : (
          sorted.slice(0, 12).map((entry) => {
            const isPinned = pinnedIndexes.includes(entry.index);

            return (
              <Pressable
                key={entry.index}
                testID={`archive-entry-${entry.index}`}
                style={[
                  styles.archiveCard,
                  isPinned && styles.archiveCardHighlighted,
                ]}
                onPress={() => togglePinned(entry.index)}
              >
                <Text style={styles.archiveCardName}>
                  #{entry.index} {entry.hero}
                </Text>
                <Text style={styles.archiveCardMeta}>
                  {entry.city} • {entry.era} • {entry.team}
                </Text>
                <Text style={styles.archiveCardNote}>{entry.note}</Text>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}
