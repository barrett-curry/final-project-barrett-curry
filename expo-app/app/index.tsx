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
import { colors, font, radius, space, teamColor } from "../src/theme";
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
    // One scroll container for the whole screen. It was a fixed-height View
    // with a ScrollView inside it, so the page could not scroll and the inner
    // list only got whatever vertical space the panels above it left over -
    // which, once the featured, team, and archive panels were stacked, was
    // nothing. Everything scrolls together now.
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>🦸‍♂️ Superhero Directory 🦸‍♀️</Text>

      <TextInput
        testID="hero-search-input"
        style={styles.searchInput}
        placeholder="Search by hero or real name"
        placeholderTextColor={colors.faint}
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

      <View style={styles.scrollView}>
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
                <Text
                  style={[
                    styles.teamBadge,
                    { color: teamColor(hero.team), backgroundColor: teamColor(hero.team) + "22" },
                  ]}
                >
                  {hero.team}
                </Text>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // --- Async states -------------------------------------------------------
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: space.xl,
    gap: space.md,
    backgroundColor: colors.background,
  },
  stateTitle: { fontSize: font.large, fontWeight: "700", color: colors.text },
  stateText: { fontSize: font.body, color: colors.muted, textAlign: "center" },
  stateButton: {
    marginTop: space.sm,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  stateButtonText: { color: colors.onAccent, fontWeight: "700" },

  // --- Shell --------------------------------------------------------------
  container: { flex: 1, backgroundColor: colors.background },
  containerContent: {
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    // Room to scroll past the last card rather than ending flush against it.
    paddingBottom: space.xxl,
  },
  title: {
    fontSize: font.display,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: space.lg,
  },

  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    color: colors.text,
    fontSize: font.body,
    marginBottom: space.md,
  },

  // --- Filter and sort pills ----------------------------------------------
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginBottom: space.md,
  },
  filterButton: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  // Selection is shown with a filled background rather than only a color
  // change, so it survives being looked at quickly.
  filterButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterButtonText: { color: colors.muted, fontSize: font.small, fontWeight: "600" },
  filterButtonTextActive: { color: colors.onAccent },

  // --- Featured hero ------------------------------------------------------
  featuredPanel: {
    backgroundColor: colors.raised,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  featuredLabel: {
    fontSize: font.micro,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.accent,
  },
  featuredName: {
    fontSize: font.title,
    fontWeight: "800",
    color: colors.text,
    marginTop: space.xs,
  },
  featuredMeta: { fontSize: font.small, color: colors.muted, marginTop: 2 },
  featuredButtonRow: { flexDirection: "row", gap: space.sm, marginTop: space.md },
  featuredButton: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  featuredButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  featuredButtonText: { color: colors.muted, fontSize: font.small, fontWeight: "600" },
  featuredButtonTextActive: { color: colors.onAccent },

  // --- Team breakdown -----------------------------------------------------
  teamPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
  },
  teamPanelTitle: {
    fontSize: font.micro,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.faint,
    marginBottom: space.sm,
  },
  teamPanelItem: { color: colors.text, fontSize: font.body, paddingVertical: 2 },

  // --- Hero cards ---------------------------------------------------------
  scrollView: { marginTop: space.md },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingRight: space.xl,
  },
  heroName: { fontSize: font.large, fontWeight: "800", color: colors.text, flexShrink: 1 },
  // Tinted per team at the call site — the roster is only scannable if the two
  // teams look different.
  teamBadge: {
    fontSize: font.micro,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  realName: { color: colors.muted, fontSize: font.small, marginTop: space.xs },
  powersLabel: {
    fontSize: font.micro,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.faint,
    marginTop: space.md,
    marginBottom: space.xs,
  },
  powerItem: { color: colors.text, fontSize: font.small, lineHeight: 20 },
  tapHint: { color: colors.accent, fontSize: font.small, fontWeight: "600", marginTop: space.md },

  favoriteButton: {
    position: "absolute",
    top: space.md,
    right: space.md,
    // 44pt target without changing the layout around it.
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  favoriteButtonText: { fontSize: 22, color: colors.avengers },

  // --- Snap controls ------------------------------------------------------
  controlsContainer: { flexDirection: "row", gap: space.sm, marginBottom: space.md },
  snapButton: {
    flex: 1,
    backgroundColor: colors.avengers,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: "center",
  },
  snapButtonDisabled: { backgroundColor: colors.line },
  snapButtonText: { color: colors.text, fontWeight: "700", fontSize: font.body },
  undoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: "center",
  },
  undoButtonText: { color: colors.text, fontWeight: "700", fontSize: font.body },

  // --- Counters -----------------------------------------------------------
  heroCount: { color: colors.muted, fontSize: font.small },
  leadHeroLabel: { color: colors.faint, fontSize: font.small, marginTop: 2 },
  favoriteCount: { color: colors.faint, fontSize: font.small, marginTop: 2 },
  emptyState: {
    color: colors.muted,
    fontSize: font.body,
    textAlign: "center",
    paddingVertical: space.xxl,
  },

  // --- Archive ------------------------------------------------------------
  archivePanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  archiveHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  archiveTitle: { fontSize: font.large, fontWeight: "800", color: colors.text },
  archiveCount: { fontSize: font.small, color: colors.muted },
  archiveControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginBottom: space.md,
  },
  archiveInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    color: colors.text,
    fontSize: font.small,
    marginBottom: space.sm,
  },
  archiveGrid: { gap: space.sm },
  archiveCard: {
    backgroundColor: colors.raised,
    borderRadius: radius.sm,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  archiveCardHighlighted: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim + "33",
  },
  archiveCardName: { fontWeight: "700", color: colors.text, marginBottom: 2 },
  archiveCardMeta: { color: colors.faint, fontSize: font.micro, marginBottom: space.xs },
  archiveCardNote: { color: colors.muted, fontSize: font.small },
  archiveEmpty: {
    color: colors.muted,
    fontSize: font.small,
    textAlign: "center",
    paddingVertical: space.xl,
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
        placeholderTextColor={colors.faint}
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
