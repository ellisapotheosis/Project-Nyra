# Nyra Application Pages Index

Complete reference for all application routes and their implementation status.

## Main Application Routes

### Dashboard & Navigation
- **`/dashboard`** ✅
  - Hero status panel with system health indicators
  - Business metrics (leads, campaigns, quotes, compliance)
  - Pipeline visualization by stage
  - GPU worker monitoring and status
  - Active agent sessions display
  - Real-time event ticker

### Broker Platform Section
- **`/crm`** ✅
  - TwentyCRM integration status
  - Real-time connection monitoring
  - Field mapping visualization (6 mapped objects)
  - Synchronization controls (Test/Sync/Replay)
  - Complete sync log with history
  - Latest 3 contacts display

- **`/drip-builder`** 🟡
  - Drip campaign workflow creation
  - Email sequence builder
  - Trigger/action setup
  - Template library
  - Analytics tracking
  - Status: Needs enhancement

- **`/campaigns`** 🟡
  - Campaign overview and listings
  - Builder with workflow canvas
  - Dynamic builder [id] route
  - Campaign detail view [id]
  - Templates and compliance controls
  - Status: Needs enhancement with compliance UI

### Operations Section
- **`/quotes`** 🟡
  - Mortgage quote generation form
  - 3-option comparison interface
  - CRM synchronization
  - Audit log tracking
  - Action buttons for approval/sharing
  - Status: Basic structure in place, needs quote comparison UI

- **`/campaigns`** (see Broker Platform)

- **`/logs`** 🟡
  - Unified event stream
  - Compliance event filtering
  - Detail drawer for inspection
  - Risk indicators
  - Real-time updates
  - Status: Basic event log exists, needs detail views

- **`/memory`** 🟡
  - Graph visualization
  - Platonic solids model
  - Memory inspector
  - Filters and search
  - Performance metrics
  - Status: Basic page exists, needs visualization

- **`/orchestrator`** 🟡
  - Service health display
  - Tunnel/subdomain mapping
  - Docker stack panel
  - Log viewer
  - Control buttons
  - Status: Basic pages exist [id], needs dashboard

- **`/workers`** 🟡
  - Worker fleet map
  - Individual worker pages [id]
  - GPU telemetry for RTX 5090, 3090 Ti, 3060
  - Workload routing display
  - Model controls
  - Session monitoring
  - Status: Pages exist, need telemetry visualization

### Tools & System Section
- **`/tools`** 🟡
  - Tool cards for all integrations
  - Quick access interface
  - Status indicators
  - Status: Implementation varies by tool

- **`/settings`** 🟡
  - Integration health checks
  - Service controls
  - Secret status display
  - Tunnel configuration
  - User preferences
  - Status: Basic page exists, needs enhancement

- **`/admin`** 🟡
  - User management
  - Role assignment
  - System configuration
  - Audit trail
  - Status: Requires implementation

## Route Organization

### Layout Hierarchy
```
RootLayout (/layout.tsx)
├── App Providers (Auth, Toast, ErrorBoundary)
├── AppShell (Global shell with sidebar + top bar)
│   ├── (broker) - Broker Platform Routes
│   │   ├── /crm
│   │   ├── /drip-builder
│   │   └── /campaigns
│   ├── (ops) - Operations Routes
│   │   ├── /quotes
│   │   ├── /logs
│   │   ├── /memory
│   │   ├── /orchestrator
│   │   ├── /workers
│   │   ├── /settings
│   │   └── /(tools) - System Tools
│   │       ├── /nexus-router
│   │       ├── /openclaw
│   │       ├── /nerve
│   │       └── /tools
│   └── /dashboard - Main dashboard
```

### Authentication Routes (Outside AppShell)
- `/auth/login` - User login
- `/auth/signup` - New user registration
- `/auth/forgot-password` - Password recovery
- `/access-denied` - RBAC access denial page

## Component Integration

### Dashboard Components
- `MetricCard` - Displays KPI with trend
- `PipelineStageCard` - Pipeline stage visualization
- `WorkerCard` - GPU worker status
- `AgentSessionCard` - Active agent display
- `StatusIndicator` - Online/offline status
- `PageHeader` - Page titles and descriptions

