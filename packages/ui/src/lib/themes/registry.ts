export const NYRA_THEMES = [
  {
    id: "midnight",
    label: "Midnight",
    role: "Conservative dark SaaS/admin-safe fallback",
  },
  {
    id: "mint-midnight",
    label: "Mint Midnight",
    role: "Authenticated broker webapp default",
  },
  {
    id: "mint-midnight-glow",
    label: "Mint Midnight Glow",
    role: "Labs/demo/investor/sizzle mode",
  },
  {
    id: "apotheosis",
    label: "Apotheosis",
    role: "Public landing default and premium brand theme",
  },
] as const;

export type NyraThemeId = (typeof NYRA_THEMES)[number]["id"];

export const APP_THEME_STORAGE_KEY = "nyra-theme";
export const DEFAULT_APP_THEME: NyraThemeId = "mint-midnight";
export const DEFAULT_MARKETING_THEME: NyraThemeId = "apotheosis";

export function isNyraThemeId(
  value: string | null | undefined
): value is NyraThemeId {
  return NYRA_THEMES.some((theme) => theme.id === value);
}

export function getDefaultAppTheme(): NyraThemeId {
  const configuredTheme = process.env.NEXT_PUBLIC_APP_DEFAULT_THEME;

  return isNyraThemeId(configuredTheme) ? configuredTheme : DEFAULT_APP_THEME;
}
