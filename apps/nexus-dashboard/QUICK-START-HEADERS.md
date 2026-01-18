# Header Management UI - Quick Start Guide

## What Was Built

Three new React components for managing HTTP headers in MCP server configuration:
- **HeaderEditor**: Key-value editor with drag-to-reorder
- **HeaderTemplates**: Template library with pre-built and custom templates
- **ServerConfigDialog**: Modal container integrating both
- **ServerCard Enhancement**: Added Configure button

## Quick Links

| Resource | Purpose |
|----------|---------|
| [MCP-HEADER-MANAGEMENT-GUIDE.md](./MCP-HEADER-MANAGEMENT-GUIDE.md) | Full API reference & integration guide |
| [HEADER-MANAGEMENT-IMPLEMENTATION.md](./HEADER-MANAGEMENT-IMPLEMENTATION.md) | Technical overview & architecture |
| [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md) | Visual diagrams & data flow |

## File Locations

```
src/components/mcp/
├── header-editor.tsx ..................... Header key-value editor
├── header-templates.tsx .................. Template library
└── server-config-dialog.tsx .............. Modal container

src/components/
└── server-card.tsx ....................... Updated with Configure button
```

## 5-Minute Setup

### 1. View the Component

Open `src/app/servers/page.tsx` and look for ServerCard - it now has a Configure button!

```tsx
<ServerCard
  server={server}
  onTest={() => handleTestServer(server.id)}
/>
```

### 2. Click Configure Button

When you click the Configure button on any server card:
- A modal dialog opens
- Two tabs appear: "Headers" and "Templates"
- Start adding headers or applying templates

### 3. Add Headers Manually

In the Headers tab:
1. Click "Add Header"
2. Enter key (e.g., "Authorization")
3. Enter value (e.g., "Bearer token...")
4. Optionally select environment variable
5. Click save

### 4. Apply a Template

In the Templates tab:
1. Browse pre-configured templates
2. Click "Apply" on desired template
3. Headers are added to your configuration
4. Edit if needed, then save

### 5. Save Configuration

Click "Save Configuration" to persist:
- Headers are passed to parent component
- Can be sent to backend API
- Dialog closes automatically

## Common Tasks

### Add Bearer Token Header
```
1. Click Add Header
2. Key: "Authorization"
3. Value: "Bearer ${API_KEY}"
4. Select env var: API_KEY (or type it)
5. Save
```

### Create Custom Template
```
1. Configure some headers
2. Switch to Templates tab
3. Click "Save Current"
4. Enter template name
5. Click "Save Template"
```

### Reorder Headers
```
1. Hover over header row
2. Grab by the three-line icon (≡)
3. Drag to desired position
4. Release to drop
```

### Show/Hide Sensitive Values
```
1. Find header with sensitive data
2. Click eye icon on the right
3. Click again to hide
```

### Test Headers
```
1. In Templates tab
2. Click "Test Headers"
3. View formatted output
4. Verify they look correct
```

## Code Examples

### Basic Usage

```tsx
import { ServerCard } from '@/components/server-card';

export default function ServersPage() {
  return (
    <div className="grid gap-4">
      {servers.map(server => (
        <ServerCard
          key={server.id}
          server={server}
        />
      ))}
    </div>
  );
}
```

### Handle Saved Headers

```tsx
// In ServerCard or parent
<ServerConfigDialog
  server={server}
  open={configOpen}
  onOpenChange={setConfigOpen}
  onSave={async (headers) => {
    // Save to database
    await fetch(`/api/servers/${server.id}/headers`, {
      method: 'PUT',
      body: JSON.stringify(headers),
    });
  }}
/>
```

### Use HeaderEditor Standalone

```tsx
import { HeaderEditor, Header } from '@/components/mcp/header-editor';
import { useState } from 'react';

export function MyHeaderComponent() {
  const [headers, setHeaders] = useState<Header[]>([]);

  return (
    <HeaderEditor
      headers={headers}
      onHeadersChange={setHeaders}
      environmentVars={['API_KEY', 'SERVICE_KEY']}
    />
  );
}
```

## Features at a Glance

### HeaderEditor Features
- ✅ Add/remove headers
- ✅ Drag to reorder
- ✅ Show/hide values
- ✅ Environment variable support
- ✅ Live preview

