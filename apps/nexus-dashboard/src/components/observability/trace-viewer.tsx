'use client';

import { useEffect, useState } from 'react';
import { NexusAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Trace {
  traceId: string;
  requestId: string;
  timestamp: number;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  provider: string;
  model: string;
  route: string;
  latency: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  cached: boolean;
}

export function TraceViewer() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        const { traces: traceData } = await NexusAPI.getTraces(50);
        setTraces(traceData);
      } catch (error) {
        console.error('Failed to fetch traces:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTraces();
    const interval = setInterval(fetchTraces, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Loading traces...
      </div>
    );
  }

  if (!traces || traces.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No traces available
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'timeout':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2">
        {traces.map((trace) => {
          const isExpanded = expandedTrace === trace.traceId;

          return (
            <div
              key={trace.traceId}
              className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
              onClick={() =>
                setExpandedTrace(isExpanded ? null : trace.traceId)
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 mt-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mt-1" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm">
                        {trace.traceId.slice(0, 8)}
                      </span>
                      <Badge variant={getStatusColor(trace.status)}>
                        {trace.status}
                      </Badge>
                      {trace.cached && (
                        <Badge variant="outline" className="text-xs">
                          Cached
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trace.route} • {trace.provider} • {trace.model}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(trace.timestamp), 'PPpp')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {trace.latency.toFixed(0)}ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trace.tokens.total} tokens
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${trace.cost.toFixed(4)}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pl-7 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Request ID:</span>{' '}
                      <span className="font-mono">{trace.requestId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>{' '}
                      {trace.duration.toFixed(0)}ms
                    </div>
                    <div>
                      <span className="text-muted-foreground">Input Tokens:</span>{' '}
                      {trace.tokens.input}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output Tokens:</span>{' '}
                      {trace.tokens.output}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
