'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NexusAPI } from '@/lib/api';

interface HistogramBucket {
  le: number;
  count: number;
}

export function LatencyHistogram() {
  const [data, setData] = useState<HistogramBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistogram = async () => {
      try {
        const histogram = await NexusAPI.fetch<{ buckets: HistogramBucket[] }>(
          '/api/metrics/histogram'
        );
        setData(histogram.buckets);
      } catch (error) {
        console.error('Failed to fetch histogram:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistogram();
    const interval = setInterval(fetchHistogram, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Loading histogram...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No latency data available
      </div>
    );
  }

  // Calculate cumulative distribution for coloring
  const totalCount = data[data.length - 1]?.count || 0;

  const chartData = data.map((bucket, index) => {
    const prevCount = index > 0 ? data[index - 1].count : 0;
    const bucketCount = bucket.count - prevCount;
    const percentile = totalCount > 0 ? (bucket.count / totalCount) * 100 : 0;

    // Color coding based on latency ranges
    let color = 'hsl(142, 76%, 36%)'; // Green
    if (bucket.le > 1000) color = 'hsl(0, 84%, 60%)'; // Red
    else if (bucket.le > 500) color = 'hsl(38, 92%, 50%)'; // Orange
    else if (bucket.le > 100) color = 'hsl(45, 93%, 47%)'; // Yellow

    return {
      label: `<${bucket.le}ms`,
      count: bucketCount,
      percentile: percentile.toFixed(1),
      color,
    };
  });

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            height={100}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            label={{
              value: 'Request Count',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'hsl(var(--muted-foreground))' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: any, name: string, props: any) => [
              `${value} requests (${props.payload.percentile}%)`,
              'Count',
            ]}
          />
          <Bar dataKey="count">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-muted-foreground">Fast (&lt;100ms)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span className="text-muted-foreground">Normal (100-500ms)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded" />
          <span className="text-muted-foreground">Slow (500-1000ms)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-muted-foreground">Very Slow (&gt;1000ms)</span>
        </div>
      </div>
    </div>
  );
}
