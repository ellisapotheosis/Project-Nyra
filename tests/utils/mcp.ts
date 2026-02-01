/**
 * Test MCP (Model Context Protocol) Utilities
 *
 * Mock MCP servers for testing:
 * - Agent coordination
 * - Tool execution
 * - Memory access
 */

import { vi } from 'vitest';

export interface TestMCPServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  executeTool: (toolName: string, params: any) => Promise<any>;
  listTools: () => Promise<string[]>;
}

export const createMockMCPServer = (serverName: string): TestMCPServer => {
  const tools = new Map<string, (params: any) => Promise<any>>();

  // Register default mock tools
  tools.set('agent_spawn', vi.fn().mockResolvedValue({
    agentId: 'mock-agent-id',
    type: 'coder',
    status: 'spawned'
  }));

  tools.set('memory_store', vi.fn().mockResolvedValue({
    success: true,
    key: 'mock-key'
  }));

  tools.set('memory_search', vi.fn().mockResolvedValue({
    results: []
  }));

  tools.set('swarm_init', vi.fn().mockResolvedValue({
    swarmId: 'mock-swarm-id',
    topology: 'mesh',
    status: 'initialized'
  }));

  return {
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    executeTool: vi.fn().mockImplementation(async (toolName: string, params: any) => {
      const tool = tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not found`);
      }
      return await tool(params);
    }),
    listTools: vi.fn().mockResolvedValue(Array.from(tools.keys()))
  };
};

export const setupTestMCP = async () => {
  const servers = {
    'claude-flow': createMockMCPServer('claude-flow'),
    'ruv-swarm': createMockMCPServer('ruv-swarm'),
    'flow-nexus': createMockMCPServer('flow-nexus')
  };

  // Start all mock servers
  await Promise.all(
    Object.values(servers).map(server => server.start())
  );

  return servers;
};

export const teardownTestMCP = async (servers: any) => {
  await Promise.all(
    Object.values(servers).map((server: any) => server.stop())
  );
};
