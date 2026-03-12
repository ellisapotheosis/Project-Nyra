# Nexus Dashboard - Quick Reference

## Essential Commands

```bash
# Development
pnpm dev                              # Start dev server (port 3005)
pnpm build                            # Build for production
pnpm start                            # Start production server
pnpm lint                             # Run ESLint
pnpm type-check                       # Check TypeScript types

# From monorepo root
pnpm --filter @nyra/nexus-dashboard dev
```

## URLs

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | http://localhost:3005 | Main metrics and charts |
| MCP Servers | http://localhost:3005/servers | Server management |
| Tool Search | http://localhost:3005/tools | Search all tools |
| GPU Workers | http://localhost:3005/gpu | GPU monitoring |
| Model Routes | http://localhost:3005/routes | Route configuration |
| Configuration | http://localhost:3005/config | System settings |

## File Locations

```
Key Files:
├── src/app/page.tsx                  # Dashboard homepage
├── src/components/sidebar.tsx        # Navigation
├── src/lib/store.ts                  # State management
├── src/lib/api.ts                    # API client
├── src/app/globals.css               # OKLCH colors
├── .env.local                        # Environment config
└── package.json                      # Dependencies

Documentation:
├── README.md                         # Full documentation
├── SETUP.md                          # Quick setup guide
├── INSTALLATION.md                   # Detailed installation
├── PROJECT_SUMMARY.md                # Architecture overview
├── CLAUDE.md                         # AI development guide
└── QUICK_REFERENCE.md                # This file
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_NEXUS_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_DEBUG=false
```

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| MetricCard | components/metric-card.tsx | Display metrics |
| ServerCard | components/server-card.tsx | Show server status |
| GPUWorkerCard | components/gpu-worker-card.tsx | GPU monitoring |
| ToolSearch | components/tool-search.tsx | Fuzzy search |
| PerformanceChart | components/performance-chart.tsx | Charts |
| ModelRouteConfig | components/model-route-config.tsx | Route config |

## State Management

```typescript
// Import store
import { useNexusStore } from '@/lib/store'

// Use in component
const { servers, setServers } = useNexusStore()

// Available state:
- servers: MCPServer[]
- tools: Tool[]
- gpuWorkers: GPUWorker[]
- modelRoutes: ModelRoute[]
- metrics: DashboardMetrics
- wsConnected: boolean
```

## API Client

```typescript
// Import API
import { NexusAPI } from '@/lib/api'

// Use API methods
await NexusAPI.getServers()
await NexusAPI.getTools()
await NexusAPI.getGPUWorkers()
await NexusAPI.getModelRoutes()
await NexusAPI.getMetrics()
await NexusAPI.updateModelRoute(id, updates)

// WebSocket
const ws = NexusAPI.connectWebSocket((data) => {
  // Handle message
})
```

## Styling

```tsx
// Use OKLCH colors
<div className="bg-primary text-primary-foreground">

// Color tokens
bg-primary, bg-secondary, bg-accent
text-foreground, text-muted-foreground
border-border, ring-ring

// Use shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

## Common Patterns

### Create New Page

```tsx
// src/app/newpage/page.tsx
'use client'

export default function NewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Page</h1>
      {/* Content */}
    </div>
  )
}
```

### Add Sidebar Link

```tsx
// src/components/sidebar.tsx
const routes = [
  {
    label: 'New Page',
    icon: IconComponent,
    href: '/newpage',
    color: 'text-blue-500',
  },
]
```

### Use WebSocket

```tsx
import { useWebSocket } from '@/hooks/use-websocket'

const { isConnected, send } = useWebSocket({
  url: 'ws://localhost:8000/ws',
  onMessage: (data) => console.log(data),
})
```

### Format Utilities

```typescript
import { formatBytes, formatNumber, formatDuration } from '@/lib/utils'

formatBytes(1024 * 1024)        // "1 MB"
formatNumber(1234567)           // "1,234,567"
formatDuration(5000)            // "5.00s"
formatPercentage(87.543, 1)     // "87.5%"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | Change port in package.json or kill process |
| Module not found | `rm -rf node_modules && pnpm install` |
| Styles not loading | Clear `.next` folder and restart |
| API errors | Check `.env.local` and Nexus Router status |
| TypeScript errors | Run `pnpm type-check` |
| Build fails | Check `pnpm build` output for errors |

## Quick Fixes

```bash
# Reset everything
rm -rf node_modules .next
pnpm install
pnpm dev

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm pnpm-lock.yaml
pnpm install

# Check for errors
pnpm type-check
pnpm lint
```

## Tech Stack Quick Reference

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1.0 | React framework |
| React | 19.0.0 | UI library |
| TypeScript | 5.7.2 | Type safety |
| Tailwind CSS | 4.0.0 | Styling |
| Zustand | 5.0.2 | State management |
| Recharts | 2.15.0 | Charts |
| Fuse.js | 7.0.0 | Fuzzy search |
| Lucide React | 0.468.0 | Icons |

## Color System (OKLCH)

```css
/* Light Mode */
--background: oklch(1.0000 0 0)        /* White */
--primary: oklch(0.2046 0 0)           /* Black */

/* Dark Mode */
--background: oklch(0.1448 0 0)        /* Dark gray */
--primary: oklch(0.5834 0.2305 277.0676)  /* Purple */
--accent: oklch(0.5102 0.2618 276.9361)   /* Bright purple */
```

## Features Checklist

- [x] Real-time dashboard with metrics
- [x] MCP server monitoring
- [x] Tool search with fuzzy matching
- [x] GPU worker status tracking
- [x] Model route configuration
- [x] System configuration
- [x] WebSocket real-time updates
- [x] Responsive design
- [x] Dark mode support (via OKLCH)
- [x] Type-safe with TypeScript
- [x] Demo mode (works without API)
- [x] Production-ready build

## Next Steps

1. Start dev server: `pnpm dev`
2. Visit http://localhost:3005
3. Explore all pages
4. Configure `.env.local`
5. Connect to Nexus Router API
6. Customize as needed

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Need more details?** Check README.md, SETUP.md, or INSTALLATION.md
