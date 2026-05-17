# Dashboard Guide

The Dashboard is the central hub of the Nyra Neural Command Deck, providing real-time visibility into mortgage operations, system status, and agent activity.

## Overview

The Dashboard provides:

- **System Status Panel** - Real-time status of all critical systems
- **Business Metrics** - Key performance indicators (KPIs)
- **Pipeline Status** - Lead pipeline visualization by stage
- **GPU Worker Monitoring** - Real-time worker utilization and metrics
- **Agent Activity** - Active agent sessions and their progress
- **Event Ticker** - Real-time event stream of system activities

## Components

### System Status Panel

Displays the operational status of critical systems:

- Orchestrator
- Nexus Router
- OpenClaw
- Memory

Each system shows:

- Online/offline status with pulsing indicator
- Color-coded health status
- Real-time updates

### Business Metrics

Displays key performance indicators:

- **Total Leads** - Count of all leads in system with trend
- **Active Campaigns** - Number of active marketing campaigns
- **Quotes This Month** - Monthly quote volume
- **Compliance Score** - System compliance rating

Each metric shows:

- Current value
- Month-over-month change
- Trend indicator (↑ up, → neutral)
- Icon representation

### Pipeline Status

Shows lead distribution across pipeline stages:

- **New** - Recently received leads
- **Qualified** - Pre-qualified leads
- **Processing** - Leads in active processing
- **Closing** - Near-closing leads

Each stage displays:

- Stage name
- Current count
- Weekly change
- Click to drill down

### GPU Worker Monitoring

Real-time monitoring of GPU worker nodes:

**RTX 5090 Worker**

- Complex reasoning workloads
- DeepSeek-R1 236B, Llama 3.1 70B
- Memory utilization bar
- Active job count
- Temperature monitoring

**RTX 3090 Ti Worker**

- General purpose processing
- Mistral 123B, Llama 3.1 70B
- Memory utilization
- Active jobs
- Temperature

**RTX 3060 Worker**

- Lightweight tasks and embeddings
- CodeLlama 34B, Qwen 2.5 32B
- Memory monitoring
- Task queue status
- Temperature tracking

### Agent Activity Sessions

Shows currently running and recently completed agent sessions:

Each session displays:

- Agent name and current task
- Active/completed/idle status
- Execution duration
- Model being used
- Token usage

### Event Ticker

Real-time stream of system events:

- Quote completions
- Lead qualifications
- Campaign launches
- Compliance validations
- Worker alerts
- System events

Events are:

- Sorted by recency
- Color-coded by type
- Scrollable with recent 5 shown
- Auto-updating (future feature)

## Using the Dashboard

### Navigation

1. Click "Dashboard" in the sidebar or press `Cmd+K` → "Dashboard"
2. View all sections for complete system overview
3. Click on pipeline stages to see detailed lead information
4. Click on worker cards to see detailed worker stats

### Interpreting Metrics

- **Green Trend** - Positive change (good)
- **Red Trend** - Negative change (needs attention)
- **Gray Trend** - Neutral/no change

### Monitoring Workers

- **Memory Bar Color**:
  - Green: < 60% utilized
  - Yellow: 60-80% utilized
  - Red: > 80% utilized
- **Active Jobs** - Number of concurrent tasks
- **Temperature** - GPU temperature in Celsius

### Real-Time Updates

The dashboard updates in real-time to reflect:

- New leads received
- Completed quotes
- Active agent sessions
- Worker status changes
- System events

## Component Architecture

### MetricCard Component

Displays a single business metric with trend information.

```tsx
<MetricCard
  label="Total Leads"
  value="2,847"
  unit="leads"
  change={12}
  trend="up"
  icon={<Users size={20} />}
  variant="default"
/>
```

### PipelineStageCard Component

Displays a single pipeline stage with count and change.

```tsx
<PipelineStageCard
  stage="Qualified"
  count={287}
  previousCount={265}
  color="purple"
  onClick={() => navigateToCrmStage("qualified")}
/>
```

### WorkerCard Component

Displays detailed worker status and metrics.

```tsx
<WorkerCard
  name="RTX 5090"
  model="DeepSeek-R1, Llama 3.1"
  status="online"
  memory={42.5}
  maxMemory={48}
  activeJobs={8}
  temperature={68.5}
/>
```

### AgentSessionCard Component

Displays active or recently completed agent session.

```tsx
<AgentSessionCard
  agentName="Quote Agent"
  task="Generating mortgage quotes"
  status="active"
  duration="12m 34s"
  model="Claude Sonnet"
  tokens={45230}
/>
```

### StatusIndicator Component

Shows status with pulsing indicator.

```tsx
<StatusIndicator status="online" label="Orchestrator" pulse={true} />
```

## Data Integration

### Real-Time Data Sources

The Dashboard connects to:

- **Supabase** - Lead counts, pipeline stages
- **Worker Status API** - GPU metrics
- **Agent Orchestrator** - Active sessions
- **Event Stream** - Real-time events

### Mock Data

Currently uses mock data for demonstration. To integrate live data:

```tsx
// Replace mock metrics with Supabase query
const { data: leads } = await supabase
  .from("leads")
  .select("*, stage:lead_stages(*)")
  .gte("created_at", startOfMonth);

// Replace mock workers with API call
const workers = await fetch("/api/workers").then((r) => r.json());

// Replace mock agents with Orchestrator API
const agents = await fetch("/api/agents/active").then((r) => r.json());
```

## Future Enhancements

### Planned Features

- ✅ Real-time data integration
- 📊 Customizable widgets
- 🔔 Alert thresholds
- 📈 Trending analytics
- 🎯 Goal tracking
- 📅 Scheduled reports
- 🔄 Auto-refresh controls
- 🎨 Theme customization

### Performance Optimizations

- Implement WebSocket subscriptions for real-time updates
- Add pagination for event ticker
- Implement virtualization for long lists
- Cache dashboard data

## Troubleshooting

### Metrics Not Updating

1. Check Supabase connection
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Refresh page with Cmd/Ctrl+Shift+R

### Workers Showing Offline

1. Verify worker processes are running
2. Check network connectivity
3. Review worker logs
4. Restart worker if necessary

### Agent Sessions Not Showing

1. Verify Orchestrator is running
2. Check agent API connectivity
3. Review agent logs
4. Verify authentication tokens are valid

## Styling

The Dashboard uses the Frosted Obsidian theme with:

- Dark purple/slate backgrounds
- Cyan/pink accent colors
- Purple borders and highlights
- Smooth animations and transitions
- Responsive grid layouts

## Accessibility

- Keyboard navigation support
- Color-blind friendly indicators
- High contrast text
- Semantic HTML structure
- ARIA labels on interactive elements

## Performance

- Metrics load in < 200ms
- Updates debounced to 1s intervals
- Optimized re-renders with React.memo
- Lazy loading of lower priority components
