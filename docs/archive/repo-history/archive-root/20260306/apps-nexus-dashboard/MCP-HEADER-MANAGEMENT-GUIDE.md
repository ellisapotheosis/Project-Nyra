# MCP Header Management UI - Implementation Guide

## Overview

This document describes the Header Management UI components built for the Nexus Dashboard (`apps/nexus-dashboard`). These components enable users to configure, manage, and test HTTP headers for MCP (Model Context Protocol) server requests.

## Component Architecture

### 1. HeaderEditor (`src/components/mcp/header-editor.tsx`)

The core header configuration component providing a key-value editor interface.

#### Features:
- **Add/Remove Headers**: Button to add headers, delete button per header
- **Key-Value Inputs**: Separate inputs for header key and value
- **Environment Variable Support**: Dropdown selector for available environment variables
- **Password Toggle**: Show/hide header values for sensitive data
- **Drag-to-Reorder**: Drag handlers to reorder headers
- **Live Preview**: Shows how headers will be sent in the preview panel
- **Environment Variable Substitution**: Automatic `${VARIABLE_NAME}` replacement

#### Props:
```typescript
interface HeaderEditorProps {
  headers: Header[];
  onHeadersChange: (headers: Header[]) => void;
  environmentVars?: string[];
}

interface Header {
  id: string;
  key: string;
  value: string;
  envVar?: string;
}
```

#### Usage:
```tsx
import { HeaderEditor, Header } from '@/components/mcp/header-editor';

const [headers, setHeaders] = useState<Header[]>([]);

<HeaderEditor
  headers={headers}
  onHeadersChange={setHeaders}
  environmentVars={['API_KEY', 'SERVICE_KEY']}
/>
```

### 2. HeaderTemplates (`src/components/mcp/header-templates.tsx`)

Template library component for quick-applying pre-configured header sets.

#### Features:
- **Default Templates**: Pre-built templates for common scenarios
  - Bearer Token: `Authorization: Bearer ${API_KEY}`
  - API Key: `X-API-Key: ${SERVICE_KEY}`
  - JSON Content: Content-Type and Accept headers
  - CORS Headers: Standard CORS configuration
  - User Agent: Custom user agent header
- **Apply Template**: Button to add template headers to current configuration
- **Custom Templates**: Save current headers as reusable templates
- **Template Management**: Delete custom templates
- **Test Headers**: Preview how headers will be sent
- **Save Dialog**: Modal to save current configuration as template

#### Props:
```typescript
interface HeaderTemplatesProps {
  onApplyTemplate: (headers: Array<{ key: string; value: string }>) => void;
  onTestHeaders: (headers: Header[]) => void;
  currentHeaders?: Header[];
}
```

#### Usage:
```tsx
import { HeaderTemplates } from '@/components/mcp/header-templates';

<HeaderTemplates
  onApplyTemplate={(headers) => {
    // Apply template headers to editor
  }}
  onTestHeaders={(headers) => {
    // Test headers
  }}
  currentHeaders={headers}
/>
```

### 3. ServerConfigDialog (`src/components/mcp/server-config-dialog.tsx`)

Modal dialog component integrating header editor and templates.

#### Features:
- **Tabbed Interface**: Separate tabs for Headers and Templates
- **Header Editor Tab**: Full header configuration interface
- **Templates Tab**: Quick-apply templates and custom template management
- **Save/Cancel**: Persist or discard changes
- **Server Context**: Shows which server is being configured
- **Environment Variables**: Mocked list (expandable with API integration)

#### Props:
```typescript
interface ServerConfigDialogProps {
  server: MCPServer;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (headers: Header[]) => void;
}
```

#### Usage:
```tsx
import { ServerConfigDialog } from '@/components/mcp/server-config-dialog';

const [configOpen, setConfigOpen] = useState(false);

<ServerConfigDialog
  server={selectedServer}
  open={configOpen}
  onOpenChange={setConfigOpen}
  onSave={(headers) => {
    console.log('Headers saved:', headers);
  }}
/>
```

### 4. Updated ServerCard (`src/components/server-card.tsx`)

Enhanced server card with configuration button.

#### Changes:
- Added "Configure" button with Settings icon
- Integrated ServerConfigDialog for header management
- Maintains existing "Test Connection" button functionality
- Responsive layout with dual-button interface

#### New Features:
- Click "Configure" to open header management dialog
- Configure headers for each server independently
- Visual icon indicating configuration capability

## File Structure

```
apps/nexus-dashboard/
├── src/
│   └── components/
│       ├── mcp/
│       │   ├── header-editor.tsx         (Header key-value editor)
│       │   ├── header-templates.tsx      (Template library)
│       │   └── server-config-dialog.tsx  (Config dialog container)
│       └── server-card.tsx               (Updated with config button)
```

