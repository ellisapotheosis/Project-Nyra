'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { Activity, TrendingDown, Clock } from 'lucide-react';

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

interface LimitStatsProps {
  stats: LimitStat[];
  title?: string;
  description?: string;
}

export function LimitStats({
  stats,
  title = 'Rate Limit Monitoring',
  description = 'Live usage statistics and reset times',
}: LimitStatsProps) {
  const usagePercentage = (usage: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((usage / max) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90)
      return (
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
      );
    if (percentage >= 70)
      return (
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
      );
    return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {stats.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No rate limit data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stats.map((stat) => {
              const percentage = usagePercentage(
                stat.currentUsage,
                stat.maxLimit
              );

              return (
                <div key={stat.id} className="space-y-3">
                  {/* Header with label and status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(percentage)}
                      <div>
                        <p className="font-medium text-sm">{stat.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {stat.currentUsage}/{stat.maxLimit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {percentage}% used
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <Progress
                    value={percentage}
                    className="h-2"
                  />

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    {/* Requests remaining */}
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium">
                          {Math.max(0, stat.requestsRemaining)}
                        </p>
                      </div>
                    </div>

                    {/* Trend indicator */}
                    {stat.trend && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center">
                          {stat.trend.direction === 'up' ? (
                            <span className="text-red-500">↑</span>
                          ) : (
                            <span className="text-green-500">↓</span>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trend</p>
                          <p className="font-medium">
                            {stat.trend.percentage}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reset time */}
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Reset in</p>
                        <p className="font-medium">
                          {formatDistanceToNow(stat.resetAt, {
                            addSuffix: false,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
