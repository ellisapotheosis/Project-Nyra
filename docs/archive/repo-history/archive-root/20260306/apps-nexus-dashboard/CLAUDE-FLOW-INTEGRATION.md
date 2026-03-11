# Claude Flow Integration - Nexus Dashboard

## Overview

This document describes the Claude Flow monitoring integration into the Nexus Dashboard application. The integration provides real-time monitoring of Claude Flow V3 agent orchestration, swarm coordination, memory usage, and system performance.

## Architecture

### Integration Approach

Rather than copying all components from the standalone `claude-flow-ui`, we implemented a streamlined monitoring dashboard that:

- Uses existing shadcn/ui components for consistency
- Connects to Claude Flow CLI via Next.js API routes
- Provides real-time updates through periodic polling
- Maintains the OKLCH color system from the main dashboard
- Implements proper error boundaries for resilience

### Components Created

#### Pages

1. **`/claude-flow`** - Main monitoring dashboard
   - Location: `src/app/claude-flow/page.tsx`
   - Features: Tabs for Swarm, Memory, System, and Terminal
   - Auto-refresh: Every 5 seconds
   - Error handling: ErrorBoundary wrapper

2. **`/claude-flow/dashboard`** - Embedded HTML view
   - Location: `src/app/claude-flow/dashboard/page.tsx`
   - Features: iframe wrapper for standalone HTML dashboard
   - Use case: Full-page terminal-style monitoring

#### API Routes

**`/api/claude-flow/status`**
- Location: `src/app/api/claude-flow/status/route.ts`
- Method: GET
- Executes: `npx @claude-flow/cli@latest hooks statusline --json`
- Timeout: 10 seconds
- Fallback: Demo data if CLI fails

#### Components

1. **ErrorBoundary** - `src/components/error-boundary.tsx`
   - Catches and displays React errors
   - Provides retry functionality
   - Shows stack traces in development
   - Uses shadcn/ui Card components

#### Hooks

1. **useClaudeFlow** - `src/hooks/use-claude-flow.ts`
   - Fetches Claude Flow status from API
   - Handles auto-refresh with configurable interval
   - Provides loading, error, and refresh states
   - Default refresh: 5 seconds

2. **useTerminalResize** - `src/hooks/use-terminal-resize.ts`
   - Calculates terminal dimensions based on container size
   - Handles responsive terminal sizing
   - Debounced resize handling
   - Min/max constraints

#### Types

**`src/types/claude-flow.ts`** - TypeScript interfaces:
- `ClaudeFlowStatus` - Main status interface
- `Agent` - Agent information
- `SwarmStatus` - Swarm coordination status
- `MemoryStats` - Memory usage statistics
- `Task` - Task information
- `PerformanceMetrics` - System performance
- `HookMetrics` - Hooks system metrics
- `WorkerStatus` - Background worker status
- `NeuralStatus` - Neural learning status
- `SessionInfo` - Session information

### Data Flow

```
┌─────────────────────────┐
│  Claude Flow CLI        │
│  (Background Process)   │
└────────────┬────────────┘
             │
             │ Executes command
             ▼
┌─────────────────────────┐
│  Next.js API Route      │
│  /api/claude-flow/      │
│  status                 │
└────────────┬────────────┘
             │
             │ JSON Response
             ▼
┌─────────────────────────┐
│  useClaudeFlow Hook     │
│  (Auto-refresh 5s)      │
└────────────┬────────────┘
             │
             │ State updates
             ▼
┌─────────────────────────┐
│  Claude Flow Dashboard  │
│  (React Components)     │
└─────────────────────────┘
```

## Features

### Main Dashboard (`/claude-flow`)

**System Overview Cards:**
- User Info: Name, git branch, Claude model
- V3 Progress: Domain completion, DDD progress
- Patterns Learned: Neural learning metrics
- Security Status: CVE tracking

**Tabs:**
1. **Swarm** - Agent coordination status
   - Active agents count
   - Coordination status
   - Spawn new agent button

2. **Memory** - Memory usage metrics
   - Memory consumption (MB)
   - Context usage (%)
   - Intelligence level (%)

3. **System** - Resource utilization
   - Memory usage with visual bar
   - Context usage with visual bar
   - Intelligence with visual bar
   - Sub-agents count

4. **Terminal** - Mock terminal interface
   - Status display
   - Terminal size indicator
   - Quick action buttons

**Quick Actions:**
- Train Patterns
- Search Memory
- View Metrics
- Open Terminal

### Embedded Dashboard (`/claude-flow/dashboard`)

- Full-page iframe view
- Standalone HTML dashboard
- Gradient UI design
- Real-time auto-refresh
- No Next.js routing overhead

## Configuration

### Environment Variables

No additional environment variables required. The integration uses:
- Claude Flow CLI from `@claude-flow/cli@latest`
- Local execution via `npx`

