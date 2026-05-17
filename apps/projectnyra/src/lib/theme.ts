/**
 * Project Nyra Neural Command Deck — 2142
 * Premium Cyberpunk Mortgage Operations Theme
 * Dark-mode-first, Frosted Obsidian, Sacred Geometry Accents
 */

export const nyraTheme = {
  // Core Colors
  colors: {
    // Deep Void Black Background
    void: {
      50: "#0f0f12",
      100: "#0a0a0d",
      950: "#050505", // Primary background
    },

    // Frosted Obsidian (translucent blacks)
    obsidian: {
      50: "#1a1a1f",
      100: "#15151a",
      200: "#10101a",
      300: "#0d0d15",
      400: "#0a0a0f",
      500: "#0a0a0f",
      600: "#080810",
      700: "#060608",
      800: "#050505",
      900: "#000000",
    },

    // Primary Accents - Electric Violet & Hot Pink Duality
    violet: {
      50: "#f3f0ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#2e0854", // Deep electric violet
      electric: "#6f3de9", // Electric violet for UI
    },

    hotpink: {
      50: "#fff0f9",
      100: "#ffe0f2",
      200: "#ffc0e5",
      300: "#ff81d0",
      400: "#ff40bb",
      500: "#ff1fa3",
      600: "#f3108e",
      700: "#d90a6f",
      800: "#b40158",
      900: "#7a0137",
      950: "#ff006e", // Hot pink accent
    },

    // Secondary Accents - Seafoam, Turquoise, Cyan
    seafoam: {
      50: "#f0fdf9",
      100: "#e0fdf4",
      200: "#c0fbe8",
      300: "#88f7e3",
      400: "#4ef4d5",
      500: "#2ee9d7",
      600: "#14b8a6",
      700: "#0d8774",
      800: "#0a6959",
      900: "#084c47",
      950: "#007a67", // Seafoam grid accent
    },

    turquoise: {
      50: "#f0fdff",
      100: "#e0fbff",
      200: "#b3f5ff",
      300: "#67e8f9",
      400: "#22d3ee",
      500: "#06b6d4",
      600: "#0891b2",
      700: "#0e7490",
      800: "#155e75",
      900: "#164e63",
      950: "#00d9ff", // Bright turquoise particles
    },

    cyan: {
      50: "#ecf9ff",
      100: "#d9f3ff",
      200: "#b3e6ff",
      300: "#7dd3ff",
      400: "#43bfff",
      500: "#00a8e8",
      600: "#0088cc",
      700: "#006ba3",
      800: "#004d7a",
      900: "#003d66",
      950: "#0066cc", // Neon cyan
    },

    // Neon Blue
    neon: {
      blue: "#00d9ff",
      pink: "#ff006e",
      violet: "#6f3de9",
      green: "#00f5a0", // System health indicator
      red: "#ff4757", // Alerts/errors
      yellow: "#ffc857", // Warnings
      gold: "#daa520", // Success/funded
    },

    // Status Colors
    status: {
      success: "#10b981", // Green
      warning: "#f59e0b", // Amber
      error: "#ef4444", // Red
      info: "#3b82f6", // Blue
      pending: "#8b5cf6", // Purple
      active: "#00d9ff", // Cyan
      inactive: "#6b7280", // Gray
    },

    // Neutral for text & borders
    neutral: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      950: "#030712",
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "sans-serif",
      ],
      mono: [
        "Monaspace Neon",
        "JetBrains Mono",
        "Fira Code",
        "Courier New",
        "monospace",
      ],
      display: ["Orbitron", "Space Mono", "Courier Prime", "monospace"],
    },
  },

  // Status indicators
  status: {
    online: "#10b981",
    offline: "#6b7280",
    warning: "#f59e0b",
    error: "#ef4444",
    pending: "#8b5cf6",
  },
} as const;

export type NyraTheme = typeof nyraTheme;