## Integration Steps

### 1. Server Card Integration (Already Complete)

The ServerCard component now includes:
- Import of ServerConfigDialog
- State management for dialog open/closed
- Configure button in the card footer
- Dialog props and save handler

### 2. Using in Your Application

#### Basic Setup:

```tsx
'use client';

import { ServerCard } from '@/components/server-card';
import { MCPServer } from '@/lib/store';

export function MyServerList({ servers }: { servers: MCPServer[] }) {
  return (
    <div className="grid gap-4">
      {servers.map(server => (
        <ServerCard
          key={server.id}
          server={server}
          onTest={() => {
            // Test server connection
          }}
        />
      ))}
    </div>
  );
}
```

#### Advanced Configuration:

```tsx
import { Header } from '@/components/mcp/header-editor';

const handleSaveHeaders = async (headers: Header[]) => {
  // Persist headers to your backend
  const response = await fetch(`/api/servers/${serverId}/headers`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(headers),
  });

  // Update server configuration
};
```

## Features Breakdown

### Header Key-Value Editor

**Add Header**
- Click "Add Header" button
- New header row appears at bottom
- Enter key and value
- Optionally select environment variable

**Delete Header**
- Click trash icon next to header
- Header is immediately removed

**Reorder Headers**
- Drag by the grip handle (≡)
- Drop at desired position
- Headers maintain ID integrity during reorder

**Show/Hide Values**
- Click eye icon to toggle value visibility
- Sensitive values hidden by default
- Improves security when sharing screens

**Environment Variable Selection**
- Dropdown shows available environment variables
- Selection pre-fills value with `${VARIABLE_NAME}`
- Preview shows resolved value

**Live Preview**
- Shows formatted header output
- Demonstrates how headers will be sent
- Updates in real-time as you edit

### Template System

**Apply Templates**
- Click "Apply" on any template
- Template headers are added to current configuration
- Can apply multiple templates
- Allows combining headers from different sources

**Default Templates Included**

1. **Bearer Token**
   - `Authorization: Bearer ${API_KEY}`
   - Ideal for JWT-based authentication

2. **API Key**
   - `X-API-Key: ${SERVICE_KEY}`
   - Custom API key authentication

3. **JSON Content**
   - `Content-Type: application/json`
   - `Accept: application/json`
   - For JSON-based APIs

4. **CORS Headers**
   - `Origin: http://localhost:3000`
   - `Access-Control-Request-Method: POST`
   - CORS configuration

5. **User Agent**
   - `User-Agent: Claude-MCP-Client/1.0`
   - Custom client identification

**Save Custom Templates**
- Click "Save Current" button
- Enter template name and optional description
- Select which headers to include
- Template appears in list for future use
- Delete custom templates anytime

**Test Headers**
- Click "Test Headers" button
- See formatted header output
- Confirms headers are properly configured
- Shows environment variable resolution

## Styling & Theme

### Classes Used:
- **Tailwind CSS**: All components use Tailwind utilities
- **shadcn/ui**: Built-in component library
- **Dark Theme**: Fully compatible with dark mode
- **OKLCH Colors**: Uses project's color system

### Component Styling:
- Input fields: Standard text input styling
- Buttons: Outlined variant for actions
- Cards: Panel backgrounds with borders
- Dialog: Modal overlay with centered content
- Icons: Lucide React icons throughout

## Environment Variables

### Mock Environment Variables (Current)
- `API_KEY`
- `SERVICE_KEY`
- `AUTH_TOKEN`
- `CLIENT_ID`

### To Load Real Environment Variables:

1. **From Backend API:**

```tsx
useEffect(() => {
  const fetchEnvVars = async () => {
    const response = await fetch('/api/environment-variables');
    const vars = await response.json();
    setEnvironmentVars(vars.map(v => v.name));
  };

  fetchEnvVars();
}, []);
```

2. **From System Environment:**

```tsx
const environmentVars = [
  'API_KEY',
  'SERVICE_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  // ... other env vars
];
```

## Type Definitions

### Header Interface
```typescript
export interface Header {
  id: string;           // Unique identifier
  key: string;          // Header name (e.g., "Authorization")
  value: string;        // Header value (e.g., "Bearer token...")
  envVar?: string;      // Optional environment variable name
}
```

### Template Interface
```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  headers: Array<{ key: string; value: string }>;
  isCustom?: boolean;
}
```

## Best Practices

### Security
1. **Hide Sensitive Values**: Use show/hide toggle for API keys
2. **Environment Variables**: Store secrets in environment, not in headers
3. **Template Protection**: Don't save actual secrets in custom templates
4. **Validation**: Validate header keys and values before sending

