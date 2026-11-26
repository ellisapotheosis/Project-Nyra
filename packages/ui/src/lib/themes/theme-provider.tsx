"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  APP_THEME_STORAGE_KEY,
  getDefaultAppTheme,
  isNyraThemeId,
  type NyraThemeId,
} from "@/lib/themes/registry";

type ThemeContextValue = {
  theme: NyraThemeId;
  setTheme: (theme: NyraThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: NyraThemeId) {
  document.documentElement.dataset.nyraTheme = theme;
  document.documentElement.classList.add("dark");
}

function readStoredTheme(
  storageKey: string,
  fallbackTheme: NyraThemeId
): NyraThemeId {
  try {
    const storedTheme = window.localStorage.getItem(storageKey);

    return isNyraThemeId(storedTheme) ? storedTheme : fallbackTheme;
  } catch {
    return fallbackTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = getDefaultAppTheme(),
  storageKey = APP_THEME_STORAGE_KEY,
}: {
  children: ReactNode;
  defaultTheme?: NyraThemeId;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<NyraThemeId>(defaultTheme);

  useEffect(() => {
    const storedTheme = readStoredTheme(storageKey, defaultTheme);

    setThemeState(storedTheme);
    applyTheme(storedTheme);
  }, [defaultTheme, storageKey]);

  function setTheme(nextTheme: NyraThemeId) {
    setThemeState(nextTheme);
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useNyraTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useNyraTheme must be used inside ThemeProvider");
  }

  return context;
}
