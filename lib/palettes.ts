export const PALETTES = [
  { id: "blush", label: "Blush and plum", bg: "#e8dfe0", accent: "#8a5566" },
  { id: "mist", label: "Mist and blue", bg: "#e0e5ec", accent: "#3f66a0" },
  { id: "sage", label: "Sage and forest", bg: "#e1e6df", accent: "#3f7055" },
  { id: "sand", label: "Sand and terracotta", bg: "#ece4d9", accent: "#9c4f2e" },
  { id: "lilac", label: "Lilac and violet", bg: "#e6e3ee", accent: "#5b4bb7" },
  { id: "night", label: "Charcoal and mint", bg: "#2a2d32", accent: "#7fd1b9" },
] as const;
export type PaletteId = (typeof PALETTES)[number]["id"];
export const isPalette = (v: unknown): v is PaletteId => PALETTES.some((p) => p.id === v);
