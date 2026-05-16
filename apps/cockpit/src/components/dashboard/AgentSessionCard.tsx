'use client';

import { Brain, Clock, Zap } from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

interface AgentSessionCardProps {
  agentName: string;
  task: string;
  status: 'active' | 'completed' | 'idle' | 'error';
  duration: string;
  model: string;
  tokens?: number;
}

export function AgentSessionCard({
  agentName,
  task,
  status,
  duration,
  model,
  tokens,
}: AgentSessionCardProps) {
  const statusMap = {
    active: 'online',
    completed: 'online',
    idle: 'offline',
    error: 'error',
  } as const;

  return (
    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-purple-400" />
            <h3 className="font-semibold text-white">{agentName}</h3>
          </div>
          <p className="mt-1 text-xs text-purple-300/60 truncate">{task}</p>
        </div>
        <StatusIndicator status={statusMap[status]} label="" pulse={status === 'active'} />
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={12} />
          <span>{duration}</span>
        </div>
        <div className="text-gray-400">
          Model: <span className="text-white">{model}</span>
        </div>
        {tokens !== undefined && (
          <div className="flex items-center gap-2 text-gray-400">
            <Zap size={12} />
            <span>{tokens.toLocaleString()} tokens</span>
          </div>
        )}
      </div>
    </div>
  );
}