### UX
1. **Template Usage**: Create templates for common scenarios
2. **Descriptive Names**: Use clear template names for discoverability
3. **Organization**: Group related headers together
4. **Testing**: Test headers before deployment

### Performance
1. **Lazy Loading**: Headers load only when dialog opens
2. **Memoization**: Components prevent unnecessary re-renders
3. **State Management**: Headers stored in local state until saved
4. **Drag Optimization**: Reordering uses efficient DOM updates

## Example Implementation

```tsx
'use client';

import { useState } from 'react';
import { ServerCard } from '@/components/server-card';
import { Header } from '@/components/mcp/header-editor';
import { useNexusStore } from '@/lib/store';

export default function ServersPage() {
  const { servers } = useNexusStore();
  const [serverHeaders, setServerHeaders] = useState<Record<string, Header[]>>({});

  const handleSaveHeaders = async (serverId: string, headers: Header[]) => {
    // Save to backend
    await fetch(`/api/servers/${serverId}/headers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(headers),
    });

    // Update local state
    setServerHeaders(prev => ({
      ...prev,
      [serverId]: headers,
    }));

    // Optional: Update server configuration
    console.log(`Headers saved for server ${serverId}:`, headers);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servers.map(server => (
        <ServerCard
          key={server.id}
          server={server}
          onTest={() => console.log('Testing:', server.id)}
        />
      ))}
    </div>
  );
}
```

## API Integration Guide

### Persisting Headers to Backend

```typescript
interface ServerHeadersPayload {
  serverId: string;
  headers: Array<{
    key: string;
    value: string;
  }>;
}

const saveHeaders = async (payload: ServerHeadersPayload) => {
  const response = await fetch('/api/mcp/servers/headers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to save headers');
  }

  return response.json();
};
```

### Loading Saved Headers

```typescript
const loadServerHeaders = async (serverId: string): Promise<Header[]> => {
  const response = await fetch(`/api/mcp/servers/${serverId}/headers`);

  if (!response.ok) {
    throw new Error('Failed to load headers');
  }

  const data = await response.json();
  return data.headers.map((h: any) => ({
    id: h.id || `header-${Date.now()}-${Math.random()}`,
    key: h.key,
    value: h.value,
    envVar: h.envVar,
  }));
};
```

## Testing

### Manual Testing Checklist

- [ ] Add header with key and value
- [ ] Add header with environment variable
- [ ] Show/hide header value
- [ ] Reorder headers using drag
- [ ] Delete header using trash button
- [ ] Apply template and verify headers added
- [ ] Save current headers as custom template
- [ ] Delete custom template
- [ ] Click "Test Headers" and verify output
- [ ] Open/close dialog without changing headers
- [ ] Verify dialog closes after save
- [ ] Check responsive layout on mobile

### Component Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderEditor } from '@/components/mcp/header-editor';

describe('HeaderEditor', () => {
  it('should add a header when Add button is clicked', () => {
    const { container } = render(
      <HeaderEditor headers={[]} onHeadersChange={jest.fn()} />
    );

    const addButton = screen.getByText(/Add Header/i);
    fireEvent.click(addButton);

    // Verify new header row appears
  });

  it('should remove header when delete button is clicked', () => {
    const headers = [{ id: '1', key: 'Auth', value: 'token' }];
    const handleChange = jest.fn();

    render(
      <HeaderEditor headers={headers} onHeadersChange={handleChange} />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
```

## Troubleshooting

### Headers Not Displaying
- Verify `headers` prop is passed correctly
- Check that Header objects have valid `id`, `key`, and `value`
- Ensure `onHeadersChange` callback is properly implemented

### Environment Variables Not Loading
- Check `environmentVars` prop is provided
- Verify environment variable names match available vars
- Look for typos in variable names

### Dialog Not Opening
- Verify `open` prop is correctly bound
- Check `onOpenChange` callback updates state
- Ensure ServerCard is in client component (`'use client'`)

### Styles Not Applied
- Confirm Tailwind CSS is properly configured
- Check shadcn/ui components are installed
- Verify `globals.css` includes Tailwind directives

## Future Enhancements

- [ ] Header validation (e.g., Content-Type header values)
- [ ] Header templates with conditions/logic
- [ ] Bulk import/export headers (JSON)
- [ ] Header history/undo functionality
- [ ] Real-time header testing with sample requests
- [ ] Header profiling and analytics
- [ ] Team-shared header templates
- [ ] Header encryption at rest
- [ ] Audit logging for header changes

## Support

For issues or questions about the Header Management UI:

1. Check the troubleshooting section above
2. Review the component props documentation
3. Examine example implementations
4. Test components in isolation using the interactive demo
