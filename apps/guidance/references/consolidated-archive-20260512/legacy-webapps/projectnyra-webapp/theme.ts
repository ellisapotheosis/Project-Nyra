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
      50: '#0f0f12',
      100: '#0a0a0d',
      950: '#050505', // Primary background
    },

    // Frosted Obsidian (translucent blacks)
    obsidian: {
      50: '#1a1a1f',
      100: '#15151a',
      200: '#10101a',
      300: '#0d0d15',
      400: '#0a0a0f',
      500: '#0a0a0f',
      600: '#080810',
      700: '#060608',
      800: '#050505',
      900: '#000000',
    },

    // Primary Accents - Electric Violet & Hot Pink Duality
    violet: {
      50: '#f3f0ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e0854', // Deep electric violet
      electric: '#6f3de9', // Electric violet for UI
    },

    hotpink: {
      50: '#fff0f9',
      100: '#ffe0f2',
      200: '#ffc0e5',
      300: '#ff81d0',
      400: '#ff40bb',
      500: '#ff1fa3',
      600: '#f3108e',
      700: '#d90a6f',
      800: '#b40158',
      900: '#7a0137',
      950: '#ff006e', // Hot pink accent
    },

    // Secondary Accents - Seafoam, Turquoise, Cyan
    seafoam: {
      50: '#f0fdf9',
      100: '#e0fdf4',
      200: '#c0fbe8',
      300: '#88f7e3',
      400: '#4ef4d5',
      500: '#2ee9d7',
      600: '#14b8a6',
      700: '#0d8774',
      800: '#0a6959',
      900: '#084c47',
      950: '#007a67', // Seafoam grid accent
    },

    turquoise: {
      50: '#f0fdff',
      100: '#e0fbff',
      200: '#b3f5ff',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#00d9ff', // Bright turquoise particles
    },

    cyan: {
      50: '#ecf9ff',
      100: '#d9f3ff',
      200: '#b3e6ff',
      300: '#7dd3ff',
      400: '#43bfff',
      500: '#00a8e8',
      600: '#0088cc',
      700: '#006ba3',
      800: '#004d7a',
      900: '#003d66',
      950: '#0066cc', // Neon cyan
    },

    // Neon Blue
    neon: {
      blue: '#00d9ff',
      pink: '#ff006e',
      violet: '#6f3de9',
      green: '#00f5a0', // System health indicator
      red: '#ff4757', // Alerts/errors
      yellow: '#ffc857', // Warnings
      gold: '#daa520', // Success/funded
    },

    // Status Colors
    status: {
      success: '#10b981', // Green
      warning: '#f59e0b', // Amber
      error: '#ef4444', // Red
      info: '#3b82f6', // Blue
      pending: '#8b5cf6', // Purple
      active: '#00d9ff', // Cyan
      inactive: '#6b7280', // Gray
    },

    // Neutral for text & borders
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
      mono: [
        'Monaspace Neon',
        'JetBrains Mono',
        'Fira Code',
        'Courier New',
        'monospace',
      ],
      display: [
        'Orbitron',
        'Space Mono',
        'Courier Prime',
        'monospace',
      ],
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    64: '16rem',
  },

  // Borders & Shadows
  borders: {
    radius: {
      none: '0',
      xs: '0.25rem',
      sm: '0.375rem',
      base: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      full: '9999px',
    },
    width: {
      none: '0',
      thin: '0.5px',
      default: '1px',
      medium: '2px',
      thick: '3px',
    },
  },

  shadows: {
    // Glass/holographic effect
    glass: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
    glow: '0 0 20px rgba(111, 61, 233, 0.3)',
    glow_pink: '0 0 20px rgba(255, 0, 110, 0.3)',
    glow_cyan: '0 0 20px rgba(0, 217, 255, 0.3)',

    // Standard shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.7), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.9), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
  },

  // Opacity
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },

  // Animations
  animations: {
    glow: 'glow 2s ease-in-out infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    shimmer: 'shimmer 2s linear infinite',
    particle_float: 'particle-float 8s ease-in-out infinite',
    rotate_slow: 'rotate-slow 20s linear infinite',
    rotate_reverse: 'rotate-reverse 25s linear infinite',
    breathe: 'breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
} as const;

export const globalStyles = `
  @import url('https://rsms.me/inter/inter.css');
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap');

  @keyframes glow {
    0%, 100% { filter: drop-shadow(0 0 8px rgba(111, 61, 233, 0.3)); }
    50% { filter: drop-shadow(0 0 16px rgba(111, 61, 233, 0.6)); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes shimmer {
    0% { background-position: -1200px 0; }
    100% { background-position: 1200px 0; }
  }

  @keyframes particle-float {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-200px) translateX(100px); opacity: 0; }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes rotate-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes breathe {
    0%, 100% { opacity: 0.3; transform: scale(0.95); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }

  body {
    background-color: #050505;
    color: #e5e7eb;
    font-family: 'Inter', sans-serif;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #0a0a0f;
  }

  ::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

export type NyraTheme = typeof nyraTheme;
