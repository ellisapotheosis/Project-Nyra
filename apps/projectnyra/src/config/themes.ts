export const THEME_REGISTRY = [
  {
    value: "nebula-core",
    label: "Nebula Core",
    color: "oklch(0.58 0.25 260)", // Placeholder blue
  },
  {
    value: "violet-singularity",
    label: "Violet Singularity",
    color: "oklch(0.55 0.29 301)", // Placeholder violet
  },
  {
    value: "cyan-halo-indigo",
    label: "Cyan Halo Indigo",
    color: "oklch(0.88 0.18 166)", // Placeholder cyan
  },
  {
    value: "mint-singularity",
    label: "Mint Singularity",
    color: "oklch(0.93 0.03 285)", // Placeholder mint
  },
  {
    value: "xulbux-neon-void",
    label: "Xulbux Neon Void",
    color: "oklch(0.45 0.3 320)", // Placeholder neon
  },
  {
    value: "apotheosis",
    label: "Apotheosis",
    color: "oklch(0.5038 0.2937 285.3753)",
  },
  {
    value: "mint-midnight",
    label: "Mint Midnight",
    color: "oklch(0.8871 0.1828 166.5465)",
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

export type ThemeValue = (typeof THEME_REGISTRY)[number]["value"];

export const LANDING_DEFAULT_THEME: ThemeValue = "nebula-core";
export const WEBAPP_DEFAULT_THEME: ThemeValue = "nebula-core";

export const themes = THEME_REGISTRY;
export const DEFAULT_THEME: ThemeValue = WEBAPP_DEFAULT_THEME;

export function resolveTheme(value: string | undefined): ThemeValue {
  return (
    THEME_REGISTRY.find((theme) => theme.value === value)?.value ??
    DEFAULT_THEME
  );
}
