# Command Palette Guide

The Command Palette is a powerful search and navigation interface that provides quick access to pages, leads, skills, and worker sessions throughout the Nyra application.

## Overview

The Command Palette implements a modern command interface similar to VS Code or GitHub, with:

- **Fuzzy search** across pages, leads, skills, and workers
- **Keyboard shortcuts** for efficient navigation
- **Categorized results** organized by type
- **Real-time filtering** as you type
- **Keyboard-driven navigation** with arrow keys and Enter

## Opening the Command Palette

### Keyboard Shortcut

```
Cmd+K (macOS)
Ctrl+K (Windows/Linux)
```

### Programmatically

```tsx
import { CommandPalette } from "@/components/CommandPalette";
import { useState } from "react";

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Commands</button>
      <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
```

## Usage

### Basic Navigation

1. Press `Cmd+K` or `Ctrl+K` to open
2. Start typing to search (e.g., "dashboard", "crm", "openclaw")
3. Use arrow keys to navigate results
4. Press `Enter` to select
5. Press `Escape` to close

### Command Categories

#### Navigation (Pages)

Jump to any major page in the application:

- Dashboard
- CRM
- Campaigns
- Quotes
- Nexus Router
- OpenClaw
- Memory
- Workers
- Tools

#### Skills

Launch AI skills:

- Rate Lookup - Get current mortgage rates
- Lead Score - Calculate lead quality
- Compliance Check - Run compliance validation

#### Workers

Access GPU worker dashboards:

- RTX 5090 - Complex reasoning (DeepSeek-R1, Llama 3.1)
- RTX 3090 Ti - General purpose
- RTX 3060 - Lightweight tasks (Ollama)

#### Recent

Quick access to recently visited pages (future feature)

## Search Behavior

### Fuzzy Matching

The search uses fuzzy matching to find results intelligently:

```tsx
// These all match "dashboard":
-"dashboard" - // Exact match
  "dash" - // Prefix match
  "d a s h"; // Fuzzy character match (lowest priority)
```

### Keyword Search

Commands can be searched by multiple keywords:

```tsx
{
  label: 'CRM',
  keywords: ['leads', 'contacts', 'customers'],
  // Matches: "crm", "leads", "contacts", "customers"
}
```

## Keyboard Shortcuts

| Key                | Action                 |
| ------------------ | ---------------------- |
| `Cmd+K` / `Ctrl+K` | Toggle Command Palette |
| `↑` / `↓`          | Navigate results       |
| `Enter`            | Select current item    |
| `Escape`           | Close Command Palette  |

## Component Props

```tsx
interface CommandPaletteProps {
  // Whether the palette is open
  isOpen?: boolean;

  // Callback when open state changes
  onOpenChange?: (open: boolean) => void;
}
```

## Hook: useCommandPalette

Manage Command Palette state programmatically:

```tsx
import { useCommandPalette } from "@/hooks/useCommandPalette";

export function MyComponent() {
  const { isOpen, open, close, toggle } = useCommandPalette();

  return (
    <>
      <button onClick={toggle}>{isOpen ? "Close" : "Open"} Palette</button>

      <button onClick={open}>Open</button>
      <button onClick={close}>Close</button>
    </>
  );
}
```

## Adding New Commands

To add custom commands, modify the `allCommands` array in `CommandPalette.tsx`:

```tsx
const customCommands: CommandItem[] = [
  {
    id: "custom-action",
    label: "My Custom Action",
    description: "Do something special",
    category: "navigation",
    icon: <Icon size={16} />,
    keywords: ["custom", "special"],
    onSelect: async () => {
      // Your custom logic here
      console.log("Action selected!");
      handleClose();
    },
  },
];
```

### CommandItem Interface

```tsx
interface CommandItem {
  id: string; // Unique identifier
  label: string; // Display name
  description?: string; // Help text
  category: CommandCategory; // Category for grouping
  icon: React.ReactNode; // Icon element
  onSelect: () => void | Promise<void>; // Action handler
  keywords?: string[]; // Search keywords
}

type CommandCategory = "navigation" | "leads" | "skills" | "workers" | "recent";
```

## Features

### ✅ Implemented

- Fuzzy search with scoring
- Keyboard navigation (arrows, enter, escape)
- Categorized results
- Real-time filtering
- Keyboard shortcut (Cmd/Ctrl+K)
- Styled with Frosted Obsidian theme
- Auto-focus input on open
- Scroll to selected item

### 🔄 Future Enhancements

- Recent commands history
- Lead search integration (from Supabase)
- Skill execution with arguments
- Custom command creation
- Search across all entities
- AI-powered semantic search

## Styling

The Command Palette uses Tailwind CSS with the Frosted Obsidian theme:

```css
/* Colors */
Background: slate-900/95 with purple-500/30 border
Text: white with purple-300/60 helpers
Hover: purple-500/10 background
Selected: purple-600/30 background

/* Animations */
Fade in + slide from right on open
Smooth transitions on hover
```

## Performance Considerations

- Fuzzy matching is O(n\*m) where n=query length, m=item count
- Suitable for 100-500 items without noticeable lag
- For larger datasets, implement pagination or async search
- Consider debouncing for backend searches

## Accessibility

- Full keyboard navigation support
- ARIA labels for screen readers (future)
- High contrast colors (purple/white)
- Clear keyboard shortcut hints in footer
- Escape key for dismissal

## Integration with AppShell

The Command Palette is automatically integrated into the AppShell and available on all dashboard pages. The keyboard shortcut (Cmd/Ctrl+K) works from anywhere within the application.

```tsx
// In AppShell.tsx
<CommandPalette
  isOpen={commandPaletteOpen}
  onOpenChange={setCommandPaletteOpen}
/>
```

## Example: Adding a Lead Search Command

To integrate lead searching from Supabase:

```tsx
// In CommandPalette.tsx
async function searchLeads(query: string): Promise<CommandItem[]> {
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name")
    .ilike("name", `%${query}%`)
    .limit(5);

  return (leads || []).map((lead) => ({
    id: `lead-${lead.id}`,
    label: lead.name,
    description: "Lead in CRM",
    category: "leads",
    icon: <Users size={16} />,
    onSelect: () => {
      router.push(`/crm/${lead.id}`);
      handleClose();
    },
  }));
}
```

## Troubleshooting

### Command Palette not opening

- Verify `Cmd+K` or `Ctrl+K` is not bound elsewhere
- Check that `CommandPalette` is rendered in AppShell
- Ensure JavaScript is enabled

### Search not working

- Check that query string is not empty
- Verify command items have proper labels
- Check fuzzy matching score threshold

### Performance issues

- Reduce number of commands if possible
- Consider async loading for large datasets
- Profile with React DevTools
