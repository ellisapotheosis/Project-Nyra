'use client';

import { useEffect, useState, useRef } from 'react';
import { NexusAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  context?: Record<string, any>;
}

export function LogStream() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { logs: logData } = await NexusAPI.getLogs(
          levelFilter === 'all' ? undefined : levelFilter,
          200
        );
        setLogs(logData);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000); // Refresh every 3s

    return () => clearInterval(interval);
  }, [levelFilter]);

  useEffect(() => {
    // Filter logs by search query
    if (!searchQuery) {
      setFilteredLogs(logs);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredLogs(
      logs.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.service.toLowerCase().includes(query)
      )
    );
  }, [logs, searchQuery]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return 'secondary';
      case 'info':
        return 'default';
      case 'warn':
        return 'outline';
      case 'error':
      case 'fatal':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'debug':
        return 'bg-muted';
      case 'info':
        return 'bg-blue-500/10';
      case 'warn':
        return 'bg-yellow-500/10';
      case 'error':
      case 'fatal':
        return 'bg-red-500/10';
      default:
        return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Loading logs...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="fatal">Fatal</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Log Stream */}
      <ScrollArea className="h-[500px]" ref={scrollRef}>
        <div className="space-y-1 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No logs match the current filters
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded ${getLevelBg(log.level)} hover:bg-accent`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                  </span>
                  <Badge
                    variant={getLevelColor(log.level)}
                    className="text-xs w-14 justify-center"
                  >
                    {log.level.toUpperCase()}
                  </Badge>
                  <span className="text-muted-foreground">
                    [{log.service}]
                  </span>
                  <span className="flex-1">{log.message}</span>
                </div>
                {log.context && Object.keys(log.context).length > 0 && (
                  <div className="mt-1 pl-32 text-muted-foreground">
                    {JSON.stringify(log.context, null, 2)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
