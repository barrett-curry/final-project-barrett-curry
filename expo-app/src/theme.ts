// The design tokens for the app.
//
// Every color, space, and size the UI uses is named here. The screens had
// roughly forty hardcoded hex values between them — six different greys doing
// the job of two, and "#2c3e50" written out fourteen times — which makes a
// consistent look impossible to hold and a theme change impossible to make.
//
// Naming them by role rather than by value is the point: `colors.muted` says
// what the color is for, so a component reading it stays correct when the value
// changes. `#7f8c8d` says nothing and has to be changed everywhere at once.

export const colors = {
  // Surfaces, darkest to lightest. Three levels is enough to build depth and
  // few enough that they stay distinguishable.
  background: "#0B0E14",
  surface: "#151A23",
  raised: "#1C2230",
  line: "#262E3D",
  lineStrong: "#36415A",

  text: "#E8EDF5",
  muted: "#93A1B5",
  faint: "#6B7A90",

  // The two teams get their own colors, which is what makes a roster of
  // eighteen scannable — you can see the split without reading a word.
  avengers: "#E23636",
  justiceLeague: "#3B7DD8",

  accent: "#FFC542",
  accentDim: "#8A6A1F",

  danger: "#FF5C5C",
  onAccent: "#12161F",
} as const;

/** The team colors, by the exact strings the API returns. */
export const teamColor = (team: string) =>
  team === "Avengers" ? colors.avengers : colors.justiceLeague;

// A 4px scale. Arbitrary spacing is the most common reason a layout looks
// unconsidered — 13px here and 15px there reads as noise even when nobody can
// name why.
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

// A type scale with real gaps between steps. The old styles used 12, 13, 14,
// 15, 16 and 18 — six sizes so close together that none of them established a
// hierarchy.
export const font = {
  micro: 11,
  small: 13,
  body: 15,
  large: 17,
  title: 22,
  display: 30,
} as const;
