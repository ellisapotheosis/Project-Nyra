'use client';

import React, { Suspense } from 'react';
import { useWebSocketConnection } from '@/hooks/websocket/useWebSocketConnection';
import { useAgentsArray } from '@/store/agentStore';
import { useTasksArray } from '@/store/taskStore';
import { useMessages } from '@/store/messageStore';
import { useMemoryStore } from '@/store/memoryStore';

// Shared components
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Agent & System Components
import { AgentGrid } from '@/components/agents/AgentGrid';
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard';
import { MessageFeed } from '@/components/messages/MessageFeed';
import { MemoryMetrics } from '@/components/metrics/MemoryMetrics';
import { SystemTopology } from '@/components/topology/SystemTopology';

// Metrics
import { SystemMetricsGrid } from '@/components/metrics/SystemMetricsGrid';

const DashboardPage: React.FC = () => {
  const { isConnected } = useWebSocketConnection();

  const agents = useAgentsArray();
  const tasks = useTasksArray();
  const messages = useMessages();
  const operations = useMemoryStore((s) => s.operations);

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <ErrorBoundary>
        <div className="col-span-12 mb-4 bg-blue-100 p-2 rounded">
          WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
        </div>

        {/* System Metrics Grid */}
        <div className="col-span-12 md:col-span-8">
          <SystemMetricsGrid
            metrics={{
              agents: agents.length,
              tasks: tasks.length,
              messages: messages.length,
              memory: operations.length
            }}
          />
        </div>

        {/* Real-time Agent Grid */}
        <div className="col-span-12 md:col-span-4">
          <Suspense fallback={<LoadingSpinner />}>
            <AgentGrid />
          </Suspense>
        </div>

        {/* Task Management */}
        <div className="col-span-12 md:col-span-6">
          <Suspense fallback={<LoadingSpinner />}>
            <TaskKanbanBoard />
          </Suspense>
        </div>

        {/* Message Stream */}
        <div className="col-span-12 md:col-span-6">
          <Suspense fallback={<LoadingSpinner />}>
            <MessageFeed />
          </Suspense>
        </div>

        {/* Memory Operations & System Topology */}
        <div className="col-span-12 grid grid-cols-2 gap-4">
          <div>
            <Suspense fallback={<LoadingSpinner />}>
              <MemoryMetrics />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<LoadingSpinner />}>
              <SystemTopology />
            </Suspense>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default DashboardPage;