### Global Components
- `AppShell` - Main application shell
- `SidebarNav` - Left sidebar navigation with RBAC
- `TopStatusBar` - Top status and user info
- `CommandPalette` - Command search interface
- `ErrorBoundary` - Error handling
- `RoleGate` - Conditional rendering by role
- `ProtectedRoute` - Route protection HOC

### Toast/Notification System
- `useToast()` hook for displaying notifications
- Success, error, warning, info types
- Auto-dismiss with configurable duration
- Used throughout for user feedback

## RBAC Integration

### Roles & Access
- **Admin** - All routes and features
- **Broker** - Dashboard, CRM, Drip, Campaigns, Quotes, Nexus, OpenClaw, Nerve, Memory, Tools
- **Loan Officer** - Dashboard, CRM, Campaigns, Quotes, OpenClaw, Tools
- **Processor** - Dashboard, Quotes, Logs
- **Viewer** - Dashboard only

### Protected Routes
- All routes except `/auth/*` and `/access-denied` require authentication
- SidebarNav filters based on role using `canAccessRoute()`
- Individual pages use `ProtectedRoute` HOC
- Components use `RoleGate` for conditional features

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ | Fully implemented with components and styling |
| 🟡 | Exists but needs enhancement/completion |
| 🔴 | Not yet implemented |

## Implementation Checklist

### Completed (✅)
- [x] AppShell with SidebarNav and TopStatusBar
- [x] CommandPalette with keyboard shortcuts
- [x] Dashboard with all required sections
- [x] CRM page with TwentyCRM integration
- [x] RBAC system across all pages
- [x] Toast/notification system
- [x] Error boundaries and access denied page

### In Progress (🟡)
- [ ] Enhance quotes page with comparison UI
- [ ] Add pipeline visualization to campaigns
- [ ] Implement memory graph visualization
- [ ] Complete worker telemetry displays
- [ ] Enhance settings and admin pages
- [ ] Add drip builder workflow canvas

### Not Started (🔴)
- [ ] Landing pages (projectnyra.com, ratehunter.net)
- [ ] API integration layer refinement
- [ ] Advanced compliance logging
- [ ] Real-time WebSocket updates
- [ ] Mobile responsiveness testing

## Navigation Flow

### Typical User Journey
1. Unauthenticated user → `/auth/login`
2. Successful login → `/dashboard`
3. Open CommandPalette with Cmd/Ctrl+K
4. Jump to `/crm` to view leads
5. View pipeline and deal status
6. Check worker status in `/workers`
7. Return to dashboard for overview

### Admin Journey
1. Login as admin
2. Access `/admin` for user management
3. Configure system settings in `/settings`
4. Monitor compliance in `/logs`
5. Check orchestrator health in `/orchestrator`

## Data Integration Points

### Current Status
- Using mock data for demonstration
- Ready for Supabase integration
- API client structure in place
- Toast notifications functional

### Next Steps for Production
1. Wire up Supabase queries for real data
2. Implement WebSocket subscriptions for real-time updates
3. Add error handling and retry logic
4. Set up data caching strategies
5. Implement optimistic updates

## Performance Notes
- Dashboard loads all sections (~300KB bundle)
- Lazy load detail pages on demand
- Image optimization for worker telemetry
- Consider pagination for large lists
- Implement virtual scrolling for logs

## Accessibility Status
- ✅ Keyboard navigation (Cmd/Ctrl+K for CommandPalette)
- ✅ High contrast colors (purple/white theme)
- 🟡 ARIA labels on components (partial)
- 🟡 Screen reader testing (needed)
- 🟡 Reduced motion support (needed)

## Known Issues & TODOs
1. Quote comparison UI not fully styled
2. Memory graph visualization placeholder
3. Worker telemetry needs real API integration
4. Admin page requires user management CRUD
5. Landing pages not yet created
6. Mobile responsiveness needs testing

## Related Documentation
- `RBAC_GUIDE.md` - Role-based access control
- `COMMAND_PALETTE_GUIDE.md` - Command palette usage
- `DASHBOARD_GUIDE.md` - Dashboard components
- `APPSHELL_GUIDE.md` - AppShell structure
