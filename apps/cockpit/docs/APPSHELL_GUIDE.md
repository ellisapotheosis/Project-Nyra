# AppShell Component Guide

The AppShell component provides the main layout structure for all authenticated routes in Project Nyra.

## Components

### AppShell
Main layout wrapper that combines sidebar navigation, top status bar, and content area.

**Location**: `components/AppShell.tsx`

**Features**:
- Authentication check and redirect to login if not authenticated
- Responsive layout with sidebar and main content
- Loading state with spinner
- Integrates SidebarNav and TopStatusBar

**Usage**:
```tsx
import { AppShell } from '@/components/AppShell';

export default function ProtectedPage() {
  return (
    <AppShell>
      <div className="space-y-6 p-6">
        {/* Your content here */}
      </div>
    </AppShell>
  );
}
```

### SidebarNav
Navigation component displaying 14 module routes organized by section.

**Location**: `components/SidebarNav.tsx`

**Sections**:
- **Main**: Dashboard
- **Broker Platform**: CRM, Drip Builder
- **Operations**: Campaigns, Quotes
- **Integration & Monitoring**: Nexus Router, OpenClaw, Nerve, Memory, Orchestrator
- **Tools**: Tools, Logs
- **Administration**: Admin, Settings

**Features**:
- Active route highlighting
- Organized navigation sections
- Icon-based visual hierarchy
- Responsive scrolling

### TopStatusBar
Header component showing system status and user menu.

**Location**: `components/TopStatusBar.tsx`

**Features**:
- System status indicator (green pulse when online)
- Current user display
- Settings button
- Logout button with API call

## Layout Integration

The AppShell is automatically applied to authenticated routes via layout files:

```
app/
├── (broker)/layout.tsx      → Uses AppShell
├── (ops)/layout.tsx         → Uses AppShell
├── (tools)/layout.tsx       → Uses AppShell
├── dashboard/layout.tsx     → Uses AppShell
└── auth/layout.tsx          → No AppShell (public route)
```

## Module Routes (14 Total)

| Route | Module | Purpose |
|-------|--------|---------|
| `/dashboard` | Dashboard | Overview and metrics |
| `/crm` | Broker Platform | Twenty CRM integration |
| `/drip-builder` | Broker Platform | Campaign drip automation |
| `/campaigns` | Operations | Campaign management |
| `/quotes` | Operations | Quote generation and tracking |
| `/nexus-router` | Integration | LLM gateway routing and monitoring |
| `/openclaw` | Integration | AI agent chat and execution |
| `/nerve` | Integration | Agent fleet management |
| `/memory` | Integration | Memory system visualization |
| `/orchestrator` | Integration | Service health and controls |
| `/tools` | Tools | Utility tools and integrations |
| `/logs` | Tools | Event logging and audit trails |
| `/admin` | Admin | User and system administration |
| `/settings` | Admin | Configuration and preferences |

## Styling Notes

The AppShell uses:
- **Colors**: Purple/Cyan accent with black background (Frosted Obsidian theme)
- **Border**: `border-purple-500/20` for subtle divisions
- **Background**: `bg-black/40` with `backdrop-blur` for depth
- **Text**: `text-purple-300` for primary, `text-purple-300/60` for secondary

## TypeScript

All components are fully typed with:
- React.ReactNode for children
- TypeScript strict mode enabled
- Lucide React icon types

## Next Steps

- Add CommandPalette component for keyboard navigation
- Implement role-based access control (RBAC) for route/feature visibility
- Add responsive mobile sidebar collapse
- Implement breadcrumb navigation
