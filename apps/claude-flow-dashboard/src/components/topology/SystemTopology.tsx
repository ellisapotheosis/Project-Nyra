import React from 'react';
import { useAgentStore } from '@/store/agentStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const SystemTopology: React.FC = () => {
  const { agents } = useAgentStore();

  const agentsByType = Array.from(agents.values()).reduce((acc, agent) => {
    if (!acc[agent.type]) {
      acc[agent.type] = [];
    }
    acc[agent.type].push(agent);
    return acc;
  }, {} as Record<string, any[]>);

  if (agents.size === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Topology</h2>
        <div className="text-center text-gray-500">
          <LoadingSpinner />
          <p>No agents in topology</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">System Topology</h2>
      <div className="space-y-2">
        {Object.entries(agentsByType).map(([type, typeAgents]) => (
          <div key={type} className="bg-gray-50 rounded p-2">
            <div className="font-medium text-sm">{type}</div>
            <div className="text-xs text-gray-500">
              {typeAgents.map((agent) => (
                <span
                  key={agent.id}
                  className={`
                    inline-block mr-2 px-2 py-1 rounded text-xs
                    ${agent.status === 'running' ? 'bg-green-100 text-green-800' :
                      agent.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                  `}
                >
                  {agent.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};