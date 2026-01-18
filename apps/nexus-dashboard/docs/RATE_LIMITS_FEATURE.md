# Rate Limiting Configuration UI - Feature Documentation

## Overview

A comprehensive Rate Limiting Configuration UI has been added to the Nexus Dashboard for managing API rate limits across multiple dimensions. This feature provides configuration, monitoring, and override management for rate limiting policies.

## Files Created

### 1. Main Page
**File**: `src/app/rate-limits/page.tsx`
- Main rate limits management page with three tabs
- Handles all configuration state management
- Integrates all sub-components

### 2. Components

#### LimitConfigCard Component
**File**: `src/components/rate-limits/limit-config-card.tsx`
- Reusable configuration card component for rate limits
- Supports four types of limits:
  - `global`: Global rate limits
  - `per-ip`: Per-IP address limits
  - `per-server`: Per-server limits with server selection
  - `per-tool`: Per-tool limits with tool selection
- Features:
  - Enable/disable toggle
  - Time window configuration (1-3600 seconds)
  - Maximum requests configuration (1-100000)
  - Dynamic selectors for server/tool selection

#### LimitStats Component
**File**: `src/components/rate-limits/limit-stats.tsx`
- Live rate limit monitoring display
- Shows real-time usage statistics
- Features:
  - Progress bars with color-coded status (green/amber/red)
  - Usage percentage tracking
  - Requests remaining calculation
  - Reset countdown timer
  - Trend indicators
  - Status animations

#### Alert Component
**File**: `src/components/ui/alert.tsx`
- New shadcn/ui Alert component
- Supports default and destructive variants
- Used for informational messages and warnings

## Feature Breakdown

### Configuration Tab

#### 1. Backend Storage Selection
- **Memory Backend**:
  - Fast local storage
  - Resets on server restart
  - Single instance only

- **Redis Cluster**:
  - Distributed storage with persistence
  - Multi-node support with dynamic URL management
  - Add/remove Redis nodes
  - Full cluster URL configuration

#### 2. Rate Limit Configuration Cards

**Global Limits**
- Controls maximum requests across entire system
- Default: 10,000 requests per 60 seconds
- Can be enabled/disabled via toggle

**Per-IP Limits**
- Maximum requests per unique IP address
- Default: 500 requests per 60 seconds
- Prevents single-source abuse

**Per-Server Limits**
- Configurable limits for specific servers
- Server selector dropdown
- Add/remove server configurations
- Example servers: US-East, US-West, EU-Frankfurt

**Per-Tool Limits**
- Rate limits specific to individual AI tools
- Tool selector dropdown
- Add/remove tool configurations
- Example tools: GPT-4 Turbo, Claude 3 Opus, Vision API

**Configuration Fields** (for all limit types):
- Time Window: 1-3600 seconds
- Maximum Requests: 1-100000
- Enable/disable toggle

### Monitoring Tab

#### 1. Live Rate Limit Statistics
- Real-time usage display with:
  - Current usage vs. maximum
  - Usage percentage
  - Remaining requests
  - Reset countdown (next 1 hour)
  - Trend indicators (up/down)
  - Color-coded status indicators:
    - Green: 0-70% usage
    - Amber: 70-90% usage
    - Red: 90%+ usage

#### 2. Monitoring Settings
- Alert threshold configuration (50-100%)
- Email notifications toggle
- Syslog integration toggle

### User Overrides Tab

#### 1. Per-User/Group Override Management
- Enable/disable user overrides
- Add unlimited override rules
- Configuration fields:
  - User/Group ID
  - Multiplier (0.1-10x)
- Example: 2.0x multiplier = double the normal rate limit
- Useful for premium users, VIP access, or specific use cases

## Component Integration

### Sidebar Navigation
The Rate Limits route is already configured in `src/components/sidebar.tsx`:
- Location: Configuration section
- Label: "Rate Limits"
- Icon: Timer (lucide-react)
- Color: Red (text-red-500)
- Route: `/rate-limits`

## State Management

The main page (`page.tsx`) manages:
- `backend`: Selected backend (memory or redis)
- `useRedis`: Redis enabled state
- `redisNodes`: Array of Redis cluster URLs
- `globalConfig`: Global rate limit configuration
- `perIpConfig`: Per-IP rate limit configuration
- `perServerConfigs`: Array of per-server configurations
- `perToolConfigs`: Array of per-tool configurations
- `allowOverrides`: Override toggle
- `overriddenUsers`: Array of user override rules

## Type Definitions

```typescript
interface LimitConfig {
  enabled: boolean;
  window: number;
  maxRequests: number;
}

interface PerServerConfig extends LimitConfig {
  serverId?: string;
}

interface PerToolConfig extends LimitConfig {
  toolId?: string;
}

interface RedisNode {
  id: string;
  url: string;
}

interface LimitStat {
  id: string;
  label: string;
  currentUsage: number;
  maxLimit: number;
  requestsRemaining: number;
  resetAt: Date;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}
```

## Mock Data

For demonstration, the page includes mock data for:
- 3 example servers (US-East, US-West, EU-Frankfurt)
- 4 example tools (GPT-4 Turbo, Claude 3, Text Embedding, Vision)
- 4 rate limit statistics with varying usage levels
- 2 example user overrides (premium users)

## UI Dependencies

The feature uses the following shadcn/ui components:
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`
- `Button` (variants: default, outline, ghost)
- `Input` (text and number)
- `Switch` (toggle switches)
- `Separator`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Progress` (usage bars)
- `Alert`, `AlertDescription` (informational alerts)

## Icons Used

From lucide-react:
- `Save` - Save configuration button
- `AlertCircle` - Alert icons
- `Plus` - Add buttons
- `X` - Remove buttons
- `Activity` - Stats section icon
- `TrendingDown` - Trend indicator
- `Clock` - Reset timer icon

## Dependencies

External dependencies used:
- `date-fns` (v4.1.0): Time formatting (`formatDistanceToNow`)
- `lucide-react`: Icon library
- `@radix-ui/react-progress`: Progress bar primitive
- `class-variance-authority`: Component styling utilities

## Styling

- Uses Tailwind CSS utility classes
- Respects dark theme (inherited from dashboard)
- Responsive grid layout
- Hover effects and transitions
- Animation for pulse indicators

## Features Implemented

✅ Backend selection (Memory vs Redis)
✅ Redis cluster URL management
✅ Nested configuration cards for 4 limit types
✅ Enable/disable toggles
✅ Time window configuration
✅ Max requests configuration
✅ Server selector for per-server limits
✅ Tool selector for per-tool limits
✅ Add/remove server configurations
✅ Add/remove tool configurations
✅ Live monitoring with real-time stats
✅ Usage progress bars with color coding
✅ Requests remaining calculation
✅ Reset countdown timer
✅ Trend indicators
✅ Per-user/group override management
✅ Override multiplier configuration
✅ Monitoring settings (alerts, email, syslog)
✅ Save configuration functionality
✅ Responsive design
✅ Dark theme support

## Future Enhancements

Potential additions for future versions:
- API integration for saving/loading configurations
- Real-time WebSocket updates for statistics
- Export/import configuration
- Rate limit rule templates
- Performance analytics and reporting
- Custom alert rules and conditions
- Rate limit history and trending
- Automatic scaling based on usage patterns
- IP whitelist/blacklist management
- Geographic-based rate limiting
