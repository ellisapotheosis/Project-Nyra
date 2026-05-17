import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#6366f1", // Indigo 500
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        turquoise: {
          400: "oklch(0.75 0.15 180)",
          500: "oklch(0.7 0.15 180)",
          600: "oklch(0.6 0.15 180)",
        },
        pink: {
          400: "oklch(0.7 0.25 350)",
          500: "oklch(0.65 0.25 350)",
          600: "oklch(0.55 0.25 350)",
        },
        secondary: {
          DEFAULT: "#14b8a6", // Seafoam
          700: "#334155", // Legacy slate compatibility
          800: "#1e293b",
          900: "#0f172a",
        },
        border: "rgba(255,255,255,0.1)",
        muted: {
          DEFAULT: "rgba(255,255,255,0.4)",
          foreground: "rgba(255,255,255,0.6)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
