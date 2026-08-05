import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";
import { useState } from "react";

import type { HeroSummary } from "../src/api/heroes";
import { Button, Pill, Screen, Section } from "../src/components";
import { HeroCard } from "../src/components/HeroCard";
import { colors, font, layout, radius, space } from "../src/theme";
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

  // 18 full-width cards is a 4,000pt column on a desktop browser.
  const { width } = useWindowDimensions();
  const columns = width >= layout.breakpoint.lg ? 3 : width >= layout.breakpoint.md ? 2 : 1;

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
    <Screen>
      <Text style={styles.title}>🦸‍♂️ Superhero Directory 🦸‍♀️</Text>

      <TextInput
        testID="hero-search-input"
        style={styles.searchInput}
        placeholder="Search by hero or real name"
        placeholderTextColor={colors.faint}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filters and sort were two wrapping rows of pills with ragged right
          edges at four different x-positions. One horizontally scrolling rail
          keeps every control mounted (which the tests require) on one line. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {(["All", "Avengers", "Justice League"] as const).map((team) => (
          <Pill
            key={team}
            testID={`team-filter-${team}`}
            label={team}
            selected={teamFilter === team}
            onPress={() => setTeamFilter(team)}
          />
        ))}
        <Pill
          testID="favorites-only-toggle"
          label="Favorites"
          selected={favoritesOnly}
          onPress={() => setFavoritesOnly((current) => !current)}
        />
        <View style={styles.railDivider} />
        {(["default", "name", "team"] as const).map((mode) => (
          <Pill
            key={mode}
            testID={`sort-mode-${mode}`}
            label={mode === "default" ? "Default Order" : `Sort ${mode}`}
            selected={sortMode === mode}
            onPress={() => setSortMode(mode)}
          />
        ))}
      </ScrollView>

      {/* The three counters were three stacked lines of grey at 2px leading,
          which read like console output someone forgot to delete. They are one
          wrapped strip now. They stay siblings rather than nested inside a
          parent Text — a wrapping Text's concatenated content would also match
          the tests' regex and getByText would find two elements. */}
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {displayedHeroes.length} of {visibleHeroes.length} heroes shown
          {isSnapped
            ? ` • ${snappedHeroes.length} dusted`
            : " • all heroes available"}
        </Text>
        <Text testID="lead-hero-label" style={styles.metaFaint}>
          First hero in list: {leadHeroName}
        </Text>
        <Text testID="favorites-count" style={styles.metaFaint}>
          Favorites: {favoriteHeroIds.length}
        </Text>
      </View>

      {/* The roster, first — it was previously below two screens of chrome. */}
      {displayedHeroes.length === 0 ? (
        <Text style={styles.emptyState}>
          No heroes match the current search and team filters.
        </Text>
      ) : (
        <View style={styles.grid}>
          {displayedHeroes.map((hero) => (
            <View
              key={hero.id}
              style={[
                styles.cell,
                { flexBasis: `${100 / columns}%`, maxWidth: `${100 / columns}%` },
              ]}
            >
              <HeroCard
                hero={hero}
                isFavorite={favoriteHeroIds.includes(hero.id)}
                testID={`hero-card-${hero.id}`}
                favoriteTestID={`favorite-button-${hero.id}`}
                onPress={() =>
                  router.push({ pathname: "/detail" as any, params: { id: hero.id } })
                }
                onToggleFavorite={() => toggleFavorite(hero.id)}
              />
            </View>
          ))}
        </View>
      )}

      {/* Snap is an easter egg that deletes half the content. It had the
          largest, reddest, full-width treatment on the screen — more weight
          than search. It sits with the counters it changes now. */}
      <View style={styles.snapRow}>
        <Button
          label={isSnapped ? "💀 Snapped!" : "🫰 Thanos Snap"}
          onPress={handleThanosSnap}
          disabled={isSnapped}
          variant={isSnapped ? "ghost" : "danger"}
        />
        {isSnapped && <Button label="⏪ Undo Snap" onPress={handleUndo} />}
      </View>

      {/* Below the roster: two panels that were competing with it for the top
          of the page. Featured is decoration on a screen with 18 items and a
          search box, not navigation. */}
      <View style={styles.footerBand}>
        <Section title="Featured Hero" style={styles.footerColumn}>
          <Text testID="featured-hero-name" style={styles.featuredName}>
            {featuredHero.name}
          </Text>
          <Text style={styles.metaText}>
            {featuredHero.team} • {featuredHero.powers.length} powers
          </Text>
          <View style={styles.footerControls}>
            <Pill
              testID="featured-mode-power"
              label="Top Power"
              selected={featuredMode === "topPower"}
              onPress={() => setFeaturedMode("topPower")}
            />
            <Pill
              testID="featured-mode-random"
              label="Stable Random"
              selected={featuredMode === "random"}
              onPress={() => {
                setFeaturedMode("random");
                setFeaturedHeroIndex(Math.floor(Math.random() * superheroes.length));
              }}
            />
          </View>
        </Section>

        <Section title="Team Breakdown" style={styles.footerColumn}>
          {Object.entries(teamTotals).map(([team, count]) => (
            <Text key={team} style={styles.teamPanelItem}>
              {team}: {count}
            </Text>
          ))}
        </Section>
      </View>

      <HeroArchivePanel />
    </Screen>
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
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  stateButtonText: { color: colors.text, fontWeight: "700" },

  // --- Header -------------------------------------------------------------
  // Was font.display (30) — the same size as a hero's name on the detail
  // screen, which flattened the hierarchy between parent and child routes.
  title: {
    fontSize: font.title,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: space.lg,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    minHeight: 48,
    color: colors.text,
    fontSize: font.body,
    marginBottom: space.md,
  },

  // --- Control rail -------------------------------------------------------
  rail: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingRight: space.lg },
  // Separates "which heroes" from "in what order".
  railDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.line,
    marginHorizontal: space.xs,
  },

  // --- Metadata strip -----------------------------------------------------
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.md,
    marginTop: space.lg,
    marginBottom: space.md,
  },
  metaText: { color: colors.muted, fontSize: font.small },
  metaFaint: { color: colors.faint, fontSize: font.small },

  // --- Roster grid --------------------------------------------------------
  // Padding gutters rather than `gap`, because percentage flex-basis plus gap
  // rounds up and overflows the row on web.
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.sm },
  cell: { padding: space.sm },
  emptyState: {
    color: colors.muted,
    fontSize: font.body,
    textAlign: "center",
    paddingVertical: space.section,
  },

  snapRow: { flexDirection: "row", gap: space.sm, marginTop: space.lg },

  // --- Footer band --------------------------------------------------------
  footerBand: { flexDirection: "row", flexWrap: "wrap", gap: space.xl, marginTop: space.section },
  footerColumn: { flexGrow: 1, flexBasis: 260, marginBottom: 0 },
  footerControls: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md },
  featuredName: {
    fontSize: font.title,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  teamPanelItem: { color: colors.text, fontSize: font.body, paddingVertical: 2 },

  // --- Archive ------------------------------------------------------------
  archivePanel: { marginTop: space.section },
  archiveHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    marginBottom: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  archiveTitle: { fontSize: font.large, fontWeight: "700", color: colors.text },
  archiveCount: { fontSize: font.small, color: colors.muted },
  archiveControls: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingRight: space.lg },
  archiveInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    minHeight: 44,
    color: colors.text,
    fontSize: font.small,
    marginBottom: space.sm,
  },
  archiveGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.xs, marginTop: space.md },
  archiveCell: { padding: space.xs, flexBasis: "50%", maxWidth: "50%" },
  archiveCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    cursor: "pointer",
  },
  archiveCardHighlighted: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  archiveCardName: { fontWeight: "700", color: colors.text, marginBottom: 2 },
  archiveCardMeta: { color: colors.faint, fontSize: font.micro, marginBottom: space.xs },
  archiveCardNote: { color: colors.muted, fontSize: font.small, lineHeight: 19 },
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

      {/* Horizontal rail, same as the roster's — seven pills in a wrapping row
          broke at ragged widths. "Next Spotlight" is an action rather than a
          toggle, so it is a Button; previously it was a pill identical to the
          six radio buttons beside it and there was no way to tell them apart. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.archiveControls}
      >
        {(["All", "Avengers", "Justice League"] as const).map((team) => (
          <Pill
            key={team}
            testID={`archive-team-${team}`}
            label={team}
            selected={teamFilter === team}
            onPress={() => setTeamFilter(team)}
          />
        ))}
        <View style={styles.railDivider} />
        {(["index", "hero", "era"] as const).map((mode) => (
          <Pill
            key={mode}
            testID={`archive-sort-${mode}`}
            label={mode}
            selected={sortMode === mode}
            onPress={() => setSortMode(mode)}
          />
        ))}
        <View style={styles.railDivider} />
        <Button
          testID="archive-spotlight-next"
          label="Next Spotlight"
          onPress={() => setSpotlightIndex((current) => current + 1)}
        />
      </ScrollView>

      <Text testID="archive-spotlight" style={styles.archiveCardMeta}>
        {spotlight
          ? `Spotlight: #${spotlight.index} ${spotlight.hero} in ${spotlight.city}`
          : "Spotlight: no matches"}
      </Text>

      <View style={styles.archiveGrid}>
        {sorted.length === 0 ? (
          <Text style={styles.archiveEmpty}>No archive entries match.</Text>
        ) : (
          // Was 12. Four is enough to show what the archive is; it is a
          // secondary panel, not the page.
          sorted.slice(0, 4).map((entry) => {
            const isPinned = pinnedIndexes.includes(entry.index);

            return (
              <View key={entry.index} style={styles.archiveCell}>
                <Pressable
                  testID={`archive-entry-${entry.index}`}
                  onPress={() => togglePinned(entry.index)}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.archiveCard,
                    hovered && { borderColor: colors.lineStrong },
                    isPinned && styles.archiveCardHighlighted,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.archiveCardName}>
                    #{entry.index} {entry.hero}
                  </Text>
                  <Text style={styles.archiveCardMeta}>
                    {entry.city} • {entry.era} • {entry.team}
                  </Text>
                  <Text style={styles.archiveCardNote} numberOfLines={2}>
                    {entry.note}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
