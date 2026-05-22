# Project Nyra - Theme System

This webapp uses a dynamic theme system based on **next-themes** and **Shadcn UI (Tailwind CSS v4)**. Themes are defined as CSS classes containing variables that map to Shadcn tokens.

## 🏛 Adding a New Theme

To add a new theme to the Project Nyra webapp, follow these two steps:

### 1. Define the CSS Variables

Add a new class to `apps/projectnyra/src/app/globals.css`. You can copy the variables from a tweakcn.com export.

Example:

```css
.my-new-theme {
  --background: oklch(0.1 0.01 250);
  --foreground: oklch(0.9 0.02 250);
  --primary: oklch(0.6 0.2 250);
  /* ... other shadcn variables */
}
```

### 2. Register the Theme

Add the theme object to the `themes` array in `apps/projectnyra/src/config/themes.ts`.

Example:

```typescript
export const themes = [
  // ... existing themes
  {
    value: "my-new-theme", // Must match the CSS class name
    label: "My New Theme",
    color: "oklch(0.6 0.2 250)", // Used in the theme switcher UI
  },
] as const;
```

The system will automatically:

- Add the theme to the **Theme Switcher** dropdown.
- Register the theme with the **ThemeProvider**.
- Allow the theme to be persisted in the user's browser.

## 🛠 Default Theme

The default theme is set in `apps/projectnyra/src/config/themes.ts` via the `DEFAULT_THEME` constant. Currently, it is set to **Apotheosis**.

## 🎨 Best Practices

- **Use Theme Variables**: When building new components, always use Tailwind classes that reference theme variables (e.g., `bg-background`, `text-primary`, `border-border`) rather than hardcoded colors (e.g., `bg-slate-900`).
- **Dark Mode**: All Project Nyra themes are dark-mode centric by default.
