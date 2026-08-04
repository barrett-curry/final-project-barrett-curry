import { fireEvent, render, screen } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import Detail from "../app/detail";
import Index from "../app/index";
import React from "react";

describe("Expo superhero app", () => {
  const mockedRouter = router as { back: jest.Mock; push: jest.Mock };
  const mockedUseLocalSearchParams = useLocalSearchParams as jest.Mock;

  beforeEach(() => {
    mockedRouter.back.mockClear();
    mockedRouter.push.mockClear();
    mockedUseLocalSearchParams.mockReset();
  });

  it("renders the directory controls on the home screen", () => {
    render(<Index />);

    expect(screen.getByText("🦸‍♂️ Superhero Directory 🦸‍♀️")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("Search by hero or real name"),
    ).toBeTruthy();
    expect(screen.getByTestId("team-filter-All")).toBeTruthy();
    expect(screen.getByTestId("team-filter-Avengers")).toBeTruthy();
    expect(screen.getByTestId("team-filter-Justice League")).toBeTruthy();
  });

  it("shows the full roster by default", () => {
    render(<Index />);

    expect(screen.getByText("Spider-Man")).toBeTruthy();
    expect(screen.getByText("Wonder Woman")).toBeTruthy();
    expect(screen.getAllByText("Martian Manhunter").length).toBeGreaterThan(0);
    expect(screen.getByText("First hero in list: Spider-Man")).toBeTruthy();
    expect(screen.getByTestId("featured-hero-name")).toBeTruthy();
    expect(screen.getByText("Team Breakdown")).toBeTruthy();
  });

  it("filters heroes by search and team", () => {
    render(<Index />);

    fireEvent.changeText(screen.getByTestId("hero-search-input"), "Wayne");
    expect(screen.getByText("Batman")).toBeTruthy();
    expect(screen.queryByText("Spider-Man")).toBeNull();

    fireEvent.press(screen.getByTestId("team-filter-Avengers"));
    expect(screen.queryByText("Batman")).toBeNull();
    expect(screen.getByText(/0 of 18 heroes shown/)).toBeTruthy();
  });

  it("shows an empty state when the search has no matches", () => {
    render(<Index />);

    fireEvent.changeText(screen.getByTestId("hero-search-input"), "Zatanna");

    expect(
      screen.getByText("No heroes match the current search and team filters."),
    ).toBeTruthy();
  });

  it("sorts the roster alphabetically when the name sort is selected", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("sort-mode-name"));

    expect(screen.getByText("First hero in list: Aquaman")).toBeTruthy();
  });

  it("switches the featured hero when the featured mode changes", () => {
    render(<Index />);

    expect(screen.getByText("Spider-Man")).toBeTruthy();

    fireEvent.press(screen.getByTestId("featured-mode-random"));

    expect(screen.getByTestId("featured-hero-name")).toBeTruthy();
    expect(screen.getByText(/Featured Hero/)).toBeTruthy();
  });

  it("lets the user favorite a hero and filter to favorites only", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("favorite-button-1"));

    expect(screen.getByText("Favorites: 1")).toBeTruthy();

    fireEvent.press(screen.getByTestId("favorites-only-toggle"));

    expect(screen.getByText("Spider-Man")).toBeTruthy();
    expect(screen.queryByText("Wonder Woman")).toBeNull();
    expect(screen.getByText("First hero in list: Spider-Man")).toBeTruthy();
  });

  it("shows all team counts in the breakdown panel", () => {
    render(<Index />);

    expect(screen.getByText("Avengers: 9")).toBeTruthy();
    expect(screen.getByText("Justice League: 9")).toBeTruthy();
  });

  it("navigates to the detail screen from a hero card", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("hero-card-1"));

    expect(mockedRouter.push).toHaveBeenCalledWith({
      pathname: "/detail",
      params: { id: 1 },
    });
  });

  it("snaps away part of the roster", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.1);

    render(<Index />);

    fireEvent.press(screen.getByText("🫰 Thanos Snap"));

    expect(screen.getByText("⏪ Undo Snap")).toBeTruthy();
    expect(screen.getByText(/dusted/)).toBeTruthy();

    randomSpy.mockRestore();
  });

  it("renders hero details and allows returning to the directory", () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: "1" });

    render(<Detail />);

    expect(screen.getByText("Spider-Man")).toBeTruthy();
    expect(screen.getByText("Peter Parker")).toBeTruthy();
    expect(screen.getByText("Power Summary")).toBeTruthy();
    expect(screen.getByText(/Power score: 42\/60/)).toBeTruthy();
    expect(screen.getByText("Origin Story")).toBeTruthy();
    expect(screen.getByText("Powers & Abilities")).toBeTruthy();

    fireEvent.press(screen.getByTestId("back-button"));
    expect(mockedRouter.back).toHaveBeenCalled();
  });

  it("renders the not found state for an unknown hero id", () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: "999" });

    render(<Detail />);

    expect(screen.getByText("Hero not found")).toBeTruthy();
  });

  it("renders a hero who has no stat block instead of claiming they do not exist", () => {
    // Regression test. The directory listed eighteen heroes but the detail
    // screen read from a hardcoded object holding eight, so tapping any of the
    // other ten showed "Hero not found" for a hero visible on the previous
    // screen. Both screens now read the same source.
    mockedUseLocalSearchParams.mockReturnValue({ id: "18" });

    render(<Detail />);

    expect(screen.queryByText("Hero not found")).toBeNull();
    expect(screen.getByText("No stat block on file for this hero.")).toBeTruthy();
  });

  it("shows the power score the API computed rather than recomputing it", () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: "1" });

    render(<Detail />);

    // 8 + 7 + 9 + 6 + 4 + 8. One definition of "how strong is this", on the
    // server, instead of the client and the server each having their own.
    expect(screen.getByText(/Power score: 42\/60/)).toBeTruthy();
  });

  it("navigates to an ally detail page from the hero page", () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: "1" });

    render(<Detail />);

    fireEvent.press(screen.getByText("Iron Man →"));

    expect(mockedRouter.push).toHaveBeenCalledWith({
      pathname: "/detail",
      params: { id: 3 },
    });
  });

  it("renders the archive panel with the full seeded count", () => {
    render(<Index />);

    expect(screen.getByText("Hero Archive")).toBeTruthy();
    expect(screen.getByTestId("archive-count")).toBeTruthy();
    expect(screen.getByText("1400 archived briefings")).toBeTruthy();
    expect(screen.getByText("0 pinned")).toBeTruthy();
  });

  it("filters archive entries by hero name", () => {
    render(<Index />);

    fireEvent.changeText(
      screen.getByTestId("archive-search-input"),
      "Doctor Strange",
    );

    expect(screen.getByText("#13 Doctor Strange")).toBeTruthy();
    expect(screen.queryByText("#1 Spider-Man")).toBeNull();
  });

  it("filters archive entries by note text", () => {
    render(<Index />);

    fireEvent.changeText(screen.getByTestId("archive-search-input"), "1400");

    expect(screen.getByText("#1400 Cyborg")).toBeTruthy();
  });

  it("filters archive entries by city", () => {
    render(<Index />);

    fireEvent.changeText(
      screen.getByTestId("archive-search-input"),
      "Gotham City",
    );

    expect(screen.getByText("#4 Batman")).toBeTruthy();
  });

  it("shows an empty archive state for unknown terms", () => {
    render(<Index />);

    fireEvent.changeText(
      screen.getByTestId("archive-search-input"),
      "Atlantis Prime",
    );

    expect(screen.getByText("No archive entries match.")).toBeTruthy();
  });

  it("filters archive entries by Avengers team", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("archive-team-Avengers"));

    expect(screen.getByText("700 archived briefings")).toBeTruthy();
    expect(screen.getByText("#1 Spider-Man")).toBeTruthy();
  });

  it("filters archive entries by Justice League team", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("archive-team-Justice League"));

    expect(screen.getByText("700 archived briefings")).toBeTruthy();
    expect(screen.getByText("#2 Wonder Woman")).toBeTruthy();
  });

  it("sorts archive entries alphabetically by hero", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("archive-sort-hero"));

    expect(screen.getByText("#8 Aquaman")).toBeTruthy();
    expect(screen.queryByText("#1 Spider-Man")).toBeNull();
  });

  it("sorts archive entries by era", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("archive-sort-era"));

    expect(screen.getByText("#4 Batman")).toBeTruthy();
    expect(screen.queryByText("#1 Spider-Man")).toBeNull();
  });

  it("advances the archive spotlight", () => {
    render(<Index />);

    expect(
      screen.getByText("Spotlight: #1 Spider-Man in New York"),
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId("archive-spotlight-next"));

    expect(
      screen.getByText("Spotlight: #2 Wonder Woman in Themyscira"),
    ).toBeTruthy();
  });

  it("pins an archive entry and increments the counter", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("archive-entry-1"));

    expect(screen.getByText("1 pinned")).toBeTruthy();
  });

  it("pins multiple archive entries", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("archive-entry-1"));
    fireEvent.press(screen.getByTestId("archive-entry-2"));

    expect(screen.getByText("2 pinned")).toBeTruthy();
  });

  it("unpins an archive entry when pressed again", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("archive-entry-1"));
    fireEvent.press(screen.getByTestId("archive-entry-1"));

    expect(screen.getByText("0 pinned")).toBeTruthy();
  });

  it("keeps the featured hero panel visible", () => {
    render(<Index />);

    expect(screen.getByTestId("featured-hero-name")).toBeTruthy();
    expect(screen.getByText("Featured Hero")).toBeTruthy();
  });

  it("switches the featured hero back to top power mode", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);

    render(<Index />);

    fireEvent.press(screen.getByTestId("featured-mode-random"));
    fireEvent.press(screen.getByTestId("featured-mode-power"));

    expect(screen.getByText("Spider-Man")).toBeTruthy();

    randomSpy.mockRestore();
  });

  it("updates the featured hero when random mode is selected", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);

    render(<Index />);

    fireEvent.press(screen.getByTestId("featured-mode-random"));

    expect(screen.getByTestId("featured-hero-name").props.children).toBe(
      "Spider-Man",
    );

    randomSpy.mockRestore();
  });

  it("shows the favorite count after selecting a hero", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("favorite-button-3"));

    expect(screen.getByText("Favorites: 1")).toBeTruthy();
  });

  it("filters to favorites only after starring one hero", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("favorite-button-1"));
    fireEvent.press(screen.getByTestId("favorites-only-toggle"));

    expect(screen.getByText("Spider-Man")).toBeTruthy();
    expect(screen.queryByText("Wonder Woman")).toBeNull();
  });

  it("keeps the sort-by-name mode working", () => {
    render(<Index />);

    fireEvent.press(screen.getByTestId("sort-mode-name"));

    expect(screen.getByText("First hero in list: Aquaman")).toBeTruthy();
  });

  it("keeps the thanos snap flow working", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.1);

    render(<Index />);

    fireEvent.press(screen.getByText("🫰 Thanos Snap"));

    expect(screen.getByText("⏪ Undo Snap")).toBeTruthy();
    expect(screen.getByText(/dusted/)).toBeTruthy();

    randomSpy.mockRestore();
  });
});
