# CRM Analytics Dashboard - Claude Flow V3 Configuration

> **Real-time analytics and reporting dashboard for sales teams**
>
> **Inherits from**: `apps/web/CLAUDE.md`
> **Stack**: React 19, Vite, TypeScript 5, Recharts, TanStack Query, Tailwind CSS 4
> **Port**: 3004
> **Type**: SPA Analytics Dashboard
> **Users**: Managers, analysts, executives

---

## APPLICATION CONTEXT

### Purpose
Analytics dashboard providing real-time insights into sales performance, pipeline health, conversion metrics, and team productivity for management and analysis.

### Key Metrics
- Pipeline value by stage
- Conversion rates by loan type
- Team performance leaderboards
- Lead source attribution
- Close rate trends
- Average days to close
- Revenue forecasting
- Compliance scorecard

### Architecture
```
React SPA (Vite) + Recharts
    ├── Overview Dashboard
    ├── Pipeline Analytics
    ├── Team Performance
    ├── Lead Source Analysis
    ├── Compliance Metrics
    └── Reports & Exports
         ↓
Analytics API (8000)
    ├── Real-time metrics
    ├── Historical trends
    └── Forecasting
```

---

## TECH STACK SPECIFICS

### Recharts Visualizations
```typescript
// components/PipelineChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function PipelineChart({ data }) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="stage" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
}
```

### Real-Time Data Updates
```typescript
// hooks/useMetrics.ts
export function useMetrics() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Poll every 30 seconds
    const interval = setInterval(async () => {
      await queryClient.invalidateQueries({
        queryKey: ['metrics'],
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/metrics');
      return response.data;
    },
    staleTime: 25000, // 25 seconds
  });
}
```

---

## COMPONENT ARCHITECTURE

```
components/
├── Dashboard
│   ├── OverviewCards.tsx
│   ├── MetricsGrid.tsx
│   └── TrendChart.tsx
├── Pipeline
│   ├── PipelineValue.tsx
│   ├── StageDistribution.tsx
│   └── VelocityChart.tsx
├── Performance
│   ├── LeaderboardTable.tsx
│   ├── PerformanceMetrics.tsx
│   └── ConversionFunnel.tsx
├── LeadAnalysis
│   ├── SourceAttribution.tsx
│   ├── QualityScore.tsx
│   └── TimeToConversion.tsx
└── Reports
    ├── ReportBuilder.tsx
    ├── ExportOptions.tsx
    └── ScheduledReports.tsx
```

---

## DEVELOPMENT COMMANDS

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm lint
```

---

**Profile**: crm-dashboard-analytics
**Generated**: 2026-01-26
**Port**: 3004
