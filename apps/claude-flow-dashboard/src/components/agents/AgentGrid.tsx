import React from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const AgentGrid: React.FC = () => {
  const { agents } = useAgentStore();

  if (agents.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Agents</h2>
        <div className="text-center text-gray-500">
          <LoadingSpinner />
          <p>No agents active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Active Agents</h2>
      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`
              p-2 rounded
              ${agent.status === 'running' ? 'bg-green-100' :
                agent.status === 'error' ? 'bg-red-100' : 'bg-gray-100'}
            `}
          >
            <div className="font-medium">{agent.name}</div>
            <div className="text-sm text-gray-500">{agent.type}</div>
            <div className="text-xs text-gray-400">{agent.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};