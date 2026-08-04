import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import type { HeroSummary } from "../src/api/heroes";
import { useArchive } from "../src/hooks/useArchive";
import { useHeroes } from "../src/hooks/useHeroes";



export default function Index() {
  const { heroes, status, error, reload } = useHeroes();

  if (status === "loading") {
    return (
      <View style={styles.stateContainer} testID="heroes-loading">
        <ActivityIndicator size="large" />
        <Text style={styles.stateText}>Loading heroes…</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.stateContainer} testID="heroes-error">
        <Text style={styles.stateTitle}>Could not load heroes</Text>
        <Text style={styles.stateText}>{error}</Text>
        <Pressable style={styles.stateButton} onPress={reload} testID="heroes-retry">
          <Text style={styles.stateButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return <HeroDirectory superheroes={heroes} />;
}

// The screen itself. It takes the roster as a prop and knows nothing about
// where it came from, which is what makes it renderable in a test without a
// network.
function HeroDirectory({ superheroes }: { superheroes: HeroSummary[] }) {
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
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  stateTitle: { fontSize: 18, fontWeight: "700" },
  stateText: { fontSize: 14, opacity: 0.7, textAlign: "center" },
  stateButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },
  stateButtonText: { color: "#fff", fontWeight: "600" },
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





function HeroArchivePanel() {
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<
    "All" | "Avengers" | "Justice League"
  >("All");
  const [sortMode, setSortMode] = useState<"index" | "hero" | "era">("index");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [pinnedIndexes, setPinnedIndexes] = useState<number[]>([]);

  // The search box and the team filter are arguments to the query, not a pass
  // over an array this component holds. 1,400 rows used to be a string literal
  // in this file, re-split and re-filtered on every keystroke; Postgres now
  // does the filtering and only the matches cross the network.
  const { entries: filtered } = useArchive({ search: query, team: teamFilter });

  // Sorting stays here on purpose. It reorders what came back rather than
  // choosing what comes back, so it costs one pass over the rows already on
  // screen and saves a round trip every time the user flips the order.
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
