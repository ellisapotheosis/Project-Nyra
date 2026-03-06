# Tool Discovery & Search UI Implementation Guide

## Overview

A comprehensive Tool Discovery and Search interface for the Nexus Dashboard that enables users to search, explore, and interact with available MCP (Model Context Protocol) tools across all connected servers.

**Location**: `apps/nexus-dashboard`
**Route**: `/tools`
**Stack**: Next.js 15, TypeScript, Fuse.js, shadcn/ui, Dark Theme

---

## Features

### 1. Advanced Search Bar
**Component**: `src/components/tools/search-bar.tsx`

- **Full-text search** across tool names, descriptions, categories, and servers
- **Fuzzy matching** with Fuse.js (threshold: 0.3) for flexible queries
- **Category filtering** via dropdown popover
- **Real-time search results** with result count
- **Combined filters** - search + category filtering work together

**Key Features**:
- Search icon indicator
- Filter button with visual feedback (changes color when active)
- Category filter popover with clear button
- Results counter with category context

### 2. Tool Cards
**Component**: `src/components/tools/tool-card.tsx`

Responsive tool display cards with hover effects:
- Tool name and description
- Category and server badges
- Parameter count indicator
- Usage count display
- "Details" and "Try" action buttons
- Hover animation with chevron indicator

**Display Modes**:
- Grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- List layout (single column with full details)

### 3. Tool Detail Modal
**Component**: `src/components/tools/tool-detail-modal.tsx`

Comprehensive tool information dialog:
- Full tool name and description
- Category and server information
- Complete parameter listing with:
  - Parameter names and types
  - Copy-to-clipboard functionality
  - Visual feedback for copied items
- Example usage code snippet
- "Copy Code" button for quick integration
- Related tools section (max 3):
  - Shows tools in same category or server
  - Helps discover complementary tools
- "Try This Tool" CTA button

### 4. Try Tool Dialog
**Component**: `src/components/tools/try-tool-dialog.tsx`

Interactive tool execution interface:
- **Dynamic parameter inputs** based on tool requirements
- **Smart input types**:
  - Text inputs for simple parameters
  - Textarea for lengthy text (description, code, etc.)
  - Type indication for each parameter
- **Execute button** with loading state
- **Response display** with syntax highlighting
- **Copy response** functionality
- **Call history** (last 10 calls):
  - Timestamp for each call
  - Parameters used
  - Ability to review past executions
- **Reset button** to clear inputs

---

## File Structure

```
src/
├── app/
│   └── tools/
│       └── page.tsx                    # Main tools page (enhanced)
├── components/
│   ├── tools/                          # NEW: Tool-specific components
│   │   ├── index.ts                    # Barrel export
│   │   ├── search-bar.tsx              # Advanced search component
│   │   ├── tool-card.tsx               # Individual tool card
│   │   ├── tool-detail-modal.tsx       # Detail modal dialog
│   │   └── try-tool-dialog.tsx         # Interactive execution dialog
│   └── ui/
│       ├── dialog.tsx                  # NEW: Dialog primitive
│       ├── label.tsx                   # NEW: Form label
│       ├── textarea.tsx                # NEW: Textarea input
│       ├── popover.tsx                 # NEW: Popover primitive
│       └── [existing components]
└── lib/
    └── store.ts                        # Zustand store (Tool interface)
```

---

## Component Interfaces

### SearchBar
```typescript
interface SearchBarProps {
  tools: Tool[];
  onSearch: (query: string, results: Tool[]) => void;
  onFilterCategory?: (category: string) => void;
  categories?: string[];
}
```

### ToolCard
```typescript
interface ToolCardProps {
  tool: Tool;
  onViewDetails?: (tool: Tool) => void;
  onTryTool?: (tool: Tool) => void;
  usageCount?: number;
  className?: string;
}
```

### ToolDetailModal
```typescript
interface ToolDetailModalProps {
  tool: Tool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTryTool?: (tool: Tool) => void;
  relatedTools?: Tool[];
}
```

