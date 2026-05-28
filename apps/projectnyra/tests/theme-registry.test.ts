import {
  DEFAULT_THEME,
  LANDING_DEFAULT_THEME,
  THEME_REGISTRY,
  WEBAPP_DEFAULT_THEME,
  resolveTheme,
} from "../src/config/themes";

describe("theme registry", () => {
  it("keeps prompted surface defaults explicit", () => {
    expect(LANDING_DEFAULT_THEME).toBe("apotheosis");
    expect(WEBAPP_DEFAULT_THEME).toBe("mint-midnight");
    expect(DEFAULT_THEME).toBe(WEBAPP_DEFAULT_THEME);
  });

  it("contains unique theme values", () => {
    const values = THEME_REGISTRY.map((theme) => theme.value);

    expect(new Set(values).size).toBe(values.length);
  });

  it("falls back to the webapp default for unknown themes", () => {
    expect(resolveTheme(undefined)).toBe(WEBAPP_DEFAULT_THEME);
    expect(resolveTheme("not-a-theme")).toBe(WEBAPP_DEFAULT_THEME);
    expect(resolveTheme("apotheosis")).toBe("apotheosis");
  });
});
