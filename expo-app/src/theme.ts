// The design tokens for the app.
//
// Named by role rather than by value, so a component reading `colors.muted`
// stays correct when the value changes. `#7f8c8d` says nothing and has to be
// changed everywhere at once.

export const colors = {
  // Surfaces. The steps are deliberately ~6 points of L* apart — the previous
  // ramp stepped by 4 and the levels were indistinguishable, so a card and the
  // page it sat on looked identical and the only thing separating them was a
  // hairline. Eighteen hairline rectangles on black reads as a wireframe.
  background: "#0C0F16",
  surface: "#161C27",
  raised: "#212936",
  line: "#2C3646",
  lineStrong: "#445066",
  hover: "#2A3342",

  // Dropped from #E8EDF5. At 16:1 on near-black, small text halates on OLED.
  text: "#DDE4EF",
  muted: "#A2AFC2",
  faint: "#77849A", // 4.52:1 — the old #6B7A90 was 4.00 and failed AA

  // The two teams are the one thing worth spending saturated color on: it is
  // what makes a roster of eighteen scannable without reading a word. Text and
  // fill are separate tokens rather than an alpha hack — `red + "22"`
  // composited to 3.59:1 on uppercase 11px, which is backwards for small text.
  avengers: "#FF8A7A",
  avengersBg: "#2E1A1C",
  justiceLeague: "#7FB2FF",
  justiceLeagueBg: "#16233A",

  // Was #FFC542, which sat only 11 L* below body text — functionally a second
  // white, and it was being spent on filter chips. Darker, and used as ink
  // rather than as fill.
  accent: "#E0A32B",
  accentSoft: "#2B2318",
  onAccent: "#0C0F16",

  danger: "#FF7A6E",
  onDanger: "#FFFFFF",
  dangerFill: "#C22B2B", // white on this is 5.72:1; the old red was 3.71:1

  // A single-hue ramp for stat bars. They previously reused the two team
  // colors as a magnitude scale, so on Iron Man's page the badge was red and
  // his strong stats were red — the same colors carrying two contradictory
  // meanings on one screen.
  statLow: "#4A5568",
  statMid: "#8A93A6",
  statHigh: "#E0A32B",
} as const;

export const teamColor = (team: string) =>
  team === "Avengers" ? colors.avengers : colors.justiceLeague;

export const teamFill = (team: string) =>
  team === "Avengers" ? colors.avengersBg : colors.justiceLeagueBg;

// A 4px scale. `section` exists because grouping comes from *unequal* space —
// every gap on the page was 12, so nothing grouped and the eye had no entry
// point.
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const font = {
  micro: 11,
  small: 13,
  body: 15,
  large: 17,
  title: 22,
  display: 30,
} as const;

export const layout = {
  // Nothing stopped the column before this, so on a 1400px browser window a
  // hero card was 1368px wide to hold "Real Name: Peter Parker".
  maxContentWidth: 1040,
  breakpoint: { md: 700, lg: 1100 },
} as const;