### TryToolDialog
```typescript
interface TryToolDialogProps {
  tool: Tool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

---

## Search Implementation

### Fuse.js Configuration
```typescript
new Fuse(tools, {
  keys: ['name', 'description', 'category', 'server'],
  threshold: 0.3,        // Fuzzy matching tolerance
  includeScore: true,    // Include match scores
  minMatchCharLength: 1  // Minimum characters to trigger search
})
```

**Search Fields**:
- `name` - Tool identifier
- `description` - Tool purpose and capabilities
- `category` - Tool classification
- `server` - Source MCP server

### Filter Combination Logic
- Search and category filters work together
- Search applies first, then category filter
- Clear feedback on applied filters

---

## Main Page Features

### Tabs Organization
The tools page displays tools organized by category using tabs:
- **All Tools** tab - Shows all search results
- **Category tabs** - One tab per unique category
- Dynamic tab generation based on actual tools

### View Mode Toggle
- **Grid view** (default) - Responsive layout
- **List view** - Single-column vertical layout
- Toggle buttons in header with active state

### Tool Loading
- **Demo data** with 8 sample tools (multiple categories)
- **API integration** ready via `NexusAPI.getTools()`
- **Error handling** with fallback to demo data
- **Refresh button** to reload tools

### Categories Included (Demo Data)
- AI
- Development
- Search
- NLP
- Monitoring

---

## State Management

All state is managed via:
- **React hooks** for component-level state
- **Zustand store** (useNexusStore) for tools data
- **URL-independent** state for modals and selections

### Key State Variables
```typescript
const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
const [detailOpen, setDetailOpen] = useState(false);
const [tryOpen, setTryOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<Tool[]>([]);
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [selectedCategory, setSelectedCategory] = useState('');
```

---

## Styling & Theming

### Design System
- **Colors**: Follows OKLCH color space (Tailwind v4)
- **Dark theme** optimized
- **Responsive** across all breakpoints
- **Accessibility** with semantic HTML and ARIA labels

### Key Classes
- `animate-fade-in` - Page entrance animation
- `hover:shadow-lg` - Card hover effects
- `text-muted-foreground` - Secondary text
- `bg-muted/50` - Subtle backgrounds
- `ring-offset-background` - Focus states

### Responsive Breakpoints
- Mobile: 1 column grid / list view
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Full width for search bar and details

---

## Usage Examples

### Basic Integration
```typescript
import { SearchBar, ToolCard, ToolDetailModal, TryToolDialog } from '@/components/tools';

// In your component
<SearchBar
  tools={tools}
  onSearch={handleSearch}
  onFilterCategory={handleFilterCategory}
  categories={categories}
/>

<ToolCard
  tool={selectedTool}
  onViewDetails={handleViewDetails}
  onTryTool={handleTryTool}
  usageCount={25}
/>
```

### Search Implementation
```typescript
const handleSearch = (query: string, results: Tool[]) => {
  setSearchQuery(query);
  setSearchResults(results);
};
```

---

## API Integration Points

### Expected API Endpoints
```typescript
// Get all available tools
GET /api/tools -> Tool[]

// Execute a tool (ready to implement)
POST /api/tools/{toolId}/execute
Body: { parameters: Record<string, any> }
Response: { status, result, ... }
```

### Current Implementation
- Uses mock data for demonstration
- `NexusAPI.getTools()` ready for implementation
- Tool execution simulated with 1-second delay

---

## Performance Optimizations

### Memoization
```typescript
// Categories extracted once per tools update
const categories = useMemo(() => {
  const cats = new Set(tools.map((t) => t.category));
  return Array.from(cats).sort();
}, [tools]);

// Related tools computed when selectedTool changes
const relatedTools = useMemo(() => {...}, [selectedTool, tools]);
```

### Callbacks
All event handlers use `useCallback` for stability:
- `handleSearch`
- `handleFilterCategory`
- `handleViewDetails`
- `handleTryTool`
- `handleRefresh`

### Efficient Search
- Fuse.js provides fuzzy matching in <1ms
- Debounced search via input onChange
- Results filtered in place without full list recreation

---

## Future Enhancements

### Phase 2
- [ ] Tool execution with real API calls
- [ ] Call history persistence (localStorage/API)
- [ ] Tool favoriting / starring
- [ ] Advanced filters (parameter types, server status)
- [ ] Tool documentation linking
- [ ] Usage statistics integration

### Phase 3
- [ ] Tool testing/playground with code snippets
- [ ] Tool rating and reviews
- [ ] Custom tool creation UI
- [ ] Tool dependency mapping
- [ ] Performance metrics dashboard

### Phase 4
- [ ] WebSocket updates for real-time tool availability
- [ ] Tool comparison interface
- [ ] Batch tool execution
- [ ] Tool template creation

---

## Testing Guide

### Unit Tests (Jest)
```typescript
describe('SearchBar', () => {
  it('should filter tools by search query', () => {
    // Test fuzzy matching
  });

  it('should filter by category', () => {
    // Test category filter
  });

  it('should combine search and category filters', () => {
    // Test combined logic
  });
});
```

### Integration Tests (Cypress)
```typescript
describe('Tool Discovery Page', () => {
  it('should search and display filtered tools', () => {
    // E2E test workflow
  });

  it('should open detail modal', () => {
    // Modal interaction
  });

  it('should execute tool with parameters', () => {
    // Tool execution workflow
  });
});
```

---

## Troubleshooting

### Common Issues

**Search not working**
- Check if Fuse.js is properly imported
- Verify tool data structure matches interface
- Check browser console for errors

**Modal not opening**
- Verify dialog state management
- Check if Dialog components are properly imported
- Ensure open/onOpenChange props are connected

**Styles not applying**
- Clear Next.js cache: `rm -rf .next`
- Verify Tailwind CSS configuration
- Check for CSS conflicts

---

## Component Dependencies

### UI Components Used
- `Dialog` - Modal dialogs
- `Button` - Action buttons
- `Input` - Text input
- `Textarea` - Multi-line text
- `Badge` - Category/server labels
- `Tabs` - Tool organization
- `Card` - Tool container
- `Popover` - Filter dropdown
- `Separator` - Visual dividers
- `ScrollArea` - Scrollable content

### External Libraries
- `fuse.js` - Fuzzy search
- `lucide-react` - Icons
- `zustand` - State management
- `class-variance-authority` - Component variants
- `next/react` - Core framework

---

## Maintenance

### Regular Updates
- Monitor Fuse.js for updates
- Keep shadcn/ui components current
- Test with new Next.js versions
- Update demo data periodically

### Performance Monitoring
- Monitor search latency
- Track modal open/close timing
- Measure tool card render performance
- Review API call patterns

---

## Notes for Developers

1. **Always use TypeScript** - The components are fully typed
2. **Follow the Component Interfaces** - Helps maintain consistency
3. **Use Tailwind utilities** - Avoid custom CSS when possible
4. **Test responsively** - Check all breakpoints
5. **Verify accessibility** - Use semantic HTML, test with screen readers

---

## Support & Questions

For questions or issues:
1. Check this guide first
2. Review component implementations
3. Check the Nexus Dashboard CLAUDE.md
4. Review Next.js 15 documentation for framework questions
5. Reference shadcn/ui component docs for UI component questions