### API Timeout

Adjust timeout in `src/app/api/claude-flow/status/route.ts`:

```typescript
const { stdout } = await execAsync(
  'npx @claude-flow/cli@latest hooks statusline --json',
  { timeout: 10000 } // 10 seconds
);
```

### Refresh Interval

Adjust auto-refresh in the hook:

```typescript
const { status, loading, error, lastUpdate, refresh } = useClaudeFlow({
  autoRefresh: true,
  refreshInterval: 5000 // 5 seconds
});
```

## Usage

### Development

```bash
cd apps/nexus-dashboard
pnpm dev
```

Navigate to:
- http://localhost:3005/claude-flow - Main dashboard
- http://localhost:3005/claude-flow/dashboard - Embedded view

### Production

```bash
pnpm build
pnpm start
```

## Navigation

The Claude Flow link is added to the sidebar with:
- Icon: Brain (lucide-react)
- Color: `text-purple-500`
- Route: `/claude-flow`

## Error Handling

### ErrorBoundary Features

- Catches React component errors
- Displays user-friendly error messages
- Shows stack traces in development mode
- Provides retry functionality
- Accessible with focus management

### API Error Handling

- Timeout handling (10s)
- Fallback to demo data if CLI fails
- Error logging to console
- Graceful degradation

### Loading States

- Spinner with loading message
- Retry button on error
- Last update timestamp
- Auto-recovery on success

## Future Enhancements

### Potential Additions

1. **WebSocket Integration**
   - Real-time streaming updates
   - Live terminal output
   - Instant status changes

2. **Interactive Terminal**
   - xterm.js full integration
   - Command execution
   - Terminal history
   - Multiple terminal sessions

3. **Advanced Metrics**
   - Performance charts (Recharts)
   - Historical data visualization
   - Trend analysis
   - Alert system

4. **Agent Management**
   - Spawn agents from UI
   - Stop/pause agents
   - View agent logs
   - Task assignment

5. **Memory Browser**
   - Search memory entries
   - View namespace contents
   - Pattern visualization
   - HNSW index statistics

## Dependencies

### Added Dependencies

```json
{
  "@xterm/xterm": "^5.5.0",
  "@xterm/addon-fit": "latest",
  "@xterm/addon-search": "latest",
  "@xterm/addon-web-links": "latest",
  "@xterm/addon-webgl": "latest",
  "@xterm/addon-canvas": "latest"
}
```

### Existing Dependencies Used

- Next.js 15
- React 19
- shadcn/ui components
- Tailwind CSS v4 (OKLCH)
- lucide-react icons

## Testing

### Manual Testing Steps

1. **Start Claude Flow daemon:**
   ```bash
   npx @claude-flow/cli@latest daemon start
   ```

2. **Start Nexus Dashboard:**
   ```bash
   cd apps/nexus-dashboard
   pnpm dev
   ```

3. **Navigate to Claude Flow page:**
   - Go to http://localhost:3005/claude-flow
   - Verify all cards display data
   - Check auto-refresh (5s interval)
   - Switch between tabs
   - Test error boundary (throw error in dev tools)

4. **Test API endpoint:**
   ```bash
   curl http://localhost:3005/api/claude-flow/status
   ```

5. **Test embedded dashboard:**
   - Go to http://localhost:3005/claude-flow/dashboard
   - Verify iframe loads
   - Check auto-refresh

### Known Issues

- CLI execution timeout (10s) may be too short for slow systems
- Demo data is returned if CLI fails (not a real error state)
- xterm dependencies installed but not fully integrated yet

## Troubleshooting

### Dashboard shows demo data

**Cause:** Claude Flow CLI not responding or not installed

**Solution:**
```bash
# Check CLI installation
npx @claude-flow/cli@latest --version

# Start daemon
npx @claude-flow/cli@latest daemon start

# Test statusline command
npx @claude-flow/cli@latest hooks statusline --json
```

### API timeout errors

**Cause:** CLI command taking longer than 10 seconds

**Solution:**
- Increase timeout in `route.ts`
- Check system resources
- Restart Claude Flow daemon

### Blank page or loading forever

**Cause:** API route error or network issue

**Solution:**
- Check browser console for errors
- Verify API route is accessible
- Check Next.js build errors

### Component error boundary triggers

**Cause:** React component error

**Solution:**
- Check browser console for stack trace
- Verify data structure matches TypeScript interfaces
- Use retry button to reload

## Code Style

All code follows the Nexus Dashboard conventions:
- TypeScript strict mode
- 'use client' for client components
- OKLCH color variables
- shadcn/ui component patterns
- Proper error handling
- Accessible components

## Credits

- Original claude-flow-ui components from `C:\Dev\Projects\Repos\claude-flow-ui-main`
- Adapted and integrated by Claude Code
- Follows Nexus Dashboard architecture and design system
