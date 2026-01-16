import React, { useState, useEffect } from 'react';
import { MCPServer } from '../types/manifest';

interface MCPServerManagerProps {
  onComplete?: () => void;
}

const AVAILABLE_SERVERS: Omit<MCPServer, 'status'>[] = [
  {
    id: 'claude-flow',
    name: 'claude-flow',
    displayName: 'Claude Flow',
    description: 'Multi-agent orchestration framework with V3 features',
    enabled: true,
    command: 'npx',
    args: ['-y', '@claude-flow/cli@latest'],
    env: {},
  },
  {
    id: 'ruv-swarm',
    name: 'ruv-swarm',
    displayName: 'RUV Swarm',
    description: 'Swarm coordination and distributed intelligence',
    enabled: false,
    command: 'npx',
    args: ['-y', 'ruv-swarm', 'mcp', 'start'],
    env: {},
  },
  {
    id: 'flow-nexus',
    name: 'flow-nexus',
    displayName: 'Flow Nexus',
    description: 'Cloud-based AI swarm deployment platform',
    enabled: false,
    command: 'npx',
    args: ['-y', 'flow-nexus@latest', 'mcp', 'start'],
    env: {},
  },
  {
    id: 'graphiti-mcp',
    name: 'graphiti-mcp',
    displayName: 'Graphiti MCP',
    description: 'Knowledge graph and semantic memory',
    enabled: false,
    command: 'npx',
    args: ['-y', '@graphiti/mcp'],
    env: {},
  },
  {
    id: 'mem0-mcp',
    name: 'mem0-mcp',
    displayName: 'Mem0 MCP',
    description: 'Persistent memory and context management',
    enabled: false,
    command: 'npx',
    args: ['-y', '@mem0/mcp'],
    env: {},
  },
];

export const MCPServerManager: React.FC<MCPServerManagerProps> = ({ onComplete }) => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMCPServers();
  }, []);

  const loadMCPServers = async () => {
    setLoading(true);
    try {
      // TODO: Load actual MCP server status from system
      const serversWithStatus: MCPServer[] = AVAILABLE_SERVERS.map((server) => ({
        ...server,
        status: server.enabled ? ('active' as const) : ('inactive' as const),
      }));
      setServers(serversWithStatus);
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleServer = async (serverId: string) => {
    setServers((prev) =>
      prev.map((server) =>
        server.id === serverId
          ? {
              ...server,
              enabled: !server.enabled,
              status: !server.enabled ? 'active' : 'inactive',
            }
          : server
      )
    );

    // TODO: Call backend to actually enable/disable the server
    console.log('Toggling server:', serverId);
  };

  const handleConfigureServer = (serverId: string) => {
    // TODO: Open configuration modal
    console.log('Configuring server:', serverId);
  };

  const handleTestServer = async (serverId: string) => {
    // TODO: Test server connection
    console.log('Testing server:', serverId);

    // Simulate test
    setServers((prev) =>
      prev.map((server) =>
        server.id === serverId ? { ...server, status: 'active' as const } : server
      )
    );
  };

  const getStatusColor = (status: MCPServer['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'active':
        return '✓';
      case 'inactive':
        return '○';
      case 'error':
        return '✗';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MCP servers...</p>
        </div>
      </div>
    );
  }

  const enabledCount = servers.filter((s) => s.enabled).length;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MCP Server Configuration</h1>
        <p className="text-gray-600">
          Enable and configure Model Context Protocol servers for Claude integration
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <span className="font-semibold">{enabledCount}</span>
          of {servers.length} servers enabled
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {servers.map((server) => (
          <div
            key={server.id}
            className={`
              bg-white border-2 rounded-lg p-6 transition-all
              ${server.enabled ? 'border-blue-500 shadow-md' : 'border-gray-200'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{server.displayName}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded font-medium ${getStatusColor(
                      server.status
                    )}`}
                  >
                    {getStatusIcon(server.status)} {server.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{server.description}</p>

                <div className="bg-gray-50 rounded p-3 border border-gray-200">
                  <div className="text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-700 min-w-20">Command:</span>
                      <code className="bg-gray-200 px-2 py-0.5 rounded text-xs flex-1">
                        {server.command} {server.args?.join(' ')}
                      </code>
                    </div>
                    {server.env && Object.keys(server.env).length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-20">Environment:</span>
                        <div className="flex-1 space-y-1">
                          {Object.entries(server.env).map(([key, value]) => (
                            <code
                              key={key}
                              className="block bg-gray-200 px-2 py-0.5 rounded text-xs"
                            >
                              {key}={value}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={server.enabled}
                    onChange={() => handleToggleServer(server.id)}
                    className="w-5 h-5 text-blue-500"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>

                <button
                  onClick={() => handleConfigureServer(server.id)}
                  disabled={!server.enabled}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Configure
                </button>

                <button
                  onClick={() => handleTestServer(server.id)}
                  disabled={!server.enabled}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                MCP servers will be added to your Claude Desktop configuration. Make sure Claude
                Desktop is closed before continuing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
