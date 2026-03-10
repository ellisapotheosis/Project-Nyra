'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PerformanceChartProps {
  data: Array<{
    time: string;
    requests: number;
    latency: number;
    errors: number;
  }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              stroke="oklch(var(--muted-foreground))"
            />
            <YAxis
              className="text-xs"
              stroke="oklch(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="oklch(var(--chart-1))"
              strokeWidth={2}
              name="Requests"
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="oklch(var(--chart-2))"
              strokeWidth={2}
              name="Latency (ms)"
            />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="oklch(var(--destructive))"
              strokeWidth={2}
              name="Errors"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