### HeaderTemplates Features
- ✅ 5 pre-built templates
- ✅ Quick apply
- ✅ Custom templates
- ✅ Test headers
- ✅ Delete templates

### Integration Features
- ✅ Tabbed dialog
- ✅ Save/cancel
- ✅ Loading states
- ✅ Server context

## Default Templates

| Template | Use Case |
|----------|----------|
| **Bearer Token** | JWT authentication |
| **API Key** | Custom API key |
| **JSON Content** | JSON requests |
| **CORS Headers** | CORS setup |
| **User Agent** | Client ID |

## Environment Variables

Current mock variables:
- `API_KEY`
- `SERVICE_KEY`
- `AUTH_TOKEN`
- `CLIENT_ID`

To add more, edit `server-config-dialog.tsx`:

```tsx
const MOCK_ENV_VARS = [
  'API_KEY',
  'SERVICE_KEY',
  'CUSTOM_VAR',  // Add here
];
```

## Dark Mode

All components automatically support dark mode:
- Uses theme-aware colors
- Text contrast adjusts automatically
- Works with Tailwind dark mode

## Responsive Design

| Breakpoint | Behavior |
|-----------|----------|
| Mobile | Stacked layout, full-width inputs |
| Tablet | 2-column headers, touch-friendly |
| Desktop | Optimized with side-by-side layout |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate inputs and buttons |
| Enter | Add header / Apply template / Save |
| Escape | Close dialog |
| Mouse | Drag headers to reorder |

## Troubleshooting

### Dialog Won't Open
- Check ServerCard is in client component (`'use client'`)
- Verify `configOpen` state updates on button click
- Check browser console for errors

### Headers Not Saving
- Verify `onSave` callback is provided
- Check server ID is correct
- Verify API endpoint exists (if used)

### Env Variables Not Showing
- Check `environmentVars` prop passed to dialog
- Verify variable names in the array
- Look for typos

### Styles Look Wrong
- Confirm Tailwind CSS is compiled
- Check shadcn/ui components installed
- Verify `globals.css` has Tailwind directives

## Next Steps

### For Development
1. Run dev server: `pnpm dev`
2. Navigate to `/servers` page
3. Click Configure on any server
4. Test header functionality

### For Production
1. Implement backend API for persistence
2. Load environment variables from system
3. Add authentication checks
4. Set up audit logging
5. Deploy and monitor

### For Enhancement
1. Add header validation
2. Create more templates
3. Implement header history
4. Add bulk import/export
5. Team-share templates

## API Reference Quick Lookup

### Header Type
```typescript
interface Header {
  id: string;           // Unique ID
  key: string;          // Header name
  value: string;        // Header value
  envVar?: string;      // Env variable name
}
```

### Component Props

**HeaderEditor**
```typescript
headers: Header[]
onHeadersChange: (headers: Header[]) => void
environmentVars?: string[]
```

**HeaderTemplates**
```typescript
onApplyTemplate: (headers: Array<{ key: string; value: string }>) => void
onTestHeaders: (headers: Header[]) => void
currentHeaders?: Header[]
```

**ServerConfigDialog**
```typescript
server: MCPServer
open?: boolean
onOpenChange?: (open: boolean) => void
onSave?: (headers: Header[]) => void
```

## Performance Tips

- Headers load only when dialog opens
- Drag-to-reorder is optimized for speed
- Re-renders only affected components
- Templates cached in component state

## Security Reminders

- Use env variables for secrets
- Hide sensitive values by default
- Don't save actual secrets in templates
- Validate headers before sending
- Consider audit logging

## Support

Need help? Check these resources:
1. [Full Guide](./MCP-HEADER-MANAGEMENT-GUIDE.md) - Complete reference
2. [Architecture](./COMPONENT-ARCHITECTURE.md) - Visual diagrams
3. [Implementation](./HEADER-MANAGEMENT-IMPLEMENTATION.md) - Technical details

---

**Version:** 1.0
**Status:** Ready for Use
**Last Updated:** January 18, 2026

## Changelog

### v1.0 - Initial Release
- Header editor component
- Template library component
- Server config dialog
- ServerCard integration
- 5 default templates
- Environment variable support
- Full documentation
