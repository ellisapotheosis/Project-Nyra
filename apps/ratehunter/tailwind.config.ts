import type { Config } from "tailwindcss";

const withOpacity = (variable: string) =>
  (({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue === undefined) {
      return `var(${variable})`;
    }

    const opacity = Number(opacityValue);

    if (Number.isFinite(opacity)) {
      return `color-mix(in oklch, var(${variable}) ${opacity * 100}%, transparent)`;
    }

    return `var(${variable})`;
  }) as unknown as string;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: withOpacity("--border"),
        input: withOpacity("--input"),
        ring: withOpacity("--ring"),
        background: withOpacity("--background"),
        foreground: withOpacity("--foreground"),
        primary: {
          DEFAULT: withOpacity("--primary"),
          foreground: withOpacity("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withOpacity("--secondary"),
          foreground: withOpacity("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: withOpacity("--destructive"),
          foreground: withOpacity("--destructive-foreground"),
        },
        muted: {
          DEFAULT: withOpacity("--muted"),
          foreground: withOpacity("--muted-foreground"),
        },
        accent: {
          DEFAULT: withOpacity("--accent"),
          foreground: withOpacity("--accent-foreground"),
        },
        popover: {
          DEFAULT: withOpacity("--popover"),
          foreground: withOpacity("--popover-foreground"),
        },
        card: {
          DEFAULT: withOpacity("--card"),
          foreground: withOpacity("--card-foreground"),
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
        display: ["var(--font-serif)", "var(--font-display)", "monospace"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "gradient-text": "gradient-text 7s ease infinite",
        "shimmer-slide":
          "shimmer-slide var(--speed,2.6s) ease-in-out infinite alternate",
        marquee: "marquee var(--duration,40s) linear infinite",
        "marquee-vertical":
          "marquee-vertical var(--duration,40s) linear infinite",
      },
      keyframes: {
        "gradient-text": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "shimmer-slide": {
          to: { transform: "translateX(calc(100cqh + 100%))" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap,1.5rem)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap,1.5rem)))" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
