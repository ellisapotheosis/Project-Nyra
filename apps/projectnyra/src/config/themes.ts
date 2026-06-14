export const themes = [
  {
    value: "apotheosis",
    label: "Apotheosis",
    color: "oklch(0.5038 0.2937 285.3753)", // Matches primary indigo
  },
  {
    value: "mint-midnight",
    label: "Mint Midnight",
    color: "oklch(0.8871 0.1828 166.5465)", // Matches seafoam
  },
  {
    value: "mint-midnight-glow",
    label: "Mint Midnight Glow",
    color: "oklch(0.8653 0.1475 204.0171)",
  },
  {
    value: "virtus",
    label: "Virtus",
    color: "oklch(0.9325 0.0337 285.7280)",
  },
] as const;

export type ThemeValue = (typeof themes)[number]["value"];

export const DEFAULT_THEME: ThemeValue = "apotheosis";
